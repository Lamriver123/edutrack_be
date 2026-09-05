import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  escapeRegex,
  normalizeSearchText,
} from '../../common/utils/search-normalizer';
import {
  convertUtcTimeToVietnam,
  convertUtcWeeklyTimeToVietnam,
  convertVietnamTimeToUtc,
  convertVietnamWeeklyTimeToUtc,
} from '../../common/utils/vietnam-time';
import {
  ClassStatus,
  EnrollmentStatus,
  ScheduleOverrideAction,
  ScheduleType,
  SessionStatus,
  AttendanceStatus,
  TuitionStatus,
  TuitionType,
} from '../school-management/enums';
import {
  Class,
  ClassDocument,
} from '../school-management/schemas/class.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../school-management/schemas/class-session.schema';
import {
  Attendance,
  AttendanceDocument,
} from '../school-management/schemas/attendance.schema';
import {
  TuitionEntry,
  TuitionEntryDocument,
} from '../school-management/schemas/tuition-entry.schema';
import { Exam, ExamDocument } from '../school-management/schemas/exam.schema';
import {
  ExamScore,
  ExamScoreDocument,
} from '../school-management/schemas/exam-score.schema';
import {
  ClassEnrollment,
  ClassEnrollmentDocument,
} from '../school-management/schemas/class-enrollment.schema';
import {
  ScheduleVersion,
  ScheduleVersionDocument,
} from '../school-management/schemas/schedule-version.schema';
import {
  ScheduleOverride,
  ScheduleOverrideDocument,
} from '../school-management/schemas/schedule-override.schema';
import { StudentDocument } from '../school-management/schemas/student.schema';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { StudentResponse, StudentsService } from '../students/students.service';
import { SchedulesService } from '../schedules/schedules.service';
import { CreateClassDto } from './dto/create-class.dto';
import {
  CreateFixedScheduleDto,
  ScheduleSlotDto,
} from './dto/create-fixed-schedule.dto';
import { CreateTemporaryScheduleDto } from './dto/create-temporary-schedule.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { SaveClassSessionContentDto } from './dto/save-class-session-content.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateTemporaryScheduleDto } from './dto/update-temporary-schedule.dto';
import {
  TakeAttendanceDto,
  type AttendanceScheduleEventType,
} from './dto/take-attendance.dto';
import { TakeAttendanceBatchDto } from './dto/take-attendance-batch.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { TakeExamScoresBatchDto } from './dto/take-exam-scores-batch.dto';

const DEFAULT_CLASS_IMAGE_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR-qRE8Ud2H3MA_umzUwRTCefEIGGjOmnsi5hsMnPdrg&s=10';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const VIETNAM_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;

export type ClassScheduleSlotResponse = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type LatestFixedScheduleResponse = {
  id: string;
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  schedules: ClassScheduleSlotResponse[];
};

export type ScheduleOverrideResponse = {
  id: string;
  classId: string;
  action: ScheduleOverrideAction;
  originalDate?: Date;
  newDate?: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

export type ClassSessionResponse = {
  id: string;
  classId: string;
  date: Date;
  startTime: string;
  endTime: string;
  scheduleType: ScheduleType;
  status: SessionStatus;
  topic?: string;
  content?: string;
};

export type ClassResponse = {
  id: string;
  teacherId: string;
  name: string;
  description?: string;
  imageUrl: string;
  colorIndex: number;
  colorHex?: string;
  regularPrice: number;
  makeupPrice: number;
  status: ClassStatus;
  studentCount: number;
  latestFixedSchedule: LatestFixedScheduleResponse | null;
};

export type ClassDetailResponse = ClassResponse & {
  students: StudentResponse[];
};

export type ClassScheduleOverviewResponse = {
  fixedSchedules: LatestFixedScheduleResponse[];
  latestFixedSchedule: LatestFixedScheduleResponse | null;
  temporarySchedules: ScheduleOverrideResponse[];
};

export type EnrollmentResponse = {
  id: string;
  classId: string;
  studentId: string;
  status: EnrollmentStatus;
  joinedAt: Date;
  leftAt?: Date | null;
  student: StudentResponse;
};

type LeanScheduleVersion = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  timeStorage?: 'utc' | 'vietnam';
  schedules?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
};

type EnrollmentCount = {
  _id: Types.ObjectId;
  count: number;
};

type StudentEnrollmentCreationResult = {
  enrollment: ClassEnrollmentDocument;
  student: StudentDocument;
};

type LeanScheduleOverride = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  action: ScheduleOverrideAction;
  originalDate?: Date;
  newDate?: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
  timeStorage?: 'utc' | 'vietnam';
};

type PopulatedAttendanceStudent = {
  _id: Types.ObjectId;
  fullName: string;
  studentCode: string;
  avatarUrl?: string;
};

type LeanAttendanceWithStudent = {
  _id: Types.ObjectId;
  studentId: PopulatedAttendanceStudent;
  status: AttendanceStatus;
  note?: string;
  isBilled?: boolean;
};

type PopulatedAttendanceSession = {
  _id: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  timeStorage?: 'utc' | 'vietnam';
};

type LeanAttendanceSheetRecord = {
  _id: Types.ObjectId;
  sessionId?: Types.ObjectId | PopulatedAttendanceSession | null;
  studentId: Types.ObjectId;
  status: AttendanceStatus;
  note?: string;
  isBilled?: boolean;
};

type LeanBilledTuitionLock = {
  attendanceId?: Types.ObjectId | null;
  sessionId?: Types.ObjectId | null;
  studentId?: Types.ObjectId | null;
};

type AttendanceSummaryRecord = {
  status: AttendanceStatus;
};

type AttendanceBillingLocks = {
  attendanceIds: Set<string>;
  sessionStudentKeys: Set<string>;
};

type ObjectIdValue = Types.ObjectId | string | null | undefined;

@Injectable()
export class ClassesService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassEnrollment.name)
    private readonly enrollmentModel: Model<ClassEnrollmentDocument>,
    @InjectModel(ScheduleVersion.name)
    private readonly scheduleVersionModel: Model<ScheduleVersionDocument>,
    @InjectModel(ScheduleOverride.name)
    private readonly scheduleOverrideModel: Model<ScheduleOverrideDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(TuitionEntry.name)
    private readonly tuitionEntryModel: Model<TuitionEntryDocument>,
    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,
    @InjectModel(ExamScore.name)
    private readonly examScoreModel: Model<ExamScoreDocument>,
    private readonly studentsService: StudentsService,
    private readonly schedulesService: SchedulesService,
  ) {}

  async create(teacherId: string, dto: CreateClassDto) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const [classroom] = await this.classModel.create([
      {
        teacherId: teacherObjectId,
        name: dto.name.trim(),
        searchText: normalizeSearchText(dto.name),
        description: dto.description?.trim(),
        imageUrl: dto.imageUrl?.trim() || DEFAULT_CLASS_IMAGE_URL,
        colorIndex: await this.resolveClassColorIndex(
          teacherObjectId,
          dto.colorIndex,
        ),
        colorHex: this.normalizeColorHex(dto.colorHex),
        regularPrice: dto.regularPrice,
        makeupPrice: dto.makeupPrice,
        status: ClassStatus.Active,
      },
    ]);

    return this.toClassResponse(classroom, 0);
  }

  async findAll(teacherId: string, query: QueryClassesDto = {}) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const search = normalizeSearchText(query.search ?? '');
    const filter: {
      teacherId: Types.ObjectId;
      status: { $ne: ClassStatus };
      $or?: Array<{
        searchText?: { $regex: string; $options: string };
        name?: { $regex: string; $options: string };
      }>;
    } = {
      teacherId: teacherObjectId,
      status: { $ne: ClassStatus.Archived },
    };

    if (search) {
      filter.$or = [
        {
          searchText: {
            $regex: escapeRegex(search),
            $options: 'i',
          },
        },
        {
          name: {
            $regex: escapeRegex(query.search?.trim() ?? ''),
            $options: 'i',
          },
        },
      ];
    }

    const classrooms = await this.classModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
    const classIds = classrooms.map((classroom) => classroom._id);
    const countPromise: Promise<EnrollmentCount[]> = classIds.length
      ? this.enrollmentModel
          .aggregate<EnrollmentCount>([
            {
              $match: {
                teacherId: teacherObjectId,
                classId: { $in: classIds },
                status: EnrollmentStatus.Active,
              },
            },
            {
              $group: {
                _id: '$classId',
                count: { $sum: 1 },
              },
            },
          ])
          .exec()
      : Promise.resolve([]);
    const [counts, latestScheduleMap] = await Promise.all([
      countPromise,
      this.findLatestFixedScheduleMap(teacherObjectId, classIds),
    ]);
    const countMap = new Map<string, number>(
      counts.map((item) => [item._id.toString(), item.count]),
    );

    return classrooms.map((classroom) =>
      this.toClassResponse(
        classroom,
        countMap.get(classroom._id.toString()) ?? 0,
        latestScheduleMap.get(classroom._id.toString()) ?? null,
      ),
    );
  }

  async findDetail(teacherId: string, classId: string) {
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const [students, latestFixedSchedule] = await Promise.all([
      this.findActiveStudentsInClass(teacherId, classroom._id),
      this.findLatestFixedSchedule(
        this.toObjectId(teacherId, 'teacherId'),
        classroom._id,
      ),
    ]);

    return {
      ...this.toClassResponse(classroom, students.length, latestFixedSchedule),
      students: students.map((student) =>
        this.studentsService.toStudentResponse(student),
      ),
    };
  }

  async updateClass(teacherId: string, classId: string, dto: UpdateClassDto) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const updateSet: Record<string, unknown> = {};
    const updateUnset: Record<string, ''> = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException('Tên lớp học không được để trống.');
      }

      updateSet.name = name;
      updateSet.searchText = normalizeSearchText(name);
    }

    if (dto.description !== undefined) {
      const description = dto.description.trim();

      if (description) {
        updateSet.description = description;
      } else {
        updateUnset.description = '';
      }
    }

    if (dto.imageUrl !== undefined) {
      const imageUrl = dto.imageUrl.trim();

      if (imageUrl) {
        updateSet.imageUrl = imageUrl;
      } else {
        updateUnset.imageUrl = '';
      }
    }

    if (dto.colorIndex !== undefined) {
      updateSet.colorIndex = this.normalizeColorIndex(dto.colorIndex);
    }

    if (dto.colorHex !== undefined) {
      updateSet.colorHex = this.normalizeColorHex(dto.colorHex);
    }

    if (dto.regularPrice !== undefined) {
      updateSet.regularPrice = dto.regularPrice;
    }

    if (dto.makeupPrice !== undefined) {
      updateSet.makeupPrice = dto.makeupPrice;
    }

    if (dto.status !== undefined) {
      updateSet.status = dto.status;
    }

    const update: {
      $set?: Record<string, unknown>;
      $unset?: Record<string, ''>;
    } = {};

    if (Object.keys(updateSet).length) {
      update.$set = updateSet;
    }

    if (Object.keys(updateUnset).length) {
      update.$unset = updateUnset;
    }

    if (!update.$set && !update.$unset) {
      return this.toClassResponse(
        classroom,
        await this.countActiveStudentsInClass(teacherObjectId, classroom._id),
        await this.findLatestFixedSchedule(teacherObjectId, classroom._id),
      );
    }

    const updatedClassroom = await this.classModel
      .findOneAndUpdate(
        {
          _id: classroom._id,
          teacherId: teacherObjectId,
          status: { $ne: ClassStatus.Archived },
        },
        update,
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedClassroom) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    if (dto.status === ClassStatus.Archived) {
      await this.deactivateClassEnrollments(
        teacherObjectId,
        updatedClassroom._id,
      );
    }

    return this.toClassResponse(
      updatedClassroom,
      await this.countActiveStudentsInClass(
        teacherObjectId,
        updatedClassroom._id,
      ),
      await this.findLatestFixedSchedule(teacherObjectId, updatedClassroom._id),
    );
  }

  async archiveClass(teacherId: string, classId: string) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const archivedClassroom = await this.classModel
      .findOneAndUpdate(
        {
          _id: classroom._id,
          teacherId: teacherObjectId,
          status: { $ne: ClassStatus.Archived },
        },
        {
          $set: {
            status: ClassStatus.Archived,
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!archivedClassroom) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    await this.deactivateClassEnrollments(
      teacherObjectId,
      archivedClassroom._id,
    );

    return {
      message: 'Đã chuyển lớp học sang trạng thái lưu trữ.',
    };
  }

  async getSchedules(
    teacherId: string,
    classId: string,
  ): Promise<ClassScheduleOverviewResponse> {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const [fixedSchedules, temporarySchedules] = await Promise.all([
      this.scheduleVersionModel
        .find({
          teacherId: teacherObjectId,
          classId: classroom._id,
        })
        .sort({ effectiveFrom: -1, version: -1 })
        .lean<LeanScheduleVersion[]>()
        .exec(),
      this.scheduleOverrideModel
        .find({
          teacherId: teacherObjectId,
          classId: classroom._id,
        })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean<LeanScheduleOverride[]>()
        .exec(),
    ]);
    const fixedScheduleResponses = fixedSchedules.map((schedule) =>
      this.toLatestFixedScheduleResponse(schedule),
    );

    return {
      fixedSchedules: fixedScheduleResponses,
      latestFixedSchedule: fixedScheduleResponses[0] ?? null,
      temporarySchedules: temporarySchedules.map((schedule) =>
        this.toScheduleOverrideResponse(schedule),
      ),
    };
  }

  async saveFixedSchedule(
    teacherId: string,
    classId: string,
    dto: CreateFixedScheduleDto,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const effectiveFrom = this.parseDate(dto.effectiveFrom, 'Ngày áp dụng');
    const schedules = dto.schedules.map((slot) => this.normalizeSlot(slot));
    const latestSchedule = await this.scheduleVersionModel
      .findOne({
        teacherId: teacherObjectId,
        classId: classroom._id,
      })
      .sort({ version: -1 })
      .lean<LeanScheduleVersion>()
      .exec();

    await this.scheduleVersionModel
      .updateMany(
        {
          teacherId: teacherObjectId,
          classId: classroom._id,
          effectiveTo: null,
        },
        {
          $set: {
            effectiveTo: this.getPreviousMoment(effectiveFrom),
          },
        },
      )
      .exec();

    const [schedule] = await this.scheduleVersionModel.create([
      {
        teacherId: teacherObjectId,
        classId: classroom._id,
        version: (latestSchedule?.version ?? 0) + 1,
        effectiveFrom,
        effectiveTo: null,
        schedules,
        timeStorage: 'utc',
      },
    ]);

    return this.toLatestFixedScheduleResponse(schedule);
  }

  async createTemporarySchedule(
    teacherId: string,
    classId: string,
    dto: CreateTemporaryScheduleDto,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const payload = this.buildTemporarySchedulePayload(dto);
    const [temporarySchedule] = await this.scheduleOverrideModel.create([
      {
        teacherId: teacherObjectId,
        classId: classroom._id,
        timeStorage: 'utc',
        ...payload,
      },
    ]);

    return this.toScheduleOverrideResponse(temporarySchedule);
  }

  async updateTemporarySchedule(
    teacherId: string,
    classId: string,
    scheduleId: string,
    dto: UpdateTemporaryScheduleDto,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const scheduleObjectId = this.toObjectId(scheduleId, 'scheduleId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const payload = this.buildTemporarySchedulePayload(dto);
    const updateUnset: Record<string, ''> = {};

    if (dto.action === ScheduleOverrideAction.Cancel) {
      updateUnset.newDate = '';

      if (!dto.startTime?.trim() && !dto.endTime?.trim()) {
        updateUnset.startTime = '';
        updateUnset.endTime = '';
      }
    } else if (dto.action === ScheduleOverrideAction.Extra) {
      updateUnset.originalDate = '';
    }

    const update: {
      $set: Record<string, unknown>;
      $unset?: Record<string, ''>;
    } = {
      $set: {
        timeStorage: 'utc',
        ...payload,
      },
    };

    if (Object.keys(updateUnset).length) {
      update.$unset = updateUnset;
    }

    const temporarySchedule = await this.scheduleOverrideModel
      .findOneAndUpdate(
        {
          _id: scheduleObjectId,
          teacherId: teacherObjectId,
          classId: classroom._id,
        },
        update,
        { returnDocument: 'after' },
      )
      .exec();

    if (!temporarySchedule) {
      throw new NotFoundException('Không tìm thấy lịch tạm thời.');
    }

    return this.toScheduleOverrideResponse(temporarySchedule);
  }

  async revokeTemporarySchedule(
    teacherId: string,
    classId: string,
    scheduleId: string,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const scheduleObjectId = this.toObjectId(scheduleId, 'scheduleId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const temporarySchedule = await this.scheduleOverrideModel
      .findOneAndDelete({
        _id: scheduleObjectId,
        teacherId: teacherObjectId,
        classId: classroom._id,
      })
      .exec();

    if (!temporarySchedule) {
      throw new NotFoundException('Không tìm thấy lịch tạm thời.');
    }

    return {
      message: 'Đã thu hồi lịch tạm thời.',
    };
  }

  async saveSessionContent(
    teacherId: string,
    classId: string,
    dto: SaveClassSessionContentDto,
  ): Promise<ClassSessionResponse> {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const date = this.requireDate(dto.date, 'Ngày buổi học');
    const dateKey = this.toVietnamDateKey(date);
    const startTime = this.requireTime(dto.startTime, 'Giờ bắt đầu');
    const endTime = this.requireTime(dto.endTime, 'Giờ kết thúc');

    if (!this.isStartBeforeEnd(startTime, endTime)) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
    }

    const sourceKey = this.buildClassSessionSourceKey(
      classroom._id.toString(),
      dateKey,
      startTime,
      endTime,
    );
    const updateSet: Record<string, unknown> = {
      teacherId: teacherObjectId,
      classId: classroom._id,
      date,
      startTime: convertVietnamTimeToUtc(startTime),
      endTime: convertVietnamTimeToUtc(endTime),
      timeStorage: 'utc',
      scheduleType: dto.scheduleType ?? ScheduleType.Manual,
      status: SessionStatus.Scheduled,
      sourceKey,
    };
    const updateUnset: Record<string, ''> = {};
    const topic = dto.topic?.trim();
    const content = dto.content?.trim();

    if (topic) {
      updateSet.topic = topic;
    } else {
      updateUnset.topic = '';
    }

    if (content) {
      updateSet.content = content;
    } else {
      updateUnset.content = '';
    }

    const update: {
      $set: Record<string, unknown>;
      $unset?: Record<string, ''>;
    } = {
      $set: updateSet,
    };

    if (Object.keys(updateUnset).length) {
      update.$unset = updateUnset;
    }

    const session = await this.classSessionModel
      .findOneAndUpdate(
        {
          teacherId: teacherObjectId,
          classId: classroom._id,
          sourceKey,
        },
        update,
        {
          returnDocument: 'after',
          setDefaultsOnInsert: true,
          upsert: true,
        },
      )
      .exec();

    if (!session) {
      throw new BadRequestException('Không thể lưu nội dung buổi học.');
    }

    return this.toClassSessionResponse(session);
  }

  async enrollExistingStudent(
    teacherId: string,
    classId: string,
    studentId: string,
  ) {
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const student = await this.studentsService.findByIdForTeacherOrThrow(
      teacherId,
      studentId,
    );
    const enrollment = await this.createActiveEnrollment(
      teacherId,
      classroom._id,
      student._id,
    );

    return this.toEnrollmentResponse(enrollment, student);
  }

  async createStudentAndEnroll(
    teacherId: string,
    classId: string,
    dto: CreateStudentDto,
  ) {
    const session = await this.connection.startSession();

    try {
      const result = (await session.withTransaction(async () =>
        this.createStudentEnrollmentEntities(teacherId, classId, dto, session),
      )) as StudentEnrollmentCreationResult | undefined;

      if (!result) {
        throw new BadRequestException('Không thể thêm học sinh vào lớp.');
      }

      return this.toEnrollmentResponse(result.enrollment, result.student);
    } catch (error) {
      if (this.isTransactionUnsupportedError(error)) {
        const result = await this.createStudentEnrollmentEntities(
          teacherId,
          classId,
          dto,
        );

        return this.toEnrollmentResponse(result.enrollment, result.student);
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async removeStudentFromClass(
    teacherId: string,
    classId: string,
    studentId: string,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classObjectId = this.toObjectId(classId, 'classId');
    const studentObjectId = this.toObjectId(studentId, 'studentId');

    await this.findClassForTeacherOrThrow(teacherId, classObjectId);
    await this.studentsService.findByIdForTeacherOrThrow(
      teacherId,
      studentObjectId,
    );

    const enrollment = await this.enrollmentModel
      .findOneAndUpdate(
        {
          teacherId: teacherObjectId,
          classId: classObjectId,
          studentId: studentObjectId,
          status: EnrollmentStatus.Active,
        },
        {
          $set: {
            status: EnrollmentStatus.Inactive,
            leftAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!enrollment) {
      throw new NotFoundException('Học sinh chưa có trong lớp này.');
    }

    return {
      message: 'Đã cho học sinh nghỉ lớp.',
    };
  }

  async getAttendance(
    teacherId: string,
    classId: string,
    dateString: string,
    startTimeString: string,
    endTimeString: string,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const date = this.requireDate(dateString, 'Ngày buổi học');
    const dateKey = this.toVietnamDateKey(date);
    const startTime = this.requireTime(startTimeString, 'Giờ bắt đầu');
    const endTime = this.requireTime(endTimeString, 'Giờ kết thúc');

    const sourceKey = this.buildClassSessionSourceKey(
      classroom._id.toString(),
      dateKey,
      startTime,
      endTime,
    );

    const session = await this.classSessionModel
      .findOne({
        teacherId: teacherObjectId,
        classId: classroom._id,
        sourceKey,
      })
      .lean()
      .exec();

    if (!session) {
      return {
        sessionId: null,
        classId,
        date: dateString,
        startTime: startTimeString,
        endTime: endTimeString,
        records: [],
        summary: {
          total: 0,
          present: 0,
          absent: 0,
          excused: 0,
        },
      };
    }

    const records = await this.attendanceModel
      .find({
        teacherId: teacherObjectId,
        sessionId: session._id,
      })
      .populate('studentId', 'fullName studentCode avatarUrl')
      .lean<LeanAttendanceWithStudent[]>()
      .exec();

    const billingLocks = await this.findBilledTuitionLocks(
      teacherObjectId,
      classroom._id,
      records.map((record) => record._id),
      [session._id],
      records.map((record) => record.studentId._id),
    );

    const responseRecords = records.map((record) => {
      const studentId = record.studentId._id.toString();

      return {
        id: record._id.toString(),
        studentId,
        studentName: record.studentId.fullName,
        studentCode: record.studentId.studentCode,
        studentAvatar: record.studentId.avatarUrl,
        status: record.status,
        note: record.note,
        isBilled:
          record.isBilled ||
          billingLocks.attendanceIds.has(record._id.toString()) ||
          billingLocks.sessionStudentKeys.has(
            `${session._id.toString()}:${studentId}`,
          ),
      };
    });

    return {
      sessionId: session._id.toString(),
      classId,
      date: dateString,
      startTime: startTimeString,
      endTime: endTimeString,
      records: responseRecords,
      summary: this.calculateAttendanceSummary(responseRecords),
    };
  }

  async getAttendanceSheet(teacherId: string, classId: string) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);

    // Get all sessions from first version to today
    const sessions = await this.schedulesService.getClassScheduleHistory(
      teacherId,
      classId,
    );

    // Get all attendance records for this class
    const records = await this.attendanceModel
      .find({
        teacherId: teacherObjectId,
        classId: classroom._id,
      })
      .populate('sessionId')
      .lean<LeanAttendanceSheetRecord[]>()
      .exec();

    const billingLocks = await this.findBilledTuitionLocks(
      teacherObjectId,
      classroom._id,
      records.map((record) => record._id),
      records.map((record) => this.getAttendanceSessionId(record.sessionId)),
      records.map((record) => record.studentId),
    );

    // Map records to a flat list for easy consumption
    const attendanceRecords = records.map((record) => {
      const populatedSession = this.getPopulatedAttendanceSession(
        record.sessionId,
      );
      let mappedSessionId =
        populatedSession?._id.toString() ??
        this.getAttendanceSessionId(record.sessionId);

      if (populatedSession) {
        const dateKey = this.toVietnamDateKey(populatedSession.date);
        const startTimeStr =
          this.toVietnamTime(
            populatedSession.startTime,
            populatedSession.timeStorage,
          ) ?? populatedSession.startTime;
        const endTimeStr =
          this.toVietnamTime(
            populatedSession.endTime,
            populatedSession.timeStorage,
          ) ?? populatedSession.endTime;

        const virtualSession = sessions.find(
          (s) =>
            s.date === dateKey &&
            s.startTime === startTimeStr &&
            s.endTime === endTimeStr,
        );
        if (virtualSession) {
          mappedSessionId = virtualSession.id;
        }
      }

      return {
        id: record._id.toString(),
        sessionId: mappedSessionId,
        studentId: record.studentId.toString(),
        status: record.status,
        note: record.note,
        isBilled:
          record.isBilled ||
          billingLocks.attendanceIds.has(record._id.toString()) ||
          billingLocks.sessionStudentKeys.has(
            `${this.getAttendanceSessionId(record.sessionId)}:${record.studentId.toString()}`,
          ),
      };
    });

    return {
      sessions,
      records: attendanceRecords,
    };
  }

  async takeAttendanceBatch(
    teacherId: string,
    classId: string,
    dto: TakeAttendanceBatchDto,
  ) {
    if (!dto.sessions.length) {
      return {
        message: 'Không có buổi học nào cần cập nhật.',
        updatedSessions: 0,
      };
    }

    let updatedSessions = 0;
    const dbSession = await this.connection.startSession();

    try {
      await dbSession.withTransaction(async () => {
        for (const sessionDto of dto.sessions) {
          await this.saveAttendanceForSession(
            teacherId,
            classId,
            sessionDto,
            dbSession,
          );
          updatedSessions += 1;
        }
      });
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error;
      }

      updatedSessions = 0;
      for (const sessionDto of dto.sessions) {
        await this.saveAttendanceForSession(teacherId, classId, sessionDto);
        updatedSessions += 1;
      }
    } finally {
      await dbSession.endSession();
    }

    return {
      message: 'Đã lưu điểm danh thành công.',
      updatedSessions,
    };
  }

  async takeAttendance(
    teacherId: string,
    classId: string,
    dto: TakeAttendanceDto,
  ) {
    const dbSession = await this.connection.startSession();
    try {
      await dbSession.withTransaction(async () => {
        await this.saveAttendanceForSession(teacherId, classId, dto, dbSession);
      });
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error;
      }

      await this.saveAttendanceForSession(teacherId, classId, dto);
    } finally {
      await dbSession.endSession();
    }

    return this.getAttendance(
      teacherId,
      classId,
      dto.date,
      dto.startTime,
      dto.endTime,
    );
  }

  private async saveAttendanceForSession(
    teacherId: string,
    classId: string,
    dto: TakeAttendanceDto,
    dbSession?: ClientSession,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classroom = await this.findClassForTeacherOrThrow(
      teacherId,
      classId,
      dbSession,
    );

    const date = this.requireDate(dto.date, 'Ngày buổi học');
    const dateKey = this.toVietnamDateKey(date);
    const startTime = this.requireTime(dto.startTime, 'Giờ bắt đầu');
    const endTime = this.requireTime(dto.endTime, 'Giờ kết thúc');

    if (!this.isStartBeforeEnd(startTime, endTime)) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
    }

    const sourceKey = this.buildClassSessionSourceKey(
      classroom._id.toString(),
      dateKey,
      startTime,
      endTime,
    );

    const sessionOptions: {
      returnDocument: 'after';
      upsert: true;
      session?: ClientSession;
    } = {
      returnDocument: 'after',
      upsert: true,
    };

    if (dbSession) {
      sessionOptions.session = dbSession;
    }

    const session = await this.classSessionModel
      .findOneAndUpdate(
        {
          teacherId: teacherObjectId,
          classId: classroom._id,
          sourceKey,
        },
        {
          $setOnInsert: {
            date,
            startTime: convertVietnamTimeToUtc(startTime),
            endTime: convertVietnamTimeToUtc(endTime),
            timeStorage: 'utc',
            scheduleType: this.resolveSessionScheduleType(
              dto.scheduleEventType,
            ),
            status: SessionStatus.Completed, // Mark as completed when attended
          },
        },
        sessionOptions,
      )
      .exec();

    if (!session) {
      throw new BadRequestException('Không thể tạo hoặc tìm thấy buổi học.');
    }

    const studentIds = dto.records.map((r) =>
      this.toObjectId(r.studentId, 'studentId'),
    );
    const enrollmentQuery = this.enrollmentModel.find({
      teacherId: teacherObjectId,
      classId: classroom._id,
      studentId: { $in: studentIds },
      status: EnrollmentStatus.Active,
    });

    if (dbSession) {
      enrollmentQuery.session(dbSession);
    }

    const enrollments = await enrollmentQuery.exec();

    const enrolledStudentIds = new Set(
      enrollments.map((e) => e.studentId.toString()),
    );

    for (const recordDto of dto.records) {
      if (!enrolledStudentIds.has(recordDto.studentId)) {
        throw new BadRequestException(
          `Học sinh với ID ${recordDto.studentId} không có trong lớp hoặc không active.`,
        );
      }
    }

    for (const recordDto of dto.records) {
      const studentObjectId = this.toObjectId(recordDto.studentId, 'studentId');
      const attendanceFilter = {
        teacherId: teacherObjectId,
        sessionId: session._id,
        studentId: studentObjectId,
      };
      const existingAttendanceQuery =
        this.attendanceModel.findOne(attendanceFilter);

      if (dbSession) {
        existingAttendanceQuery.session(dbSession);
      }

      const existingAttendance = await existingAttendanceQuery.exec();
      const isLockedByBilledTuition = await this.hasBilledTuitionEntry(
        teacherObjectId,
        classroom._id,
        session._id,
        studentObjectId,
        existingAttendance?._id,
        dbSession,
      );

      if (existingAttendance?.isBilled || isLockedByBilledTuition) {
        throw new BadRequestException(
          'Điểm danh của buổi học này đã được xuất hóa đơn, không thể chỉnh sửa.',
        );
      }

      if (!recordDto.status) {
        if (existingAttendance) {
          await this.attendanceModel
            .deleteOne({ _id: existingAttendance._id }, { session: dbSession })
            .exec();
          await this.tuitionEntryModel
            .deleteOne(
              {
                teacherId: teacherObjectId,
                $or: [
                  { attendanceId: existingAttendance._id },
                  {
                    sessionId: session._id,
                    studentId: studentObjectId,
                  },
                ],
              },
              { session: dbSession },
            )
            .exec();
        }
        continue;
      }

      const attendanceUpdateOptions: {
        returnDocument: 'after';
        upsert: true;
        session?: ClientSession;
      } = {
        returnDocument: 'after',
        upsert: true,
      };

      if (dbSession) {
        attendanceUpdateOptions.session = dbSession;
      }

      const attendance = await this.attendanceModel
        .findOneAndUpdate(
          attendanceFilter,
          {
            $set: {
              classId: classroom._id,
              status: recordDto.status,
              note: recordDto.note || '',
            },
            $setOnInsert: {
              teacherId: teacherObjectId,
              sessionId: session._id,
              studentId: studentObjectId,
            },
          },
          attendanceUpdateOptions,
        )
        .exec();

      if (!attendance) {
        throw new BadRequestException('Không thể lưu điểm danh học sinh.');
      }

      if (
        recordDto.status === AttendanceStatus.Present ||
        recordDto.status === AttendanceStatus.Absent ||
        recordDto.status === AttendanceStatus.Late
      ) {
        const tuitionSnapshot = this.resolveAttendanceTuition(
          recordDto.status,
          dto.scheduleEventType,
          classroom.regularPrice,
          classroom.makeupPrice,
        );
        const tuitionUpdateOptions: {
          returnDocument: 'after';
          upsert: true;
          session?: ClientSession;
        } = {
          returnDocument: 'after',
          upsert: true,
        };

        if (dbSession) {
          tuitionUpdateOptions.session = dbSession;
        }

        await this.tuitionEntryModel
          .findOneAndUpdate(
            {
              teacherId: teacherObjectId,
              $or: [
                { attendanceId: attendance._id },
                {
                  sessionId: session._id,
                  studentId: studentObjectId,
                },
              ],
            },
            {
              $set: {
                studentId: studentObjectId,
                classId: classroom._id,
                sessionId: session._id,
                attendanceId: attendance._id,
                type: tuitionSnapshot.type,
                amount: tuitionSnapshot.amount,
                classNameSnapshot: classroom.name,
                sessionDate: session.date,
                sessionStartTime: startTime,
                sessionEndTime: endTime,
                topicSnapshot: session.topic || '',
                contentSnapshot: session.content || '',
              },
            },
            tuitionUpdateOptions,
          )
          .exec();
      } else if (recordDto.status === AttendanceStatus.Excused) {
        await this.tuitionEntryModel
          .findOneAndDelete(
            {
              teacherId: teacherObjectId,
              $or: [
                { attendanceId: attendance._id },
                {
                  sessionId: session._id,
                  studentId: studentObjectId,
                },
              ],
            },
            { session: dbSession },
          )
          .exec();
      }
    }
  }

  private resolveSessionScheduleType(
    scheduleEventType?: AttendanceScheduleEventType,
  ) {
    if (scheduleEventType === 'fixed') {
      return ScheduleType.Fixed;
    }

    if (scheduleEventType === 'extra') {
      return ScheduleType.Extra;
    }

    if (scheduleEventType === 'reschedule') {
      return ScheduleType.Temporary;
    }

    return ScheduleType.Manual;
  }

  private resolveAttendanceTuition(
    status: AttendanceStatus,
    scheduleEventType: AttendanceScheduleEventType | undefined,
    regularPrice: number,
    makeupPrice: number,
  ) {
    const isExtraSession = scheduleEventType === 'extra';
    const amount = isExtraSession ? makeupPrice : regularPrice;

    if (status === AttendanceStatus.Absent) {
      return {
        type: TuitionType.Absence,
        amount,
      };
    }

    return {
      type: isExtraSession ? TuitionType.Extra : TuitionType.Regular,
      amount,
    };
  }

  async getAttendanceOverview(teacherIdStr: string, classIdStr: string) {
    const teacherId = this.toObjectId(teacherIdStr, 'Giáo viên');
    const classId = this.toObjectId(classIdStr, 'Lớp học');

    // Xác minh quyền sở hữu lớp
    const classroom = await this.classModel
      .findOne({
        _id: classId,
        teacherId,
        status: { $ne: ClassStatus.Archived },
      })
      .lean()
      .exec();

    if (!classroom) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    const attendances = await this.attendanceModel
      .find({ teacherId, classId })
      .lean()
      .exec();

    const overview: Record<
      string,
      { present: number; absent: number; excused: number; total: number }
    > = {};

    attendances.forEach((record) => {
      const studentId = record.studentId.toString();
      if (!overview[studentId]) {
        overview[studentId] = { present: 0, absent: 0, excused: 0, total: 0 };
      }

      overview[studentId].total++;
      if (
        record.status === AttendanceStatus.Present ||
        record.status === AttendanceStatus.Late
      )
        overview[studentId].present++;
      else if (record.status === AttendanceStatus.Absent)
        overview[studentId].absent++;
      else if (record.status === AttendanceStatus.Excused)
        overview[studentId].excused++;
    });

    return overview;
  }

  private getPopulatedAttendanceSession(
    session: Types.ObjectId | PopulatedAttendanceSession | null | undefined,
  ): PopulatedAttendanceSession | null {
    if (
      !session ||
      typeof session !== 'object' ||
      !('date' in session) ||
      !(session.date instanceof Date)
    ) {
      return null;
    }

    return session;
  }

  private getAttendanceSessionId(
    session: Types.ObjectId | PopulatedAttendanceSession | null | undefined,
  ) {
    if (!session) {
      return '';
    }

    if (session instanceof Types.ObjectId) {
      return session.toString();
    }

    return session._id.toString();
  }

  private async findBilledTuitionLocks(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
    attendanceIdValues: ObjectIdValue[],
    sessionIdValues: ObjectIdValue[],
    studentIdValues: ObjectIdValue[],
    dbSession?: ClientSession,
  ): Promise<AttendanceBillingLocks> {
    const attendanceIds = this.toUniqueObjectIds(attendanceIdValues);
    const sessionIds = this.toUniqueObjectIds(sessionIdValues);
    const studentIds = this.toUniqueObjectIds(studentIdValues);
    const lockFilters: Record<string, unknown>[] = [];

    if (attendanceIds.length) {
      lockFilters.push({ attendanceId: { $in: attendanceIds } });
    }

    if (sessionIds.length && studentIds.length) {
      lockFilters.push({
        sessionId: { $in: sessionIds },
        studentId: { $in: studentIds },
      });
    }

    const locks: AttendanceBillingLocks = {
      attendanceIds: new Set<string>(),
      sessionStudentKeys: new Set<string>(),
    };

    if (!lockFilters.length) {
      return locks;
    }

    const query = this.tuitionEntryModel
      .find({
        teacherId,
        classId,
        status: TuitionStatus.Billed,
        $or: lockFilters,
      })
      .select('attendanceId sessionId studentId')
      .lean<LeanBilledTuitionLock[]>();

    if (dbSession) {
      query.session(dbSession);
    }

    const tuitionEntries = await query.exec();

    for (const entry of tuitionEntries) {
      if (entry.attendanceId) {
        locks.attendanceIds.add(entry.attendanceId.toString());
      }

      if (entry.sessionId && entry.studentId) {
        locks.sessionStudentKeys.add(
          `${entry.sessionId.toString()}:${entry.studentId.toString()}`,
        );
      }
    }

    return locks;
  }

  private async hasBilledTuitionEntry(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
    sessionId: Types.ObjectId,
    studentId: Types.ObjectId,
    attendanceId?: Types.ObjectId,
    dbSession?: ClientSession,
  ) {
    const locks = await this.findBilledTuitionLocks(
      teacherId,
      classId,
      attendanceId ? [attendanceId] : [],
      [sessionId],
      [studentId],
      dbSession,
    );

    return (
      (attendanceId && locks.attendanceIds.has(attendanceId.toString())) ||
      locks.sessionStudentKeys.has(
        `${sessionId.toString()}:${studentId.toString()}`,
      )
    );
  }

  private toUniqueObjectIds(values: ObjectIdValue[]) {
    const map = new Map<string, Types.ObjectId>();

    for (const value of values) {
      if (!value) {
        continue;
      }

      const id = value instanceof Types.ObjectId ? value.toString() : value;

      if (!Types.ObjectId.isValid(id) || map.has(id)) {
        continue;
      }

      map.set(id, new Types.ObjectId(id));
    }

    return [...map.values()];
  }

  private calculateAttendanceSummary(records: AttendanceSummaryRecord[]) {
    const summary = {
      total: records.length,
      present: 0,
      absent: 0,
      excused: 0,
    };

    for (const record of records) {
      if (
        record.status === AttendanceStatus.Present ||
        record.status === AttendanceStatus.Late
      ) {
        summary.present++;
      } else if (record.status === AttendanceStatus.Absent) {
        summary.absent++;
      } else if (record.status === AttendanceStatus.Excused) {
        summary.excused++;
      }
    }

    return summary;
  }

  private async resolveClassColorIndex(
    teacherId: Types.ObjectId,
    requestedColorIndex?: number,
  ) {
    if (requestedColorIndex !== undefined) {
      return this.normalizeColorIndex(requestedColorIndex);
    }

    const classes = await this.classModel
      .find({
        teacherId,
        status: { $ne: ClassStatus.Archived },
      })
      .select('colorIndex')
      .lean<Array<{ colorIndex?: number }>>()
      .exec();
    const usedColorIndexes = new Set(
      classes
        .map((classroom) => classroom.colorIndex)
        .filter((colorIndex): colorIndex is number => colorIndex !== undefined),
    );

    for (let colorIndex = 0; colorIndex <= 7; colorIndex += 1) {
      if (!usedColorIndexes.has(colorIndex)) {
        return colorIndex;
      }
    }

    return 0;
  }

  private normalizeColorIndex(colorIndex: number) {
    if (!Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex > 7) {
      throw new BadRequestException('Màu lớp học không hợp lệ.');
    }

    return colorIndex;
  }

  private normalizeColorHex(colorHex: string | undefined) {
    const normalizedColor = colorHex?.trim().toLowerCase();

    if (!normalizedColor) {
      return undefined;
    }

    if (!/^#([0-9a-f]{6})$/.test(normalizedColor)) {
      throw new BadRequestException('Màu lớp học phải có dạng #RRGGBB.');
    }

    return normalizedColor;
  }

  private countActiveStudentsInClass(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    return this.enrollmentModel
      .countDocuments({
        teacherId,
        classId,
        status: EnrollmentStatus.Active,
      })
      .exec();
  }

  private deactivateClassEnrollments(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    return this.enrollmentModel
      .updateMany(
        {
          teacherId,
          classId,
          status: EnrollmentStatus.Active,
        },
        {
          $set: {
            status: EnrollmentStatus.Inactive,
            leftAt: new Date(),
          },
        },
      )
      .exec();
  }

  private async findClassForTeacherOrThrow(
    teacherId: string,
    classId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    const query = this.classModel.findOne({
      _id:
        classId instanceof Types.ObjectId
          ? classId
          : this.toObjectId(classId, 'classId'),
      teacherId: this.toObjectId(teacherId, 'teacherId'),
      status: { $ne: ClassStatus.Archived },
    });

    if (session) {
      query.session(session);
    }

    const classroom = await query.exec();

    if (!classroom) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    return classroom;
  }

  private async findActiveStudentsInClass(
    teacherId: string,
    classId: Types.ObjectId,
  ) {
    const enrollments = await this.enrollmentModel
      .find({
        teacherId: this.toObjectId(teacherId, 'teacherId'),
        classId,
        status: EnrollmentStatus.Active,
      })
      .sort({ joinedAt: -1 })
      .exec();
    const studentIds = enrollments.map((enrollment) => enrollment.studentId);

    if (!studentIds.length) {
      return [];
    }

    const students = await Promise.all(
      studentIds.map((studentId) =>
        this.studentsService.findByIdForTeacherOrThrow(teacherId, studentId),
      ),
    );

    return students;
  }

  private async createActiveEnrollment(
    teacherId: string,
    classId: Types.ObjectId,
    studentId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const filter: {
      teacherId: Types.ObjectId;
      classId: Types.ObjectId;
      studentId: Types.ObjectId;
      status: EnrollmentStatus;
    } = {
      teacherId: this.toObjectId(teacherId, 'teacherId'),
      classId,
      studentId,
      status: EnrollmentStatus.Active,
    };
    const existingQuery = this.enrollmentModel.findOne(filter);

    if (session) {
      existingQuery.session(session);
    }

    const existingEnrollment = await existingQuery.exec();

    if (existingEnrollment) {
      return existingEnrollment;
    }

    try {
      const [enrollment] = await this.enrollmentModel.create(
        [
          {
            teacherId: this.toObjectId(teacherId, 'teacherId'),
            classId,
            studentId,
            joinedAt: new Date(),
            leftAt: null,
            status: EnrollmentStatus.Active,
          },
        ],
        { session },
      );

      return enrollment;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const retryQuery = this.enrollmentModel.findOne(filter);

        if (session) {
          retryQuery.session(session);
        }

        const enrollment = await retryQuery.exec();

        if (enrollment) {
          return enrollment;
        }
      }

      throw error;
    }
  }

  private async createStudentEnrollmentEntities(
    teacherId: string,
    classId: string,
    dto: CreateStudentDto,
    session?: ClientSession,
  ): Promise<StudentEnrollmentCreationResult> {
    const classroom = await this.findClassForTeacherOrThrow(
      teacherId,
      classId,
      session,
    );
    const student = await this.studentsService.create(teacherId, dto, session);
    const enrollment = await this.createActiveEnrollment(
      teacherId,
      classroom._id,
      student._id,
      session,
    );

    return {
      enrollment,
      student,
    };
  }

  private toClassResponse(
    classroom: ClassDocument,
    studentCount: number,
    latestFixedSchedule: LatestFixedScheduleResponse | null = null,
  ): ClassResponse {
    return {
      id: classroom._id.toString(),
      teacherId: classroom.teacherId.toString(),
      name: classroom.name,
      description: classroom.description,
      imageUrl: classroom.imageUrl || DEFAULT_CLASS_IMAGE_URL,
      colorIndex: classroom.colorIndex ?? 0,
      colorHex: classroom.colorHex,
      regularPrice: classroom.regularPrice,
      makeupPrice: classroom.makeupPrice,
      status: classroom.status,
      studentCount,
      latestFixedSchedule,
    };
  }

  private normalizeSlot(slot: ScheduleSlotDto): ClassScheduleSlotResponse {
    const startTime = slot.startTime.trim();
    const endTime = slot.endTime.trim();

    if (!this.isStartBeforeEnd(startTime, endTime)) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
    }
    const utcStart = convertVietnamWeeklyTimeToUtc(slot.dayOfWeek, startTime);

    return {
      dayOfWeek: utcStart.dayOfWeek,
      startTime: utcStart.time,
      endTime: convertVietnamTimeToUtc(endTime),
    };
  }

  private buildTemporarySchedulePayload(dto: CreateTemporaryScheduleDto) {
    const reason = dto.reason?.trim() || undefined;

    if (dto.action === ScheduleOverrideAction.Cancel) {
      const startTime = dto.startTime?.trim();
      const endTime = dto.endTime?.trim();
      const timePayload =
        startTime || endTime
          ? this.buildOptionalTemporaryTimePayload(startTime, endTime)
          : {};

      return {
        action: dto.action,
        originalDate: this.requireDate(dto.originalDate, 'Ngày cần hủy'),
        ...timePayload,
        reason,
      };
    }

    if (dto.action === ScheduleOverrideAction.Reschedule) {
      const startTime = this.requireTime(dto.startTime, 'Giờ bắt đầu');
      const endTime = this.requireTime(dto.endTime, 'Giờ kết thúc');

      if (!this.isStartBeforeEnd(startTime, endTime)) {
        throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
      }

      return {
        action: dto.action,
        originalDate: this.requireDate(dto.originalDate, 'Ngày gốc'),
        newDate: this.requireDate(dto.newDate, 'Ngày học mới'),
        startTime: convertVietnamTimeToUtc(startTime),
        endTime: convertVietnamTimeToUtc(endTime),
        reason,
      };
    }

    const startTime = this.requireTime(dto.startTime, 'Giờ bắt đầu');
    const endTime = this.requireTime(dto.endTime, 'Giờ kết thúc');

    if (!this.isStartBeforeEnd(startTime, endTime)) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
    }

    return {
      action: ScheduleOverrideAction.Extra,
      newDate: this.requireDate(dto.newDate, 'Ngày học thêm'),
      startTime: convertVietnamTimeToUtc(startTime),
      endTime: convertVietnamTimeToUtc(endTime),
      reason,
    };
  }

  private buildOptionalTemporaryTimePayload(
    startTime: string | undefined,
    endTime: string | undefined,
  ) {
    if (!startTime || !endTime) {
      throw new BadRequestException(
        'Vui lòng nhập đầy đủ giờ bắt đầu và giờ kết thúc.',
      );
    }

    if (!this.isStartBeforeEnd(startTime, endTime)) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
    }

    return {
      startTime: convertVietnamTimeToUtc(startTime),
      endTime: convertVietnamTimeToUtc(endTime),
    };
  }

  private async findLatestFixedScheduleMap(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
  ) {
    const latestScheduleMap = new Map<string, LatestFixedScheduleResponse>();

    if (!classIds.length) {
      return latestScheduleMap;
    }

    const schedules = await this.scheduleVersionModel
      .find({
        teacherId,
        classId: { $in: classIds },
      })
      .sort({ effectiveFrom: -1, createdAt: -1 })
      .lean<LeanScheduleVersion[]>()
      .exec();

    for (const schedule of schedules) {
      const classId = schedule.classId.toString();

      if (!latestScheduleMap.has(classId)) {
        latestScheduleMap.set(
          classId,
          this.toLatestFixedScheduleResponse(schedule),
        );
      }
    }

    return latestScheduleMap;
  }

  private async findLatestFixedSchedule(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    const schedule = await this.scheduleVersionModel
      .findOne({
        teacherId,
        classId,
      })
      .sort({ effectiveFrom: -1, createdAt: -1 })
      .lean<LeanScheduleVersion>()
      .exec();

    return schedule ? this.toLatestFixedScheduleResponse(schedule) : null;
  }

  private toLatestFixedScheduleResponse(
    schedule: LeanScheduleVersion,
  ): LatestFixedScheduleResponse {
    return {
      id: schedule._id.toString(),
      version: schedule.version,
      effectiveFrom: schedule.effectiveFrom,
      effectiveTo: schedule.effectiveTo ?? null,
      schedules: (schedule.schedules ?? []).map((slot) =>
        this.toVietnamScheduleSlot(slot, schedule.timeStorage),
      ),
    };
  }

  private toScheduleOverrideResponse(
    schedule: LeanScheduleOverride | ScheduleOverrideDocument,
  ): ScheduleOverrideResponse {
    return {
      id: schedule._id.toString(),
      classId: schedule.classId.toString(),
      action: schedule.action,
      originalDate: schedule.originalDate,
      newDate: schedule.newDate,
      startTime: this.toVietnamTime(schedule.startTime, schedule.timeStorage),
      endTime: this.toVietnamTime(schedule.endTime, schedule.timeStorage),
      reason: schedule.reason,
    };
  }

  private toClassSessionResponse(
    session: ClassSessionDocument,
  ): ClassSessionResponse {
    return {
      id: session._id.toString(),
      classId: session.classId.toString(),
      date: session.date,
      startTime:
        this.toVietnamTime(session.startTime, session.timeStorage) ??
        session.startTime,
      endTime:
        this.toVietnamTime(session.endTime, session.timeStorage) ??
        session.endTime,
      scheduleType: session.scheduleType,
      status: session.status,
      topic: session.topic,
      content: session.content,
    };
  }

  private toVietnamScheduleSlot(
    slot: ClassScheduleSlotResponse,
    timeStorage?: 'utc' | 'vietnam',
  ) {
    if (timeStorage !== 'utc') {
      return slot;
    }

    const start = convertUtcWeeklyTimeToVietnam(slot.dayOfWeek, slot.startTime);

    return {
      dayOfWeek: start.dayOfWeek,
      startTime: start.time,
      endTime: convertUtcTimeToVietnam(slot.endTime),
    };
  }

  private toVietnamTime(
    time: string | undefined,
    timeStorage?: 'utc' | 'vietnam',
  ) {
    if (!time) {
      return undefined;
    }

    return timeStorage === 'utc' ? convertUtcTimeToVietnam(time) : time;
  }

  private toEnrollmentResponse(
    enrollment: ClassEnrollmentDocument,
    student: StudentDocument,
  ): EnrollmentResponse {
    return {
      id: enrollment._id.toString(),
      classId: enrollment.classId.toString(),
      studentId: enrollment.studentId.toString(),
      status: enrollment.status,
      joinedAt: enrollment.joinedAt,
      leftAt: enrollment.leftAt,
      student: this.studentsService.toStudentResponse(student),
    };
  }

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    }

    return new Types.ObjectId(value);
  }

  private parseDate(value: string, label: string) {
    const normalizedValue = value.trim();
    const dateOnlyMatch = DATE_ONLY_PATTERN.exec(normalizedValue);

    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      const utcDate = new Date(Date.UTC(year, month - 1, day));

      if (
        utcDate.getUTCFullYear() !== year ||
        utcDate.getUTCMonth() !== month - 1 ||
        utcDate.getUTCDate() !== day
      ) {
        throw new BadRequestException(`${label} không hợp lệ.`);
      }

      return new Date(
        Date.UTC(year, month - 1, day) - VIETNAM_TIMEZONE_OFFSET_MS,
      );
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${label} không hợp lệ.`);
    }

    return date;
  }

  private toVietnamDateKey(date: Date) {
    const vietnamDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET_MS);
    const year = vietnamDate.getUTCFullYear();
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private requireDate(value: string | undefined, label: string) {
    if (!value?.trim()) {
      throw new BadRequestException(`Vui lòng nhập ${label.toLowerCase()}.`);
    }

    return this.parseDate(value, label);
  }

  private requireTime(value: string | undefined, label: string) {
    if (!value?.trim()) {
      throw new BadRequestException(`Vui lòng nhập ${label.toLowerCase()}.`);
    }

    return value.trim();
  }

  private getPreviousMoment(date: Date) {
    return new Date(date.getTime() - 1);
  }

  private isStartBeforeEnd(startTime: string, endTime: string) {
    return startTime < endTime;
  }

  private buildClassSessionSourceKey(
    classId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    return `${classId}:${date}:${startTime}:${endTime}`;
  }

  // --- Exam Management ---
  async getExamSheet(teacherIdStr: string, classIdStr: string) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');

    await this.findClassForTeacherOrThrow(teacherIdStr, classId);

    const activeStudents = await this.findActiveStudentsInClass(
      teacherIdStr,
      classId,
    );

    const exams = await this.examModel
      .find({ teacherId, classId, deletedAt: null })
      .sort({ testDate: 1 })
      .lean()
      .exec();

    const scores = await this.examScoreModel
      .find({ teacherId, classId, deletedAt: null })
      .lean()
      .exec();

    return {
      students: activeStudents.map((s) =>
        this.studentsService.toStudentResponse(s),
      ),
      exams: exams.map((e) => ({
        id: e._id.toString(),
        title: e.title,
        testDate: e.testDate,
        maxScore: e.maxScore,
        description: e.description,
        fileUrl: e.fileUrl,
        fileName: e.fileName,
      })),
      scores: scores.map((s) => ({
        id: s._id.toString(),
        examId: s.examId.toString(),
        studentId: s.studentId.toString(),
        score: s.score,
        note: s.note,
        evidenceImages: s.evidenceImages || [],
      })),
    };
  }

  async createExam(
    teacherIdStr: string,
    classIdStr: string,
    dto: CreateExamDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');

    await this.findClassForTeacherOrThrow(teacherIdStr, classId);

    const [exam] = await this.examModel.create([
      {
        teacherId,
        classId,
        title: dto.title,
        testDate: new Date(dto.testDate),
        maxScore: dto.maxScore,
        description: dto.description,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
      },
    ]);

    return {
      id: exam._id.toString(),
      title: exam.title,
      testDate: exam.testDate,
      maxScore: exam.maxScore,
      description: exam.description,
      fileUrl: exam.fileUrl,
      fileName: exam.fileName,
    };
  }

  async updateExam(
    teacherIdStr: string,
    classIdStr: string,
    examIdStr: string,
    dto: UpdateExamDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');
    const examId = this.toObjectId(examIdStr, 'examId');

    await this.findClassForTeacherOrThrow(teacherIdStr, classId);

    const exam = await this.examModel.findOne({
      _id: examId,
      teacherId,
      classId,
      deletedAt: null,
    });

    if (!exam) {
      throw new NotFoundException('Không tìm thấy bài kiểm tra.');
    }

    if (dto.title !== undefined) exam.title = dto.title;
    if (dto.testDate !== undefined) exam.testDate = new Date(dto.testDate);
    if (dto.maxScore !== undefined) exam.maxScore = dto.maxScore;
    if (dto.description !== undefined) exam.description = dto.description;
    if (dto.fileUrl !== undefined) exam.fileUrl = dto.fileUrl;
    if (dto.fileName !== undefined) exam.fileName = dto.fileName;

    await exam.save();

    return {
      id: exam._id.toString(),
      title: exam.title,
      testDate: exam.testDate,
      maxScore: exam.maxScore,
      description: exam.description,
      fileUrl: exam.fileUrl,
      fileName: exam.fileName,
    };
  }

  async deleteExam(
    teacherIdStr: string,
    classIdStr: string,
    examIdStr: string,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');
    const examId = this.toObjectId(examIdStr, 'examId');

    await this.findClassForTeacherOrThrow(teacherIdStr, classId);

    const dbSession = await this.connection.startSession();
    try {
      await dbSession.withTransaction(async () => {
        const deletedAt = new Date();
        await this.examModel.updateOne(
          { _id: examId, teacherId, classId },
          { $set: { deletedAt } },
          { session: dbSession },
        );

        await this.examScoreModel.updateMany(
          { examId, teacherId, classId, deletedAt: null },
          { $set: { deletedAt } },
          { session: dbSession },
        );
      });
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error;
      }

      const deletedAt = new Date();
      await this.examModel.updateOne(
        { _id: examId, teacherId, classId },
        { $set: { deletedAt } },
      );

      await this.examScoreModel.updateMany(
        { examId, teacherId, classId, deletedAt: null },
        { $set: { deletedAt } },
      );
    } finally {
      await dbSession.endSession();
    }

    return { message: 'Xóa bài kiểm tra thành công.' };
  }

  async takeExamScoresBatch(
    teacherIdStr: string,
    classIdStr: string,
    dto: TakeExamScoresBatchDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');

    await this.findClassForTeacherOrThrow(teacherIdStr, classId);

    if (!dto.scores || dto.scores.length === 0) {
      return { message: 'Không có điểm nào được cập nhật.' };
    }

    const examIds = [
      ...new Set(dto.scores.map((entry) => entry.examId.trim())),
    ].map((examId) => this.toObjectId(examId, 'examId'));
    const studentIds = [
      ...new Set(dto.scores.map((entry) => entry.studentId.trim())),
    ].map((studentId) => this.toObjectId(studentId, 'studentId'));

    const [exams, enrollments] = await Promise.all([
      this.examModel
        .find({
          _id: { $in: examIds },
          teacherId,
          classId,
          deletedAt: null,
        })
        .lean()
        .exec(),
      this.enrollmentModel
        .find({
          teacherId,
          classId,
          studentId: { $in: studentIds },
          status: EnrollmentStatus.Active,
        })
        .lean()
        .exec(),
    ]);

    const examMap = new Map(exams.map((exam) => [exam._id.toString(), exam]));
    const enrolledStudentIds = new Set(
      enrollments.map((enrollment) => enrollment.studentId.toString()),
    );

    for (const entry of dto.scores) {
      const exam = examMap.get(entry.examId.trim());
      if (!exam) {
        throw new BadRequestException(
          'Bài kiểm tra không tồn tại hoặc không thuộc lớp này.',
        );
      }

      if (!enrolledStudentIds.has(entry.studentId.trim())) {
        throw new BadRequestException(
          'Học sinh không tồn tại trong lớp hoặc không còn đang học.',
        );
      }

      if (
        entry.score !== undefined &&
        entry.score !== null &&
        entry.score > exam.maxScore
      ) {
        throw new BadRequestException(
          `Điểm của học sinh không được vượt quá ${exam.maxScore}.`,
        );
      }
    }

    const bulkOps = dto.scores.map((entry) => {
      if (entry.score === undefined || entry.score === null) {
        return {
          deleteOne: {
            filter: {
              teacherId,
              classId,
              examId: this.toObjectId(entry.examId.trim(), 'examId'),
              studentId: this.toObjectId(entry.studentId.trim(), 'studentId'),
            },
          },
        };
      }
      return {
        updateOne: {
          filter: {
            teacherId,
            classId,
            examId: this.toObjectId(entry.examId.trim(), 'examId'),
            studentId: this.toObjectId(entry.studentId.trim(), 'studentId'),
            deletedAt: null,
          },
          update: {
            $set: {
              score: entry.score,
              note: entry.note?.trim() || '',
              evidenceImages: entry.evidenceImages || [],
            },
            $setOnInsert: {
              teacherId,
              classId,
              examId: this.toObjectId(entry.examId.trim(), 'examId'),
              studentId: this.toObjectId(entry.studentId.trim(), 'studentId'),
            },
          },
          upsert: true,
        },
      };
    });

    await this.examScoreModel.bulkWrite(bulkOps);

    return { message: 'Cập nhật điểm thành công.' };
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }

  private isTransactionUnsupportedError(error: unknown) {
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();

    return (
      message.includes('transaction numbers are only allowed') ||
      message.includes('transactions are not supported') ||
      message.includes('only servers in a sharded cluster can start') ||
      message.includes('conflictingoperationinprogress') ||
      this.getErrorCode(error) === 117 ||
      message.includes('transaction is not supported')
    );
  }

  private getErrorCode(error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'number'
    ) {
      return (error as { code: number }).code;
    }

    return undefined;
  }
}
