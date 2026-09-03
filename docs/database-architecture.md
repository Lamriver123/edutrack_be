# EduTrack Database Architecture

Ngay lap: 2026-09-02

## PHAN 1 - Database Architecture Review

Thiet ke dung huong cho MVP co the len production: `User` la giao vien, khong tao `Teacher`; moi collection nghiep vu co `teacherId` de filter nhanh, validate quyen so huu va tao compound index.

Diem can giu nghiem ngat:

- Khong query nghiep vu bang `_id` don le. Moi service phai query dang `{ _id, teacherId }`.
- `Student` va `Class` khong embed danh sach tang vo han. Quan he many-to-many nam o `class_enrollments`.
- `ScheduleVersion` la lich co dinh theo giai doan. Cap nhat lich moi phai dong version cu va tao version moi.
- `ScheduleOverride` chi xu ly thay doi tam thoi, khong sua `ScheduleVersion`.
- `ClassSession` la buoi hoc thuc te. Diem danh va hoc phi phai dua vao session, khong tinh truc tiep tu schedule.
- `TuitionEntry` la source of truth ve tien. Gia tien, ten lop, ngay gio va noi dung buoi hoc duoc snapshot tai thoi diem phat sinh.
- `BillingCycle` thuoc ve tung hoc sinh, khong thuoc ve lop.
- `Receipt` la snapshot da chot, khong tinh lai bang du lieu realtime.
- Tien luu bang integer VND, khong dung floating point.
- MongoDB luu `Date` UTC; recurring schedule chi luu gio `HH:mm`.

Bo sung de tang consistency:

- `ClassSession.sourceKey`: dung cho job generate session idempotent, tranh sinh trung session khi API/job bi retry.
- Unique partial active enrollment: cho phep hoc sinh nghi lop roi tham gia lai, nhung khong co 2 enrollment active cung luc.
- Unique partial `TuitionEntry.attendanceId`: mot attendance chi tao toi da mot dong hoc phi chinh.
- Unique `Notification.teacherId + dedupKey`: chong duplicate notification 8/10, 10/10.
- Unique partial `Receipt.teacherId + billingCycleId` khi receipt chua cancelled: tranh xuat 2 phieu thu hoat dong cho cung cycle.
- `Student.avatarUrl`: luu anh dai dien custom hoac avatar mac dinh theo gioi tinh.
- `Student.searchText`: ban normalized cua ten hoc sinh de search co dau/khong dau nhanh hon.
- `Class.searchText`: ban normalized cua ten lop de search trong pham vi tung giao vien.

## PHAN 2 - Collections

- `students`: ho so hoc sinh rieng cua tung giao vien, gom avatar va truong search normalized.
- `classes`: lop hoc, gia buoi thuong, gia hoc bu va truong search normalized.
- `class_enrollments`: lich su hoc sinh tham gia/nghi lop.
- `schedule_versions`: lich co dinh cua lop theo version va khoang hieu luc.
- `schedule_overrides`: lich tam thoi nhu doi lich, nghi, hoc them.
- `class_sessions`: buoi hoc thuc te duoc diem danh/tinh phi.
- `attendances`: trang thai tung hoc sinh trong tung session.
- `exams`: bai kiem tra cua lop.
- `exam_scores`: diem tung hoc sinh theo bai kiem tra.
- `tuition_entries`: ledger hoc phi, source of truth de tinh tien.
- `billing_cycles`: chu ky hoc phi theo tung hoc sinh.
- `receipts`: phieu thu snapshot.
- `notifications`: thong bao cho giao vien, co dedup.

## PHAN 3 - Relationship Diagram

```text
User (teacher)
|-- students
|-- classes
|   |-- class_enrollments -- students
|   |-- schedule_versions
|   |-- schedule_overrides
|   |-- class_sessions
|   |   |-- attendances -- students
|   |   |   `-- tuition_entries
|   |   `-- exams
|   `-- exams
|       `-- exam_scores -- students
|-- billing_cycles -- tuition_entries
|-- receipts
`-- notifications
```

Luong chinh:

```text
ScheduleVersion/ScheduleOverride
  -> ClassSession
  -> Attendance
  -> TuitionEntry
  -> BillingCycle
  -> Notification 8/10 hoac 10/10
  -> Receipt snapshot
```

## PHAN 4 - Mongoose Schemas

Da hien thuc code theo NestJS + Mongoose tai:

```text
src/modules/school-management/
|-- enums/
|   |-- attendance-status.enum.ts
|   |-- attendance-type.enum.ts
|   |-- billing-status.enum.ts
|   |-- class-status.enum.ts
|   |-- day-of-week.enum.ts
|   |-- enrollment-status.enum.ts
|   |-- gender.enum.ts
|   |-- notification-type.enum.ts
|   |-- payment-status.enum.ts
|   |-- receipt-reason.enum.ts
|   |-- schedule-override-action.enum.ts
|   |-- schedule-type.enum.ts
|   |-- session-status.enum.ts
|   |-- student-status.enum.ts
|   |-- tuition-status.enum.ts
|   `-- tuition-type.enum.ts
|-- schemas/
|   |-- attendance.schema.ts
|   |-- billing-cycle.schema.ts
|   |-- class-enrollment.schema.ts
|   |-- class-session.schema.ts
|   |-- class.schema.ts
|   |-- exam-score.schema.ts
|   |-- exam.schema.ts
|   |-- notification.schema.ts
|   |-- receipt.schema.ts
|   |-- schedule-override.schema.ts
|   |-- schedule-version.schema.ts
|   |-- student.schema.ts
|   `-- tuition-entry.schema.ts
`-- school-management.module.ts
```

Tat ca schema dung `@Schema()`, `@Prop()`, `SchemaFactory.createForClass()`, `timestamps: true`, `versionKey: false`, ObjectId ref toi `User.name` cho `teacherId`, enum ro rang va compound indexes.

## PHAN 5 - Index Strategy

- `students`: `{ teacherId, studentCode }` unique cho ma hoc sinh trong pham vi giao vien; `{ teacherId, status }` cho list; `{ teacherId, fullName }` cho sort; `{ teacherId, searchText }` cho search ten co dau/khong dau.
- `classes`: `{ teacherId, status }` cho lop active; `{ teacherId, name }` cho sort/fallback search; `{ teacherId, searchText }` cho search co dau/khong dau.
- `class_enrollments`: `{ teacherId, classId, status }` de lay hoc sinh trong lop; `{ teacherId, studentId, status }` de lay lop cua hoc sinh; unique partial active de chong enroll trung.
- `schedule_versions`: unique `{ teacherId, classId, version }`; `{ teacherId, classId, effectiveFrom }` de tim version theo ngay; unique partial `effectiveTo: null` de chi co mot version hien hanh.
- `schedule_overrides`: index theo `originalDate` va `newDate` de tinh lich ngay/tuan.
- `class_sessions`: `{ teacherId, classId, date }` cho session cua lop; `{ teacherId, date, status }` cho lich hom nay; unique partial `sourceKey` de job generate idempotent.
- `attendances`: unique `{ sessionId, studentId }`; `{ teacherId, studentId, createdAt }` cho lich su; unique partial makeup de tranh bu cho cung buoi nghi nhieu lan.
- `exams`: `{ teacherId, classId, testDate }` va `{ teacherId, testDate }` cho loc diem theo ky.
- `exam_scores`: unique `{ examId, studentId }`; index theo student/exam/class.
- `tuition_entries`: unique partial `{ attendanceId }`; `{ teacherId, studentId, status, createdAt }`; `{ teacherId, billingCycleId }`; `{ teacherId, status, sessionDate }`.
- `billing_cycles`: unique `{ teacherId, studentId, cycleNumber }`; `{ teacherId, studentId, status }` cho current cycle; `{ teacherId, status, updatedAt }` cho danh sach warning/ready.
- `receipts`: unique `{ teacherId, receiptNumber }`; index theo student, issuedAt, paymentStatus; unique partial `{ teacherId, billingCycleId }` khi receipt chua cancelled.
- `notifications`: `{ teacherId, isRead, createdAt }`; `{ teacherId, type, createdAt }`; unique `{ teacherId, dedupKey }`.

## PHAN 6 - Core Business Logic

```text
createStudent(user, dto):
  teacherId = user.id
  create Student with teacherId
  rely on unique {teacherId, studentCode}
```

```text
createClass(user, dto):
  teacherId = user.id
  validate regularPrice/makeupPrice are integer VND
  create Class with teacherId
```

```text
enrollStudent(user, classId, studentId):
  in transaction
  find class by {_id: classId, teacherId}
  find student by {_id: studentId, teacherId}
  if active enrollment exists, return existing result
  create ClassEnrollment status active, joinedAt now
```

```text
removeStudentFromClass(user, classId, studentId):
  find active enrollment by {teacherId, classId, studentId, status: active}
  set status inactive, leftAt now
```

```text
updateFixedSchedule(user, classId, dto):
  in transaction
  find current ScheduleVersion {teacherId, classId, effectiveTo: null}
  set current.effectiveTo = dto.effectiveFrom - 1 ms
  create new ScheduleVersion version = current.version + 1
```

```text
createTemporarySchedule(user, dto):
  validate class belongs to teacher
  validate action fields:
    cancel/reschedule require originalDate
    reschedule/extra require newDate, startTime, endTime
  create ScheduleOverride
```

```text
generateClassSession(user, classId, date):
  find effective ScheduleVersion for date
  apply ScheduleOverride for date
  build sourceKey from classId + date + schedule source
  upsert ClassSession by {teacherId, classId, sourceKey}
```

```text
attendance(user, sessionId, studentId, dto):
  in transaction when billing is enabled
  validate session, student and class/enrollment belong to teacher
  upsert Attendance by {sessionId, studentId}
  if business rule says billable:
    createTuitionEntryFromAttendance(...)
```

```text
makeupAttendance(user, missedSessionId, makeupSessionId, studentId):
  validate missed attendance is absent/excused
  validate makeup session belongs to teacher
  create Attendance in makeup session with attendanceType makeup,
    homeClassId = missedSession.classId,
    makeupForSessionId = missedSessionId
```

```text
createTuitionEntry(attendance):
  load class and session snapshot by teacherId
  amount = class.regularPrice or class.makeupPrice
  create TuitionEntry with copied amount/className/topic/content/date
  call handleBillingCycle(entry)
```

```text
handleBillingCycle(entry):
  in same transaction
  find current open/warning cycle for student
  create next cycle if missing
  attach billingCycleId to TuitionEntry
  recount valid TuitionEntry in cycle
  update cached sessionCount
  if count >= warning and < target: status warning + notification dedup
  if count >= target: status ready, readyAt now + notification dedup
```

```text
manualEarlyBilling(user, billingCycleId):
  in transaction
  load cycle by {teacherId, _id}
  load unbilled entries in cycle
  create Receipt reason manual_early
  mark entries billed
  close cycle as closed_early
  create next open cycle
```

```text
createReceipt(user, billingCycleId, reason):
  in transaction
  load cycle, student, tuition entries
  find ExamScore in cycle date range for student and teacher
  copy student/session/exam snapshots into receipt
  calculate subtotal/discount/adjustment/total
  create Receipt with receiptNumber
  mark TuitionEntry billed
  update BillingCycle receiptId/status
```

## PHAN 7 - MongoDB Transactions

Bat buoc dung transaction:

- Dong schedule version cu va tao version moi.
- Diem danh co tao/cap nhat `Attendance`, `TuitionEntry`, `BillingCycle`, `Notification`.
- Hoc bu neu dong thoi cap nhat attendance buoi nghi va tao attendance buoi bu.
- Xuat receipt: tao receipt, mark tuition billed, dong cycle, tao cycle moi.
- Chot hoc phi truoc han.

Nen dung transaction:

- Enroll/remove enrollment neu di kem audit log/notification.
- Cap nhat payment receipt neu can dong bo `paidAmount`, `paidAt`, `paymentStatus`.

## PHAN 8 - Edge Cases

1. Hai hoc sinh cung `studentCode` trong mot teacher: DB unique index chan.
2. Hai teacher co cung `studentCode`: hop le vi unique theo `teacherId`.
3. FE gui `teacherId` gia: service bo qua, lay tu JWT.
4. Query bang `_id` don le lam ro ri du lieu: service phai bat buoc filter `{ _id, teacherId }`.
5. Hoc sinh enroll cung lop hai lan khi dang active: unique partial chan.
6. Hoc sinh nghi lop roi quay lai: tao enrollment active moi sau khi record cu inactive.
7. Sua lich co dinh lam mat lich su: khong overwrite, tao `ScheduleVersion` moi.
8. API generate session retry: `sourceKey` giup upsert idempotent.
9. Doi lich tam thoi bi ap vao lich co dinh: `ScheduleOverride` tach rieng.
10. Buoi hoc bi huy nhung da co attendance/tuition: service can chan huy hoac yeu cau void tuition co audit.
11. Diem danh mot hoc sinh hai lan trong session: unique `{ sessionId, studentId }` chan.
12. Hoc bu mot buoi nghi nhieu lan: unique partial makeup chan theo business rule MVP.
13. Vang co tinh phi hoac khong tinh phi: quyet dinh bang `TuitionEntry`, khong suy dien tu Attendance.
14. Gia lop thay doi sau do: `TuitionEntry.amount` giu gia cu.
15. Ten lop/noi dung buoi hoc thay doi sau do: receipt da snapshot nen khong doi.
16. Student hoc nhieu class trong mot cycle: `BillingCycle` theo student, `TuitionEntry` theo class/session.
17. Chot som 7/10: cycle cu `closed_early`, cycle moi bat dau tu buoi tiep theo.
18. Notification 8/10 bi tao lai khi refresh API: `dedupKey` unique chan.
19. Receipt cho cung cycle bi goi lai: unique partial `teacherId + billingCycleId` chan.
20. ExamScore vuot `maxScore`: service phai load Exam va validate `score <= maxScore`.

## PHAN 9 - Recommended Folder Structure

```text
src/modules/
|-- users/
|-- auth/
|-- school-management/
|   |-- enums/
|   |-- schemas/
|   `-- school-management.module.ts
|-- students/
|   |-- dto/
|   |-- students.controller.ts
|   |-- students.service.ts
|   `-- students.module.ts
|-- classes/
|   |-- dto/
|   |-- classes.controller.ts
|   |-- classes.service.ts
|   `-- classes.module.ts
|-- schedules/
|-- sessions/
|-- attendances/
|-- exams/
|-- billing/
|-- receipts/
`-- notifications/
```

`school-management` la model foundation. Khi bat dau API nghiep vu, nen tach service/controller theo domain nho de controller gon va moi service chi nam mot luong nghiep vu ro rang.
