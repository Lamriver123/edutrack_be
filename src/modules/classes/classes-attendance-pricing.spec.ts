import { AttendanceStatus, TuitionType } from '../school-management/enums';
import { resolveAttendanceTuition } from './attendance-tuition';

describe('attendance tuition pricing', () => {
  it('uses the regular price for extra lessons', () => {
    expect(
      resolveAttendanceTuition(
        AttendanceStatus.Present,
        'extra',
        150_000,
        220_000,
      ),
    ).toEqual({ amount: 150_000, type: TuitionType.Extra });
  });

  it('uses the one-on-one price only for one-on-one lessons', () => {
    expect(
      resolveAttendanceTuition(
        AttendanceStatus.Present,
        'one_on_one',
        150_000,
        220_000,
      ),
    ).toEqual({ amount: 220_000, type: TuitionType.OneOnOne });
  });
});
