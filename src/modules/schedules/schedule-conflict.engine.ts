import { BadRequestException } from '@nestjs/common';

export type TimeSlot = { startTime: string; endTime: string };
export type WeeklySlot = TimeSlot & { dayOfWeek: number };
export type FixedVersion = {
  id: string;
  classId: string;
  version: number;
  from: string;
  to?: string;
  schedules: WeeklySlot[];
};
export type TemporarySlot = {
  id: string;
  classId: string;
  action: 'extra' | 'reschedule' | 'cancel';
  originalDate?: string;
  newDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  startTime?: string;
  endTime?: string;
};
export type ScheduleSnapshot = {
  classes: Map<string, string>;
  versions: FixedVersion[];
  overrides: TemporarySlot[];
};
export type OccupiedSlot = TimeSlot & {
  classId: string;
  scheduleId: string;
  date: string;
  type: 'fixed' | 'temporary';
};
export type ScheduleConflict = OccupiedSlot & {
  className: string;
  message: string;
};
export type ConflictResult = {
  blockingConflicts: ScheduleConflict[];
  warnings: ScheduleConflict[];
};

const DAY_MS = 86400000;
export function dateKey(value: Date) {
  return new Date(value.getTime() + 7 * 3600000).toISOString().slice(0, 10);
}
export function validDate(value: string | undefined): string {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequestException(
      'Ngày học phải hợp lệ và có dạng YYYY-MM-DD.',
    );
  }
  return value;
}
export function dayOfWeek(date: string) {
  return new Date(date).getUTCDay() || 7;
}
export function addDate(date: string, days: number) {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}
export function validateTime(slot: {
  startTime?: string;
  endTime?: string;
}): asserts slot is TimeSlot {
  const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    !slot.startTime ||
    !slot.endTime ||
    !pattern.test(slot.startTime) ||
    !pattern.test(slot.endTime) ||
    slot.startTime >= slot.endTime
  ) {
    throw new BadRequestException(
      'Nhập giờ Việt Nam 24h HH:mm; giờ kết thúc phải sau giờ bắt đầu.',
    );
  }
}
export function overlaps(a: TimeSlot, b: TimeSlot) {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

// Clip stale/open versions at the next effective date, including legacy data.
export function effectiveVersions(versions: FixedVersion[]) {
  return versions
    .map((v) => {
      const next = versions
        .filter(
          (other) =>
            other.classId === v.classId &&
            (other.from > v.from ||
              (other.from === v.from && other.version > v.version)),
        )
        .sort(
          (a, b) => a.from.localeCompare(b.from) || b.version - a.version,
        )[0];
      const nextEnd = next ? addDate(next.from, -1) : undefined;
      return {
        ...v,
        to: nextEnd && (!v.to || nextEnd < v.to) ? nextEnd : v.to,
      };
    })
    .filter((v) => !v.to || v.to >= v.from);
}
export function candidateEnd(
  snapshot: ScheduleSnapshot,
  classId: string,
  from: string,
) {
  const next = snapshot.versions
    .filter((v) => v.classId === classId && v.from > from)
    .sort((a, b) => a.from.localeCompare(b.from))[0];
  return next ? addDate(next.from, -1) : undefined;
}
function firstOccurrence(
  from: string,
  to: string | undefined,
  weekday: number,
) {
  const first = addDate(from, (weekday - dayOfWeek(from) + 7) % 7);
  return !to || first <= to ? first : undefined;
}
export function fixedOnDate(
  snapshot: ScheduleSnapshot,
  date: string,
): OccupiedSlot[] {
  return effectiveVersions(snapshot.versions)
    .filter((v) => v.from <= date && (!v.to || v.to >= date))
    .flatMap((v) =>
      v.schedules
        .filter((slot) => slot.dayOfWeek === dayOfWeek(date))
        .map((slot) => ({
          ...slot,
          classId: v.classId,
          scheduleId: v.id,
          date,
          type: 'fixed' as const,
        })),
    );
}
export function sourceMatches(event: OccupiedSlot, schedule: TemporarySlot) {
  if (
    event.type !== 'fixed' ||
    event.classId !== schedule.classId ||
    event.date !== schedule.originalDate
  )
    return false;
  const start =
    schedule.originalStartTime ??
    (schedule.action === 'cancel' ? schedule.startTime : undefined);
  const end =
    schedule.originalEndTime ??
    (schedule.action === 'cancel' ? schedule.endTime : undefined);
  return !start || !end || (event.startTime === start && event.endTime === end);
}
export function occupiedOnDate(
  snapshot: ScheduleSnapshot,
  date: string,
  ignoreId?: string,
): OccupiedSlot[] {
  const overrides = snapshot.overrides.filter((s) => s.id !== ignoreId);
  const fixed = fixedOnDate(snapshot, date).filter(
    (event) =>
      !overrides.some((s) => s.action !== 'extra' && sourceMatches(event, s)),
  );
  return [
    ...fixed,
    ...overrides
      .filter(
        (s) =>
          s.action !== 'cancel' &&
          s.newDate === date &&
          s.startTime &&
          s.endTime,
      )
      .map((s) => ({
        classId: s.classId,
        scheduleId: s.id,
        date,
        startTime: s.startTime!,
        endTime: s.endTime!,
        type: 'temporary' as const,
      })),
  ];
}
export function conflict(
  snapshot: ScheduleSnapshot,
  event: OccupiedSlot,
): ScheduleConflict {
  const className = snapshot.classes.get(event.classId) ?? 'Lớp học';
  const date = event.date.split('-').reverse().join('/');
  return {
    ...event,
    className,
    message: `${className}: ${date}, ${event.startTime} - ${event.endTime} (${event.type === 'fixed' ? 'lịch cố định' : 'lịch tạm'}).`,
  };
}
export function checkFixed(
  snapshot: ScheduleSnapshot,
  classId: string,
  from: string,
  slots: WeeklySlot[],
): ConflictResult {
  validDate(from);
  if (!slots.length) throw new BadRequestException('Thêm ít nhất một ca học.');
  const blockingConflicts: ScheduleConflict[] = [];
  const warnings: ScheduleConflict[] = [];
  const to = candidateEnd(snapshot, classId, from);
  for (const [index, slot] of slots.entries()) {
    validateTime(slot);
    if (
      !Number.isInteger(slot.dayOfWeek) ||
      slot.dayOfWeek < 1 ||
      slot.dayOfWeek > 7
    )
      throw new BadRequestException('Thứ không hợp lệ.');
    for (const other of slots.slice(0, index)) {
      if (slot.dayOfWeek === other.dayOfWeek && overlaps(slot, other)) {
        blockingConflicts.push(
          conflict(snapshot, {
            ...other,
            classId,
            scheduleId: 'draft',
            date: firstOccurrence(from, undefined, slot.dayOfWeek)!,
            type: 'fixed',
          }),
        );
      }
    }
    for (const version of effectiveVersions(snapshot.versions).filter(
      (v) => v.classId !== classId,
    )) {
      const start = version.from > from ? version.from : from;
      const end = !to
        ? version.to
        : !version.to
          ? to
          : to < version.to
            ? to
            : version.to;
      const date = firstOccurrence(start, end, slot.dayOfWeek);
      if (!date) continue;
      for (const other of version.schedules) {
        if (other.dayOfWeek === slot.dayOfWeek && overlaps(slot, other))
          blockingConflicts.push(
            conflict(snapshot, {
              ...other,
              classId: version.classId,
              scheduleId: version.id,
              date,
              type: 'fixed',
            }),
          );
      }
    }
    for (const other of snapshot.overrides) {
      if (
        other.action === 'cancel' ||
        !other.newDate ||
        other.newDate < from ||
        (to && other.newDate > to) ||
        !other.startTime ||
        !other.endTime ||
        dayOfWeek(other.newDate) !== slot.dayOfWeek
      )
        continue;
      // Its own moved occurrence replaces this fixed slot, so it is not a warning.
      const occurrence: OccupiedSlot = {
        ...slot,
        classId,
        scheduleId: 'draft',
        date: other.newDate,
        type: 'fixed',
      };
      if (other.action === 'reschedule' && sourceMatches(occurrence, other))
        continue;
      if (overlaps(slot, other as TimeSlot))
        warnings.push(
          conflict(snapshot, {
            ...(other as TimeSlot),
            classId: other.classId,
            scheduleId: other.id,
            date: other.newDate,
            type: 'temporary',
          }),
        );
    }
  }
  return { blockingConflicts, warnings };
}

export function resolveSource(
  snapshot: ScheduleSnapshot,
  draft: TemporarySlot,
  ignoreId?: string,
) {
  if (draft.action !== 'reschedule') return draft;
  const date = validDate(draft.originalDate);
  const candidates = fixedOnDate(snapshot, date).filter(
    (e) =>
      e.classId === draft.classId &&
      (!draft.originalStartTime || e.startTime === draft.originalStartTime) &&
      (!draft.originalEndTime || e.endTime === draft.originalEndTime),
  );
  if (candidates.length !== 1)
    throw new BadRequestException(
      'Vui lòng chọn đúng tiết gốc cần dời (ngày và giờ học).',
    );
  const source = candidates[0];
  if (
    snapshot.overrides.some(
      (s) =>
        s.id !== ignoreId && s.action !== 'extra' && sourceMatches(source, s),
    )
  ) {
    throw new BadRequestException(
      'Tiết gốc đã được dời hoặc cho nghỉ. Hãy sửa lịch tạm hiện có.',
    );
  }
  return {
    ...draft,
    originalStartTime: source.startTime,
    originalEndTime: source.endTime,
  };
}
export function checkTemporary(
  snapshot: ScheduleSnapshot,
  draft: TemporarySlot,
  ignoreId?: string,
): ConflictResult {
  const blockingConflicts: ScheduleConflict[] = [];
  if (draft.action !== 'cancel') {
    validateTime(draft);
    const date = validDate(draft.newDate);
    const normalized = resolveSource(snapshot, draft, ignoreId);
    for (const event of occupiedOnDate(snapshot, date, ignoreId)) {
      if (
        normalized.action === 'reschedule' &&
        sourceMatches(event, normalized)
      )
        continue;
      if (overlaps(draft, event))
        blockingConflicts.push(conflict(snapshot, event));
    }
  }
  return { blockingConflicts, warnings: [] };
}

export function freeIntervals(
  busy: TimeSlot[],
  startTime: string,
  endTime: string,
  duration: number,
): TimeSlot[] {
  validateTime({ startTime, endTime });
  const minutes = (v: string) =>
    Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
  const format = (v: number) =>
    `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
  const from = minutes(startTime);
  const to = minutes(endTime);
  let cursor = from;
  const result: TimeSlot[] = [];
  for (const slot of [...busy].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )) {
    const start = Math.max(from, Math.min(to, minutes(slot.startTime)));
    if (start - cursor >= duration)
      result.push({ startTime: format(cursor), endTime: format(start) });
    cursor = Math.max(cursor, Math.min(to, minutes(slot.endTime)));
  }
  if (to - cursor >= duration)
    result.push({ startTime: format(cursor), endTime: format(to) });
  return result;
}
