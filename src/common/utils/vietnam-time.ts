const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;

export type WeeklyTimePoint = {
  dayOfWeek: number;
  time: string;
};

export function convertVietnamWeeklyTimeToUtc(
  dayOfWeek: number,
  time: string,
): WeeklyTimePoint {
  return shiftWeeklyTime(dayOfWeek, time, -VIETNAM_UTC_OFFSET_MINUTES);
}

export function convertUtcWeeklyTimeToVietnam(
  dayOfWeek: number,
  time: string,
): WeeklyTimePoint {
  return shiftWeeklyTime(dayOfWeek, time, VIETNAM_UTC_OFFSET_MINUTES);
}

export function convertVietnamTimeToUtc(time: string) {
  return shiftTime(time, -VIETNAM_UTC_OFFSET_MINUTES);
}

export function convertUtcTimeToVietnam(time: string) {
  return shiftTime(time, VIETNAM_UTC_OFFSET_MINUTES);
}

function shiftWeeklyTime(
  dayOfWeek: number,
  time: string,
  offsetMinutes: number,
): WeeklyTimePoint {
  const totalMinutes =
    (dayOfWeek - 1) * MINUTES_PER_DAY +
    parseTimeToMinutes(time) +
    offsetMinutes;
  const normalizedMinutes =
    ((totalMinutes % MINUTES_PER_WEEK) + MINUTES_PER_WEEK) % MINUTES_PER_WEEK;

  return {
    dayOfWeek: Math.floor(normalizedMinutes / MINUTES_PER_DAY) + 1,
    time: formatMinutesToTime(normalizedMinutes % MINUTES_PER_DAY),
  };
}

function shiftTime(time: string, offsetMinutes: number) {
  const totalMinutes = parseTimeToMinutes(time) + offsetMinutes;
  const normalizedMinutes =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return formatMinutesToTime(normalizedMinutes);
}

function parseTimeToMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);

  return hour * 60 + minute;
}

function formatMinutesToTime(minutes: number) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');

  return `${hour}:${minute}`;
}
