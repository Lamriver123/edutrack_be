/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  BillingStatus,
  ClassStatus,
  EnrollmentStatus,
  PaymentStatus,
  ReceiptPdfStatus,
  ReceiptReason,
  ReceiptScope,
  TuitionStatus,
} from '../school-management/enums';
import {
  Attendance,
  AttendanceDocument,
  BillingCycle,
  BillingCycleDocument,
  Class,
  ClassDocument,
  ClassEnrollment,
  ClassEnrollmentDocument,
  ClassSession,
  ClassSessionDocument,
  Exam,
  ExamDocument,
  ExamScore,
  ExamScoreDocument,
  Receipt,
  ReceiptDocument,
  Student,
  StudentDocument,
  TuitionEntry,
  TuitionEntryDocument,
} from '../school-management/schemas';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { IssueReceiptDto } from './dto/issue-receipt.dto';
import { QueryBillingDto } from './dto/query-billing.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';
import { UpdateReceiptPaymentDto } from './dto/update-receipt-payment.dto';
import { ReceiptPdfService } from './receipt-pdf.service';
import { ReceiptTemplateService } from './receipt-template.service';

const DEFAULT_TARGET_SESSION_COUNT = 10;
const VIETNAM_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_VERSION_NEEDED = 20;
const CRC32_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});
const DEFAULT_BOY_AVATAR_URL =
  'https://img.magnific.com/premium-psd/student-boy-avatar-3d-icon_1723-409.jpg';
const DEFAULT_GIRL_AVATAR_URL =
  'https://png.pngtree.com/png-vector/20250709/ourmid/pngtree-adorable-school-girl-cartoon-with-backpack-pointing-up-cute-chibi-vector-png-image_16736310.webp';

type DateRange = {
  from?: Date;
  to?: Date;
};

type ReceiptDraft = {
  teacherId: Types.ObjectId;
  classId: Types.ObjectId;
  classIds: Types.ObjectId[];
  primaryClassId: Types.ObjectId;
  scopeType: ReceiptScope;
  studentId: Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  dueDate?: Date;
  reason: ReceiptReason;
  teacherSnapshot: Record<string, unknown>;
  classSnapshot: Record<string, unknown>;
  classSnapshots: Array<Record<string, unknown>>;
  studentSnapshot: Record<string, unknown>;
  sessions: Array<Record<string, unknown>>;
  exams: Array<Record<string, unknown>>;
  selectedTuitionEntryIds: Types.ObjectId[];
  selectedAttendanceIds: Types.ObjectId[];
  lessonCount: number;
  subtotal: number;
  discountAmount: number;
  adjustmentAmount: number;
  totalAmount: number;
  note?: string;
  teacherComment?: string;
  strengthsComment?: string;
  improvementsComment?: string;
  generalComment?: string;
  paymentNote?: string;
};

type ReceiptAttendanceRef = {
  attendanceId?: unknown;
  sessionId?: unknown;
};

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(ClassEnrollment.name)
    private readonly enrollmentModel: Model<ClassEnrollmentDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(TuitionEntry.name)
    private readonly tuitionEntryModel: Model<TuitionEntryDocument>,
    @InjectModel(BillingCycle.name)
    private readonly billingCycleModel: Model<BillingCycleDocument>,
    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,
    @InjectModel(ExamScore.name)
    private readonly examScoreModel: Model<ExamScoreDocument>,
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly receiptTemplateService: ReceiptTemplateService,
    private readonly receiptPdfService: ReceiptPdfService,
  ) {}

  async getClassBillingOverview(
    teacherIdStr: string,
    classIdStr: string,
    query: QueryBillingDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');
    const classroom = await this.findClassForTeacherOrThrow(teacherId, classId);
    const range = this.parseDateRange(query.fromDate, query.toDate);
    const enrollments = await this.enrollmentModel
      .find({
        teacherId,
        classId,
        status: EnrollmentStatus.Active,
      })
      .sort({ joinedAt: -1 })
      .lean()
      .exec();
    const studentIds = enrollments.map((item) => item.studentId);

    if (!studentIds.length) {
      return {
        classId: classId.toString(),
        className: classroom.name,
        regularPrice: classroom.regularPrice,
        makeupPrice: classroom.makeupPrice,
        totals: {
          students: 0,
          unbilledLessonCount: 0,
          unbilledAmount: 0,
          readyToIssueCount: 0,
        },
        students: [],
      };
    }

    const tuitionFilter: Record<string, unknown> = {
      teacherId,
      classId,
      studentId: { $in: studentIds },
      status: TuitionStatus.Unbilled,
    };
    this.assignDateRangeFilter(tuitionFilter, 'sessionDate', range);

    const [students, tuitionGroups, latestReceipts] = await Promise.all([
      this.studentModel
        .find({ teacherId, _id: { $in: studentIds } })
        .lean()
        .exec(),
      this.tuitionEntryModel
        .aggregate<{
          _id: Types.ObjectId;
          unbilledLessonCount: number;
          unbilledAmount: number;
          firstSessionDate?: Date;
          lastSessionDate?: Date;
        }>([
          { $match: tuitionFilter },
          {
            $group: {
              _id: '$studentId',
              firstSessionDate: { $min: '$sessionDate' },
              lastSessionDate: { $max: '$sessionDate' },
              unbilledAmount: { $sum: '$amount' },
              unbilledLessonCount: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.receiptModel
        .find({
          teacherId,
          studentId: { $in: studentIds },
          paymentStatus: { $ne: PaymentStatus.Cancelled },
          $or: [{ classId }, { classIds: classId }],
        })
        .sort({ issuedAt: -1 })
        .lean()
        .exec(),
    ]);

    const tuitionMap = new Map(
      tuitionGroups.map((item) => [item._id.toString(), item]),
    );
    const latestReceiptMap = new Map<string, Record<string, unknown>>();
    for (const receipt of latestReceipts) {
      const studentId = receipt.studentId.toString();
      if (!latestReceiptMap.has(studentId)) {
        latestReceiptMap.set(studentId, this.toReceiptListItem(receipt));
      }
    }

    const rows = students
      .map((student) => {
        const group = tuitionMap.get(student._id.toString());
        const unbilledLessonCount = group?.unbilledLessonCount ?? 0;

        return {
          student: this.toStudentResponse(student),
          unbilledLessonCount,
          unbilledAmount: group?.unbilledAmount ?? 0,
          firstUnbilledSessionDate: group?.firstSessionDate,
          lastUnbilledSessionDate: group?.lastSessionDate,
          reachedSuggestedCycle:
            unbilledLessonCount >= DEFAULT_TARGET_SESSION_COUNT,
          latestReceipt: latestReceiptMap.get(student._id.toString()) ?? null,
        };
      })
      .sort((a, b) => b.unbilledLessonCount - a.unbilledLessonCount);

    return {
      classId: classId.toString(),
      className: classroom.name,
      regularPrice: classroom.regularPrice,
      makeupPrice: classroom.makeupPrice,
      totals: {
        students: rows.length,
        unbilledLessonCount: rows.reduce(
          (sum, item) => sum + item.unbilledLessonCount,
          0,
        ),
        unbilledAmount: rows.reduce(
          (sum, item) => sum + item.unbilledAmount,
          0,
        ),
        readyToIssueCount: rows.filter((item) => item.reachedSuggestedCycle)
          .length,
      },
      students: rows,
    };
  }

  async getBillingCandidates(
    teacherIdStr: string,
    classIdStr: string,
    studentIdStr: string,
    query: QueryBillingDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classId = this.toObjectId(classIdStr, 'classId');
    const studentId = this.toObjectId(studentIdStr, 'studentId');
    return this.getBillingCandidatesForClasses(
      teacherId,
      studentId,
      [classId],
      query,
    );
  }

  async getStudentBillingOverview(
    teacherIdStr: string,
    studentIdStr: string,
    query: QueryBillingDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const studentId = this.toObjectId(studentIdStr, 'studentId');
    const range = this.parseDateRange(query.fromDate, query.toDate);
    const student = await this.findStudentForTeacherOrThrow(
      teacherId,
      studentId,
    );
    const classIds = await this.resolveStudentBillingClassIds(
      teacherId,
      studentId,
      query.classIds,
    );

    if (!classIds.length) {
      return {
        student: this.toStudentResponse(student),
        classes: [],
        totals: {
          classes: 0,
          unbilledLessonCount: 0,
          unbilledAmount: 0,
          readyToIssueCount: 0,
        },
      };
    }

    const { classrooms } = await this.validateMultiClassBillingScope(
      teacherId,
      classIds,
      studentId,
    );
    const classMap = this.toClassDocumentMap(classrooms);
    const tuitionFilter: Record<string, unknown> = {
      teacherId,
      studentId,
      classId: { $in: classIds },
      status: TuitionStatus.Unbilled,
    };
    this.assignDateRangeFilter(tuitionFilter, 'sessionDate', range);

    const [tuitionGroups, latestReceipts] = await Promise.all([
      this.tuitionEntryModel
        .aggregate<{
          _id: Types.ObjectId;
          unbilledLessonCount: number;
          unbilledAmount: number;
          firstSessionDate?: Date;
          lastSessionDate?: Date;
        }>([
          { $match: tuitionFilter },
          {
            $group: {
              _id: '$classId',
              firstSessionDate: { $min: '$sessionDate' },
              lastSessionDate: { $max: '$sessionDate' },
              unbilledAmount: { $sum: '$amount' },
              unbilledLessonCount: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.receiptModel
        .find({
          teacherId,
          studentId,
          paymentStatus: { $ne: PaymentStatus.Cancelled },
          $or: [
            { classId: { $in: classIds } },
            { classIds: { $in: classIds } },
          ],
        })
        .sort({ issuedAt: -1 })
        .lean()
        .exec(),
    ]);
    const tuitionMap = new Map(
      tuitionGroups.map((item) => [item._id.toString(), item]),
    );
    const latestReceiptMap = new Map<string, Record<string, unknown>>();

    for (const receipt of latestReceipts) {
      const receiptClassIds = this.getReceiptClassIds(receipt);

      for (const receiptClassId of receiptClassIds) {
        if (!latestReceiptMap.has(receiptClassId)) {
          latestReceiptMap.set(receiptClassId, this.toReceiptListItem(receipt));
        }
      }
    }

    const rows = classIds
      .map((classIdItem) => {
        const classroom = classMap.get(classIdItem.toString());

        if (!classroom) {
          return null;
        }

        const group = tuitionMap.get(classIdItem.toString());
        const unbilledLessonCount = group?.unbilledLessonCount ?? 0;

        return {
          class: this.toClassSummary(classroom),
          unbilledLessonCount,
          unbilledAmount: group?.unbilledAmount ?? 0,
          firstUnbilledSessionDate: group?.firstSessionDate,
          lastUnbilledSessionDate: group?.lastSessionDate,
          reachedSuggestedCycle:
            unbilledLessonCount >= DEFAULT_TARGET_SESSION_COUNT,
          latestReceipt: latestReceiptMap.get(classIdItem.toString()) ?? null,
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    return {
      student: this.toStudentResponse(student),
      classes: rows,
      totals: {
        classes: rows.length,
        unbilledLessonCount: rows.reduce(
          (sum, item) => sum + Number(item.unbilledLessonCount ?? 0),
          0,
        ),
        unbilledAmount: rows.reduce(
          (sum, item) => sum + Number(item.unbilledAmount ?? 0),
          0,
        ),
        readyToIssueCount: rows.filter((item) => item.reachedSuggestedCycle)
          .length,
      },
    };
  }

  async getStudentBillingCandidates(
    teacherIdStr: string,
    studentIdStr: string,
    query: QueryBillingDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const studentId = this.toObjectId(studentIdStr, 'studentId');
    const classIds = await this.resolveStudentBillingClassIds(
      teacherId,
      studentId,
      query.classIds,
    );

    return this.getBillingCandidatesForClasses(
      teacherId,
      studentId,
      classIds,
      query,
    );
  }

  private async getBillingCandidatesForClasses(
    teacherId: Types.ObjectId,
    studentId: Types.ObjectId,
    classIds: Types.ObjectId[],
    query: QueryBillingDto,
  ) {
    const { classrooms, student } = await this.validateMultiClassBillingScope(
      teacherId,
      classIds,
      studentId,
    );
    const classMap = this.toClassDocumentMap(classrooms);
    const range = this.parseDateRange(query.fromDate, query.toDate);
    const tuitionEntries = this.withClassMetadata(
      await this.findUnbilledTuitionEntries(
        teacherId,
        classIds,
        studentId,
        range,
      ),
      classMap,
    );
    const suggestedTuitionEntries = tuitionEntries.slice(
      0,
      DEFAULT_TARGET_SESSION_COUNT,
    );
    const period = this.resolveDraftPeriod(
      {},
      suggestedTuitionEntries.length ? suggestedTuitionEntries : tuitionEntries,
    );
    const exams = await this.findExamSnapshots(
      teacherId,
      classIds,
      studentId,
      classMap,
      period.from,
      period.to,
      new Map(),
    );
    const primaryClassroom = classrooms[0];

    return {
      class: this.toClassSummary(primaryClassroom),
      classes: classrooms.map((classroom) => this.toClassSummary(classroom)),
      scopeType:
        classIds.length > 1 ? ReceiptScope.MultiClass : ReceiptScope.Class,
      student: this.toStudentResponse(student),
      periodStart: period.from,
      periodEnd: period.to,
      suggestedTuitionEntryIds: suggestedTuitionEntries.map((item) => item.id),
      tuitionEntries,
      exams,
      summary: {
        unbilledLessonCount: tuitionEntries.length,
        unbilledAmount: tuitionEntries.reduce(
          (sum, item) => sum + item.amount,
          0,
        ),
        examCount: exams.length,
      },
    };
  }

  async previewReceipt(
    teacherIdStr: string,
    classIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
  ) {
    const draft = await this.buildReceiptDraft(
      teacherIdStr,
      classIdStr,
      studentIdStr,
      dto,
    );
    const preview = this.toReceiptPreviewResponse(draft);
    const paymentQrDataUrl = await this.getTeacherPaymentQrDataUrl(
      draft.teacherId,
    );

    return {
      receipt: preview,
      html: this.receiptTemplateService.render(preview, paymentQrDataUrl),
    };
  }

  async previewStudentReceipt(
    teacherIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
  ) {
    const classIds = await this.resolveStudentReceiptClassIds(
      teacherIdStr,
      studentIdStr,
      dto,
    );
    const draft = await this.buildReceiptDraftForClasses(
      teacherIdStr,
      classIds,
      studentIdStr,
      dto,
    );
    const preview = this.toReceiptPreviewResponse(draft);
    const paymentQrDataUrl = await this.getTeacherPaymentQrDataUrl(
      draft.teacherId,
    );

    return {
      receipt: preview,
      html: this.receiptTemplateService.render(preview, paymentQrDataUrl),
    };
  }

  async issueReceipt(
    teacherIdStr: string,
    classIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
  ) {
    const dbSession = await this.connection.startSession();
    let receiptId: Types.ObjectId | null = null;

    try {
      await dbSession.withTransaction(async () => {
        const receipt = await this.persistIssuedReceipt(
          teacherIdStr,
          classIdStr,
          studentIdStr,
          dto,
          dbSession,
        );
        receiptId = receipt._id;
      });
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error;
      }

      const receipt = await this.persistIssuedReceipt(
        teacherIdStr,
        classIdStr,
        studentIdStr,
        dto,
      );
      receiptId = receipt._id;
    } finally {
      await dbSession.endSession();
    }

    if (!receiptId) {
      throw new BadRequestException('Không thể phát hành hóa đơn.');
    }

    await this.renderAndUploadReceiptPdf(teacherIdStr, receiptId.toString());

    return this.findReceiptById(teacherIdStr, receiptId.toString());
  }

  async issueStudentReceipt(
    teacherIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
  ) {
    const dbSession = await this.connection.startSession();
    let receiptId: Types.ObjectId | null = null;

    try {
      await dbSession.withTransaction(async () => {
        const classIds = await this.resolveStudentReceiptClassIds(
          teacherIdStr,
          studentIdStr,
          dto,
          dbSession,
        );
        const receipt = await this.persistIssuedReceiptForClasses(
          teacherIdStr,
          classIds,
          studentIdStr,
          dto,
          dbSession,
        );
        receiptId = receipt._id;
      });
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error;
      }

      const classIds = await this.resolveStudentReceiptClassIds(
        teacherIdStr,
        studentIdStr,
        dto,
      );
      const receipt = await this.persistIssuedReceiptForClasses(
        teacherIdStr,
        classIds,
        studentIdStr,
        dto,
      );
      receiptId = receipt._id;
    } finally {
      await dbSession.endSession();
    }

    if (!receiptId) {
      throw new BadRequestException('Không thể phát hành hóa đơn.');
    }

    await this.renderAndUploadReceiptPdf(teacherIdStr, receiptId.toString());

    return this.findReceiptById(teacherIdStr, receiptId.toString());
  }

  async listReceipts(teacherIdStr: string, query: QueryReceiptsDto) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const filter: Record<string, unknown> = {
      teacherId,
      paymentStatus: { $ne: PaymentStatus.Cancelled },
    };

    if (query.classId) {
      const classId = this.toObjectId(query.classId, 'classId');

      filter.$or = [{ classId }, { classIds: classId }];
    }

    if (query.studentId) {
      filter.studentId = this.toObjectId(query.studentId, 'studentId');
    }

    if (query.paymentStatus === PaymentStatus.Cancelled) {
      return [];
    }

    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }

    this.assignDateRangeFilter(
      filter,
      'issuedAt',
      this.parseDateRange(query.fromDate, query.toDate),
    );

    const receipts = await this.receiptModel
      .find(filter)
      .sort({ issuedAt: -1 })
      .limit(120)
      .lean()
      .exec();

    return receipts.map((receipt) => this.toReceiptListItem(receipt));
  }

  async findReceiptById(teacherIdStr: string, receiptIdStr: string) {
    const receipt = await this.findReceiptForTeacherOrThrow(
      teacherIdStr,
      receiptIdStr,
    );

    return this.toReceiptResponse(receipt);
  }

  async getReceiptDownload(teacherIdStr: string, receiptIdStr: string) {
    const receipt = await this.findReceiptForTeacherOrThrow(
      teacherIdStr,
      receiptIdStr,
    );
    const pdf = await this.renderReceiptPdfBuffer(receipt);

    return {
      buffer: pdf,
      fileName: this.buildReceiptPdfFileName(receipt),
    };
  }

  async getReceiptsBulkDownload(teacherIdStr: string, receiptIdStrs: string[]) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const receiptIds = [...new Set(receiptIdStrs.map((item) => item.trim()))]
      .filter(Boolean)
      .map((item) => this.toObjectId(item, 'receiptId'));

    if (!receiptIds.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một hóa đơn.');
    }

    const receipts = await this.receiptModel
      .find({
        _id: { $in: receiptIds },
        teacherId,
        paymentStatus: { $ne: PaymentStatus.Cancelled },
      })
      .exec();
    const receiptMap = new Map(
      receipts.map((receipt) => [receipt._id.toString(), receipt]),
    );

    if (receiptMap.size !== receiptIds.length) {
      throw new NotFoundException(
        'Một hoặc nhiều hóa đơn không tồn tại hoặc đã bị hủy.',
      );
    }

    const seenFileNames = new Set<string>();
    const files: Array<{ buffer: Buffer; fileName: string; modifiedAt: Date }> =
      [];

    for (const receiptId of receiptIds) {
      const receipt = receiptMap.get(receiptId.toString());

      if (!receipt) {
        continue;
      }

      const pdf = await this.renderReceiptPdfBuffer(receipt);

      if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
        throw new BadRequestException(
          `Hóa đơn ${receipt.receiptNumber} không tạo được file PDF hợp lệ.`,
        );
      }

      files.push({
        buffer: pdf,
        fileName: this.toUniqueZipFileName(
          this.buildReceiptPdfFileName(receipt),
          seenFileNames,
        ),
        modifiedAt: receipt.pdfGeneratedAt ?? receipt.issuedAt ?? new Date(),
      });
    }

    return {
      buffer: this.buildZipArchive(files),
      fileName: this.buildReceiptsZipFileName(files),
    };
  }

  async retryRenderPdf(teacherIdStr: string, receiptIdStr: string) {
    await this.renderAndUploadReceiptPdf(teacherIdStr, receiptIdStr);

    return this.findReceiptById(teacherIdStr, receiptIdStr);
  }

  async validateReceiptOwnership(teacherIdStr: string, receiptIdStr: string) {
    await this.findReceiptForTeacherOrThrow(teacherIdStr, receiptIdStr);

    return true;
  }

  async updatePayment(
    teacherIdStr: string,
    receiptIdStr: string,
    dto: UpdateReceiptPaymentDto,
  ) {
    if (dto.paymentStatus === PaymentStatus.Cancelled) {
      throw new BadRequestException(
        'Vui lòng dùng thao tác hủy hóa đơn thay vì cập nhật thanh toán.',
      );
    }

    const receipt = await this.findReceiptForTeacherOrThrow(
      teacherIdStr,
      receiptIdStr,
    );

    if (receipt.paymentStatus === PaymentStatus.Cancelled) {
      throw new BadRequestException('Hóa đơn đã hủy, không thể cập nhật.');
    }

    const paidAmount = this.resolvePaidAmount(dto, receipt.totalAmount);
    const paidAt =
      dto.paymentStatus === PaymentStatus.Unpaid
        ? undefined
        : dto.paidAt
          ? this.parseDate(dto.paidAt, 'Ngày thanh toán')
          : new Date();
    const updateSet: Record<string, unknown> = {
      paymentStatus: dto.paymentStatus,
      paidAmount,
      paymentNote: dto.paymentNote?.trim() || receipt.paymentNote || '',
    };
    const updateUnset: Record<string, ''> = {};

    if (paidAt) {
      updateSet.paidAt = paidAt;
    } else {
      updateUnset.paidAt = '';
    }

    if (dto.paymentProofUrl) {
      updateSet.paymentProofUrl = dto.paymentProofUrl.trim();
      updateSet.paymentProofPublicId = dto.paymentProofPublicId?.trim() || '';
      updateSet.paymentProofUploadedAt = new Date();
    }

    const updatedReceipt = await this.receiptModel
      .findOneAndUpdate(
        {
          _id: receipt._id,
          teacherId: receipt.teacherId,
        },
        {
          $set: updateSet,
          ...(Object.keys(updateUnset).length ? { $unset: updateUnset } : {}),
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedReceipt) {
      throw new NotFoundException('Không tìm thấy hóa đơn.');
    }

    if (dto.paymentStatus === PaymentStatus.Paid) {
      await this.billingCycleModel
        .updateOne(
          {
            _id: receipt.billingCycleId,
            teacherId: receipt.teacherId,
          },
          {
            $set: {
              status: BillingStatus.Paid,
            },
          },
        )
        .exec();
    }

    return this.toReceiptResponse(updatedReceipt);
  }

  async cancelReceipt(teacherIdStr: string, receiptIdStr: string) {
    const dbSession = await this.connection.startSession();

    try {
      await dbSession.withTransaction(async () => {
        await this.cancelReceiptCore(teacherIdStr, receiptIdStr, dbSession);
      });
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error;
      }

      await this.cancelReceiptCore(teacherIdStr, receiptIdStr);
    } finally {
      await dbSession.endSession();
    }

    return this.findReceiptById(teacherIdStr, receiptIdStr);
  }

  private async persistIssuedReceipt(
    teacherIdStr: string,
    classIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
    session?: ClientSession,
  ) {
    return this.persistIssuedReceiptForClasses(
      teacherIdStr,
      [classIdStr],
      studentIdStr,
      dto,
      session,
    );
  }

  private async persistIssuedReceiptForClasses(
    teacherIdStr: string,
    classIdStrs: string[],
    studentIdStr: string,
    dto: IssueReceiptDto,
    session?: ClientSession,
  ) {
    const draft = await this.buildReceiptDraftForClasses(
      teacherIdStr,
      classIdStrs,
      studentIdStr,
      dto,
      session,
    );
    const receiptNumber = await this.generateReceiptNumber(
      draft.teacherId,
      session,
    );
    const billingCycle = await this.createBillingCycleFromDraft(draft, session);
    const receiptPayload = {
      teacherId: draft.teacherId,
      classId: draft.classId,
      classIds: draft.classIds,
      primaryClassId: draft.primaryClassId,
      scopeType: draft.scopeType,
      studentId: draft.studentId,
      billingCycleId: billingCycle._id,
      receiptNumber,
      issuedAt: new Date(),
      periodStart: draft.periodStart,
      periodEnd: draft.periodEnd,
      dueDate: draft.dueDate,
      reason: draft.reason,
      teacherSnapshot: draft.teacherSnapshot,
      classSnapshot: this.toClassSnapshotResponse(draft.classSnapshot),
      classSnapshots: draft.classSnapshots.map((snapshot) =>
        this.toClassSnapshotResponse(snapshot),
      ),
      studentSnapshot: draft.studentSnapshot,
      sessions: draft.sessions.map((item) =>
        this.toReceiptSessionSnapshotResponse(item),
      ),
      exams: draft.exams.map((item) =>
        this.toReceiptExamSnapshotResponse(item),
      ),
      lessonCount: draft.lessonCount,
      subtotal: draft.subtotal,
      discountAmount: draft.discountAmount,
      adjustmentAmount: draft.adjustmentAmount,
      totalAmount: draft.totalAmount,
      paymentStatus: PaymentStatus.Unpaid,
      paidAmount: 0,
      note: draft.note,
      teacherComment: draft.teacherComment,
      strengthsComment: draft.strengthsComment,
      improvementsComment: draft.improvementsComment,
      generalComment: draft.generalComment,
      paymentNote: draft.paymentNote,
      htmlTemplateVersion: 'v1',
      renderSnapshot: {
        ...draft,
        receiptNumber,
        selectedTuitionEntryIds: draft.selectedTuitionEntryIds.map((id) =>
          id.toString(),
        ),
        selectedAttendanceIds: draft.selectedAttendanceIds.map((id) =>
          id.toString(),
        ),
      },
      pdfStatus: ReceiptPdfStatus.Pending,
    };
    const receipt = new this.receiptModel(receiptPayload);
    await receipt.save({ session });
    const tuitionUpdate = await this.tuitionEntryModel
      .updateMany(
        {
          _id: { $in: draft.selectedTuitionEntryIds },
          teacherId: draft.teacherId,
          classId: { $in: draft.classIds },
          studentId: draft.studentId,
          status: TuitionStatus.Unbilled,
        },
        {
          $set: {
            status: TuitionStatus.Billed,
            billingCycleId: billingCycle._id,
            receiptId: receipt._id,
          },
        },
        { session },
      )
      .exec();

    if (tuitionUpdate.modifiedCount !== draft.selectedTuitionEntryIds.length) {
      throw new BadRequestException(
        'Một số buổi học đã được xuất hóa đơn trước đó. Vui lòng tải lại dữ liệu.',
      );
    }

    if (draft.selectedAttendanceIds.length) {
      await this.attendanceModel
        .updateMany(
          {
            _id: { $in: draft.selectedAttendanceIds },
            teacherId: draft.teacherId,
            isBilled: false,
          },
          {
            $set: {
              isBilled: true,
            },
          },
          { session },
        )
        .exec();
    }

    await this.billingCycleModel
      .updateOne(
        { _id: billingCycle._id, teacherId: draft.teacherId },
        {
          $set: {
            receiptId: receipt._id,
          },
        },
        { session },
      )
      .exec();

    return receipt;
  }

  private async buildReceiptDraft(
    teacherIdStr: string,
    classIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
    session?: ClientSession,
  ): Promise<ReceiptDraft> {
    return this.buildReceiptDraftForClasses(
      teacherIdStr,
      [classIdStr],
      studentIdStr,
      dto,
      session,
    );
  }

  private async buildReceiptDraftForClasses(
    teacherIdStr: string,
    classIdStrs: string[],
    studentIdStr: string,
    dto: IssueReceiptDto,
    session?: ClientSession,
  ): Promise<ReceiptDraft> {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const classIds = this.toUniqueObjectIds(classIdStrs);

    if (!classIds.length) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất một lớp để xuất hóa đơn.',
      );
    }

    const studentId = this.toObjectId(studentIdStr, 'studentId');
    const { classrooms, student, teacher } =
      await this.validateMultiClassBillingScope(
        teacherId,
        classIds,
        studentId,
        session,
        true,
      );
    const classMap = this.toClassDocumentMap(classrooms);
    const primaryClassroom = classrooms[0];
    const scopeType =
      classIds.length > 1 ? ReceiptScope.MultiClass : ReceiptScope.Class;
    const classSnapshots = classrooms.map((classroom) =>
      this.toClassSnapshot(classroom),
    );
    const explicitRange = this.parseDateRange(dto.fromDate, dto.toDate);
    const tuitionEntries = this.withClassMetadata(
      await this.findUnbilledTuitionEntries(
        teacherId,
        classIds,
        studentId,
        explicitRange,
        dto.tuitionEntryIds,
        session,
      ),
      classMap,
    );
    const targetSessionCount =
      dto.targetSessionCount ?? DEFAULT_TARGET_SESSION_COUNT;
    const selectedTuitionEntries = dto.tuitionEntryIds?.length
      ? tuitionEntries
      : tuitionEntries.slice(0, targetSessionCount);

    if (!selectedTuitionEntries.length) {
      throw new BadRequestException(
        'Chưa có buổi học nào đủ điều kiện để xuất hóa đơn.',
      );
    }

    const period = this.resolveDraftPeriod({}, selectedTuitionEntries);
    const examRemarkMap = new Map(
      (dto.examRemarks ?? []).map((item) => [
        item.examScoreId,
        item.teacherRemark.trim(),
      ]),
    );
    const exams = await this.findExamSnapshots(
      teacherId,
      classIds,
      studentId,
      classMap,
      period.from,
      period.to,
      examRemarkMap,
      session,
    );
    const subtotal = selectedTuitionEntries.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const discountAmount = Math.min(dto.discountAmount ?? 0, subtotal);
    const adjustmentAmount = dto.adjustmentAmount ?? 0;
    const totalAmount = Math.max(
      0,
      subtotal - discountAmount + adjustmentAmount,
    );
    const selectedAttendanceIds = await this.resolveReceiptAttendanceIds(
      teacherId,
      classIds,
      studentId,
      selectedTuitionEntries,
      session,
    );

    return {
      teacherId,
      classId: primaryClassroom._id,
      classIds,
      primaryClassId: primaryClassroom._id,
      scopeType,
      studentId,
      periodStart: period.from,
      periodEnd: period.to,
      dueDate: dto.dueDate
        ? this.parseDate(dto.dueDate, 'Hạn thanh toán')
        : undefined,
      reason:
        selectedTuitionEntries.length >= DEFAULT_TARGET_SESSION_COUNT
          ? ReceiptReason.CycleCompleted
          : ReceiptReason.ManualEarly,
      teacherSnapshot: this.toTeacherSnapshot(teacher),
      classSnapshot: this.toClassSnapshot(primaryClassroom),
      classSnapshots,
      studentSnapshot: this.toStudentSnapshot(student),
      sessions: selectedTuitionEntries.map((item, index) => ({
        ...item,
        sequence: index + 1,
      })),
      exams,
      selectedTuitionEntryIds: selectedTuitionEntries.map((item) =>
        this.toObjectId(item.id, 'tuitionEntryId'),
      ),
      selectedAttendanceIds,
      lessonCount: selectedTuitionEntries.length,
      subtotal,
      discountAmount,
      adjustmentAmount,
      totalAmount,
      note: dto.note?.trim() || undefined,
      teacherComment: dto.teacherComment?.trim() || undefined,
      strengthsComment: dto.strengthsComment?.trim() || undefined,
      improvementsComment: dto.improvementsComment?.trim() || undefined,
      generalComment:
        dto.generalComment?.trim() || dto.teacherComment?.trim() || undefined,
      paymentNote: dto.paymentNote?.trim() || undefined,
    };
  }

  private async renderAndUploadReceiptPdf(
    teacherIdStr: string,
    receiptIdStr: string,
  ) {
    const receipt = await this.findReceiptForTeacherOrThrow(
      teacherIdStr,
      receiptIdStr,
    );

    try {
      const pdf = await this.renderReceiptPdfBuffer(receipt);
      const upload = await this.cloudinaryService.uploadReceiptPdf({
        buffer: pdf,
        mimetype: 'application/pdf',
        originalname: this.buildReceiptPdfFileName(receipt),
        size: pdf.length,
      });

      await this.receiptModel
        .updateOne(
          {
            _id: receipt._id,
            teacherId: receipt.teacherId,
          },
          {
            $set: {
              pdfStatus: ReceiptPdfStatus.Generated,
              pdfUrl: upload.url,
              pdfPublicId: upload.publicId,
              pdfGeneratedAt: new Date(),
            },
            $unset: {
              pdfFailedReason: '',
            },
          },
        )
        .exec();
    } catch (error) {
      await this.receiptModel
        .updateOne(
          {
            _id: receipt._id,
            teacherId: receipt.teacherId,
          },
          {
            $set: {
              pdfStatus: ReceiptPdfStatus.Failed,
              pdfFailedReason: this.getErrorMessage(error),
            },
          },
        )
        .exec();
    }
  }

  private async renderReceiptPdfBuffer(receipt: ReceiptDocument) {
    const paymentQrDataUrl = await this.getTeacherPaymentQrDataUrl(
      receipt.teacherId,
    );
    const response = this.toReceiptResponse(receipt);
    const html = this.receiptTemplateService.render(response, paymentQrDataUrl);

    return this.receiptPdfService.render(html, response, paymentQrDataUrl);
  }

  private async cancelReceiptCore(
    teacherIdStr: string,
    receiptIdStr: string,
    session?: ClientSession,
  ) {
    const receipt = await this.findReceiptForTeacherOrThrow(
      teacherIdStr,
      receiptIdStr,
      session,
    );

    if (receipt.paymentStatus !== PaymentStatus.Unpaid) {
      throw new BadRequestException('Chỉ có thể hủy hóa đơn chưa thanh toán.');
    }

    receipt.paymentStatus = PaymentStatus.Cancelled;
    receipt.note = receipt.note
      ? `${receipt.note}\nĐã hủy hóa đơn.`
      : 'Đã hủy hóa đơn.';
    await receipt.save({ session });

    const tuitionEntryIds = receipt.sessions.map((item) => item.tuitionEntryId);
    const receiptClassIds = this.getReceiptClassObjectIds(receipt);
    const attendanceIds = await this.resolveReceiptAttendanceIds(
      receipt.teacherId,
      receiptClassIds,
      receipt.studentId,
      receipt.sessions,
      session,
    );

    if (tuitionEntryIds.length) {
      await this.tuitionEntryModel
        .updateMany(
          {
            _id: { $in: tuitionEntryIds },
            teacherId: receipt.teacherId,
            receiptId: receipt._id,
          },
          {
            $set: {
              status: TuitionStatus.Unbilled,
            },
            $unset: {
              receiptId: '',
              billingCycleId: '',
            },
          },
          { session },
        )
        .exec();
    }

    if (attendanceIds.length) {
      await this.attendanceModel
        .updateMany(
          {
            _id: { $in: attendanceIds },
            teacherId: receipt.teacherId,
          },
          {
            $set: {
              isBilled: false,
            },
          },
          { session },
        )
        .exec();
    }

    await this.billingCycleModel
      .updateOne(
        {
          _id: receipt.billingCycleId,
          teacherId: receipt.teacherId,
        },
        {
          $set: {
            status: BillingStatus.Open,
          },
          $unset: {
            closedAt: '',
            receiptId: '',
          },
        },
        { session },
      )
      .exec();
  }

  private async findUnbilledTuitionEntries(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
    studentId: Types.ObjectId,
    range: DateRange,
    tuitionEntryIds?: string[],
    session?: ClientSession,
  ) {
    const filter: Record<string, unknown> = {
      teacherId,
      classId: { $in: classIds },
      studentId,
      status: TuitionStatus.Unbilled,
    };

    if (tuitionEntryIds?.length) {
      filter._id = {
        $in: tuitionEntryIds.map((id) => this.toObjectId(id, 'tuitionEntryId')),
      };
    } else {
      this.assignDateRangeFilter(filter, 'sessionDate', range);
    }

    const query = this.tuitionEntryModel
      .find(filter)
      .sort({ sessionDate: 1, createdAt: 1 })
      .lean();

    if (session) {
      query.session(session);
    }

    const entries = await query.exec();

    if (tuitionEntryIds?.length && entries.length !== tuitionEntryIds.length) {
      throw new BadRequestException(
        'Một số buổi học không tồn tại hoặc đã được xuất hóa đơn.',
      );
    }

    const attendanceIds = entries
      .map((entry) => entry.attendanceId)
      .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);
    const sessionIds = entries
      .map((entry) => entry.sessionId)
      .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);
    const [attendanceMap, sessionAttendanceMap, sessionMap] = await Promise.all(
      [
        this.findAttendanceMap(teacherId, attendanceIds, session),
        this.findAttendanceBySessionStudentMap(
          teacherId,
          classIds,
          studentId,
          sessionIds,
          session,
        ),
        this.findSessionMap(teacherId, sessionIds, session),
      ],
    );
    const candidates = entries
      .map((entry) => {
        let attendance = entry.attendanceId
          ? attendanceMap.get(entry.attendanceId.toString())
          : undefined;

        if (!attendance && entry.sessionId) {
          attendance = sessionAttendanceMap.get(
            `${entry.sessionId.toString()}:${studentId.toString()}`,
          );
        }

        if (!attendance || attendance.isBilled) {
          return null;
        }

        const classSession = entry.sessionId
          ? sessionMap.get(entry.sessionId.toString())
          : null;

        return {
          id: entry._id.toString(),
          tuitionEntryId: entry._id,
          attendanceId: attendance._id.toString(),
          sessionId: entry.sessionId,
          classId: entry.classId,
          attendedClassId: entry.attendedClassId || entry.classId,
          billingClassId: entry.billingClassId || entry.classId,
          makeupForClassId: entry.makeupForClassId,
          date: entry.sessionDate,
          sessionDate: entry.sessionDate,
          startTime: entry.sessionStartTime,
          endTime: entry.sessionEndTime,
          className: entry.classNameSnapshot,
          attendedClassName: entry.classNameSnapshot,
          billingClassName: entry.classNameSnapshot,
          topic: entry.topicSnapshot || classSession?.topic || undefined,
          content: entry.contentSnapshot || classSession?.content || undefined,
          attendanceStatus: attendance.status,
          scheduleType: classSession?.scheduleType,
          tuitionType: entry.type,
          unitPrice: entry.amount,
          amount: entry.amount,
          note: attendance.note || entry.note || undefined,
        };
      })
      .filter(Boolean) as Array<Record<string, any>>;

    if (tuitionEntryIds?.length && candidates.length !== entries.length) {
      throw new BadRequestException(
        'Một số buổi học đã được xuất hóa đơn trước đó. Vui lòng tải lại dữ liệu.',
      );
    }

    return candidates;
  }

  private async findAttendanceMap(
    teacherId: Types.ObjectId,
    attendanceIds: Types.ObjectId[],
    session?: ClientSession,
  ) {
    const map = new Map<string, Record<string, any>>();

    if (!attendanceIds.length) {
      return map;
    }

    const query = this.attendanceModel
      .find({ teacherId, _id: { $in: attendanceIds } })
      .lean();

    if (session) {
      query.session(session);
    }

    const attendances = await query.exec();
    for (const attendance of attendances) {
      map.set(attendance._id.toString(), attendance);
    }

    return map;
  }

  private async findAttendanceBySessionStudentMap(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
    studentId: Types.ObjectId,
    sessionIds: Types.ObjectId[],
    session?: ClientSession,
  ) {
    const map = new Map<string, Record<string, any>>();

    if (!sessionIds.length) {
      return map;
    }

    const query = this.attendanceModel
      .find({
        teacherId,
        classId: { $in: classIds },
        studentId,
        sessionId: { $in: sessionIds },
      })
      .lean();

    if (session) {
      query.session(session);
    }

    const attendances = await query.exec();
    for (const attendance of attendances) {
      map.set(
        `${attendance.sessionId.toString()}:${attendance.studentId.toString()}`,
        attendance,
      );
    }

    return map;
  }

  private async resolveReceiptAttendanceIds(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
    studentId: Types.ObjectId,
    refs: ReceiptAttendanceRef[],
    session?: ClientSession,
  ) {
    const attendanceMap = new Map<string, Types.ObjectId>();
    const directAttendanceIds = this.toUniqueObjectIds(
      refs.map((item) => item.attendanceId),
    );
    const sessionIds = this.toUniqueObjectIds(
      refs.map((item) => item.sessionId),
    );

    for (const attendanceId of directAttendanceIds) {
      attendanceMap.set(attendanceId.toString(), attendanceId);
    }

    if (sessionIds.length) {
      const query = this.attendanceModel
        .find({
          teacherId,
          classId: { $in: classIds },
          studentId,
          sessionId: { $in: sessionIds },
        })
        .select('_id')
        .lean();

      if (session) {
        query.session(session);
      }

      const attendances = await query.exec();
      for (const attendance of attendances) {
        attendanceMap.set(attendance._id.toString(), attendance._id);
      }
    }

    return [...attendanceMap.values()];
  }

  private async findSessionMap(
    teacherId: Types.ObjectId,
    sessionIds: Types.ObjectId[],
    session?: ClientSession,
  ) {
    const map = new Map<string, Record<string, any>>();

    if (!sessionIds.length) {
      return map;
    }

    const query = this.classSessionModel
      .find({ teacherId, _id: { $in: sessionIds } })
      .lean();

    if (session) {
      query.session(session);
    }

    const sessions = await query.exec();
    for (const item of sessions) {
      map.set(item._id.toString(), item);
    }

    return map;
  }

  private async findExamSnapshots(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
    studentId: Types.ObjectId,
    classMap: Map<string, ClassDocument>,
    periodStart: Date,
    periodEnd: Date,
    examRemarkMap: Map<string, string>,
    session?: ClientSession,
  ): Promise<Array<Record<string, unknown>>> {
    const scoresQuery = this.examScoreModel
      .find({
        teacherId,
        classId: { $in: classIds },
        studentId,
        deletedAt: null,
      })
      .lean();

    if (session) {
      scoresQuery.session(session);
    }

    const scores = await scoresQuery.exec();

    if (!scores.length) {
      return [];
    }

    const examIds = scores.map((score) => score.examId);
    const examsQuery = this.examModel
      .find({
        _id: { $in: examIds },
        teacherId,
        classId: { $in: classIds },
        deletedAt: null,
        testDate: {
          $gte: periodStart,
          $lte: periodEnd,
        },
      })
      .sort({ testDate: 1 })
      .lean();

    if (session) {
      examsQuery.session(session);
    }

    const exams = await examsQuery.exec();
    const scoreMap = new Map(
      scores.map((score) => [score.examId.toString(), score]),
    );

    const snapshots: Array<Record<string, unknown>> = [];

    for (const exam of exams) {
      const score = scoreMap.get(exam._id.toString());

      if (!score) {
        continue;
      }

      snapshots.push({
        examId: exam._id,
        examScoreId: score._id,
        classId: exam.classId,
        className: classMap.get(exam.classId.toString())?.name || 'Lớp học',
        title: exam.title,
        date: exam.testDate,
        score: score.score,
        maxScore: exam.maxScore,
        description: exam.description,
        note: score.note,
        evidenceImages: score.evidenceImages ?? [],
        teacherRemark: examRemarkMap.get(score._id.toString()) || undefined,
      });
    }

    return snapshots;
  }

  private async validateBillingScope(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
    studentId: Types.ObjectId,
    session?: ClientSession,
    includeTeacher = false,
  ) {
    const classQuery = this.classModel.findOne({
      _id: classId,
      teacherId,
      status: { $ne: ClassStatus.Archived },
    });
    const studentQuery = this.studentModel.findOne({
      _id: studentId,
      teacherId,
    });
    const enrollmentQuery = this.enrollmentModel.findOne({
      teacherId,
      classId,
      studentId,
    });
    const teacherQuery = this.userModel.findById(teacherId);

    if (session) {
      classQuery.session(session);
      studentQuery.session(session);
      enrollmentQuery.session(session);
      teacherQuery.session(session);
    }

    const [classroom, student, enrollment, teacher] = await Promise.all([
      classQuery.exec(),
      studentQuery.exec(),
      enrollmentQuery.exec(),
      includeTeacher ? teacherQuery.exec() : Promise.resolve(null),
    ]);

    if (!classroom) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh.');
    }

    if (!enrollment) {
      throw new BadRequestException('Học sinh không thuộc lớp học này.');
    }

    if (includeTeacher && !teacher) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    return {
      classroom,
      student,
      teacher: teacher as UserDocument,
    };
  }

  private async validateMultiClassBillingScope(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
    studentId: Types.ObjectId,
    session?: ClientSession,
    includeTeacher = false,
  ) {
    if (!classIds.length) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất một lớp để xuất hóa đơn.',
      );
    }

    const classQuery = this.classModel.find({
      _id: { $in: classIds },
      teacherId,
      status: { $ne: ClassStatus.Archived },
    });
    const studentQuery = this.studentModel.findOne({
      _id: studentId,
      teacherId,
    });
    const enrollmentQuery = this.enrollmentModel.find({
      teacherId,
      classId: { $in: classIds },
      studentId,
    });
    const teacherQuery = this.userModel.findById(teacherId);

    if (session) {
      classQuery.session(session);
      studentQuery.session(session);
      enrollmentQuery.session(session);
      teacherQuery.session(session);
    }

    const [classroomsRaw, student, enrollments, teacher] = await Promise.all([
      classQuery.exec(),
      studentQuery.exec(),
      enrollmentQuery.exec(),
      includeTeacher ? teacherQuery.exec() : Promise.resolve(null),
    ]);
    const classMap = this.toClassDocumentMap(classroomsRaw);
    const classrooms = classIds
      .map((classId) => classMap.get(classId.toString()))
      .filter(Boolean) as ClassDocument[];

    if (classrooms.length !== classIds.length) {
      throw new NotFoundException('Một số lớp học không tồn tại.');
    }

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh.');
    }

    const enrollmentClassIds = new Set(
      enrollments.map((enrollment) => enrollment.classId.toString()),
    );
    const missingEnrollment = classIds.some(
      (classId) => !enrollmentClassIds.has(classId.toString()),
    );

    if (missingEnrollment) {
      throw new BadRequestException('Học sinh không thuộc một số lớp đã chọn.');
    }

    if (includeTeacher && !teacher) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    return {
      classrooms,
      student,
      teacher: teacher as UserDocument,
    };
  }

  private async findStudentForTeacherOrThrow(
    teacherId: Types.ObjectId,
    studentId: Types.ObjectId,
  ) {
    const student = await this.studentModel
      .findOne({
        _id: studentId,
        teacherId,
      })
      .exec();

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh.');
    }

    return student;
  }

  private async findClassesForTeacherOrThrow(
    teacherId: Types.ObjectId,
    classIds: Types.ObjectId[],
    session?: ClientSession,
  ) {
    const query = this.classModel.find({
      _id: { $in: classIds },
      teacherId,
      status: { $ne: ClassStatus.Archived },
    });

    if (session) {
      query.session(session);
    }

    const classroomsRaw = await query.exec();
    const classMap = this.toClassDocumentMap(classroomsRaw);
    const classrooms = classIds
      .map((classId) => classMap.get(classId.toString()))
      .filter(Boolean) as ClassDocument[];

    if (classrooms.length !== classIds.length) {
      throw new NotFoundException('Một số lớp học không tồn tại.');
    }

    return classrooms;
  }

  private async resolveStudentBillingClassIds(
    teacherId: Types.ObjectId,
    studentId: Types.ObjectId,
    rawClassIds?: string[],
    session?: ClientSession,
  ) {
    const explicitClassIds = this.toUniqueObjectIds(rawClassIds ?? []);

    if (explicitClassIds.length) {
      return explicitClassIds;
    }

    const tuitionQuery = this.tuitionEntryModel.distinct('classId', {
      teacherId,
      studentId,
      status: TuitionStatus.Unbilled,
    });

    if (session) {
      tuitionQuery.session(session);
    }

    const tuitionClassIds = this.toUniqueObjectIds(await tuitionQuery.exec());

    const enrollmentQuery = this.enrollmentModel
      .find({
        teacherId,
        studentId,
        status: EnrollmentStatus.Active,
      })
      .select('classId')
      .sort({ joinedAt: -1 });

    if (session) {
      enrollmentQuery.session(session);
    }

    const enrollments = await enrollmentQuery.exec();

    return this.toUniqueObjectIds([
      ...tuitionClassIds,
      ...enrollments.map((enrollment) => enrollment.classId),
    ]);
  }

  private async resolveStudentReceiptClassIds(
    teacherIdStr: string,
    studentIdStr: string,
    dto: IssueReceiptDto,
    session?: ClientSession,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const studentId = this.toObjectId(studentIdStr, 'studentId');

    if (dto.classIds?.length) {
      return dto.classIds;
    }

    const classIds = await this.resolveStudentBillingClassIds(
      teacherId,
      studentId,
      undefined,
      session,
    );

    return classIds.map((classId) => classId.toString());
  }

  private toClassDocumentMap(classrooms: ClassDocument[]) {
    return new Map(
      classrooms.map((classroom) => [classroom._id.toString(), classroom]),
    );
  }

  private withClassMetadata(
    tuitionEntries: Array<Record<string, any>>,
    classMap: Map<string, ClassDocument>,
  ): Array<Record<string, any>> {
    return tuitionEntries.map((entry) => {
      const classId = entry.classId?.toString?.() ?? String(entry.classId);
      const attendedClassId =
        entry.attendedClassId?.toString?.() ??
        String(entry.attendedClassId || '');
      const billingClassId =
        entry.billingClassId?.toString?.() ??
        String(entry.billingClassId || '');
      const makeupForClassId =
        entry.makeupForClassId?.toString?.() ??
        String(entry.makeupForClassId || '');
      const classroom = classMap.get(classId);
      const attendedClassroom = classMap.get(attendedClassId);
      const billingClassroom = classMap.get(billingClassId);
      const makeupForClassroom = classMap.get(makeupForClassId);

      return {
        ...entry,
        className: classroom?.name || entry.className,
        attendedClassName:
          attendedClassroom?.name || entry.attendedClassName || classroom?.name,
        billingClassName:
          billingClassroom?.name || entry.billingClassName || classroom?.name,
        makeupForClassName: makeupForClassroom?.name,
        classColorHex: classroom?.colorHex,
      };
    });
  }

  private getReceiptClassIds(receipt: Record<string, any>) {
    const values = [
      ...(receipt.classIds ?? []),
      receipt.primaryClassId,
      receipt.classId,
    ];

    return this.toUniqueObjectIds(values).map((classId) => classId.toString());
  }

  private getReceiptClassNames(receipt: Record<string, any>) {
    const snapshots = Array.isArray(receipt.classSnapshots)
      ? receipt.classSnapshots
      : [];
    const names = snapshots
      .map((snapshot: Record<string, unknown>) =>
        typeof snapshot.className === 'string' ? snapshot.className.trim() : '',
      )
      .filter(Boolean);

    if (!names.length && receipt.classSnapshot?.className) {
      names.push(receipt.classSnapshot.className);
    }

    return [...new Set(names)].join(' + ') || 'Lớp học';
  }

  private getReceiptClassObjectIds(receipt: Record<string, any>) {
    return this.toUniqueObjectIds([
      ...(receipt.classIds ?? []),
      receipt.primaryClassId,
      receipt.classId,
    ]);
  }

  private async findClassForTeacherOrThrow(
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    const classroom = await this.classModel
      .findOne({
        _id: classId,
        teacherId,
        status: { $ne: ClassStatus.Archived },
      })
      .exec();

    if (!classroom) {
      throw new NotFoundException('Không tìm thấy lớp học.');
    }

    return classroom;
  }

  private async findReceiptForTeacherOrThrow(
    teacherIdStr: string,
    receiptIdStr: string,
    session?: ClientSession,
  ) {
    const receiptId = this.toObjectId(receiptIdStr, 'receiptId');
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const query = this.receiptModel.findOne({
      _id: receiptId,
      teacherId,
    });

    if (session) {
      query.session(session);
    }

    const receipt = await query.exec();

    if (!receipt) {
      throw new NotFoundException('Không tìm thấy hóa đơn.');
    }

    return receipt;
  }

  private async createBillingCycleFromDraft(
    draft: ReceiptDraft,
    session?: ClientSession,
  ) {
    const lastQuery = this.billingCycleModel
      .findOne({
        teacherId: draft.teacherId,
        studentId: draft.studentId,
      })
      .sort({ cycleNumber: -1 });

    if (session) {
      lastQuery.session(session);
    }

    const lastCycle = await lastQuery.exec();
    const billingCycle = new this.billingCycleModel({
      teacherId: draft.teacherId,
      studentId: draft.studentId,
      cycleNumber: (lastCycle?.cycleNumber ?? 0) + 1,
      targetSessionCount: DEFAULT_TARGET_SESSION_COUNT,
      sessionCount: draft.lessonCount,
      warningSessionCount: 8,
      status:
        draft.reason === ReceiptReason.CycleCompleted
          ? BillingStatus.Closed
          : BillingStatus.ClosedEarly,
      startedAt: draft.periodStart,
      ...(draft.reason === ReceiptReason.CycleCompleted
        ? { readyAt: new Date() }
        : {}),
      closedAt: new Date(),
    });
    await billingCycle.save({ session });

    return billingCycle;
  }

  private async generateReceiptNumber(
    teacherId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const dateKey = this.toVietnamDateKey(new Date()).replace(/-/g, '');
    const prefix = `HD-${dateKey}`;
    const query = this.receiptModel.countDocuments({
      teacherId,
      receiptNumber: {
        $regex: `^${prefix}-`,
      },
    });

    if (session) {
      query.session(session);
    }

    const count = await query.exec();

    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  private resolvePaidAmount(dto: UpdateReceiptPaymentDto, totalAmount: number) {
    if (dto.paymentStatus === PaymentStatus.Unpaid) {
      return 0;
    }

    if (dto.paymentStatus === PaymentStatus.Paid) {
      return totalAmount;
    }

    const paidAmount = dto.paidAmount ?? 0;

    if (paidAmount <= 0) {
      throw new BadRequestException(
        'Số tiền đã thanh toán phải lớn hơn 0 khi thanh toán một phần.',
      );
    }

    if (paidAmount >= totalAmount) {
      throw new BadRequestException(
        'Thanh toán một phần cần nhỏ hơn tổng tiền hóa đơn.',
      );
    }

    return paidAmount;
  }

  private resolveDraftPeriod(
    range: DateRange,
    tuitionEntries: Array<Record<string, any>>,
  ) {
    if (range.from && range.to) {
      return {
        from: range.from,
        to: range.to,
      };
    }

    const dates = tuitionEntries
      .map((item) => item.sessionDate ?? item.date)
      .filter(Boolean)
      .map((value) => new Date(value));

    if (!dates.length) {
      const today = new Date();

      return {
        from: range.from ?? today,
        to: range.to ?? this.endOfVietnamDate(today),
      };
    }

    const firstDate = dates.reduce(
      (current, item) => (item < current ? item : current),
      dates[0],
    );
    const lastDate = dates.reduce(
      (current, item) => (item > current ? item : current),
      dates[0],
    );

    return {
      from: range.from ?? firstDate,
      to: range.to ?? this.endOfVietnamDate(lastDate),
    };
  }

  private parseDateRange(fromDate?: string, toDate?: string): DateRange {
    const from = fromDate
      ? this.parseDate(fromDate, 'Ngày bắt đầu')
      : undefined;
    const to = toDate
      ? this.endOfVietnamDate(this.parseDate(toDate, 'Ngày kết thúc'))
      : undefined;

    if (from && to && from > to) {
      throw new BadRequestException(
        'Ngày bắt đầu không được lớn hơn ngày kết thúc.',
      );
    }

    return {
      from,
      to,
    };
  }

  private assignDateRangeFilter(
    filter: Record<string, unknown>,
    field: string,
    range: DateRange,
  ) {
    const dateFilter: Record<string, Date> = {};

    if (range.from) {
      dateFilter.$gte = range.from;
    }

    if (range.to) {
      dateFilter.$lte = range.to;
    }

    if (Object.keys(dateFilter).length) {
      filter[field] = dateFilter;
    }
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

  private endOfVietnamDate(date: Date) {
    const dateKey = this.toVietnamDateKey(date);
    const [year, month, day] = dateKey.split('-').map(Number);

    return new Date(
      Date.UTC(year, month - 1, day + 1) - VIETNAM_TIMEZONE_OFFSET_MS - 1,
    );
  }

  private toVietnamDateKey(date: Date) {
    const vietnamDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET_MS);
    const year = vietnamDate.getUTCFullYear();
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private async getTeacherPaymentQrDataUrl(teacherId: Types.ObjectId) {
    const teacher = await this.userModel
      .findById(teacherId)
      .select('+paymentQrImageData')
      .exec();
    const paymentQrBuffer = this.toBuffer(teacher?.paymentQrImageData);

    if (
      !paymentQrBuffer?.length ||
      !teacher?.paymentQrImageContentType ||
      !teacher.paymentQrImageSize
    ) {
      return undefined;
    }

    return `data:${teacher.paymentQrImageContentType};base64,${paymentQrBuffer.toString('base64')}`;
  }

  private toBuffer(value: unknown) {
    if (!value) {
      return null;
    }

    if (Buffer.isBuffer(value)) {
      return value;
    }

    if (value instanceof Uint8Array) {
      return Buffer.from(value);
    }

    if (typeof value === 'object') {
      const maybeBuffer = (value as Record<string, unknown>).buffer;
      const maybeData = (value as Record<string, unknown>).data;

      if (Buffer.isBuffer(maybeBuffer)) {
        return maybeBuffer;
      }

      if (maybeBuffer instanceof Uint8Array) {
        return Buffer.from(maybeBuffer);
      }

      if (maybeBuffer instanceof ArrayBuffer) {
        return Buffer.from(maybeBuffer);
      }

      if (maybeData instanceof Uint8Array) {
        return Buffer.from(maybeData);
      }

      if (Array.isArray(maybeData)) {
        return Buffer.from(maybeData as number[]);
      }
    }

    return null;
  }

  private toReceiptPreviewResponse(draft: ReceiptDraft) {
    return {
      id: 'preview',
      teacherId: draft.teacherId.toString(),
      classId: draft.classId.toString(),
      classIds: draft.classIds.map((classId) => classId.toString()),
      primaryClassId: draft.primaryClassId.toString(),
      scopeType: draft.scopeType,
      studentId: draft.studentId.toString(),
      billingCycleId: null,
      receiptNumber: 'Bản xem trước',
      issuedAt: new Date(),
      periodStart: draft.periodStart,
      periodEnd: draft.periodEnd,
      dueDate: draft.dueDate,
      reason: draft.reason,
      teacherSnapshot: draft.teacherSnapshot,
      classSnapshot: draft.classSnapshot,
      classSnapshots: draft.classSnapshots,
      studentSnapshot: draft.studentSnapshot,
      sessions: draft.sessions,
      exams: draft.exams,
      lessonCount: draft.lessonCount,
      subtotal: draft.subtotal,
      discountAmount: draft.discountAmount,
      adjustmentAmount: draft.adjustmentAmount,
      totalAmount: draft.totalAmount,
      paymentStatus: PaymentStatus.Unpaid,
      paidAmount: 0,
      paidAt: null,
      note: draft.note,
      teacherComment: draft.teacherComment,
      strengthsComment: draft.strengthsComment,
      improvementsComment: draft.improvementsComment,
      generalComment: draft.generalComment,
      paymentNote: draft.paymentNote,
      pdfStatus: ReceiptPdfStatus.Pending,
      pdfUrl: null,
      pdfGeneratedAt: null,
      pdfFailedReason: null,
    };
  }

  private toReceiptListItem(receipt: Record<string, any>) {
    return {
      id: receipt._id.toString(),
      classId: receipt.classId?.toString(),
      classIds: this.getReceiptClassIds(receipt),
      primaryClassId: receipt.primaryClassId?.toString?.(),
      scopeType: receipt.scopeType ?? ReceiptScope.Class,
      studentId: receipt.studentId?.toString(),
      receiptNumber: receipt.receiptNumber,
      issuedAt: receipt.issuedAt,
      periodStart: receipt.periodStart,
      periodEnd: receipt.periodEnd,
      studentName: receipt.studentSnapshot?.fullName,
      className: this.getReceiptClassNames(receipt),
      classSnapshots: (receipt.classSnapshots ?? [receipt.classSnapshot])
        .filter(Boolean)
        .map((snapshot: Record<string, any>) =>
          this.toClassSnapshotResponse(snapshot),
        ),
      lessonCount: receipt.lessonCount,
      totalAmount: receipt.totalAmount,
      paymentStatus: receipt.paymentStatus,
      paidAmount: receipt.paidAmount ?? 0,
      paidAt: receipt.paidAt ?? null,
      paymentNote: receipt.paymentNote,
      pdfStatus: receipt.pdfStatus,
      pdfUrl: receipt.pdfUrl,
    };
  }

  private buildReceiptPdfFileName(
    receipt: ReceiptDocument | Record<string, any>,
  ) {
    const source =
      typeof (receipt as ReceiptDocument).toObject === 'function'
        ? (receipt as ReceiptDocument).toObject()
        : receipt;
    const studentName = this.toFileNamePart(
      source.studentSnapshot?.fullName,
      'Học sinh',
    );
    const receiptNumber = this.toFileNamePart(source.receiptNumber, 'Hóa đơn');

    return `${studentName} - ${receiptNumber}.pdf`;
  }

  private buildReceiptsZipFileName(
    files: Array<{ fileName: string; modifiedAt: Date }>,
  ) {
    const dateKey = this.toVietnamDateKey(new Date()).replace(/-/g, '');

    if (files.length === 1) {
      const name = files[0].fileName.replace(/\.pdf$/i, '');

      return `${this.toFileNamePart(name, 'Hóa đơn')} - ${dateKey}.zip`;
    }

    return `Hóa đơn - ${dateKey} - ${files.length} file.zip`;
  }

  private toUniqueZipFileName(fileName: string, seenFileNames: Set<string>) {
    const normalizedFileName = this.toZipEntryFileName(fileName);

    if (!seenFileNames.has(normalizedFileName)) {
      seenFileNames.add(normalizedFileName);

      return normalizedFileName;
    }

    const extensionMatch = /\.[^.]+$/.exec(normalizedFileName);
    const extension = extensionMatch?.[0] ?? '';
    const baseName = extension
      ? normalizedFileName.slice(0, -extension.length)
      : normalizedFileName;
    let index = 2;
    let nextFileName = `${baseName} (${index})${extension}`;

    while (seenFileNames.has(nextFileName)) {
      index += 1;
      nextFileName = `${baseName} (${index})${extension}`;
    }

    seenFileNames.add(nextFileName);

    return nextFileName;
  }

  private toZipEntryFileName(fileName: string) {
    const normalizedFileName = fileName
      .replace(/[<>:"/\\|?*]+/g, '-')
      .replace(/\s+/g, ' ')
      .replace(/-+/g, '-')
      .replace(/^[.\s-]+|[.\s-]+$/g, '')
      .trim();

    return normalizedFileName || 'receipt.pdf';
  }

  private buildZipArchive(
    files: Array<{ buffer: Buffer; fileName: string; modifiedAt: Date }>,
  ) {
    if (!files.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một hóa đơn.');
    }

    const localParts: Buffer[] = [];
    const centralDirectoryParts: Buffer[] = [];
    let offset = 0;

    for (const file of files) {
      if (file.buffer.length > 0xffffffff) {
        throw new BadRequestException(
          `File ${file.fileName} quá lớn để đóng gói ZIP.`,
        );
      }

      const fileNameBuffer = Buffer.from(file.fileName, 'utf8');
      const localHeaderOffset = offset;
      const size = file.buffer.length;
      const crc = this.crc32(file.buffer);
      const dosDateTime = this.toZipDosDateTime(file.modifiedAt);
      const localHeader = Buffer.alloc(30);

      localHeader.writeUInt32LE(0x04034b50, 0);
      localHeader.writeUInt16LE(ZIP_VERSION_NEEDED, 4);
      localHeader.writeUInt16LE(ZIP_UTF8_FLAG, 6);
      localHeader.writeUInt16LE(0, 8);
      localHeader.writeUInt16LE(dosDateTime.time, 10);
      localHeader.writeUInt16LE(dosDateTime.date, 12);
      localHeader.writeUInt32LE(crc, 14);
      localHeader.writeUInt32LE(size, 18);
      localHeader.writeUInt32LE(size, 22);
      localHeader.writeUInt16LE(fileNameBuffer.length, 26);
      localHeader.writeUInt16LE(0, 28);

      localParts.push(localHeader, fileNameBuffer, file.buffer);
      offset += localHeader.length + fileNameBuffer.length + file.buffer.length;

      const centralDirectoryHeader = Buffer.alloc(46);
      centralDirectoryHeader.writeUInt32LE(0x02014b50, 0);
      centralDirectoryHeader.writeUInt16LE(ZIP_VERSION_NEEDED, 4);
      centralDirectoryHeader.writeUInt16LE(ZIP_VERSION_NEEDED, 6);
      centralDirectoryHeader.writeUInt16LE(ZIP_UTF8_FLAG, 8);
      centralDirectoryHeader.writeUInt16LE(0, 10);
      centralDirectoryHeader.writeUInt16LE(dosDateTime.time, 12);
      centralDirectoryHeader.writeUInt16LE(dosDateTime.date, 14);
      centralDirectoryHeader.writeUInt32LE(crc, 16);
      centralDirectoryHeader.writeUInt32LE(size, 20);
      centralDirectoryHeader.writeUInt32LE(size, 24);
      centralDirectoryHeader.writeUInt16LE(fileNameBuffer.length, 28);
      centralDirectoryHeader.writeUInt16LE(0, 30);
      centralDirectoryHeader.writeUInt16LE(0, 32);
      centralDirectoryHeader.writeUInt16LE(0, 34);
      centralDirectoryHeader.writeUInt16LE(0, 36);
      centralDirectoryHeader.writeUInt32LE(0, 38);
      centralDirectoryHeader.writeUInt32LE(localHeaderOffset, 42);

      centralDirectoryParts.push(centralDirectoryHeader, fileNameBuffer);
    }

    const centralDirectoryOffset = offset;
    const centralDirectorySize = centralDirectoryParts.reduce(
      (sum, part) => sum + part.length,
      0,
    );
    const endRecord = Buffer.alloc(22);

    endRecord.writeUInt32LE(0x06054b50, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(files.length, 8);
    endRecord.writeUInt16LE(files.length, 10);
    endRecord.writeUInt32LE(centralDirectorySize, 12);
    endRecord.writeUInt32LE(centralDirectoryOffset, 16);
    endRecord.writeUInt16LE(0, 20);

    return Buffer.concat([...localParts, ...centralDirectoryParts, endRecord]);
  }

  private toZipDosDateTime(value: Date) {
    const source = Number.isNaN(value.getTime()) ? new Date() : value;
    const date = new Date(source.getTime() + VIETNAM_TIMEZONE_OFFSET_MS);
    const year = Math.max(1980, date.getUTCFullYear());
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = Math.floor(date.getUTCSeconds() / 2);

    return {
      date: ((year - 1980) << 9) | (month << 5) | day,
      time: (hours << 11) | (minutes << 5) | seconds,
    };
  }

  private crc32(buffer: Buffer) {
    let crc = 0xffffffff;

    for (const byte of buffer) {
      crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff];
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  private toFileNamePart(value: unknown, fallback: string) {
    const source = typeof value === 'string' ? value.trim() : '';
    const safeName = source
      .split('')
      .map((character) =>
        character.charCodeAt(0) < 32 || /[<>:"/\\|?*]/.test(character)
          ? '-'
          : character,
      )
      .join('')
      .replace(/\s+/g, ' ')
      .replace(/-+/g, '-')
      .replace(/^[.\s-]+|[.\s-]+$/g, '')
      .slice(0, 90)
      .trim();

    return safeName || fallback;
  }

  private toReceiptResponse(receipt: ReceiptDocument | Record<string, any>) {
    const source =
      typeof (receipt as ReceiptDocument).toObject === 'function'
        ? (receipt as ReceiptDocument).toObject()
        : receipt;

    return {
      id: source._id.toString(),
      teacherId: source.teacherId.toString(),
      classId: source.classId?.toString(),
      classIds: this.getReceiptClassIds(source),
      primaryClassId: source.primaryClassId?.toString?.(),
      scopeType: source.scopeType ?? ReceiptScope.Class,
      studentId: source.studentId.toString(),
      billingCycleId: source.billingCycleId?.toString(),
      receiptNumber: source.receiptNumber,
      issuedAt: source.issuedAt,
      periodStart: source.periodStart,
      periodEnd: source.periodEnd,
      dueDate: source.dueDate,
      reason: source.reason,
      teacherSnapshot: source.teacherSnapshot,
      classSnapshot: this.toClassSnapshotResponse(source.classSnapshot),
      classSnapshots: (source.classSnapshots ?? [source.classSnapshot])
        .filter(Boolean)
        .map((snapshot: Record<string, any>) =>
          this.toClassSnapshotResponse(snapshot),
        ),
      studentSnapshot: source.studentSnapshot,
      sessions: (source.sessions ?? []).map((item: Record<string, any>) =>
        this.toReceiptSessionSnapshotResponse(item),
      ),
      exams: (source.exams ?? []).map((item: Record<string, any>) =>
        this.toReceiptExamSnapshotResponse(item),
      ),
      lessonCount: source.lessonCount,
      subtotal: source.subtotal,
      discountAmount: source.discountAmount ?? 0,
      adjustmentAmount: source.adjustmentAmount ?? 0,
      totalAmount: source.totalAmount,
      paymentStatus: source.paymentStatus,
      paidAmount: source.paidAmount ?? 0,
      paidAt: source.paidAt ?? null,
      note: source.note,
      teacherComment: source.teacherComment,
      strengthsComment: source.strengthsComment,
      improvementsComment: source.improvementsComment,
      generalComment: source.generalComment ?? source.teacherComment,
      paymentNote: source.paymentNote,
      paymentProofUrl: source.paymentProofUrl,
      pdfStatus: source.pdfStatus,
      pdfUrl: source.pdfUrl,
      pdfGeneratedAt: source.pdfGeneratedAt,
      pdfFailedReason: source.pdfFailedReason,
    };
  }

  private toTeacherSnapshot(teacher: UserDocument) {
    return {
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      avatarUrl: teacher.avatarUrl,
      bankAccountName: teacher.bankAccountName,
      bankAccountNumber: teacher.bankAccountNumber,
      hasPaymentQr: Boolean(
        teacher.paymentQrImageContentType && teacher.paymentQrImageSize,
      ),
    };
  }

  private toClassSnapshot(classroom: ClassDocument) {
    return {
      classId: classroom._id,
      className: classroom.name,
      colorHex: classroom.colorHex,
      regularPrice: classroom.regularPrice,
      makeupPrice: classroom.makeupPrice,
    };
  }

  private toClassSnapshotResponse(snapshot?: Record<string, any>) {
    if (!snapshot) {
      return snapshot;
    }

    return {
      ...snapshot,
      classId: snapshot.classId?.toString?.(),
    };
  }

  private toReceiptSessionSnapshotResponse(item: Record<string, any>) {
    return {
      ...item,
      tuitionEntryId: item.tuitionEntryId?.toString?.(),
      attendanceId: item.attendanceId?.toString?.(),
      sessionId: item.sessionId?.toString?.(),
      classId: item.classId?.toString?.(),
      attendedClassId: item.attendedClassId?.toString?.(),
      billingClassId: item.billingClassId?.toString?.(),
      makeupForClassId: item.makeupForClassId?.toString?.(),
    };
  }

  private toReceiptExamSnapshotResponse(item: Record<string, any>) {
    return {
      ...item,
      examId: item.examId?.toString?.(),
      examScoreId: item.examScoreId?.toString?.(),
      classId: item.classId?.toString?.(),
    };
  }

  private toClassSummary(classroom: ClassDocument) {
    return {
      id: classroom._id.toString(),
      name: classroom.name,
      colorHex: classroom.colorHex,
      regularPrice: classroom.regularPrice,
      makeupPrice: classroom.makeupPrice,
    };
  }

  private toStudentSnapshot(student: StudentDocument) {
    return {
      studentCode: student.studentCode,
      fullName: student.fullName,
      phone: student.phone,
      parentName: student.parent?.fullName,
      parentPhone: student.parent?.phone,
    };
  }

  private toStudentResponse(student: StudentDocument | Record<string, any>) {
    return {
      id: student._id.toString(),
      teacherId: student.teacherId.toString(),
      studentCode: student.studentCode,
      fullName: student.fullName,
      avatarUrl:
        student.avatarUrl ||
        (student.gender === 'female'
          ? DEFAULT_GIRL_AVATAR_URL
          : DEFAULT_BOY_AVATAR_URL),
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      phone: student.phone,
      parent: student.parent,
      address: student.address,
      note: student.note,
      status: student.status,
    };
  }

  private toUniqueObjectIds(values: unknown[]) {
    const map = new Map<string, Types.ObjectId>();

    for (const value of values) {
      if (!value) {
        continue;
      }

      if (!(value instanceof Types.ObjectId) && typeof value !== 'string') {
        continue;
      }

      const id =
        value instanceof Types.ObjectId ? value.toString() : value.trim();

      if (!Types.ObjectId.isValid(id) || map.has(id)) {
        continue;
      }

      map.set(id, new Types.ObjectId(id));
    }

    return [...map.values()];
  }

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    }

    return new Types.ObjectId(value);
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Không thể tạo file PDF hóa đơn.';
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
