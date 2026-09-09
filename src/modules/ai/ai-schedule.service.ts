import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import {
  ClassStatus,
  ScheduleOverrideAction,
} from '../school-management/enums';
import {
  Class,
  ClassDocument,
} from '../school-management/schemas/class.schema';
import {
  ScheduleVersion,
  ScheduleVersionDocument,
} from '../school-management/schemas/schedule-version.schema';
import {
  ScheduleOverride,
  ScheduleOverrideDocument,
} from '../school-management/schemas/schedule-override.schema';
import { AiSession, AiSessionDocument } from './schemas/ai-session.schema';
import {
  convertUtcTimeToVietnam,
  convertUtcWeeklyTimeToVietnam,
} from '../../common/utils/vietnam-time';

const MAX_SESSIONS_PER_TEACHER = 5;
const MAX_MESSAGES_PER_SESSION = 40;
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

const DAY_NAMES: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  7: 'Chủ Nhật',
};

const SYSTEM_INSTRUCTION = `Bạn là trợ lý AI của EduTrack, chuyên giúp giáo viên sắp xếp thời khóa biểu.

NGUYÊN TẮC BẮT BUỘC:
1. Chỉ trả lời câu hỏi liên quan đến việc sắp xếp, gợi ý, tư vấn lịch học, thời khóa biểu, lớp học.
2. Nếu câu hỏi KHÔNG liên quan đến lịch học hoặc lớp học → LUÔN trả lời chính xác: "Câu hỏi không liên quan đến việc sắp xếp lịch học."
3. Khi gợi ý lịch, luôn nêu rõ: thứ mấy, giờ bắt đầu, giờ kết thúc, tên lớp (nếu có).
4. TUYỆT ĐỐI KHÔNG đề xuất giờ trùng với lịch hiện tại của giáo viên (xem phần LỊCH HIỆN TẠI).
5. Ưu tiên phân bổ đều các buổi trong tuần, tránh dồn nhiều buổi cùng ngày.
6. Luôn trả lời bằng tiếng Việt, rõ ràng, dễ hiểu, có cấu trúc.
7. Nếu giáo viên hỏi chung chung, hãy hỏi lại để làm rõ: số buổi/tuần, thời lượng mỗi buổi, buổi sáng/chiều/tối, lớp nào.
8. Khi đề xuất, liệt kê dạng bảng hoặc danh sách rõ ràng.`;

@Injectable()
export class AiScheduleService {
  private readonly logger = new Logger(AiScheduleService.name);
  private readonly genai: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(ScheduleVersion.name)
    private readonly scheduleVersionModel: Model<ScheduleVersionDocument>,
    @InjectModel(ScheduleOverride.name)
    private readonly scheduleOverrideModel: Model<ScheduleOverrideDocument>,
    @InjectModel(AiSession.name)
    private readonly aiSessionModel: Model<AiSessionDocument>,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY chưa được cấu hình. Tính năng AI gợi ý lịch sẽ không hoạt động.',
      );
    }

    this.genai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async createSession(teacherId: string) {
    const teacherObjectId = new Types.ObjectId(teacherId);
    const scheduleContext = await this.buildScheduleContext(teacherObjectId);

    let session = await this.aiSessionModel
      .findOne({ teacherId: teacherObjectId, 'messages.0': { $exists: false } })
      .sort({ createdAt: -1 })
      .exec();

    if (session) {
      session.scheduleContext = scheduleContext;
      session.lastActivityAt = new Date();
      await session.save();
    } else {
      session = await this.aiSessionModel.create({
        teacherId: teacherObjectId,
        scheduleContext,
        messages: [],
        lastActivityAt: new Date(),
      });
      await this.pruneOldSessions(teacherObjectId);
    }

    return {
      sessionId: session._id.toString(),
      scheduleContext,
      greeting: this.buildGreeting(),
    };
  }

  async chat(teacherId: string, sessionId: string, userMessage: string) {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException('Session không hợp lệ.');
    }

    const session = await this.aiSessionModel
      .findOne({
        _id: new Types.ObjectId(sessionId),
        teacherId: new Types.ObjectId(teacherId),
      })
      .exec();

    if (!session) {
      throw new NotFoundException(
        'Phiên trò chuyện không tồn tại hoặc đã hết hạn.',
      );
    }

    if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
      throw new BadRequestException(
        'Phiên trò chuyện đã đạt giới hạn. Vui lòng tạo phiên mới.',
      );
    }

    const chatHistory = session.messages.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: msg.text }],
    }));

    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nLỊCH HIỆN TẠI CỦA GIÁO VIÊN:\n${session.scheduleContext}`;

    let reply: string;

    try {
      const response = await this.genai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        config: {
          systemInstruction: fullPrompt,
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      reply =
        response.text?.trim() ||
        'Xin lỗi, tôi không thể xử lý yêu cầu lúc này. Vui lòng thử lại.';
    } catch (error) {
      this.logger.error('Gemini API error:', error);
      throw new InternalServerErrorException(
        'Không thể kết nối dịch vụ AI. Vui lòng thử lại sau.',
      );
    }

    session.messages.push(
      { role: 'user', text: userMessage, timestamp: new Date() },
      { role: 'ai', text: reply, timestamp: new Date() },
    );
    session.lastActivityAt = new Date();
    await session.save();

    return { reply };
  }

  async getSession(teacherId: string, sessionId: string) {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException('Session không hợp lệ.');
    }

    const session = await this.aiSessionModel
      .findOne({
        _id: new Types.ObjectId(sessionId),
        teacherId: new Types.ObjectId(teacherId),
      })
      .exec();

    if (!session) {
      throw new NotFoundException('Phiên trò chuyện không tồn tại.');
    }

    return {
      sessionId: session._id.toString(),
      messages: session.messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp,
      })),
      scheduleContext: session.scheduleContext,
      createdAt: session.createdAt,
    };
  }

  async listSessions(teacherId: string) {
    const sessions = await this.aiSessionModel
      .find({
        teacherId: new Types.ObjectId(teacherId),
        'messages.0': { $exists: true },
      })
      .sort({ createdAt: -1 })
      .select('_id messages lastActivityAt createdAt')
      .lean()
      .exec();

    return sessions.map((session) => ({
      sessionId: session._id.toString(),
      messageCount: session.messages?.length ?? 0,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      preview:
        session.messages?.find((m) => m.role === 'user')?.text?.slice(0, 80) ??
        '',
    }));
  }

  private async pruneOldSessions(teacherId: Types.ObjectId) {
    const sessions = await this.aiSessionModel
      .find({ teacherId })
      .sort({ createdAt: -1 })
      .select('_id')
      .lean()
      .exec();

    if (sessions.length > MAX_SESSIONS_PER_TEACHER) {
      const idsToRemove = sessions
        .slice(MAX_SESSIONS_PER_TEACHER)
        .map((s) => s._id);

      await this.aiSessionModel.deleteMany({ _id: { $in: idsToRemove } });
    }
  }

  private async buildScheduleContext(
    teacherId: Types.ObjectId,
  ): Promise<string> {
    const classes = await this.classModel
      .find({
        teacherId,
        status: { $ne: ClassStatus.Archived },
      })
      .select('_id name regularPrice makeupPrice')
      .lean()
      .exec();

    if (!classes.length) {
      return 'Giáo viên chưa có lớp học nào. Không có lịch dạy hiện tại.';
    }

    const classIds = classes.map((c) => c._id);
    const classMap = new Map(classes.map((c) => [c._id.toString(), c.name]));

    const [activeVersions, overrides] = await Promise.all([
      this.scheduleVersionModel
        .find({
          teacherId,
          classId: { $in: classIds },
          effectiveTo: null,
        })
        .lean()
        .exec(),
      this.scheduleOverrideModel
        .find({
          teacherId,
          classId: { $in: classIds },
        })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()
        .exec(),
    ]);

    const lines: string[] = [];

    lines.push(`Danh sách lớp học (${classes.length} lớp):`);

    for (const cls of classes) {
      lines.push(
        `  - ${cls.name} (giá thường: ${cls.regularPrice.toLocaleString('vi-VN')}đ, giá học bù: ${cls.makeupPrice.toLocaleString('vi-VN')}đ)`,
      );
    }

    lines.push('');
    lines.push('Lịch cố định hiện tại:');

    const scheduleByDay = new Map<number, string[]>();

    for (const version of activeVersions) {
      const className =
        classMap.get(version.classId.toString()) ?? 'Lớp không xác định';

      for (const slot of version.schedules) {
        let dayOfWeek = slot.dayOfWeek;
        let startTime = slot.startTime;
        let endTime = slot.endTime;

        if (version.timeStorage === 'utc') {
          const converted = convertUtcWeeklyTimeToVietnam(
            slot.dayOfWeek,
            slot.startTime,
          );
          dayOfWeek = converted.dayOfWeek;
          startTime = converted.time;
          endTime = convertUtcTimeToVietnam(slot.endTime);
        }

        const entry = `  - ${startTime} - ${endTime}: ${className}`;

        if (!scheduleByDay.has(dayOfWeek)) {
          scheduleByDay.set(dayOfWeek, []);
        }

        scheduleByDay.get(dayOfWeek)!.push(entry);
      }
    }

    if (scheduleByDay.size === 0) {
      lines.push('  (Chưa có lịch cố định nào)');
    } else {
      for (let day = 1; day <= 7; day++) {
        const entries = scheduleByDay.get(day);

        if (entries?.length) {
          lines.push(`  ${DAY_NAMES[day]}:`);
          lines.push(...entries);
        }
      }
    }

    if (overrides.length) {
      lines.push('');
      lines.push('Lịch tạm thời gần đây:');

      for (const override of overrides.slice(0, 10)) {
        const className =
          classMap.get(override.classId.toString()) ?? 'Lớp không xác định';
        const action =
          override.action === ScheduleOverrideAction.Extra
            ? 'Học thêm'
            : override.action === ScheduleOverrideAction.Reschedule
              ? 'Dời lịch'
              : 'Hủy buổi';

        let detail = `  - ${action}: ${className}`;

        if (override.newDate) {
          const startTime =
            override.timeStorage === 'utc' && override.startTime
              ? convertUtcTimeToVietnam(override.startTime)
              : override.startTime;
          const endTime =
            override.timeStorage === 'utc' && override.endTime
              ? convertUtcTimeToVietnam(override.endTime)
              : override.endTime;

          detail += ` → ${this.formatDate(override.newDate)}`;

          if (startTime && endTime) {
            detail += ` ${startTime}-${endTime}`;
          }
        }

        if (override.reason) {
          detail += ` (${override.reason})`;
        }

        lines.push(detail);
      }
    }

    lines.push('');
    lines.push('Khung giờ rảnh (không có lịch cố định):');

    for (let day = 1; day <= 7; day++) {
      const entries = scheduleByDay.get(day);

      if (!entries?.length) {
        lines.push(`  ${DAY_NAMES[day]}: Cả ngày rảnh`);
        continue;
      }

      const busySlots = this.extractTimeSlots(entries);
      const freeSlots = this.computeFreeSlots(busySlots);

      if (freeSlots.length) {
        lines.push(
          `  ${DAY_NAMES[day]}: ${freeSlots.map((s) => `${s.start}-${s.end}`).join(', ')}`,
        );
      } else {
        lines.push(`  ${DAY_NAMES[day]}: Kín lịch`);
      }
    }

    return lines.join('\n');
  }

  private extractTimeSlots(
    entries: string[],
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];
    const pattern = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;

    for (const entry of entries) {
      const match = pattern.exec(entry);

      if (match) {
        slots.push({ start: match[1], end: match[2] });
      }
    }

    return slots.sort((a, b) => a.start.localeCompare(b.start));
  }

  private computeFreeSlots(
    busySlots: Array<{ start: string; end: string }>,
  ): Array<{ start: string; end: string }> {
    const dayStart = '07:00';
    const dayEnd = '21:00';
    const free: Array<{ start: string; end: string }> = [];

    let cursor = dayStart;

    for (const slot of busySlots) {
      if (cursor < slot.start) {
        free.push({ start: cursor, end: slot.start });
      }

      if (slot.end > cursor) {
        cursor = slot.end;
      }
    }

    if (cursor < dayEnd) {
      free.push({ start: cursor, end: dayEnd });
    }

    return free;
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private buildGreeting(): string {
    return `Xin chào! Tôi là trợ lý AI của EduTrack. Tôi đã xem qua lịch dạy hiện tại của bạn.\n\nBạn có thể mô tả yêu cầu sắp xếp lịch học, ví dụ:\n• "Tôi muốn thêm lớp Toán 9, học 3 buổi/tuần, mỗi buổi 2 tiếng, buổi tối"\n• "Sắp xếp lịch cho lớp Văn 10, 2 buổi/tuần vào sáng thứ 3 và thứ 5"\n• "Gợi ý giờ rảnh để thêm 1 lớp mới"\n\nHãy cho tôi biết bạn cần gì nhé!`;
  }
}
