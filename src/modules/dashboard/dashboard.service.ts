import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClassStatus,
  PaymentStatus,
  StudentStatus,
} from '../school-management/enums';
import {
  Class,
  ClassDocument,
  Notification,
  NotificationDocument,
  Receipt,
  ReceiptDocument,
  Student,
  StudentDocument,
} from '../school-management/schemas';
import {
  SchedulesService,
  TeacherScheduleEventResponse,
} from '../schedules/schedules.service';

const VIETNAM_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;
const DEFAULT_PENDING_LIMIT = 8;

type RevenueReceipt = {
  _id: Types.ObjectId;
  issuedAt?: Date;
  paidAmount?: number;
  paidAt?: Date;
  paymentStatus: PaymentStatus;
  totalAmount?: number;
};

type ReceiptClassSnapshotLite = {
  classId?: Types.ObjectId;
  className?: string;
  colorHex?: string;
};

type PendingReceipt = RevenueReceipt & {
  classId?: Types.ObjectId;
  classSnapshot?: ReceiptClassSnapshotLite;
  classSnapshots?: ReceiptClassSnapshotLite[];
  dueDate?: Date;
  lessonCount?: number;
  periodEnd?: Date;
  periodStart?: Date;
  receiptNumber?: string;
  studentId?: Types.ObjectId;
  studentSnapshot?: {
    fullName?: string;
    parentName?: string;
    parentPhone?: string;
    studentCode?: string;
  };
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    private readonly schedulesService: SchedulesService,
  ) {}

  async getOverview(teacherIdStr: string) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const vietnamNow = this.getVietnamNowContext();
    const weekSchedulePromise = this.schedulesService.getTeacherWeekSchedule(
      teacherId.toString(),
      { weekStart: vietnamNow.todayKey },
    );

    const [
      activeClassCount,
      activeStudentCount,
      unreadNotificationCount,
      weekSchedule,
      revenueReceipts,
      pendingReceipts,
    ] = await Promise.all([
      this.classModel
        .countDocuments({ teacherId, status: ClassStatus.Active })
        .exec(),
      this.studentModel
        .countDocuments({ teacherId, status: StudentStatus.Active })
        .exec(),
      this.notificationModel
        .countDocuments({ teacherId, isRead: false })
        .exec(),
      weekSchedulePromise,
      this.receiptModel
        .find({ teacherId, paymentStatus: { $ne: PaymentStatus.Cancelled } })
        .select('issuedAt paidAmount paidAt paymentStatus totalAmount')
        .lean<RevenueReceipt[]>()
        .exec(),
      this.receiptModel
        .find({
          teacherId,
          paymentStatus: {
            $in: [PaymentStatus.Unpaid, PaymentStatus.PartiallyPaid],
          },
        })
        .select(
          [
            'classId',
            'classSnapshot',
            'classSnapshots',
            'dueDate',
            'issuedAt',
            'lessonCount',
            'paidAmount',
            'paymentStatus',
            'periodEnd',
            'periodStart',
            'receiptNumber',
            'studentId',
            'studentSnapshot',
            'totalAmount',
          ].join(' '),
        )
        .sort({ dueDate: 1, issuedAt: -1 })
        .limit(DEFAULT_PENDING_LIMIT)
        .lean<PendingReceipt[]>()
        .exec(),
    ]);

    const todayLessons = weekSchedule.events
      .filter((event) => event.date === vietnamNow.todayKey)
      .filter((event) => event.type !== 'cancel')
      .map((event) => this.toTodayLesson(event, vietnamNow.currentMinutes));
    const currentMonthRevenue = this.buildRevenueStats(
      revenueReceipts.filter(
        (receipt) =>
          receipt.issuedAt &&
          receipt.issuedAt >= vietnamNow.monthStartUtc &&
          receipt.issuedAt < vietnamNow.nextMonthStartUtc,
      ),
    );
    const overallRevenue = this.buildRevenueStats(revenueReceipts);

    return {
      generatedAt: new Date(),
      today: vietnamNow.todayKey,
      stats: {
        activeClassCount,
        activeStudentCount,
        todaySessionCount: todayLessons.length,
        unreadNotificationCount,
        pendingPaymentCount: overallRevenue.pendingReceiptCount,
      },
      revenue: {
        currentMonth: currentMonthRevenue,
        collectedThisMonth: this.sumPaidAmount(
          revenueReceipts.filter(
            (receipt) =>
              receipt.paidAt &&
              receipt.paidAt >= vietnamNow.monthStartUtc &&
              receipt.paidAt < vietnamNow.nextMonthStartUtc,
          ),
        ),
        overall: overallRevenue,
      },
      todayLessons,
      pendingPayments: pendingReceipts.map((receipt) =>
        this.toPendingPaymentItem(receipt),
      ),
    };
  }

  private toTodayLesson(
    event: TeacherScheduleEventResponse,
    currentMinutes: number,
  ) {
    return {
      ...event,
      displayTitle: this.resolveLessonTitle(event),
      statusLabel: this.resolveLessonStatus(event, currentMinutes),
      typeLabel: this.resolveScheduleTypeLabel(event.type),
    };
  }

  private resolveLessonTitle(event: TeacherScheduleEventResponse) {
    return event.topic?.trim() || event.content?.trim() || 'Nội dung buổi học';
  }

  private resolveLessonStatus(
    event: TeacherScheduleEventResponse,
    currentMinutes: number,
  ) {
    const startMinutes = this.parseTimeToMinutes(event.startTime);
    const endMinutes = this.parseTimeToMinutes(event.endTime);

    if (startMinutes === null || endMinutes === null) {
      return 'Chưa rõ giờ';
    }

    if (currentMinutes < startMinutes) {
      return 'Sắp tới';
    }

    if (currentMinutes <= endMinutes) {
      return 'Đang diễn ra';
    }

    return 'Đã qua';
  }

  private resolveScheduleTypeLabel(type: TeacherScheduleEventResponse['type']) {
    if (type === 'extra') {
      return 'Buổi học thêm';
    }

    if (type === 'reschedule') {
      return 'Lịch dời';
    }

    if (type === 'manual') {
      return 'Thủ công';
    }

    if (type === 'cancel') {
      return 'Đã hủy';
    }

    return 'Cố định';
  }

  private buildRevenueStats(receipts: RevenueReceipt[]) {
    const issuedAmount = receipts.reduce(
      (sum, receipt) => sum + this.resolveMoney(receipt.totalAmount),
      0,
    );
    const paidAmount = this.sumPaidAmount(receipts);
    const pendingReceiptCount = receipts.filter((receipt) =>
      [PaymentStatus.Unpaid, PaymentStatus.PartiallyPaid].includes(
        receipt.paymentStatus,
      ),
    ).length;
    const paidReceiptCount = receipts.filter(
      (receipt) => receipt.paymentStatus === PaymentStatus.Paid,
    ).length;
    const outstandingAmount = receipts.reduce(
      (sum, receipt) =>
        sum +
        Math.max(
          0,
          this.resolveMoney(receipt.totalAmount) -
            this.resolveReceiptPaidAmount(receipt),
        ),
      0,
    );

    return {
      issuedAmount,
      paidAmount,
      outstandingAmount,
      paidReceiptCount,
      pendingReceiptCount,
      receiptCount: receipts.length,
    };
  }

  private sumPaidAmount(receipts: RevenueReceipt[]) {
    return receipts.reduce(
      (sum, receipt) => sum + this.resolveReceiptPaidAmount(receipt),
      0,
    );
  }

  private resolveReceiptPaidAmount(receipt: RevenueReceipt) {
    const totalAmount = this.resolveMoney(receipt.totalAmount);

    if (receipt.paymentStatus === PaymentStatus.Paid) {
      return totalAmount;
    }

    return Math.min(totalAmount, this.resolveMoney(receipt.paidAmount));
  }

  private toPendingPaymentItem(receipt: PendingReceipt) {
    const totalAmount = this.resolveMoney(receipt.totalAmount);
    const paidAmount = this.resolveReceiptPaidAmount(receipt);

    return {
      id: receipt._id.toString(),
      classId: receipt.classId?.toString(),
      className: this.getReceiptClassNames(receipt),
      colorHex: this.getReceiptClassColor(receipt),
      dueDate: receipt.dueDate,
      issuedAt: receipt.issuedAt,
      lessonCount: receipt.lessonCount ?? 0,
      paidAmount,
      parentName: receipt.studentSnapshot?.parentName || 'Chưa cập nhật',
      parentPhone: receipt.studentSnapshot?.parentPhone || 'Chưa cập nhật',
      paymentStatus: receipt.paymentStatus,
      periodEnd: receipt.periodEnd,
      periodStart: receipt.periodStart,
      receiptNumber: receipt.receiptNumber,
      remainingAmount: Math.max(0, totalAmount - paidAmount),
      studentCode: receipt.studentSnapshot?.studentCode,
      studentId: receipt.studentId?.toString(),
      studentName: receipt.studentSnapshot?.fullName || 'Học sinh',
      totalAmount,
    };
  }

  private getReceiptClassNames(receipt: PendingReceipt) {
    const names = this.uniqueNonEmpty([
      ...(receipt.classSnapshots ?? []).map((snapshot) => snapshot.className),
      receipt.classSnapshot?.className,
    ]);

    return names.join(' + ') || 'Lớp học';
  }

  private getReceiptClassColor(receipt: PendingReceipt) {
    return (
      receipt.classSnapshots?.find((snapshot) => snapshot.colorHex)?.colorHex ||
      receipt.classSnapshot?.colorHex
    );
  }

  private uniqueNonEmpty(values: unknown[]) {
    const seen = new Set<string>();

    return values
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => {
        if (!value || seen.has(value)) {
          return false;
        }

        seen.add(value);
        return true;
      });
  }

  private getVietnamNowContext(now = new Date()) {
    const vietnamDate = new Date(now.getTime() + VIETNAM_TIMEZONE_OFFSET_MS);
    const year = vietnamDate.getUTCFullYear();
    const month = vietnamDate.getUTCMonth();
    const day = vietnamDate.getUTCDate();

    return {
      currentMinutes:
        vietnamDate.getUTCHours() * 60 + vietnamDate.getUTCMinutes(),
      monthStartUtc: new Date(
        Date.UTC(year, month, 1) - VIETNAM_TIMEZONE_OFFSET_MS,
      ),
      nextMonthStartUtc: new Date(
        Date.UTC(year, month + 1, 1) - VIETNAM_TIMEZONE_OFFSET_MS,
      ),
      todayKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  }

  private parseTimeToMinutes(time?: string) {
    if (!time) {
      return null;
    }

    const [hour, minute] = time.split(':').map(Number);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      return null;
    }

    return hour * 60 + minute;
  }

  private resolveMoney(value?: number) {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.round(value ?? 0));
  }

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    }

    return new Types.ObjectId(value);
  }
}
