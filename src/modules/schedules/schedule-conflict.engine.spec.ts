import {
  checkFixed,
  checkTemporary,
  freeIntervals,
  occupiedOnDate,
  resolveSource,
  type FixedVersion,
  type ScheduleSnapshot,
  type TemporarySlot,
} from './schedule-conflict.engine';

const slot = (startTime = '09:00', endTime = '10:00', dayOfWeek = 1) => ({
  startTime,
  endTime,
  dayOfWeek,
});
const version = (
  classId: string,
  overrides: Partial<FixedVersion> = {},
): FixedVersion => ({
  id: `${classId}-v1`,
  classId,
  version: 1,
  from: '2026-09-01',
  schedules: [slot()],
  ...overrides,
});
const snapshot = (
  versions: FixedVersion[],
  overrides: TemporarySlot[] = [],
): ScheduleSnapshot => ({
  classes: new Map([
    ['a', 'Lớp A'],
    ['b', 'Lớp B'],
  ]),
  versions,
  overrides,
});
const moved = (overrides: Partial<TemporarySlot> = {}): TemporarySlot => ({
  id: 'move-a',
  classId: 'a',
  action: 'reschedule',
  originalDate: '2026-09-07',
  originalStartTime: '09:00',
  originalEndTime: '10:00',
  newDate: '2026-09-07',
  startTime: '09:30',
  endTime: '10:30',
  ...overrides,
});

describe('Schedule conflicts: Vietnam local time', () => {
  it.each([
    ['09:00', '10:00'],
    ['08:30', '09:30'],
    ['09:30', '10:30'],
    ['08:00', '11:00'],
  ])('blocks overlapping fixed range %s-%s', (start, end) => {
    expect(
      checkFixed(snapshot([version('b')]), 'a', '2026-09-01', [
        slot(start, end),
      ]).blockingConflicts,
    ).toHaveLength(1);
  });
  it.each([
    ['08:00', '09:00'],
    ['10:00', '11:00'],
  ])('allows touching fixed boundaries %s-%s', (start, end) => {
    expect(
      checkFixed(snapshot([version('b')]), 'a', '2026-09-01', [
        slot(start, end),
      ]).blockingConflicts,
    ).toHaveLength(0);
  });
  it('rejects intersecting draft slots, allows different weekdays', () => {
    expect(
      checkFixed(snapshot([]), 'a', '2026-09-01', [
        slot(),
        slot('09:30', '10:30'),
      ]).blockingConflicts,
    ).toHaveLength(1);
    expect(
      checkFixed(snapshot([]), 'a', '2026-09-01', [
        slot(),
        slot('09:30', '10:30', 2),
      ]).blockingConflicts,
    ).toHaveLength(0);
  });
  it('uses old and future versions by effective date, without a lookahead cap', () => {
    const data = snapshot([
      version('b', { to: '2026-09-06' }),
      version('b', {
        id: 'b-v2',
        version: 2,
        from: '2030-01-01',
        schedules: [slot('11:00', '12:00')],
      }),
    ]);
    expect(
      checkFixed(data, 'a', '2026-09-07', [slot()]).blockingConflicts,
    ).toHaveLength(0);
    expect(
      checkFixed(data, 'a', '2026-09-07', [slot('11:30', '12:30')])
        .blockingConflicts[0].date,
    ).toBe('2030-01-07');
  });
  it('does not report overlap if no matching weekday occurs during the shared date range', () => {
    expect(
      checkFixed(
        snapshot([version('b', { from: '2026-09-01', to: '2026-09-06' })]),
        'a',
        '2026-09-01',
        [slot()],
      ).blockingConflicts,
    ).toHaveLength(0);
  });
  it('ends inserted version at the next scheduled version of the same class', () => {
    const data = snapshot([
      version('a', { from: '2026-09-14' }),
      version('b', { from: '2026-09-14' }),
    ]);
    expect(
      checkFixed(data, 'a', '2026-09-07', [slot()]).blockingConflicts,
    ).toHaveLength(0);
  });
  it('ignores replaced same-class fixed versions', () => {
    expect(
      checkFixed(snapshot([version('a')]), 'a', '2026-09-01', [slot()])
        .blockingConflicts,
    ).toHaveLength(0);
  });
  it('warns on future temporary overlaps but permits fixed creation', () => {
    const data = snapshot(
      [],
      [
        {
          id: 'extra-b',
          classId: 'b',
          action: 'extra',
          newDate: '2028-09-04',
          ...slot(),
        },
      ],
    );
    const result = checkFixed(data, 'a', '2026-09-01', [slot()]);
    expect(result.blockingConflicts).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
  it('still blocks recurring conflict even if that occurrence has been cancelled', () => {
    const data = snapshot(
      [version('b')],
      [
        {
          id: 'cancel-b',
          classId: 'b',
          action: 'cancel',
          originalDate: '2026-09-07',
          ...slot(),
        },
      ],
    );
    expect(
      checkFixed(data, 'a', '2026-09-07', [slot()]).blockingConflicts,
    ).toHaveLength(1);
  });
  it('excludes exactly the original occurrence when moving within its own time range', () => {
    const data = snapshot([
      version('a', { schedules: [slot(), slot('11:00', '12:00')] }),
    ]);
    expect(checkTemporary(data, moved()).blockingConflicts).toHaveLength(0);
    expect(
      checkTemporary(data, moved({ startTime: '10:30', endTime: '11:30' }))
        .blockingConflicts,
    ).toHaveLength(1);
  });
  it('still checks other classes while excluding the source', () => {
    const data = snapshot([
      version('a'),
      version('b', { schedules: [slot('10:00', '11:00')] }),
    ]);
    expect(checkTemporary(data, moved()).blockingConflicts[0].classId).toBe(
      'b',
    );
  });
  it('does not exclude another occurrence of the same weekly slot next week', () => {
    expect(
      checkTemporary(snapshot([version('a')]), moved({ newDate: '2026-09-14' }))
        .blockingConflicts,
    ).toHaveLength(1);
  });
  it('ignores the edited override, not other temporary schedules', () => {
    const data = snapshot(
      [version('a')],
      [
        moved(),
        {
          id: 'extra-b',
          classId: 'b',
          action: 'extra',
          newDate: '2026-09-07',
          startTime: '11:00',
          endTime: '12:00',
        },
      ],
    );
    expect(
      checkTemporary(data, moved(), 'move-a').blockingConflicts,
    ).toHaveLength(0);
    expect(
      checkTemporary(
        data,
        moved({ startTime: '10:30', endTime: '11:30' }),
        'move-a',
      ).blockingConflicts[0].scheduleId,
    ).toBe('extra-b');
  });
  it('preserves other same-day occurrences when applying an override', () => {
    const data = snapshot(
      [version('a', { schedules: [slot(), slot('11:00', '12:00')] })],
      [moved({ newDate: '2026-09-08' })],
    );
    expect(occupiedOnDate(data, '2026-09-07').map((s) => s.startTime)).toEqual([
      '11:00',
    ]);
    expect(occupiedOnDate(data, '2026-09-08')[0].type).toBe('temporary');
  });
  it('makes cancelled slots available and does not reserve cancellations', () => {
    const data = snapshot(
      [version('a')],
      [
        {
          id: 'cancel',
          classId: 'a',
          action: 'cancel',
          originalDate: '2026-09-07',
          ...slot(),
        },
      ],
    );
    expect(occupiedOnDate(data, '2026-09-07')).toHaveLength(0);
    expect(
      checkTemporary(data, {
        id: 'extra',
        classId: 'b',
        action: 'extra',
        newDate: '2026-09-07',
        ...slot(),
      }).blockingConflicts,
    ).toHaveLength(0);
  });
  it('rejects ambiguous, nonexistent or already moved source occurrences', () => {
    expect(() =>
      resolveSource(
        snapshot([
          version('a', { schedules: [slot(), slot('11:00', '12:00')] }),
        ]),
        moved({ originalStartTime: undefined, originalEndTime: undefined }),
      ),
    ).toThrow('tiết gốc');
    expect(() =>
      resolveSource(
        snapshot([version('a')]),
        moved({ originalStartTime: '08:00' }),
      ),
    ).toThrow('tiết gốc');
    expect(() =>
      resolveSource(
        snapshot([version('a')], [moved()]),
        moved({ id: 'second-move' }),
      ),
    ).toThrow('đã được dời');
  });
  it('uses a future version on its boundary date', () => {
    const data = snapshot([
      version('b'),
      version('b', {
        id: 'b-v2',
        version: 2,
        from: '2026-09-07',
        schedules: [slot('14:00', '15:00')],
      }),
    ]);
    expect(occupiedOnDate(data, '2026-09-07').map((s) => s.startTime)).toEqual([
      '14:00',
    ]);
  });
  it('rejects invalid dates, backwards ranges, midnight rollover and AM/PM', () => {
    for (const time of [
      slot('15:00', '14:00'),
      slot('23:00', '01:00'),
      slot('1:00 PM', '14:00'),
    ])
      expect(() =>
        checkFixed(snapshot([]), 'a', '2026-09-01', [time]),
      ).toThrow();
    expect(() =>
      checkFixed(snapshot([]), 'a', '2026-02-30', [slot()]),
    ).toThrow();
  });
  it('finds free intervals after merging occupied ranges and respects minimum duration', () => {
    expect(
      freeIntervals(
        [
          slot('08:00', '10:00'),
          slot('09:00', '11:00'),
          slot('14:00', '15:00'),
        ],
        '06:00',
        '16:00',
        90,
      ),
    ).toEqual([
      { startTime: '06:00', endTime: '08:00' },
      { startTime: '11:00', endTime: '14:00' },
    ]);
  });
});
