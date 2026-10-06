import { ValidationPipe } from '@nestjs/common';
import { ResumeFixedScheduleDto } from './resume-fixed-schedule.dto';

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
const validate = (body: unknown) =>
  pipe.transform(body, { type: 'body', metatype: ResumeFixedScheduleDto });
const schedules = [{ dayOfWeek: 3, startTime: '19:00', endTime: '20:30' }];

describe('Resume fixed schedule request validation', () => {
  it('accepts the existing keep-schedule payload', async () => {
    await expect(validate({ resumeFrom: '2026-10-06' })).resolves.toMatchObject(
      { resumeFrom: '2026-10-06' },
    );
  });
  it('accepts optional replacement slots and transforms their weekday', async () => {
    const result = (await validate({
      resumeFrom: '2026-10-06',
      schedules: [{ ...schedules[0], dayOfWeek: '3' }],
    })) as ResumeFixedScheduleDto;
    expect(result.schedules).toEqual(schedules);
  });
  it.each([
    { resumeFrom: 'not-a-date', schedules },
    { resumeFrom: '2026-10-06', schedules: [] },
    {
      resumeFrom: '2026-10-06',
      schedules: [{ ...schedules[0], dayOfWeek: 8 }],
    },
    {
      resumeFrom: '2026-10-06',
      schedules: [{ ...schedules[0], startTime: '25:00' }],
    },
    {
      resumeFrom: '2026-10-06',
      schedules: [{ ...schedules[0], teacherId: 'another-teacher' }],
    },
  ])(
    'rejects an invalid or unexpected replacement schedule: %j',
    async (body) => {
      await expect(validate(body)).rejects.toMatchObject({ status: 400 });
    },
  );
});
