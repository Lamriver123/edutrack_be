import { AttendanceStatus, TuitionType } from '../school-management/enums';
import type { AttendanceScheduleEventType } from './dto/take-attendance.dto';

export function resolveAttendanceTuition(
  status: AttendanceStatus,
  scheduleEventType: AttendanceScheduleEventType | undefined,
  regularPrice: number,
  oneOnOnePrice: number,
) {
  const isOneOnOneSession = scheduleEventType === 'one_on_one';
  const amount = isOneOnOneSession ? oneOnOnePrice : regularPrice;

  if (status === AttendanceStatus.Absent) {
    return {
      type: TuitionType.Absence,
      amount,
    };
  }

  return {
    type:
      scheduleEventType === 'extra'
        ? TuitionType.Extra
        : isOneOnOneSession
          ? TuitionType.OneOnOne
          : TuitionType.Regular,
    amount,
  };
}
