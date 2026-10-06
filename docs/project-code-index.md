# EduTrack — chỉ mục mã nguồn BE + FE

Sinh từ mã nguồn bằng node scripts/project-index.cjs trong backend. Đọc [project-guide.md](project-guide.md) trước, rồi tìm đúng đường dẫn hoặc symbol trong file này. Chỉ mục ghi cấu trúc tĩnh; kiểu trả về suy luận và nghiệp vụ cần đọc hướng dẫn hoặc method đích.

Mốc sinh chỉ mục: 2026-10-06 (Việt Nam). Backend: b77355d4ab831b51593394caa36012d162c4c808. Frontend: ca4a87ba02114e46b0402afed582bf21a4775a37.

Phạm vi: 377 file mã/cấu hình/style/tài nguyên văn bản, 73872 dòng. Loại trừ dependency, build/cache, log, credential JSON, .env runtime và dữ liệu backup; .env.example chỉ chứa mẫu cấu hình. Không đọc/ghi DB hoặc gọi dịch vụ ngoài.

## Cách tra cứu

- Dùng tìm kiếm theo route, DTO, schema, tên component, tên method hoặc tên test.
- Dòng ghi trong chỉ mục là vị trí tại mốc sinh; có thể đổi sau chỉnh sửa. Tìm symbol nếu dòng lệch.
- Kiểm tra tài liệu lỗi thời: node scripts/project-index.cjs --check. Mã thoát 1 nghĩa là có file đã thay đổi; đọc diff của những file đó, cập nhật hướng dẫn rồi sinh lại chỉ mục.
- Chỉ mục và snapshot hash tự sinh; không dùng để kết luận test đã chạy hoặc tính năng đã deploy.

## Danh mục file

| File | Dòng | Thành phần chính |
| --- | ---: | --- |
| [edutrack_be/.env.example](../.env.example) | 48 |  |
| [edutrack_be/.gitignore](../.gitignore) | 52 |  |
| [edutrack_be/eslint.config.mjs](../eslint.config.mjs) | 36 |  |
| [edutrack_be/nest-cli.json](../nest-cli.json) | 9 |  |
| [edutrack_be/package.json](../package.json) | 118 |  |
| [edutrack_be/render.yaml](../render.yaml) | 81 |  |
| [edutrack_be/scripts/project-index.cjs](../scripts/project-index.cjs) | 141 | decoratorArgument, visitFiles, decorators, readRecord |
| [edutrack_be/src/app.controller.spec.ts](../src/app.controller.spec.ts) | 27 |  |
| [edutrack_be/src/app.controller.ts](../src/app.controller.ts) | 13 | AppController |
| [edutrack_be/src/app.module.ts](../src/app.module.ts) | 51 | AppModule |
| [edutrack_be/src/app.service.ts](../src/app.service.ts) | 13 | AppService |
| [edutrack_be/src/common/decorators/current-user.decorator.ts](../src/common/decorators/current-user.decorator.ts) | 11 | CurrentUser |
| [edutrack_be/src/common/types/authenticated-request.type.ts](../src/common/types/authenticated-request.type.ts) | 13 | JwtUser, AuthenticatedRequest |
| [edutrack_be/src/common/utils/search-normalizer.ts](../src/common/utils/search-normalizer.ts) | 14 | normalizeSearchText, escapeRegex |
| [edutrack_be/src/common/utils/vietnam-time.ts](../src/common/utils/vietnam-time.ts) | 70 | convertVietnamWeeklyTimeToUtc, convertUtcWeeklyTimeToVietnam, convertVietnamTimeToUtc, convertUtcTimeToVietnam, shiftWeeklyTime, shiftTime, parseTimeToMinutes, formatMinutesToTime, WeeklyTimePoint |
| [edutrack_be/src/config/configuration.spec.ts](../src/config/configuration.spec.ts) | 84 |  |
| [edutrack_be/src/config/configuration.ts](../src/config/configuration.ts) | 160 |  |
| [edutrack_be/src/database/database.module.ts](../src/database/database.module.ts) | 22 | DatabaseModule |
| [edutrack_be/src/main.ts](../src/main.ts) | 40 | bootstrap |
| [edutrack_be/src/modules/ai/ai-schedule.service.ts](../src/modules/ai/ai-schedule.service.ts) | 472 | AiScheduleService |
| [edutrack_be/src/modules/ai/ai.controller.ts](../src/modules/ai/ai.controller.ts) | 36 | AiController |
| [edutrack_be/src/modules/ai/ai.module.ts](../src/modules/ai/ai.module.ts) | 19 | AiModule |
| [edutrack_be/src/modules/ai/dto/ai-chat.dto.ts](../src/modules/ai/dto/ai-chat.dto.ts) | 13 | AiChatDto |
| [edutrack_be/src/modules/ai/schemas/ai-session.schema.ts](../src/modules/ai/schemas/ai-session.schema.ts) | 51 | AiChatMessage, AiSession, AiChatMessageSchema, AiSessionDocument, AiSessionSchema |
| [edutrack_be/src/modules/auth/auth.controller.spec.ts](../src/modules/auth/auth.controller.spec.ts) | 186 | createSession, createController, createResponse |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts) | 178 | AuthController |
| [edutrack_be/src/modules/auth/auth.module.ts](../src/modules/auth/auth.module.ts) | 33 | AuthModule |
| [edutrack_be/src/modules/auth/auth.service.ts](../src/modules/auth/auth.service.ts) | 771 | AuthService |
| [edutrack_be/src/modules/auth/dto/forgot-password.dto.ts](../src/modules/auth/dto/forgot-password.dto.ts) | 12 | ForgotPasswordDto |
| [edutrack_be/src/modules/auth/dto/login.dto.ts](../src/modules/auth/dto/login.dto.ts) | 11 | LoginDto |
| [edutrack_be/src/modules/auth/dto/register.dto.ts](../src/modules/auth/dto/register.dto.ts) | 17 | RegisterDto |
| [edutrack_be/src/modules/auth/dto/resend-otp.dto.ts](../src/modules/auth/dto/resend-otp.dto.ts) | 7 | ResendOtpDto |
| [edutrack_be/src/modules/auth/dto/resend-password-reset-otp.dto.ts](../src/modules/auth/dto/resend-password-reset-otp.dto.ts) | 7 | ResendPasswordResetOtpDto |
| [edutrack_be/src/modules/auth/dto/reset-password.dto.ts](../src/modules/auth/dto/reset-password.dto.ts) | 12 | ResetPasswordDto |
| [edutrack_be/src/modules/auth/dto/verify-otp.dto.ts](../src/modules/auth/dto/verify-otp.dto.ts) | 12 | VerifyOtpDto |
| [edutrack_be/src/modules/auth/guards/jwt-auth.guard.ts](../src/modules/auth/guards/jwt-auth.guard.ts) | 6 | JwtAuthGuard |
| [edutrack_be/src/modules/auth/strategies/jwt.strategy.ts](../src/modules/auth/strategies/jwt.strategy.ts) | 31 | JwtStrategy |
| [edutrack_be/src/modules/auth/types/auth-response.type.ts](../src/modules/auth/types/auth-response.type.ts) | 12 | AuthResponse, AuthSession |
| [edutrack_be/src/modules/auth/types/jwt-payload.type.ts](../src/modules/auth/types/jwt-payload.type.ts) | 11 | JwtTokenType, JwtPayload |
| [edutrack_be/src/modules/backup/backup-check.cli.ts](../src/modules/backup/backup-check.cli.ts) | 60 | BackupCheckModule, main |
| [edutrack_be/src/modules/backup/backup-oauth.cli.ts](../src/modules/backup/backup-oauth.cli.ts) | 226 | OAuthConfigModule, main |
| [edutrack_be/src/modules/backup/backup-oauth.spec.ts](../src/modules/backup/backup-oauth.spec.ts) | 133 |  |
| [edutrack_be/src/modules/backup/backup-oauth.ts](../src/modules/backup/backup-oauth.ts) | 113 | OAuthSetupError, parseDesktopOAuthClient, validateOAuthCallback, updateOAuthEnv, OAuthCallback, OAuthEnvValues |
| [edutrack_be/src/modules/backup/backup.module.ts](../src/modules/backup/backup.module.ts) | 10 | BackupModule |
| [edutrack_be/src/modules/backup/backup.service.spec.ts](../src/modules/backup/backup.service.spec.ts) | 153 |  |
| [edutrack_be/src/modules/backup/backup.service.ts](../src/modules/backup/backup.service.ts) | 240 | BackupService |
| [edutrack_be/src/modules/backup/google-drive.service.spec.ts](../src/modules/backup/google-drive.service.spec.ts) | 206 |  |
| [edutrack_be/src/modules/backup/google-drive.service.ts](../src/modules/backup/google-drive.service.ts) | 303 | GoogleDriveService |
| [edutrack_be/src/modules/backup/index.ts](../src/modules/backup/index.ts) | 4 |  |
| [edutrack_be/src/modules/classes/attendance-tuition.ts](../src/modules/classes/attendance-tuition.ts) | 30 | resolveAttendanceTuition |
| [edutrack_be/src/modules/classes/classes-attendance-pricing.spec.ts](../src/modules/classes/classes-attendance-pricing.spec.ts) | 27 |  |
| [edutrack_be/src/modules/classes/classes-attendance-reset.spec.ts](../src/modules/classes/classes-attendance-reset.spec.ts) | 364 |  |
| [edutrack_be/src/modules/classes/classes-schedule-guard.spec.ts](../src/modules/classes/classes-schedule-guard.spec.ts) | 77 |  |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts) | 423 | ClassesController |
| [edutrack_be/src/modules/classes/classes.module.ts](../src/modules/classes/classes.module.ts) | 22 | ClassesModule |
| [edutrack_be/src/modules/classes/classes.service.ts](../src/modules/classes/classes.service.ts) | 3332 | ClassesService, ClassScheduleSlotResponse, LatestFixedScheduleResponse, ScheduleOverrideResponse, ClassSessionResponse, ClassResponse, ClassDetailResponse, ClassScheduleOverviewResponse, EnrollmentResponse, EnrollmentBulkError, EnrollmentBulkResponse, RemoveStudentsBulkResponse |
| [edutrack_be/src/modules/classes/dto/create-class.dto.ts](../src/modules/classes/dto/create-class.dto.ts) | 57 | CreateClassDto |
| [edutrack_be/src/modules/classes/dto/create-exam.dto.ts](../src/modules/classes/dto/create-exam.dto.ts) | 35 | CreateExamDto |
| [edutrack_be/src/modules/classes/dto/create-fixed-schedule.dto.ts](../src/modules/classes/dto/create-fixed-schedule.dto.ts) | 39 | ScheduleSlotDto, CreateFixedScheduleDto |
| [edutrack_be/src/modules/classes/dto/create-temporary-schedule.dto.ts](../src/modules/classes/dto/create-temporary-schedule.dto.ts) | 46 | CreateTemporaryScheduleDto |
| [edutrack_be/src/modules/classes/dto/enroll-existing-student.dto.ts](../src/modules/classes/dto/enroll-existing-student.dto.ts) | 7 | EnrollExistingStudentDto |
| [edutrack_be/src/modules/classes/dto/enroll-existing-students.dto.ts](../src/modules/classes/dto/enroll-existing-students.dto.ts) | 15 | EnrollExistingStudentsDto |
| [edutrack_be/src/modules/classes/dto/query-classes.dto.ts](../src/modules/classes/dto/query-classes.dto.ts) | 8 | QueryClassesDto |
| [edutrack_be/src/modules/classes/dto/remove-existing-students.dto.ts](../src/modules/classes/dto/remove-existing-students.dto.ts) | 15 | RemoveExistingStudentsDto |
| [edutrack_be/src/modules/classes/dto/resume-fixed-schedule.dto.ts](../src/modules/classes/dto/resume-fixed-schedule.dto.ts) | 7 | ResumeFixedScheduleDto |
| [edutrack_be/src/modules/classes/dto/save-class-session-content.dto.ts](../src/modules/classes/dto/save-class-session-content.dto.ts) | 37 | SaveClassSessionContentDto |
| [edutrack_be/src/modules/classes/dto/suspend-fixed-schedule.dto.ts](../src/modules/classes/dto/suspend-fixed-schedule.dto.ts) | 12 | SuspendFixedScheduleDto |
| [edutrack_be/src/modules/classes/dto/take-attendance-batch.dto.ts](../src/modules/classes/dto/take-attendance-batch.dto.ts) | 11 | TakeAttendanceBatchDto |
| [edutrack_be/src/modules/classes/dto/take-attendance.dto.ts](../src/modules/classes/dto/take-attendance.dto.ts) | 53 | TakeAttendanceRecordDto, TakeAttendanceDto, AttendanceScheduleEventType |
| [edutrack_be/src/modules/classes/dto/take-exam-scores-batch.dto.ts](../src/modules/classes/dto/take-exam-scores-batch.dto.ts) | 53 | ExamScoreEntryDto, TakeExamScoresBatchDto |
| [edutrack_be/src/modules/classes/dto/update-class.dto.ts](../src/modules/classes/dto/update-class.dto.ts) | 66 | UpdateClassDto |
| [edutrack_be/src/modules/classes/dto/update-enrollment-status.dto.ts](../src/modules/classes/dto/update-enrollment-status.dto.ts) | 13 | UpdateEnrollmentStatusDto |
| [edutrack_be/src/modules/classes/dto/update-exam.dto.ts](../src/modules/classes/dto/update-exam.dto.ts) | 5 | UpdateExamDto |
| [edutrack_be/src/modules/classes/dto/update-temporary-schedule.dto.ts](../src/modules/classes/dto/update-temporary-schedule.dto.ts) | 46 | UpdateTemporaryScheduleDto |
| [edutrack_be/src/modules/classes/listeners/class-enrollment.listener.ts](../src/modules/classes/listeners/class-enrollment.listener.ts) | 53 | ClassEnrollmentListener |
| [edutrack_be/src/modules/cloudinary/cloudinary.module.ts](../src/modules/cloudinary/cloudinary.module.ts) | 9 | CloudinaryModule |
| [edutrack_be/src/modules/cloudinary/cloudinary.service.ts](../src/modules/cloudinary/cloudinary.service.ts) | 276 | CloudinaryService, UploadImageFile, CloudinaryUploadResponse |
| [edutrack_be/src/modules/dashboard/dashboard.controller.ts](../src/modules/dashboard/dashboard.controller.ts) | 17 | DashboardController |
| [edutrack_be/src/modules/dashboard/dashboard.module.ts](../src/modules/dashboard/dashboard.module.ts) | 13 | DashboardModule |
| [edutrack_be/src/modules/dashboard/dashboard.service.ts](../src/modules/dashboard/dashboard.service.ts) | 443 | DashboardService |
| [edutrack_be/src/modules/invoice-template/constants/default-invoice-template.ts](../src/modules/invoice-template/constants/default-invoice-template.ts) | 36 | SYSTEM_INVOICE_TEMPLATE_ID, SYSTEM_INVOICE_TEMPLATE_VERSION, SYSTEM_INVOICE_TEMPLATE_HTML, SYSTEM_INVOICE_TEMPLATE_CSS, SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA, SYSTEM_INVOICE_TEMPLATE |
| [edutrack_be/src/modules/invoice-template/constants/invoice-fields.ts](../src/modules/invoice-template/constants/invoice-fields.ts) | 124 | InvoiceFieldFormatter, InvoiceDynamicField, INVOICE_DYNAMIC_FIELDS, INVOICE_DYNAMIC_FIELD_MAP |
| [edutrack_be/src/modules/invoice-template/constants/invoice-regions.ts](../src/modules/invoice-template/constants/invoice-regions.ts) | 58 | invoiceRegionPlaceholder, INVOICE_REGIONS, InvoiceRegionKey, INVOICE_REGION_KEYS, INVOICE_REGION_CSS |
| [edutrack_be/src/modules/invoice-template/constants/legacy-invoice-template.ts](../src/modules/invoice-template/constants/legacy-invoice-template.ts) | 181 | SYSTEM_INVOICE_TEMPLATE_ID, SYSTEM_INVOICE_TEMPLATE_VERSION, SYSTEM_INVOICE_TEMPLATE_HTML, SYSTEM_INVOICE_TEMPLATE_CSS, SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA, SYSTEM_INVOICE_TEMPLATE |
| [edutrack_be/src/modules/invoice-template/constants/preview-receipt.ts](../src/modules/invoice-template/constants/preview-receipt.ts) | 56 | PREVIEW_RECEIPT |
| [edutrack_be/src/modules/invoice-template/constants/system-invoice-v2.ts](../src/modules/invoice-template/constants/system-invoice-v2.ts) | 32 | SYSTEM_V2_HTML, SYSTEM_V2_CSS |
| [edutrack_be/src/modules/invoice-template/dto/create-invoice-template.dto.ts](../src/modules/invoice-template/dto/create-invoice-template.dto.ts) | 43 | CreateInvoiceTemplateDto |
| [edutrack_be/src/modules/invoice-template/dto/duplicate-invoice-template.dto.ts](../src/modules/invoice-template/dto/duplicate-invoice-template.dto.ts) | 15 | DuplicateInvoiceTemplateDto |
| [edutrack_be/src/modules/invoice-template/dto/preview-invoice-template.dto.ts](../src/modules/invoice-template/dto/preview-invoice-template.dto.ts) | 12 | PreviewInvoiceTemplateDto |
| [edutrack_be/src/modules/invoice-template/dto/query-invoice-images.dto.ts](../src/modules/invoice-template/dto/query-invoice-images.dto.ts) | 8 | QueryInvoiceImagesDto |
| [edutrack_be/src/modules/invoice-template/dto/update-invoice-template.dto.ts](../src/modules/invoice-template/dto/update-invoice-template.dto.ts) | 7 | UpdateInvoiceTemplateDto |
| [edutrack_be/src/modules/invoice-template/invoice-images.controller.ts](../src/modules/invoice-template/invoice-images.controller.ts) | 48 | InvoiceImagesController |
| [edutrack_be/src/modules/invoice-template/invoice-images.service.spec.ts](../src/modules/invoice-template/invoice-images.service.spec.ts) | 180 |  |
| [edutrack_be/src/modules/invoice-template/invoice-images.service.ts](../src/modules/invoice-template/invoice-images.service.ts) | 174 | InvoiceImagesService, INVOICE_IMAGE_MAX_SIZE |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.spec.ts](../src/modules/invoice-template/invoice-template.controller.spec.ts) | 118 |  |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts) | 112 | InvoiceTemplateController |
| [edutrack_be/src/modules/invoice-template/invoice-template.module.ts](../src/modules/invoice-template/invoice-template.module.ts) | 35 | InvoiceTemplateModule |
| [edutrack_be/src/modules/invoice-template/invoice-template.service.spec.ts](../src/modules/invoice-template/invoice-template.service.spec.ts) | 142 |  |
| [edutrack_be/src/modules/invoice-template/invoice-template.service.ts](../src/modules/invoice-template/invoice-template.service.ts) | 471 | InvoiceTemplateService, InvoiceTemplateResponse |
| [edutrack_be/src/modules/invoice-template/schemas/invoice-image.schema.ts](../src/modules/invoice-template/schemas/invoice-image.schema.ts) | 40 | InvoiceImage, InvoiceImageDocument, InvoiceImageSchema |
| [edutrack_be/src/modules/invoice-template/schemas/invoice-template.schema.ts](../src/modules/invoice-template/schemas/invoice-template.schema.ts) | 88 | InvoiceTemplate, InvoiceTemplateType, InvoiceTemplateStatus, InvoiceTemplateDocument, InvoiceTemplateSchema |
| [edutrack_be/src/modules/invoice-template/utils/region-renderer.spec.ts](../src/modules/invoice-template/utils/region-renderer.spec.ts) | 79 |  |
| [edutrack_be/src/modules/invoice-template/utils/region-renderer.ts](../src/modules/invoice-template/utils/region-renderer.ts) | 27 | renderRegionTemplate |
| [edutrack_be/src/modules/invoice-template/utils/sanitize-template.spec.ts](../src/modules/invoice-template/utils/sanitize-template.spec.ts) | 102 |  |
| [edutrack_be/src/modules/invoice-template/utils/sanitize-template.ts](../src/modules/invoice-template/utils/sanitize-template.ts) | 409 | sanitizeTemplateHtml, sanitizeTemplateCss, findDynamicFieldKeys, assertWhitelistedDynamicFields, stripForbiddenBlocks, sanitizeTag, sanitizeAttributes, sanitizeAttributeValue, sanitizeCssDeclarationBlock, sanitizeCssDeclaration, sanitizeCssSelector, isDangerousCssValue, isSafeUrl, escapeAttribute |
| [edutrack_be/src/modules/invoice-template/utils/template-renderer.ts](../src/modules/invoice-template/utils/template-renderer.ts) | 180 | renderInvoiceTemplateHtml, buildMockInvoiceRenderContext, resolveDynamicFieldValue, formatDynamicFieldValue, escapeHtml, InvoiceTemplateRenderContext |
| [edutrack_be/src/modules/mail/listeners/mail.listener.ts](../src/modules/mail/listeners/mail.listener.ts) | 35 | MailListener |
| [edutrack_be/src/modules/mail/mail.module.ts](../src/modules/mail/mail.module.ts) | 10 | MailModule |
| [edutrack_be/src/modules/mail/mail.service.ts](../src/modules/mail/mail.service.ts) | 160 | MailService |
| [edutrack_be/src/modules/push/push.controller.spec.ts](../src/modules/push/push.controller.spec.ts) | 271 |  |
| [edutrack_be/src/modules/push/push.controller.ts](../src/modules/push/push.controller.ts) | 66 | PushController |
| [edutrack_be/src/modules/push/push.module.ts](../src/modules/push/push.module.ts) | 13 | PushModule |
| [edutrack_be/src/modules/push/push.service.spec.ts](../src/modules/push/push.service.spec.ts) | 220 | createService |
| [edutrack_be/src/modules/push/push.service.ts](../src/modules/push/push.service.ts) | 196 | PushService, PushDeliveryResult |
| [edutrack_be/src/modules/receipts/dto/download-receipts.dto.ts](../src/modules/receipts/dto/download-receipts.dto.ts) | 15 | DownloadReceiptsDto |
| [edutrack_be/src/modules/receipts/dto/issue-receipt.dto.ts](../src/modules/receipts/dto/issue-receipt.dto.ts) | 141 | ReceiptExamRemarkDto, IssueReceiptDto, normalizeStringArray |
| [edutrack_be/src/modules/receipts/dto/query-billing.dto.ts](../src/modules/receipts/dto/query-billing.dto.ts) | 41 | QueryBillingDto, normalizeStringArray |
| [edutrack_be/src/modules/receipts/dto/query-receipts.dto.ts](../src/modules/receipts/dto/query-receipts.dto.ts) | 25 | QueryReceiptsDto |
| [edutrack_be/src/modules/receipts/dto/update-receipt-payment.dto.ts](../src/modules/receipts/dto/update-receipt-payment.dto.ts) | 43 | UpdateReceiptPaymentDto |
| [edutrack_be/src/modules/receipts/receipt-design.service.spec.ts](../src/modules/receipts/receipt-design.service.spec.ts) | 194 |  |
| [edutrack_be/src/modules/receipts/receipt-design.service.ts](../src/modules/receipts/receipt-design.service.ts) | 153 | ReceiptDesignService, record |
| [edutrack_be/src/modules/receipts/receipt-image-policy.ts](../src/modules/receipts/receipt-image-policy.ts) | 46 | receiptBuiltInImagePath, isReceiptCloudImage, isReceiptBrowserRequestAllowed, isAllowedHttpsHost |
| [edutrack_be/src/modules/receipts/receipt-pdf.service.spec.ts](../src/modules/receipts/receipt-pdf.service.spec.ts) | 52 |  |
| [edutrack_be/src/modules/receipts/receipt-pdf.service.ts](../src/modules/receipts/receipt-pdf.service.ts) | 1388 | ReceiptPdfService |
| [edutrack_be/src/modules/receipts/receipt-template.layout.ts](../src/modules/receipts/receipt-template.layout.ts) | 66 | renderReceiptPage, commentCard, ReceiptPageContent |
| [edutrack_be/src/modules/receipts/receipt-template.service.ts](../src/modules/receipts/receipt-template.service.ts) | 791 | ReceiptTemplateService, record |
| [edutrack_be/src/modules/receipts/receipt-template.styles.ts](../src/modules/receipts/receipt-template.styles.ts) | 392 | RECEIPT_TEMPLATE_CSS |
| [edutrack_be/src/modules/receipts/receipts-template-flow.spec.ts](../src/modules/receipts/receipts-template-flow.spec.ts) | 232 |  |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts) | 282 | ReceiptsController |
| [edutrack_be/src/modules/receipts/receipts.module.ts](../src/modules/receipts/receipts.module.ts) | 31 | ReceiptsModule |
| [edutrack_be/src/modules/receipts/receipts.service.ts](../src/modules/receipts/receipts.service.ts) | 2993 | ReceiptsService |
| [edutrack_be/src/modules/schedules/dto/check-schedule.dto.ts](../src/modules/schedules/dto/check-schedule.dto.ts) | 71 | CheckFixedScheduleDto, CheckTemporaryScheduleDto, ScheduleAvailabilityDto |
| [edutrack_be/src/modules/schedules/dto/query-teacher-week-schedule.dto.ts](../src/modules/schedules/dto/query-teacher-week-schedule.dto.ts) | 8 | QueryTeacherWeekScheduleDto |
| [edutrack_be/src/modules/schedules/push-reminder-store.service.ts](../src/modules/schedules/push-reminder-store.service.ts) | 63 | PushReminderStore |
| [edutrack_be/src/modules/schedules/schedule-conflict.engine.spec.ts](../src/modules/schedules/schedule-conflict.engine.spec.ts) | 334 |  |
| [edutrack_be/src/modules/schedules/schedule-conflict.engine.ts](../src/modules/schedules/schedule-conflict.engine.ts) | 391 | isStandaloneAction, dateKey, validDate, dayOfWeek, addDate, validateTime, overlaps, effectiveVersions, candidateEnd, firstOccurrence, fixedOnDate, sourceMatches, occupiedOnDate, conflict, checkFixed, resolveSource, checkTemporary, freeIntervals, TimeSlot, WeeklySlot, FixedVersion, TemporarySlot, ScheduleSnapshot, OccupiedSlot, ScheduleConflict, ConflictResult |
| [edutrack_be/src/modules/schedules/schedule-conflicts.service.spec.ts](../src/modules/schedules/schedule-conflicts.service.spec.ts) | 571 |  |
| [edutrack_be/src/modules/schedules/schedule-conflicts.service.ts](../src/modules/schedules/schedule-conflicts.service.ts) | 527 | ScheduleConflictsService |
| [edutrack_be/src/modules/schedules/schedules-cron.service.spec.ts](../src/modules/schedules/schedules-cron.service.spec.ts) | 329 | query |
| [edutrack_be/src/modules/schedules/schedules-cron.service.ts](../src/modules/schedules/schedules-cron.service.ts) | 253 | SchedulesCronService |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts) | 73 | SchedulesController |
| [edutrack_be/src/modules/schedules/schedules.module.ts](../src/modules/schedules/schedules.module.ts) | 38 | SchedulesModule |
| [edutrack_be/src/modules/schedules/schedules.service.spec.ts](../src/modules/schedules/schedules.service.spec.ts) | 354 | query, model, createService |
| [edutrack_be/src/modules/schedules/schedules.service.ts](../src/modules/schedules/schedules.service.ts) | 1093 | SchedulesService, TeacherScheduleClassResponse, TeacherScheduleDayResponse, TeacherScheduleEventType, TeacherScheduleEventResponse, TeacherWeekScheduleResponse |
| [edutrack_be/src/modules/schedules/schemas/push-reminder.schema.ts](../src/modules/schedules/schemas/push-reminder.schema.ts) | 26 | PushReminder, PushReminderDocument, PushReminderSchema |
| [edutrack_be/src/modules/school-management/enums/attendance-status.enum.ts](../src/modules/school-management/enums/attendance-status.enum.ts) | 7 | AttendanceStatus |
| [edutrack_be/src/modules/school-management/enums/attendance-type.enum.ts](../src/modules/school-management/enums/attendance-type.enum.ts) | 5 | AttendanceType |
| [edutrack_be/src/modules/school-management/enums/billing-status.enum.ts](../src/modules/school-management/enums/billing-status.enum.ts) | 9 | BillingStatus |
| [edutrack_be/src/modules/school-management/enums/class-status.enum.ts](../src/modules/school-management/enums/class-status.enum.ts) | 6 | ClassStatus |
| [edutrack_be/src/modules/school-management/enums/day-of-week.enum.ts](../src/modules/school-management/enums/day-of-week.enum.ts) | 12 | DayOfWeek, DAY_OF_WEEK_VALUES |
| [edutrack_be/src/modules/school-management/enums/enrollment-status.enum.ts](../src/modules/school-management/enums/enrollment-status.enum.ts) | 6 | EnrollmentStatus |
| [edutrack_be/src/modules/school-management/enums/gender.enum.ts](../src/modules/school-management/enums/gender.enum.ts) | 6 | Gender |
| [edutrack_be/src/modules/school-management/enums/index.ts](../src/modules/school-management/enums/index.ts) | 19 |  |
| [edutrack_be/src/modules/school-management/enums/notification-type.enum.ts](../src/modules/school-management/enums/notification-type.enum.ts) | 6 | NotificationType |
| [edutrack_be/src/modules/school-management/enums/payment-status.enum.ts](../src/modules/school-management/enums/payment-status.enum.ts) | 7 | PaymentStatus |
| [edutrack_be/src/modules/school-management/enums/receipt-pdf-status.enum.ts](../src/modules/school-management/enums/receipt-pdf-status.enum.ts) | 6 | ReceiptPdfStatus |
| [edutrack_be/src/modules/school-management/enums/receipt-reason.enum.ts](../src/modules/school-management/enums/receipt-reason.enum.ts) | 5 | ReceiptReason |
| [edutrack_be/src/modules/school-management/enums/receipt-scope.enum.ts](../src/modules/school-management/enums/receipt-scope.enum.ts) | 5 | ReceiptScope |
| [edutrack_be/src/modules/school-management/enums/schedule-override-action.enum.ts](../src/modules/school-management/enums/schedule-override-action.enum.ts) | 7 | ScheduleOverrideAction |
| [edutrack_be/src/modules/school-management/enums/schedule-type.enum.ts](../src/modules/school-management/enums/schedule-type.enum.ts) | 8 | ScheduleType |
| [edutrack_be/src/modules/school-management/enums/session-status.enum.ts](../src/modules/school-management/enums/session-status.enum.ts) | 6 | SessionStatus |
| [edutrack_be/src/modules/school-management/enums/student-status.enum.ts](../src/modules/school-management/enums/student-status.enum.ts) | 5 | StudentStatus |
| [edutrack_be/src/modules/school-management/enums/tuition-status.enum.ts](../src/modules/school-management/enums/tuition-status.enum.ts) | 6 | TuitionStatus |
| [edutrack_be/src/modules/school-management/enums/tuition-type.enum.ts](../src/modules/school-management/enums/tuition-type.enum.ts) | 10 | TuitionType |
| [edutrack_be/src/modules/school-management/schemas/attendance.schema.ts](../src/modules/school-management/schemas/attendance.schema.ts) | 96 | Attendance, AttendanceDocument, AttendanceSchema |
| [edutrack_be/src/modules/school-management/schemas/billing-cycle.schema.ts](../src/modules/school-management/schemas/billing-cycle.schema.ts) | 73 | BillingCycle, BillingCycleDocument, BillingCycleSchema |
| [edutrack_be/src/modules/school-management/schemas/class-enrollment.schema.ts](../src/modules/school-management/schemas/class-enrollment.schema.ts) | 69 | ClassEnrollment, ClassEnrollmentDocument, ClassEnrollmentSchema |
| [edutrack_be/src/modules/school-management/schemas/class-price-version.schema.ts](../src/modules/school-management/schemas/class-price-version.schema.ts) | 56 | ClassPriceVersion, ClassPriceVersionDocument, ClassPriceVersionSchema |
| [edutrack_be/src/modules/school-management/schemas/class-session.schema.ts](../src/modules/school-management/schemas/class-session.schema.ts) | 100 | ClassSession, ClassSessionDocument, ClassSessionSchema |
| [edutrack_be/src/modules/school-management/schemas/class.schema.ts](../src/modules/school-management/schemas/class.schema.ts) | 72 | Class, ClassDocument, ClassSchema |
| [edutrack_be/src/modules/school-management/schemas/exam-score.schema.ts](../src/modules/school-management/schemas/exam-score.schema.ts) | 66 | ExamScore, ExamScoreDocument, ExamScoreSchema |
| [edutrack_be/src/modules/school-management/schemas/exam.schema.ts](../src/modules/school-management/schemas/exam.schema.ts) | 63 | Exam, ExamDocument, ExamSchema |
| [edutrack_be/src/modules/school-management/schemas/index.ts](../src/modules/school-management/schemas/index.ts) | 15 |  |
| [edutrack_be/src/modules/school-management/schemas/notification.schema.ts](../src/modules/school-management/schemas/notification.schema.ts) | 63 | Notification, NotificationDocument, NotificationSchema |
| [edutrack_be/src/modules/school-management/schemas/receipt-template-snapshot.schema.ts](../src/modules/school-management/schemas/receipt-template-snapshot.schema.ts) | 27 | ReceiptTemplateSnapshot, ReceiptTemplateSnapshotSchema |
| [edutrack_be/src/modules/school-management/schemas/receipt.schema.ts](../src/modules/school-management/schemas/receipt.schema.ts) | 492 | ReceiptStudentSnapshot, ReceiptTeacherSnapshot, ReceiptClassSnapshot, ReceiptSessionSnapshot, ReceiptExamSnapshot, Receipt, ReceiptStudentSnapshotSchema, ReceiptTeacherSnapshotSchema, ReceiptClassSnapshotSchema, ReceiptSessionSnapshotSchema, ReceiptExamSnapshotSchema, ReceiptDocument, ReceiptSchema |
| [edutrack_be/src/modules/school-management/schemas/schedule-override.schema.ts](../src/modules/school-management/schemas/schedule-override.schema.ts) | 70 | ScheduleOverride, ScheduleOverrideDocument, ScheduleOverrideSchema |
| [edutrack_be/src/modules/school-management/schemas/schedule-version.schema.ts](../src/modules/school-management/schemas/schedule-version.schema.ts) | 83 | ScheduleSlot, ScheduleVersion, ScheduleSlotSchema, ScheduleVersionDocument, ScheduleVersionSchema |
| [edutrack_be/src/modules/school-management/schemas/student.schema.ts](../src/modules/school-management/schemas/student.schema.ts) | 89 | StudentParent, Student, StudentParentSchema, StudentDocument, StudentSchema |
| [edutrack_be/src/modules/school-management/schemas/tuition-entry.schema.ts](../src/modules/school-management/schemas/tuition-entry.schema.ts) | 159 | TuitionEntry, TuitionEntryDocument, TuitionEntrySchema |
| [edutrack_be/src/modules/school-management/school-management.module.ts](../src/modules/school-management/school-management.module.ts) | 56 | SchoolManagementModule |
| [edutrack_be/src/modules/students/dto/bulk-delete-students.dto.ts](../src/modules/students/dto/bulk-delete-students.dto.ts) | 20 | BulkDeleteStudentsDto |
| [edutrack_be/src/modules/students/dto/create-student.dto.ts](../src/modules/students/dto/create-student.dto.ts) | 86 | StudentParentDto, CreateStudentDto |
| [edutrack_be/src/modules/students/dto/delete-student.dto.ts](../src/modules/students/dto/delete-student.dto.ts) | 13 | DeleteStudentDto, DeleteStudentMode |
| [edutrack_be/src/modules/students/dto/query-students.dto.ts](../src/modules/students/dto/query-students.dto.ts) | 53 | QueryStudentsDto, STUDENT_SORT_FIELDS, SORT_ORDERS, StudentSortField, SortOrder |
| [edutrack_be/src/modules/students/dto/update-student.dto.ts](../src/modules/students/dto/update-student.dto.ts) | 67 | UpdateStudentDto |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts) | 147 | StudentsController |
| [edutrack_be/src/modules/students/students.module.ts](../src/modules/students/students.module.ts) | 14 | StudentsModule |
| [edutrack_be/src/modules/students/students.service.ts](../src/modules/students/students.service.ts) | 1888 | StudentsService, StudentResponse, StudentImportError, StudentImportResult, StudentBulkDeleteError, StudentBulkDeleteResult, StudentImportFile |
| [edutrack_be/src/modules/users/bank-directory.service.spec.ts](../src/modules/users/bank-directory.service.spec.ts) | 202 |  |
| [edutrack_be/src/modules/users/bank-directory.service.ts](../src/modules/users/bank-directory.service.ts) | 370 | BankDirectoryService, normalizeBank, isAllowedBankLogoUrl, isRecord, stringValue, maskAccountNumber, quotedLogValue, safeEndpoint, PaymentBank, BankAccountLookup |
| [edutrack_be/src/modules/users/dto/change-password.dto.ts](../src/modules/users/dto/change-password.dto.ts) | 14 | ChangePasswordDto |
| [edutrack_be/src/modules/users/dto/lookup-bank-account.dto.ts](../src/modules/users/dto/lookup-bank-account.dto.ts) | 16 | LookupBankAccountDto |
| [edutrack_be/src/modules/users/dto/push-subscription.dto.spec.ts](../src/modules/users/dto/push-subscription.dto.spec.ts) | 65 |  |
| [edutrack_be/src/modules/users/dto/push-subscription.dto.ts](../src/modules/users/dto/push-subscription.dto.ts) | 81 | PushEndpointDto, PushSubscriptionKeysDto, PushSubscriptionDto, isSupportedPushEndpoint |
| [edutrack_be/src/modules/users/dto/update-profile.dto.ts](../src/modules/users/dto/update-profile.dto.ts) | 60 | UpdateProfileDto |
| [edutrack_be/src/modules/users/payment-qr.constants.ts](../src/modules/users/payment-qr.constants.ts) | 5 | PAYMENT_QR_INFO_NOT_FOUND_CODE, PAYMENT_QR_INFO_NOT_FOUND_MESSAGE |
| [edutrack_be/src/modules/users/schemas/user.schema.ts](../src/modules/users/schemas/user.schema.ts) | 134 | User, UserRole, UserDocument, UserSchema |
| [edutrack_be/src/modules/users/types/push-device.type.ts](../src/modules/users/types/push-device.type.ts) | 28 | PushDeviceType, PushDeviceInfo, StoredPushSubscription, PushDeviceSummary |
| [edutrack_be/src/modules/users/types/safe-user.type.ts](../src/modules/users/types/safe-user.type.ts) | 24 | SafeUser |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts) | 195 | UsersController |
| [edutrack_be/src/modules/users/users.module.ts](../src/modules/users/users.module.ts) | 19 | UsersModule |
| [edutrack_be/src/modules/users/users.push.spec.ts](../src/modules/users/users.push.spec.ts) | 87 | createService |
| [edutrack_be/src/modules/users/users.service.spec.ts](../src/modules/users/users.service.spec.ts) | 281 | createUser, createService |
| [edutrack_be/src/modules/users/users.service.ts](../src/modules/users/users.service.ts) | 614 | UsersService, isValidQrAccountIdentifier, createPaymentQrTrace, maskAccountNumber |
| [edutrack_be/src/modules/users/utils/push-device.spec.ts](../src/modules/users/utils/push-device.spec.ts) | 131 |  |
| [edutrack_be/src/modules/users/utils/push-device.ts](../src/modules/users/utils/push-device.ts) | 122 | describePushDevice, isoDate, summarizePushDevices, pushDeviceId |
| [edutrack_be/src/modules/users/utils/vietqr-parser.spec.ts](../src/modules/users/utils/vietqr-parser.spec.ts) | 66 | tlv |
| [edutrack_be/src/modules/users/utils/vietqr-parser.ts](../src/modules/users/utils/vietqr-parser.ts) | 137 | parseVietQrPaymentInfo, parseVietQrQuickLink, normalizeAccountName, parseTlv, findField, VietQrPaymentInfo |
| [edutrack_be/test/app.e2e-spec.ts](../test/app.e2e-spec.ts) | 30 |  |
| [edutrack_be/test/jest-e2e.json](../test/jest-e2e.json) | 10 |  |
| [edutrack_be/test/jest-push-integration.json](../test/jest-push-integration.json) | 23 |  |
| [edutrack_be/test/jest-schedule-integration.json](../test/jest-schedule-integration.json) | 25 |  |
| [edutrack_be/test/push-storage.integration-spec.ts](../test/push-storage.integration-spec.ts) | 295 |  |
| [edutrack_be/test/schedule-revoke.integration-spec.ts](../test/schedule-revoke.integration-spec.ts) | 382 |  |
| [edutrack_be/test/schedule-ui-smoke.cjs](../test/schedule-ui-smoke.cjs) | 129 | main |
| [edutrack_be/tsconfig.build.json](../tsconfig.build.json) | 5 |  |
| [edutrack_be/tsconfig.json](../tsconfig.json) | 26 |  |
| [edutrack_fe/.gitignore](../../edutrack_fe/.gitignore) | 44 |  |
| [edutrack_fe/app/(auth)/forgot-password/page.tsx](../../edutrack_fe/app/(auth)/forgot-password/page.tsx) | 38 | ForgotPasswordPage |
| [edutrack_fe/app/(auth)/login/page.tsx](../../edutrack_fe/app/(auth)/login/page.tsx) | 15 | LoginPage |
| [edutrack_fe/app/(auth)/register/page.tsx](../../edutrack_fe/app/(auth)/register/page.tsx) | 15 | RegisterPage |
| [edutrack_fe/app/(auth)/verify-otp/page.tsx](../../edutrack_fe/app/(auth)/verify-otp/page.tsx) | 26 | VerifyOtpPage |
| [edutrack_fe/app/(dashboard)/classes/[classId]/page.tsx](../../edutrack_fe/app/(dashboard)/classes/[classId]/page.tsx) | 10 | ClassDetailRoute |
| [edutrack_fe/app/(dashboard)/classes/page.tsx](../../edutrack_fe/app/(dashboard)/classes/page.tsx) | 6 | ClassesPage |
| [edutrack_fe/app/(dashboard)/dashboard/page.tsx](../../edutrack_fe/app/(dashboard)/dashboard/page.tsx) | 6 | DashboardPage |
| [edutrack_fe/app/(dashboard)/layout.tsx](../../edutrack_fe/app/(dashboard)/layout.tsx) | 19 | DashboardGroupLayout, metadata |
| [edutrack_fe/app/(dashboard)/notifications/page.tsx](../../edutrack_fe/app/(dashboard)/notifications/page.tsx) | 27 | NotificationsPage |
| [edutrack_fe/app/(dashboard)/profile/page.tsx](../../edutrack_fe/app/(dashboard)/profile/page.tsx) | 6 | ProfileRoute |
| [edutrack_fe/app/(dashboard)/schedule/page.tsx](../../edutrack_fe/app/(dashboard)/schedule/page.tsx) | 6 | SchedulePage |
| [edutrack_fe/app/(dashboard)/settings/invoice-template/layout.tsx](../../edutrack_fe/app/(dashboard)/settings/invoice-template/layout.tsx) | 11 | InvoiceTemplateLayout |
| [edutrack_fe/app/(dashboard)/settings/invoice-template/page.tsx](../../edutrack_fe/app/(dashboard)/settings/invoice-template/page.tsx) | 6 | InvoiceTemplatePage |
| [edutrack_fe/app/(dashboard)/students/page.tsx](../../edutrack_fe/app/(dashboard)/students/page.tsx) | 6 | StudentsPage |
| [edutrack_fe/app/(dashboard)/upload/page.tsx](../../edutrack_fe/app/(dashboard)/upload/page.tsx) | 11 | UploadPage, metadata |
| [edutrack_fe/app/(dashboard)/upload/upload-page-content.tsx](../../edutrack_fe/app/(dashboard)/upload/upload-page-content.tsx) | 121 | UploadPageContent |
| [edutrack_fe/app/(public)/about/page.tsx](../../edutrack_fe/app/(public)/about/page.tsx) | 34 | AboutPage, metadata |
| [edutrack_fe/app/(public)/layout.tsx](../../edutrack_fe/app/(public)/layout.tsx) | 45 | PublicLayout |
| [edutrack_fe/app/(public)/privacy/page.tsx](../../edutrack_fe/app/(public)/privacy/page.tsx) | 39 | PrivacyPage, metadata |
| [edutrack_fe/app/(public)/terms/page.tsx](../../edutrack_fe/app/(public)/terms/page.tsx) | 34 | TermsPage, metadata |
| [edutrack_fe/app/globals.css](../../edutrack_fe/app/globals.css) | 394 |  |
| [edutrack_fe/app/layout.tsx](../../edutrack_fe/app/layout.tsx) | 89 | RootLayout, metadata, viewport |
| [edutrack_fe/app/offline/page.tsx](../../edutrack_fe/app/offline/page.tsx) | 79 | OfflinePage |
| [edutrack_fe/app/page.tsx](../../edutrack_fe/app/page.tsx) | 6 | Home |
| [edutrack_fe/app/pwa.css](../../edutrack_fe/app/pwa.css) | 180 |  |
| [edutrack_fe/app/robots.ts](../../edutrack_fe/app/robots.ts) | 25 | robots |
| [edutrack_fe/app/sitemap.ts](../../edutrack_fe/app/sitemap.ts) | 38 | sitemap |
| [edutrack_fe/components/auth/auth-shell.module.css](../../edutrack_fe/components/auth/auth-shell.module.css) | 33 |  |
| [edutrack_fe/components/auth/auth-shell.tsx](../../edutrack_fe/components/auth/auth-shell.tsx) | 180 | AuthShell |
| [edutrack_fe/components/auth/forgot-password-form.tsx](../../edutrack_fe/components/auth/forgot-password-form.tsx) | 337 | ForgotPasswordForm |
| [edutrack_fe/components/auth/login-form.tsx](../../edutrack_fe/components/auth/login-form.tsx) | 209 | LoginForm |
| [edutrack_fe/components/auth/otp-code-input.tsx](../../edutrack_fe/components/auth/otp-code-input.tsx) | 146 | OtpCodeInput |
| [edutrack_fe/components/auth/register-form.tsx](../../edutrack_fe/components/auth/register-form.tsx) | 142 | RegisterForm |
| [edutrack_fe/components/auth/verify-otp-form.tsx](../../edutrack_fe/components/auth/verify-otp-form.tsx) | 251 | getRemainingSeconds, formatCountdown, VerifyOtpForm |
| [edutrack_fe/components/classes/attendance/attendance-action-bar.tsx](../../edutrack_fe/components/classes/attendance/attendance-action-bar.tsx) | 53 | AttendanceActionBar |
| [edutrack_fe/components/classes/attendance/attendance-legend.tsx](../../edutrack_fe/components/classes/attendance/attendance-legend.tsx) | 32 | AttendanceLegend |
| [edutrack_fe/components/classes/attendance/attendance-table.tsx](../../edutrack_fe/components/classes/attendance/attendance-table.tsx) | 229 | AttendanceTable |
| [edutrack_fe/components/classes/class-attendance-tab.module.css](../../edutrack_fe/components/classes/class-attendance-tab.module.css) | 215 |  |
| [edutrack_fe/components/classes/class-attendance-tab.tsx](../../edutrack_fe/components/classes/class-attendance-tab.tsx) | 377 | ClassAttendanceTab, getApiErrorMessage |
| [edutrack_fe/components/classes/class-schedule-parts.tsx](../../edutrack_fe/components/classes/class-schedule-parts.tsx) | 1498 | SummaryItem, CurrentFixedSchedule, WeekCalendar, DayHeader, PeriodHeader, CalendarCell, ScheduleEventCard, TemporarySchedulePanel, LessonAdjustmentControls, CalendarSkeleton, SelectField, DateField, TimeField, buildFixedFormFromSchedule, buildTemporaryFormFromSchedule, buildTemporaryFormFromEvent, validateFixedSchedule, buildTemporaryPayload, formatTemporarySchedule, getActionLabel, getTemporaryIcon, getEventStyle, getEventIcon, getEventLabel, formatTimeRange, getLessonContent, getCalendarCellKey, compareEventsByStartTime, getTimeOrderValue, getSessionPeriod, getSessionPeriodIcon, mapEventTypeToScheduleType, isStandaloneTemporaryAction, getTemporaryScheduleIdFromEvent, isTemporaryScheduleInWeek, buildWeekDays, formatDate, toDateInputValue, normalizeTimeInput, normalizeTimeOnBlur, getCurrentWeekStartKey, getWeekStartKey, addDaysToDateKey, isToday, parseVietnamDateKey, getVietnamDayOfWeek, toVietnamDateKey, addDays, getDayLabel, FixedScheduleForm, TemporaryScheduleForm, LessonContentForm, ScheduleConfirmAction, SelectOption, SessionPeriodValue, SchedulePeriod, emptySlot, initialFixedForm, initialTemporaryForm, initialLessonForm, dayOptions, actionOptions, calendarPeriods, unknownPeriod |
| [edutrack_fe/components/classes/class-schedule-tab.module.css](../../edutrack_fe/components/classes/class-schedule-tab.module.css) | 1248 |  |
| [edutrack_fe/components/classes/class-schedule-tab.tsx](../../edutrack_fe/components/classes/class-schedule-tab.tsx) | 1521 | ClassScheduleTab |
| [edutrack_fe/components/classes/class-tuition-tab.tsx](../../edutrack_fe/components/classes/class-tuition-tab.tsx) | 1135 | downloadBlobFile, ClassTuitionTab, ReceiptPreviewDialog, PriceSettingsPanel, PriceDateField |
| [edutrack_fe/components/classes/classroom-detail-page.tsx](../../edutrack_fe/components/classes/classroom-detail-page.tsx) | 529 | ClassroomDetailPage, buildClassFormFromClass, buildClassColorUsages |
| [edutrack_fe/components/classes/classroom-detail-tabs.tsx](../../edutrack_fe/components/classes/classroom-detail-tabs.tsx) | 765 | ClassroomDetailTabs, StudentActionMenu, StudentsTab, StudentIdentity, FutureTab |
| [edutrack_fe/components/classes/classroom-manager.module.css](../../edutrack_fe/components/classes/classroom-manager.module.css) | 1507 |  |
| [edutrack_fe/components/classes/classroom-types.ts](../../edutrack_fe/components/classes/classroom-types.ts) | 125 | buildStudentPayload, buildStudentFormFromStudent, toDateInputValue, Notice, ClassFormState, StudentFormState, initialClassForm, initialStudentForm |
| [edutrack_fe/components/classes/classroom-ui.tsx](../../edutrack_fe/components/classes/classroom-ui.tsx) | 400 | Modal, ConfirmDialog, NoticeBanner, getNoticeToastConfig, InlineLoading, EmptyState, TextInput, TextArea, PrimaryAction, SecondaryAction, StudentAvatar |
| [edutrack_fe/components/classes/classroom-utils.ts](../../edutrack_fe/components/classes/classroom-utils.ts) | 544 | formatMoney, formatCurrencyInput, parseCurrencyInput, getVietnamTodayInputDate, toVietnamDateInputValue, getCurrencyDigits, formatCurrencyDigits, getErrorMessage, normalizeClassColorHex, getClassColorHex, getClassColorLabel, getSuggestedClassColors, buildAdaptiveClassColorCandidates, getClassColorIndexForHue, getGeneratedColorLabel, getClassColorTheme, mixHexColor, hexToRgb, getPerceptualColorDistance, rgbToOklab, rgbToHsl, hslToHex, normalizeHue, getCircularHueDistance, rgbToHex, getGenderLabel, getStudentAvatar, getDefaultAvatarByGender, normalizeVisibleText, DEFAULT_BOY_AVATAR_URL, DEFAULT_GIRL_AVATAR_URL, DEFAULT_CLASS_IMAGE_URL, CLASS_COLOR_OPTIONS, ClassColorSuggestion, CLASS_COLOR_SUGGESTION_OPTIONS, DEFAULT_CLASS_COLOR_HEX |
| [edutrack_fe/components/classes/classrooms-page.tsx](../../edutrack_fe/components/classes/classrooms-page.tsx) | 512 | ClassroomsPage, buildClassColorUsages, ClassroomToolbar, ClassroomGrid, ClassroomGridItem, ClassroomGridSkeleton, getStatusLabel, getStatusClassName, getLatestScheduleText, formatScheduleSlot, getDayLabel |
| [edutrack_fe/components/classes/create-class-modal.tsx](../../edutrack_fe/components/classes/create-class-modal.tsx) | 639 | CurrencyInput, CreateClassModal, EditClassModal, ClassFormModal, ClassImagePicker, ClassColorPicker, ClassStatusPicker, ClassColorUsage |
| [edutrack_fe/components/classes/exam/class-exam-tab.tsx](../../edutrack_fe/components/classes/exam/class-exam-tab.tsx) | 534 | ClassExamTab, getApiErrorMessage, sortExamsByDate |
| [edutrack_fe/components/classes/exam/exam-create-modal.tsx](../../edutrack_fe/components/classes/exam/exam-create-modal.tsx) | 199 | ExamCreateModal |
| [edutrack_fe/components/classes/exam/exam-desktop-table.tsx](../../edutrack_fe/components/classes/exam/exam-desktop-table.tsx) | 147 | ExamDesktopTable |
| [edutrack_fe/components/classes/exam/exam-evidence-modal.tsx](../../edutrack_fe/components/classes/exam/exam-evidence-modal.tsx) | 168 | ExamEvidenceModal |
| [edutrack_fe/components/classes/exam/exam-mobile-list.tsx](../../edutrack_fe/components/classes/exam/exam-mobile-list.tsx) | 186 | ExamMobileList |
| [edutrack_fe/components/classes/exam/exam-sheet.module.css](../../edutrack_fe/components/classes/exam/exam-sheet.module.css) | 310 |  |
| [edutrack_fe/components/classes/receipt-template-picker.tsx](../../edutrack_fe/components/classes/receipt-template-picker.tsx) | 122 | ReceiptTemplatePicker |
| [edutrack_fe/components/classes/student-detail-modal.tsx](../../edutrack_fe/components/classes/student-detail-modal.tsx) | 541 | StudentDetailModal, StudentReceiptContent, DetailTabButton, MiniMetric, PaymentStatusPill, getPaymentLabel, getStudentReceiptFilterOptions, filterStudentReceipts, getReceiptClassSnapshots, SectionTitle, formatDate |
| [edutrack_fe/components/classes/student-form-fields.tsx](../../edutrack_fe/components/classes/student-form-fields.tsx) | 355 | StudentFormFields, StudentFormSelect |
| [edutrack_fe/components/classes/student-picker-modal.tsx](../../edutrack_fe/components/classes/student-picker-modal.tsx) | 445 | StudentPickerModal, StudentOption |
| [edutrack_fe/components/classes/student-profile-panel.tsx](../../edutrack_fe/components/classes/student-profile-panel.tsx) | 242 | StudentIdentityPanel, StudentProfileContent, StudentStatus, ProfileSection, DetailItem, formatProfileDate |
| [edutrack_fe/components/classes/tuition/billing-student-list.tsx](../../edutrack_fe/components/classes/tuition/billing-student-list.tsx) | 160 | BillingStudentList |
| [edutrack_fe/components/classes/tuition/receipt-dialogs.tsx](../../edutrack_fe/components/classes/tuition/receipt-dialogs.tsx) | 1115 | IssueReceiptModal, getReceiptPreviewLoadingHtml, getReceiptPreviewErrorHtml, PaymentModal, SelectField, CurrencyField, SummaryLine, StatusPill, getTuitionEntriesPeriod, getTuitionEntryLessonText, uniqueNonEmpty, toDateInputValue, buildPriceForm, formatDateInput, handleProofFile, formatDate, BillingFilterState, IssueFormState, PaymentFormState, PriceFormState, SelectOption, IssueMode, initialFilters, initialIssueForm, BULK_RECEIPT_DOWNLOAD_ID |
| [edutrack_fe/components/classes/tuition/receipt-history.tsx](../../edutrack_fe/components/classes/tuition/receipt-history.tsx) | 609 | ReceiptHistory, ReceiptActions, SelectField, StatusPill, IconButton, getReceiptPeriodOptions, getReceiptPeriodSummary, getReceiptPeriodKey, toDateInputValue, formatDate, getPaymentLabel, getPaymentTone |
| [edutrack_fe/components/classes/tuition/tuition-metric.tsx](../../edutrack_fe/components/classes/tuition/tuition-metric.tsx) | 66 | TuitionMetric |
| [edutrack_fe/components/classes/use-deferred-class-image-upload.ts](../../edutrack_fe/components/classes/use-deferred-class-image-upload.ts) | 95 | useDeferredClassImageUpload |
| [edutrack_fe/components/classes/use-deferred-student-avatar-upload.ts](../../edutrack_fe/components/classes/use-deferred-student-avatar-upload.ts) | 79 | useDeferredStudentAvatarUpload |
| [edutrack_fe/components/dashboard/dashboard-overview.tsx](../../edutrack_fe/components/dashboard/dashboard-overview.tsx) | 937 | DashboardOverview, StatsGrid, TodayLessonsPanel, TodayLessonItem, RevenuePanel, RevenueMetric, PendingPaymentsPanel, PendingPaymentItem, PanelHeader, StatusBadge, EmptyState, ErrorPanel, DashboardSkeleton, getLessonStatusTone, getPaymentLabel, getPaymentTone, formatDate, formatCurrentMonthLabel, getInitial |
| [edutrack_fe/components/dashboard/dashboard-welcome-panel.tsx](../../edutrack_fe/components/dashboard/dashboard-welcome-panel.tsx) | 159 | WelcomePanel |
| [edutrack_fe/components/dashboard/feature-placeholder.tsx](../../edutrack_fe/components/dashboard/feature-placeholder.tsx) | 50 | FeaturePlaceholder |
| [edutrack_fe/components/dashboard/yearly-revenue-chart.tsx](../../edutrack_fe/components/dashboard/yearly-revenue-chart.tsx) | 297 | YearlyRevenueChart, getChartAxisMax, formatAxisMoney, formatCompactMoney, trimDecimal |
| [edutrack_fe/components/invoice-designer/component-sidebar.tsx](../../edutrack_fe/components/invoice-designer/component-sidebar.tsx) | 91 | ComponentSidebar |
| [edutrack_fe/components/invoice-designer/configs/blocks.config.ts](../../edutrack_fe/components/invoice-designer/configs/blocks.config.ts) | 106 | registerBlocks, BASIC_BLOCKS |
| [edutrack_fe/components/invoice-designer/configs/grapesjs.config.ts](../../edutrack_fe/components/invoice-designer/configs/grapesjs.config.ts) | 259 | getInvoicePage, documentScroll, stableResizeOptions, configureInvoiceEditor, invoiceEditorConfig, A4_WIDTH, A4_HEIGHT, PAGE_CSS |
| [edutrack_fe/components/invoice-designer/configs/project-safety.ts](../../edutrack_fe/components/invoice-designer/configs/project-safety.ts) | 304 | safeImageUrl, record, safeStyle, safeCss, declarationStyle, safeAttributes, safeHtml, safeComponent, safeSelectors, safeStyles, safeProject |
| [edutrack_fe/components/invoice-designer/configs/regions.config.ts](../../edutrack_fe/components/invoice-designer/configs/regions.config.ts) | 91 | registerRegions, lockRegionContents, REGION_EDITOR_CSS |
| [edutrack_fe/components/invoice-designer/designer-dialogs.tsx](../../edutrack_fe/components/invoice-designer/designer-dialogs.tsx) | 171 | DialogFocus, SaveTemplateDialog |
| [edutrack_fe/components/invoice-designer/designer-toolbar.tsx](../../edutrack_fe/components/invoice-designer/designer-toolbar.tsx) | 258 | ToolButton, DesignerToolbar |
| [edutrack_fe/components/invoice-designer/image-library-dialog.tsx](../../edutrack_fe/components/invoice-designer/image-library-dialog.tsx) | 284 | ImageLibraryDialog |
| [edutrack_fe/components/invoice-designer/invoice-canvas.tsx](../../edutrack_fe/components/invoice-designer/invoice-canvas.tsx) | 179 | InvoiceCanvas |
| [edutrack_fe/components/invoice-designer/invoice-designer-loader.tsx](../../edutrack_fe/components/invoice-designer/invoice-designer-loader.tsx) | 20 | InvoiceDesignerLoader |
| [edutrack_fe/components/invoice-designer/invoice-designer.module.css](../../edutrack_fe/components/invoice-designer/invoice-designer.module.css) | 771 |  |
| [edutrack_fe/components/invoice-designer/invoice-designer.tsx](../../edutrack_fe/components/invoice-designer/invoice-designer.tsx) | 242 | InvoiceDesigner |
| [edutrack_fe/components/invoice-designer/property-panel.tsx](../../edutrack_fe/components/invoice-designer/property-panel.tsx) | 364 | PropertyPanel |
| [edutrack_fe/components/invoice-designer/template-preview-dialog.tsx](../../edutrack_fe/components/invoice-designer/template-preview-dialog.tsx) | 54 | TemplatePreviewDialog |
| [edutrack_fe/components/invoice-designer/use-invoice-designer.ts](../../edutrack_fe/components/invoice-designer/use-invoice-designer.ts) | 346 | errorMessage, sortTemplates, useInvoiceDesigner |
| [edutrack_fe/components/layout/dashboard-shell.tsx](../../edutrack_fe/components/layout/dashboard-shell.tsx) | 813 | useDashboardUser, useDashboardSession, DashboardShell, MobileBottomNavigation, isUnauthorized, Sidebar, SidebarGroup, useScrollDirection, Header, formatHeaderDate |
| [edutrack_fe/components/media/media-history.tsx](../../edutrack_fe/components/media/media-history.tsx) | 118 | MediaHistory |
| [edutrack_fe/components/media/media-trim-slider.tsx](../../edutrack_fe/components/media/media-trim-slider.tsx) | 110 | formatDuration, MediaTrimSlider |
| [edutrack_fe/components/media/media-upload-board.tsx](../../edutrack_fe/components/media/media-upload-board.tsx) | 525 | formatFileSize, writeString, encodeWav, MediaUploadBoard |
| [edutrack_fe/components/notifications/push-device-list.tsx](../../edutrack_fe/components/notifications/push-device-list.tsx) | 72 | updatedAt, PushDeviceList |
| [edutrack_fe/components/notifications/push-notification-panel.tsx](../../edutrack_fe/components/notifications/push-notification-panel.tsx) | 114 | PushNotificationPanel |
| [edutrack_fe/components/profile/profile-bank-select.tsx](../../edutrack_fe/components/profile/profile-bank-select.tsx) | 69 | ProfileBankSelect |
| [edutrack_fe/components/profile/profile-page.tsx](../../edutrack_fe/components/profile/profile-page.tsx) | 851 | ProfilePage, ImagePreviewDialog, isPaymentQrInfoNotFoundError, getPaymentQrWarningDescription, normalizeBankAccountNumber |
| [edutrack_fe/components/profile/profile-qr-crop.tsx](../../edutrack_fe/components/profile/profile-qr-crop.tsx) | 324 | QrCropBox, CropHandle, QrCropToolbar, getEdgeHandleClassName, getCornerHandleClassName, getCropHandleLabel, normalizeQrCrop, resizeQrCrop, clampNumber, QrCropState |
| [edutrack_fe/components/profile/profile-sections.tsx](../../edutrack_fe/components/profile/profile-sections.tsx) | 808 | TeacherProfileCard, ProfileEditFields, ProfileReadonlyFields, ReadonlyItem, PaymentQrPanel, PasswordPanel, PasswordInput, SystemSettingsPanel, INITIAL_QR_CROP, PasswordFormState |
| [edutrack_fe/components/profile/profile-utils.ts](../../edutrack_fe/components/profile/profile-utils.ts) | 250 | buildProfileForm, buildProfilePayload, getConfirmConfig, createCroppedQrFile, decodeQrContent, loadImageFromFile, getCanvasOutputType, formatFileSize, ProfileFormState, ConfirmAction, ConfirmDialogConfig |
| [edutrack_fe/components/public/information-page.tsx](../../edutrack_fe/components/public/information-page.tsx) | 25 | InformationPage |
| [edutrack_fe/components/pwa/install-prompt.tsx](../../edutrack_fe/components/pwa/install-prompt.tsx) | 181 | PWAInstallPrompt |
| [edutrack_fe/components/pwa/service-worker-registration.tsx](../../edutrack_fe/components/pwa/service-worker-registration.tsx) | 28 | ServiceWorkerRegistration |
| [edutrack_fe/components/schedule/ai-schedule-chat.module.css](../../edutrack_fe/components/schedule/ai-schedule-chat.module.css) | 611 |  |
| [edutrack_fe/components/schedule/ai-schedule-chat.tsx](../../edutrack_fe/components/schedule/ai-schedule-chat.tsx) | 647 | AiScheduleChatButton, AiScheduleChat |
| [edutrack_fe/components/schedule/schedule-availability-picker.tsx](../../edutrack_fe/components/schedule/schedule-availability-picker.tsx) | 197 | maskTime, ScheduleAvailabilityPicker |
| [edutrack_fe/components/schedule/schedule-conflict-feedback.tsx](../../edutrack_fe/components/schedule/schedule-conflict-feedback.tsx) | 94 | useScheduleCheck, ScheduleConflictFeedback |
| [edutrack_fe/components/schedule/schedule-planning.module.css](../../edutrack_fe/components/schedule/schedule-planning.module.css) | 177 |  |
| [edutrack_fe/components/schedule/schedule-source-picker.tsx](../../edutrack_fe/components/schedule/schedule-source-picker.tsx) | 88 | ScheduleSourcePicker |
| [edutrack_fe/components/schedule/teacher-schedule-calendar.module.css](../../edutrack_fe/components/schedule/teacher-schedule-calendar.module.css) | 1190 |  |
| [edutrack_fe/components/schedule/teacher-schedule-calendar.tsx](../../edutrack_fe/components/schedule/teacher-schedule-calendar.tsx) | 394 | TeacherScheduleCalendar |
| [edutrack_fe/components/schedule/teacher-schedule-parts.tsx](../../edutrack_fe/components/schedule/teacher-schedule-parts.tsx) | 1134 | SummaryItem, ClassLegend, WeekCalendar, DayHeader, PeriodHeader, CalendarCell, ScheduleEventCard, ScheduleEventModal, InfoBlock, DateField, TimeField, CalendarSkeleton, EmptyScheduleState, getEventStyle, getEventIcon, getEventLabel, formatTimeRange, getLessonContent, buildTemporaryFormFromEvent, buildTemporaryPayload, getTemporaryScheduleIdFromEvent, getCalendarCellKey, compareEventsByStartTime, getTimeOrderValue, getSessionPeriod, getSessionPeriodIcon, getSkeletonDays, getDayLabel, formatDate, getCurrentWeekStartKey, getWeekStartKey, addDaysToDateKey, isToday, parseVietnamDateKey, getVietnamDayOfWeek, toVietnamDateKey, addDays, normalizeTimeInput, normalizeTimeOnBlur, getErrorMessage, SessionPeriodValue, SchedulePeriod, calendarPeriods, unknownPeriod, TemporaryScheduleForm, initialTemporaryForm |
| [edutrack_fe/components/students/student-directory-parts.tsx](../../edutrack_fe/components/students/student-directory-parts.tsx) | 472 | BulkStudentActionMenu, FilterSelect, ImportStudentsModal, ImportMetric, StudentDirectoryIdentity, buildStudentUpdatePayload, DeleteStudentModal |
| [edutrack_fe/components/students/student-directory.tsx](../../edutrack_fe/components/students/student-directory.tsx) | 1182 | StudentDirectory, CompactMobileSelect |
| [edutrack_fe/components/ui/form-field.tsx](../../edutrack_fe/components/ui/form-field.tsx) | 81 | FormField |
| [edutrack_fe/components/ui/notice-provider.tsx](../../edutrack_fe/components/ui/notice-provider.tsx) | 158 | NoticeProvider, useNotice |
| [edutrack_fe/components/ui/primary-button.tsx](../../edutrack_fe/components/ui/primary-button.tsx) | 43 | PrimaryButton |
| [edutrack_fe/components/ui/select-picker.tsx](../../edutrack_fe/components/ui/select-picker.tsx) | 386 | SelectPicker, normalizeSearchText, getTriggerToneClass, getOptionToneClass, SelectPickerOption |
| [edutrack_fe/eslint.config.mjs](../../edutrack_fe/eslint.config.mjs) | 19 |  |
| [edutrack_fe/hooks/use-push.ts](../../edutrack_fe/hooks/use-push.ts) | 229 | usePushNotifications |
| [edutrack_fe/lib/api/auth.ts](../../edutrack_fe/lib/api/auth.ts) | 90 | authApi |
| [edutrack_fe/lib/api/client.ts](../../edutrack_fe/lib/api/client.ts) | 331 | ApiError, apiRequest, apiBlobRequest, executeRequest, refreshSession, coordinateRefresh, refreshOrReuseStoredSession, getStoredReplacementSession, getRefreshedAccessToken, performRefreshSession, refreshAuthSession, createSessionExpiredError, createSessionChangedError, readResponsePayload, throwApiError, getFileNameFromContentDisposition, ApiBlobResponse |
| [edutrack_fe/lib/api/invoice-images.ts](../../edutrack_fe/lib/api/invoice-images.ts) | 29 | invoiceImagesApi |
| [edutrack_fe/lib/api/invoice-template.ts](../../edutrack_fe/lib/api/invoice-template.ts) | 63 | invoiceTemplateApi |
| [edutrack_fe/lib/api/profile.ts](../../edutrack_fe/lib/api/profile.ts) | 218 | getToken, pushRequest, refreshForBinaryRequest, readBinaryError, fetchPaymentQrBlob, profileApi |
| [edutrack_fe/lib/api/school.ts](../../edutrack_fe/lib/api/school.ts) | 742 | getToken, buildQuery, schoolApi |
| [edutrack_fe/lib/api/url.ts](../../edutrack_fe/lib/api/url.ts) | 15 | getApiBaseUrl, getApiRequestUrl |
| [edutrack_fe/lib/auth/access-token.ts](../../edutrack_fe/lib/auth/access-token.ts) | 55 | getAccessTokenPayload, getAccessTokenExpiresAt, getAccessTokenSubject, isAccessTokenExpired, shouldRefreshAccessToken |
| [edutrack_fe/lib/auth/token-storage.ts](../../edutrack_fe/lib/auth/token-storage.ts) | 181 | removeSession, AUTH_ACCESS_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY, AUTH_SESSION_EXPIRED_EVENT, AUTH_SESSION_CHANGED_EVENT, PendingOtpState, tokenStorage |
| [edutrack_fe/lib/files/open-pdf-in-new-tab.ts](../../edutrack_fe/lib/files/open-pdf-in-new-tab.ts) | 33 | openPdfInNewTab |
| [edutrack_fe/lib/push/browser.ts](../../edutrack_fe/lib/push/browser.ts) | 56 | getPushDeviceType, supportsPush, pushSupportMessage, decodePublicKey, subscriptionMatchesKey, readyPushRegistration |
| [edutrack_fe/next.config.ts](../../edutrack_fe/next.config.ts) | 45 | normalizeApiUrl |
| [edutrack_fe/package.json](../../edutrack_fe/package.json) | 39 |  |
| [edutrack_fe/playwright.config.ts](../../edutrack_fe/playwright.config.ts) | 18 |  |
| [edutrack_fe/postcss.config.mjs](../../edutrack_fe/postcss.config.mjs) | 8 |  |
| [edutrack_fe/public/auth-visual.svg](../../edutrack_fe/public/auth-visual.svg) | 41 |  |
| [edutrack_fe/public/file.svg](../../edutrack_fe/public/file.svg) | 1 |  |
| [edutrack_fe/public/globe.svg](../../edutrack_fe/public/globe.svg) | 1 |  |
| [edutrack_fe/public/googlefc2a9f584421c3f0.html](../../edutrack_fe/public/googlefc2a9f584421c3f0.html) | 1 |  |
| [edutrack_fe/public/invoice-class.svg](../../edutrack_fe/public/invoice-class.svg) | 2 |  |
| [edutrack_fe/public/invoice-student.svg](../../edutrack_fe/public/invoice-student.svg) | 2 |  |
| [edutrack_fe/public/manifest.json](../../edutrack_fe/public/manifest.json) | 92 |  |
| [edutrack_fe/public/next.svg](../../edutrack_fe/public/next.svg) | 1 |  |
| [edutrack_fe/public/sw.js](../../edutrack_fe/public/sw.js) | 191 | notificationUrl |
| [edutrack_fe/public/vercel.svg](../../edutrack_fe/public/vercel.svg) | 1 |  |
| [edutrack_fe/public/window.svg](../../edutrack_fe/public/window.svg) | 1 |  |
| [edutrack_fe/tests/access-token.test.mjs](../../edutrack_fe/tests/access-token.test.mjs) | 100 | createToken |
| [edutrack_fe/tests/attendance-reset.spec.ts](../../edutrack_fe/tests/attendance-reset.spec.ts) | 254 | setup |
| [edutrack_fe/tests/class-color-suggestions.test.mjs](../../edutrack_fe/tests/class-color-suggestions.test.mjs) | 74 | getHslLightness |
| [edutrack_fe/tests/invoice-designer.spec.ts](../../edutrack_fe/tests/invoice-designer.spec.ts) | 1083 | renderReceiptReference, mockApi, saveTemplate, openDesigner |
| [edutrack_fe/tests/push-notifications.spec.ts](../../edutrack_fe/tests/push-notifications.spec.ts) | 221 | setup |
| [edutrack_fe/tests/push-worker.test.mjs](../../edutrack_fe/tests/push-worker.test.mjs) | 111 | harness |
| [edutrack_fe/tests/receipt-template-selection.spec.ts](../../edutrack_fe/tests/receipt-template-selection.spec.ts) | 260 | setup, chooseTemplate |
| [edutrack_fe/tests/session-persistence.spec.ts](../../edutrack_fe/tests/session-persistence.spec.ts) | 329 | seedSession, fulfillDashboard |
| [edutrack_fe/tests/session-routing.test.mjs](../../edutrack_fe/tests/session-routing.test.mjs) | 60 |  |
| [edutrack_fe/tsconfig.json](../../edutrack_fe/tsconfig.json) | 35 |  |
| [edutrack_fe/types/auth.ts](../../edutrack_fe/types/auth.ts) | 70 | RegisterPayload, LoginPayload, VerifyOtpPayload, ForgotPasswordPayload, ResetPasswordPayload, ResendOtpPayload, ResendPasswordResetOtpPayload, AuthResponse, RegisterResponse, ResendOtpResponse, ForgotPasswordResponse, ResetPasswordResponse, LogoutResponse |
| [edutrack_fe/types/invoice-template.ts](../../edutrack_fe/types/invoice-template.ts) | 45 | InvoiceTemplate, SaveInvoiceTemplate, TemplateSaveMode, InvoiceRegion, InvoiceRegionRegistry, InvoiceImage, InvoiceImagePage |
| [edutrack_fe/types/school.ts](../../edutrack_fe/types/school.ts) | 810 | Gender, StudentStatus, ClassStatus, EnrollmentStatus, ClassScheduleSlot, ScheduleOverrideAction, SuspendFixedSchedulePayload, ResumeFixedSchedulePayload, UpdateEnrollmentStatusPayload, LatestFixedSchedule, ClassScheduleOverview, ClassTemporarySchedule, StudentParent, Student, CreateStudentPayload, UpdateStudentPayload, DeleteStudentMode, StudentBulkDeleteResult, StudentSortField, StudentSortOrder, StudentListFilters, StudentImportResult, Classroom, ClassroomDetail, CreateClassPayload, UpdateClassPayload, SaveFixedSchedulePayload, CreateTemporarySchedulePayload, UpdateTemporarySchedulePayload, ClassSessionScheduleType, SaveClassSessionContentPayload, ClassSessionContent, TeacherScheduleEventType, TeacherScheduleClass, TeacherScheduleDay, TeacherScheduleEvent, TeacherWeekSchedule, DashboardTodayLesson, DashboardRevenueStats, DashboardMonthlyRevenue, DashboardPendingPayment, DashboardOverviewData, ScheduleConflict, ScheduleConflictResult, ScheduleAvailabilityPayload, ScheduleTimeSlot, ScheduleAvailability, EnrollmentResponse, EnrollmentBulkResponse, RemoveStudentsBulkResponse, AttendanceStatus, AttendanceRecord, AttendanceResponse, TakeAttendanceRecordPayload, TakeAttendancePayload, TakeAttendanceBatchPayload, FlatAttendanceRecord, AttendanceSheetResponse, Exam, ExamScore, ExamSheetResponse, CreateExamPayload, UpdateExamPayload, TakeExamScoreEntry, TakeExamScoresBatchPayload, PaymentStatus, ReceiptPdfStatus, ReceiptScope, ReceiptTeacherSnapshot, ReceiptClassSnapshot, ReceiptStudentSnapshot, ReceiptSessionSnapshot, ReceiptExamSnapshot, ReceiptDetail, ReceiptListItem, BillingOverviewStudent, BillingOverview, StudentBillingOverviewClass, StudentBillingOverview, BillingClassSummary, BillingCandidates, IssueReceiptPayload, ReceiptPreviewResponse, FileDownloadResponse, ReceiptDownloadResponse, ReceiptBulkDownloadPayload, UpdateReceiptPaymentPayload, AiChatMessage, AiScheduleSessionResponse, AiChatResponse, AiSessionListItem, AiSessionDetail |
| [edutrack_fe/types/user.ts](../../edutrack_fe/types/user.ts) | 77 | UserRole, PushDeviceType, PushDevice, PushStatus, PaymentBank, User, UpdateProfilePayload, PaymentQrUploadResponse, ChangePasswordPayload |

## API backend

Tất cả đường dẫn controller được thêm prefix /api tại src/main.ts. HTTP/path ghép từ string decorators trong source; handler signature và guard được giữ để tra cứu quyền/DTO.

| File:dòng | HTTP | Đường dẫn đầy đủ | Handler + tham số | Guard |
| --- | --- | --- | --- | --- |
| [edutrack_be/src/app.controller.ts](../src/app.controller.ts):8 | GET | /api | getHealth() |  |
| [edutrack_be/src/modules/ai/ai.controller.ts](../src/modules/ai/ai.controller.ts):13 | POST | /api/ai/schedule-suggest | createSession(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/ai/ai.controller.ts](../src/modules/ai/ai.controller.ts):18 | POST | /api/ai/schedule-suggest/chat | chat(@CurrentUser() user: JwtUser, @Body() dto: AiChatDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/ai/ai.controller.ts](../src/modules/ai/ai.controller.ts):23 | GET | /api/ai/schedule-suggest/sessions | listSessions(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/ai/ai.controller.ts](../src/modules/ai/ai.controller.ts):28 | GET | /api/ai/schedule-suggest/sessions/:sessionId | getSession(@CurrentUser() user: JwtUser, @Param('sessionId') sessionId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):32 | POST | /api/auth/register | register(@Body() registerDto: RegisterDto) |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):37 | POST | /api/auth/verify-otp | verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):48 | POST | /api/auth/resend-otp | resendOtp(@Body() resendOtpDto: ResendOtpDto) |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):53 | POST | /api/auth/forgot-password | forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):58 | POST | /api/auth/reset-password | resetPassword(@Body() resetPasswordDto: ResetPasswordDto) |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):63 | POST | /api/auth/resend-password-reset-otp | resendPasswordResetOtp(@Body() resendPasswordResetOtpDto: ResendPasswordResetOtpDto) |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):70 | POST | /api/auth/login | login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):81 | POST | /api/auth/refresh | refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):93 | POST | /api/auth/logout | logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) |  |
| [edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts):109 | GET | /api/auth/me | me(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):52 | GET | /api/classes | findAll(@CurrentUser() user: JwtUser, @Query() query: QueryClassesDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):57 | POST | /api/classes | create(@CurrentUser() user: JwtUser, @Body() dto: CreateClassDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):62 | POST | /api/classes/image | uploadClassImage(@UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):82 | GET | /api/classes/:classId | findDetail(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):87 | PATCH | /api/classes/:classId | updateClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: UpdateClassDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):96 | DELETE | /api/classes/:classId | archiveClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):104 | GET | /api/classes/:classId/schedules | getSchedules(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):112 | POST | /api/classes/:classId/schedules/fixed | saveFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: CreateFixedScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):121 | POST | /api/classes/:classId/schedules/fixed/suspend-preview | previewSuspendFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: SuspendFixedScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):134 | POST | /api/classes/:classId/schedules/fixed/suspend | suspendFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: SuspendFixedScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):143 | POST | /api/classes/:classId/schedules/fixed/resume | resumeFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: ResumeFixedScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):152 | POST | /api/classes/:classId/schedules/temporary | createTemporarySchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: CreateTemporaryScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):165 | PATCH | /api/classes/:classId/schedules/temporary/:scheduleId | updateTemporarySchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('scheduleId') scheduleId: string, @Body() dto: UpdateTemporaryScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):180 | DELETE | /api/classes/:classId/schedules/temporary/:scheduleId | revokeTemporarySchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('scheduleId') scheduleId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):193 | POST | /api/classes/:classId/schedules/session-content | saveSessionContent(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: SaveClassSessionContentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):202 | POST | /api/classes/:classId/students | enrollExistingStudent(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: EnrollExistingStudentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):215 | POST | /api/classes/:classId/students/bulk | enrollExistingStudents(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: EnrollExistingStudentsDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):228 | POST | /api/classes/:classId/students/new | createStudentAndEnroll(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: CreateStudentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):241 | POST | /api/classes/:classId/students/bulk-remove | removeStudentsFromClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: RemoveExistingStudentsDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):254 | PATCH | /api/classes/:classId/students/:studentId/status | updateStudentEnrollmentStatus(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Body() dto: UpdateEnrollmentStatusDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):269 | DELETE | /api/classes/:classId/students/:studentId/hard | hardDeleteStudentFromClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):282 | DELETE | /api/classes/:classId/students/:studentId | removeStudentFromClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):295 | GET | /api/classes/:classId/attendance | getAttendance(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Query('date') date: string, @Query('startTime') startTime: string, @Query('endTime') endTime: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):312 | GET | /api/classes/:id/attendance-sheet | getAttendanceSheet(@CurrentUser() user: JwtUser, @Param('id') classId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):320 | POST | /api/classes/:id/attendance-batch | takeAttendanceBatch(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Body() dto: TakeAttendanceBatchDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):329 | GET | /api/classes/:classId/attendance-overview | getAttendanceOverview(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):337 | POST | /api/classes/:classId/attendance | takeAttendance(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: TakeAttendanceDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):348 | GET | /api/classes/:id/exam-sheet | getExamSheet(@CurrentUser() user: JwtUser, @Param('id') classId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):353 | POST | /api/classes/:id/exams | createExam(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Body() dto: CreateExamDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):362 | PATCH | /api/classes/:id/exams/:examId | updateExam(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Param('examId') examId: string, @Body() dto: UpdateExamDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):372 | DELETE | /api/classes/:id/exams/:examId | deleteExam(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Param('examId') examId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):381 | POST | /api/classes/:id/exams/file | uploadExamFile(@UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):396 | POST | /api/classes/:id/exam-scores | takeExamScoresBatch(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Body() dto: TakeExamScoresBatchDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts):405 | POST | /api/classes/:id/exam-scores/evidence | uploadExamEvidenceImage(@UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/dashboard/dashboard.controller.ts](../src/modules/dashboard/dashboard.controller.ts):12 | GET | /api/dashboard/overview | getOverview(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-images.controller.ts](../src/modules/invoice-template/invoice-images.controller.ts):28 | GET | /api/invoice-images | list(@CurrentUser() user: JwtUser, @Query() query: QueryInvoiceImagesDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-images.controller.ts](../src/modules/invoice-template/invoice-images.controller.ts):33 | POST | /api/invoice-images | upload(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-images.controller.ts](../src/modules/invoice-template/invoice-images.controller.ts):43 | DELETE | /api/invoice-images/:imageId | archive(@CurrentUser() user: JwtUser, @Param('imageId') imageId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):39 | GET | /api/invoice-templates/default | getDefaultTemplate(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):44 | GET | /api/invoice-templates/regions | regions() | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):55 | POST | /api/invoice-templates/preview | preview(@Body() dto: PreviewInvoiceTemplateDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):69 | GET | /api/invoice-templates | findAll(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):74 | POST | /api/invoice-templates | create(@CurrentUser() user: JwtUser, @Body() dto: CreateInvoiceTemplateDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):79 | POST | /api/invoice-templates/reset-default | resetDefaultTemplate(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):84 | GET | /api/invoice-templates/:id | findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):89 | PATCH | /api/invoice-templates/:id | update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateInvoiceTemplateDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):98 | DELETE | /api/invoice-templates/:id | remove(@CurrentUser() user: JwtUser, @Param('id') id: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts):103 | POST | /api/invoice-templates/:id/duplicate | duplicate(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: DuplicateInvoiceTemplateDto = {}) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/push/push.controller.ts](../src/modules/push/push.controller.ts):31 | GET | /api/users/me/push-subscription/status | getStatus(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/push/push.controller.ts](../src/modules/push/push.controller.ts):36 | POST | /api/users/me/push-subscription | subscribe(@CurrentUser() user: JwtUser, @Body() dto: PushSubscriptionDto, @Req() request: Request) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/push/push.controller.ts](../src/modules/push/push.controller.ts):56 | POST | /api/users/me/push-subscription/test | test(@CurrentUser() user: JwtUser, @Body() dto: PushEndpointDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/push/push.controller.ts](../src/modules/push/push.controller.ts):61 | DELETE | /api/users/me/push-subscription | unsubscribe(@CurrentUser() user: JwtUser, @Body() dto: PushEndpointDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):43 | GET | /api/classes/:classId/billing/overview | getClassBillingOverview(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Query() query: QueryBillingDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):56 | GET | /api/classes/:classId/students/:studentId/billing-candidates | getBillingCandidates(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Query() query: QueryBillingDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):71 | GET | /api/students/:studentId/billing/overview | getStudentBillingOverview(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Query() query: QueryBillingDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):84 | GET | /api/students/:studentId/billing-candidates | getStudentBillingCandidates(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Query() query: QueryBillingDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):97 | POST | /api/classes/:classId/students/:studentId/receipts/preview | previewReceipt(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):112 | POST | /api/students/:studentId/receipts/preview | previewStudentReceipt(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):125 | POST | /api/classes/:classId/students/:studentId/receipts | issueReceipt(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):140 | POST | /api/students/:studentId/receipts | issueStudentReceipt(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):153 | GET | /api/receipts | listReceipts(@CurrentUser() user: JwtUser, @Query() query: QueryReceiptsDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):158 | POST | /api/receipts/download-bulk | downloadReceipts(@CurrentUser() user: JwtUser, @Body() dto: DownloadReceiptsDto, @Res({ passthrough: true }) response: Response) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):184 | GET | /api/receipts/:receiptId | findReceipt(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):193 | GET | /api/receipts/:receiptId/download | downloadReceipt(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string, @Res({ passthrough: true }) response: Response) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):219 | POST | /api/receipts/:receiptId/render-pdf | retryRenderPdf(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):227 | POST | /api/receipts/:receiptId/payment-proof | uploadPaymentProof(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string, @UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):253 | PATCH | /api/receipts/:receiptId/payment | updatePayment(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string, @Body() dto: UpdateReceiptPaymentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts):262 | DELETE | /api/receipts/:receiptId | cancelReceipt(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts):24 | GET | /api/schedules/reminders/status | getReminderStatus() | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts):29 | POST | /api/schedules/conflicts/check-fixed | checkFixed(@CurrentUser() user: JwtUser, @Body() dto: CheckFixedScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts):34 | POST | /api/schedules/conflicts/check-temporary | checkTemporary(@CurrentUser() user: JwtUser, @Body() dto: CheckTemporaryScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts):47 | POST | /api/schedules/availability | availability(@CurrentUser() user: JwtUser, @Body() dto: ScheduleAvailabilityDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts):55 | GET | /api/schedules/source-slots | sourceSlots(@CurrentUser() user: JwtUser, @Query('classId') classId: string, @Query('date') date: string, @Query('ignoreOverrideId') ignoreId?: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts):65 | GET | /api/schedules/week | getTeacherWeekSchedule(@CurrentUser() user: JwtUser, @Query() query: QueryTeacherWeekScheduleDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):42 | GET | /api/students | findAll(@CurrentUser() user: JwtUser, @Query() query: QueryStudentsDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):47 | GET | /api/students/import-template | downloadImportTemplate(@Res({ passthrough: true }) response: Response): StreamableFile | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):68 | POST | /api/students | create(@CurrentUser() user: JwtUser, @Body() dto: CreateStudentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):75 | POST | /api/students/import | importStudents(@CurrentUser() user: JwtUser, @UploadedFile() file?: StudentImportFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):94 | POST | /api/students/bulk-delete | deleteMany(@CurrentUser() user: JwtUser, @Body() dto: BulkDeleteStudentsDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):103 | PATCH | /api/students/:studentId | update(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Body() dto: UpdateStudentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):118 | DELETE | /api/students/:studentId | delete(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Query() query: DeleteStudentDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts):127 | POST | /api/students/avatar | uploadAvatar(@UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):45 | GET | /api/users/me | getProfile(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):50 | GET | /api/users/banks | getBanks() | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):55 | POST | /api/users/bank-account/lookup | lookupBankAccount(@Body() dto: LookupBankAccountDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):60 | PATCH | /api/users/me | updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):65 | PATCH | /api/users/me/password | changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):70 | POST | /api/users/me/avatar | uploadTeacherAvatar(@UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):89 | POST | /api/users/me/payment-qr | uploadPaymentQr(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile, @Body('qrContent') qrContent?: string, @Body('allowUnrecognized') allowUnrecognized?: string) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):130 | GET | /api/users/me/payment-qr | getPaymentQr(@CurrentUser() user: JwtUser, @Res() response: Response) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):140 | DELETE | /api/users/me/payment-qr | removePaymentQr(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):145 | POST | /api/users/me/media | uploadMedia(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile) | @UseGuards(JwtAuthGuard) |
| [edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts):163 | GET | /api/users/me/media | getMediaHistory(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) |

## Symbol, schema, DTO và test theo file

### edutrack_be/scripts/project-index.cjs

[edutrack_be/scripts/project-index.cjs](../scripts/project-index.cjs) — 141 dòng.

Functions: `decoratorArgument(value)` (dòng 21); `visitFiles(root)` (dòng 25); `decorators(node, sf)` (dòng 34); `readRecord(full)` (dòng 37).

### edutrack_be/src/app.controller.spec.ts

[edutrack_be/src/app.controller.spec.ts](../src/app.controller.spec.ts) — 27 dòng.

Dependencies: `@nestjs/testing`, `./app.controller`, `./app.service`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 5: AppController
- Dòng 17: root
- Dòng 18: should return API health metadata

### edutrack_be/src/app.controller.ts

[edutrack_be/src/app.controller.ts](../src/app.controller.ts) — 13 dòng.

Dependencies: `@nestjs/common`, `./app.service`.

**AppController** (dòng 4) @Controller()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getHealth | 8 | public getHealth() | @Get() |

Exports: `AppController` (4).

### edutrack_be/src/app.module.ts

[edutrack_be/src/app.module.ts](../src/app.module.ts) — 51 dòng.

Dependencies: `@nestjs/common`, `@nestjs/event-emitter`, `@nestjs/config`, `./app.controller`, `./app.service`, `./config/configuration`, `./database/database.module`, `./modules/ai/ai.module`, `./modules/auth/auth.module`, `./modules/classes/classes.module`, `./modules/dashboard/dashboard.module`, `./modules/invoice-template/invoice-template.module`, `./modules/mail/mail.module`, `./modules/receipts/receipts.module`, `./modules/schedules/schedules.module`, `./modules/school-management/school-management.module`, `./modules/students/students.module`, `./modules/users/users.module`, `./modules/backup/backup.module`, `./modules/push/push.module`, `@nestjs/schedule`.

**AppModule** (dòng 24) @Module({ imports: [ ConfigModule.forRoot({ isGlobal: true, load: [configuration], }), EventEmitterModule.forRoot(), ScheduleModule.forRoot(), DatabaseModule, UsersModule, MailModule, AuthModule, SchoolManagementModule, StudentsModule, ClassesModule, SchedulesModule, ReceiptsModule, InvoiceTemplateModule, DashboardModule, AiModule, PushModule, BackupModule, ], controllers: [AppController], providers: [AppService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `AppModule` (24).

### edutrack_be/src/app.service.ts

[edutrack_be/src/app.service.ts](../src/app.service.ts) — 13 dòng.

Dependencies: `@nestjs/common`.

**AppService** (dòng 3) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getHealth | 5 | public getHealth() |  |

Exports: `AppService` (3).

### edutrack_be/src/common/decorators/current-user.decorator.ts

[edutrack_be/src/common/decorators/current-user.decorator.ts](../src/common/decorators/current-user.decorator.ts) — 11 dòng.

Dependencies: `@nestjs/common`, `../types/authenticated-request.type`.

Exports: `CurrentUser` (4).

### edutrack_be/src/common/types/authenticated-request.type.ts

[edutrack_be/src/common/types/authenticated-request.type.ts](../src/common/types/authenticated-request.type.ts) — 13 dòng.

Dependencies: `express`, `../../modules/users/schemas/user.schema`.

Exports: `JwtUser` (4), `AuthenticatedRequest` (10).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 4
export type JwtUser = {
  userId: string;
  email: string;
  role: UserRole;
};
// line 10
export type AuthenticatedRequest = Request & {
  user: JwtUser;
};
```

### edutrack_be/src/common/utils/search-normalizer.ts

[edutrack_be/src/common/utils/search-normalizer.ts](../src/common/utils/search-normalizer.ts) — 14 dòng.

Functions: `normalizeSearchText(value: string)` (dòng 1); `escapeRegex(value: string)` (dòng 11).

Exports: `normalizeSearchText` (1), `escapeRegex` (11).

### edutrack_be/src/common/utils/vietnam-time.ts

[edutrack_be/src/common/utils/vietnam-time.ts](../src/common/utils/vietnam-time.ts) — 70 dòng.

Functions: `convertVietnamWeeklyTimeToUtc(dayOfWeek: number, time: string): WeeklyTimePoint` (dòng 10); `convertUtcWeeklyTimeToVietnam(dayOfWeek: number, time: string): WeeklyTimePoint` (dòng 17); `convertVietnamTimeToUtc(time: string)` (dòng 24); `convertUtcTimeToVietnam(time: string)` (dòng 28); `shiftWeeklyTime(dayOfWeek: number, time: string, offsetMinutes: number): WeeklyTimePoint` (dòng 32); `shiftTime(time: string, offsetMinutes: number)` (dòng 50); `parseTimeToMinutes(time: string)` (dòng 58); `formatMinutesToTime(minutes: number)` (dòng 64).

Exports: `WeeklyTimePoint` (5), `convertVietnamWeeklyTimeToUtc` (10), `convertUtcWeeklyTimeToVietnam` (17), `convertVietnamTimeToUtc` (24), `convertUtcTimeToVietnam` (28).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 5
export type WeeklyTimePoint = {
  dayOfWeek: number;
  time: string;
};
```

### edutrack_be/src/config/configuration.spec.ts

[edutrack_be/src/config/configuration.spec.ts](../src/config/configuration.spec.ts) — 84 dòng.

Dependencies: `./configuration`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 10: refresh cookie configuration
- Dòng 27: uses secure SameSite=None cookies by default in production
- Dòng 38: uses localhost-compatible cookie defaults in development
- Dòng 50: uses secure cookies for an HTTPS frontend without NODE_ENV
- Dòng 62: accepts explicit cookie policy overrides
- Dòng 73: falls back safely when cookie settings are invalid

### edutrack_be/src/database/database.module.ts

[edutrack_be/src/database/database.module.ts](../src/database/database.module.ts) — 22 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/mongoose`.

**DatabaseModule** (dòng 5) @Module({ imports: [ MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (configService: ConfigService) => { const uri = configService.get<string>('database.uri'); if (!uri) { throw new Error('MONGO_URI is required to start EduTrack API'); } return { uri }; }, }), ], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `DatabaseModule` (5).

### edutrack_be/src/main.ts

[edutrack_be/src/main.ts](../src/main.ts) — 40 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `dns`, `./app.module`.

Functions: `bootstrap()` (dòng 7).

### edutrack_be/src/modules/ai/ai-schedule.service.ts

[edutrack_be/src/modules/ai/ai-schedule.service.ts](../src/modules/ai/ai-schedule.service.ts) — 472 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/mongoose`, `mongoose`, `@google/genai`, `../school-management/enums`, `../school-management/schemas/class.schema`, `../school-management/schemas/schedule-version.schema`, `../school-management/schemas/schedule-override.schema`, `./schemas/ai-session.schema`, `../../common/utils/vietnam-time`.

**AiScheduleService** (dòng 60) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 62 |  |  |
| genai | 63 | GoogleGenAI |  |
| createSession | 87 | public createSession(teacherId: string) |  |
| chat | 117 | public chat(teacherId: string, sessionId: string, userMessage: string) |  |
| getSession | 184 | public getSession(teacherId: string, sessionId: string) |  |
| listSessions | 212 | public listSessions(teacherId: string) |  |
| pruneOldSessions | 234 | private pruneOldSessions(teacherId: Types.ObjectId) |  |
| buildScheduleContext | 251 | private buildScheduleContext(teacherId: Types.ObjectId): Promise<string> |  |
| extractTimeSlots | 416 | private extractTimeSlots(entries: string[]): Array<{ start: string; end: string }> |  |
| computeFreeSlots | 433 | private computeFreeSlots(busySlots: Array<{ start: string; end: string }>): Array<{ start: string; end: string }> |  |
| formatDate | 459 | private formatDate(date: Date): string |  |
| buildGreeting | 468 | private buildGreeting(): string |  |

Exports: `AiScheduleService` (60).

### edutrack_be/src/modules/ai/ai.controller.ts

[edutrack_be/src/modules/ai/ai.controller.ts](../src/modules/ai/ai.controller.ts) — 36 dòng.

Dependencies: `@nestjs/common`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `./ai-schedule.service`, `./dto/ai-chat.dto`.

**AiController** (dòng 8) @Controller('ai') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| createSession | 13 | public createSession(@CurrentUser() user: JwtUser) | @Post('schedule-suggest') |
| chat | 18 | public chat(@CurrentUser() user: JwtUser, @Body() dto: AiChatDto) | @Post('schedule-suggest/chat') |
| listSessions | 23 | public listSessions(@CurrentUser() user: JwtUser) | @Get('schedule-suggest/sessions') |
| getSession | 28 | public getSession(@CurrentUser() user: JwtUser, @Param('sessionId') sessionId: string) | @Get('schedule-suggest/sessions/:sessionId') |

Exports: `AiController` (8).

### edutrack_be/src/modules/ai/ai.module.ts

[edutrack_be/src/modules/ai/ai.module.ts](../src/modules/ai/ai.module.ts) — 19 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `../school-management/school-management.module`, `./ai.controller`, `./ai-schedule.service`, `./schemas/ai-session.schema`.

**AiModule** (dòng 8) @Module({ imports: [ MongooseModule.forFeature([ { name: AiSession.name, schema: AiSessionSchema }, ]), SchoolManagementModule, ], controllers: [AiController], providers: [AiScheduleService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `AiModule` (8).

### edutrack_be/src/modules/ai/dto/ai-chat.dto.ts

[edutrack_be/src/modules/ai/dto/ai-chat.dto.ts](../src/modules/ai/dto/ai-chat.dto.ts) — 13 dòng.

Dependencies: `class-validator`.

**AiChatDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| sessionId | 4 | string | @IsString() @IsNotEmpty({ message: 'Vui lòng cung cấp sessionId.' }) |
| message | 8 | string | @IsString() @IsNotEmpty({ message: 'Vui lòng nhập nội dung tin nhắn.' }) @MaxLength(2000, { message: 'Tin nhắn không được quá 2000 ký tự.' }) |

Exports: `AiChatDto` (3).

### edutrack_be/src/modules/ai/schemas/ai-session.schema.ts

[edutrack_be/src/modules/ai/schemas/ai-session.schema.ts](../src/modules/ai/schemas/ai-session.schema.ts) — 51 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`.

**AiChatMessage** (dòng 5) @Schema({ _id: false, versionKey: false })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| role | 7 | 'user' \| 'ai' | @Prop({ required: true, enum: ['user', 'ai'] }) |
| text | 10 | string | @Prop({ required: true }) |
| timestamp | 13 | Date | @Prop({ type: Date, default: () => new Date() }) |

**AiSession** (dòng 19) @Schema({ collection: 'ai_sessions', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 25 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| scheduleContext | 33 | string | @Prop({ required: true }) |
| messages | 36 | AiChatMessage[] | @Prop({ type: [AiChatMessageSchema], default: [] }) |
| lastActivityAt | 39 | Date | @Prop({ type: Date, default: () => new Date() }) |
| createdAt | 42 | Date |  |
| updatedAt | 43 | Date |  |

Exports: `AiChatMessage` (5), `AiChatMessageSchema` (17), `AiSession` (19), `AiSessionDocument` (46), `AiSessionSchema` (47).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 46
export type AiSessionDocument = HydratedDocument<AiSession>;
```

Indexes:

- Dòng 49: `AiSessionSchema.index({ teacherId: 1, createdAt: -1 })`
- Dòng 50: `AiSessionSchema.index({ lastActivityAt: 1 })`

### edutrack_be/src/modules/auth/auth.controller.spec.ts

[edutrack_be/src/modules/auth/auth.controller.spec.ts](../src/modules/auth/auth.controller.spec.ts) — 186 dòng.

Dependencies: `express`, `../users/schemas/user.schema`, `./auth.controller`, `./types/auth-response.type`.

Functions: `createSession(): AuthSession` (dòng 12); `createController(nodeEnv: 'development' \| 'production' \| undefined, frontendUrl = '')` (dòng 28); `createResponse()` (dòng 57).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 71: AuthController refresh cookie
- Dòng 72: sets a persistent, host-only cross-site cookie in production
- Dòng 97: reads the persistent cookie and replaces it after refresh rotation
- Dòng 122: clears the same cookie path and attributes during logout
- Dòng 143: uses a localhost-compatible cookie during development
- Dòng 163: infers secure cookies from an HTTPS frontend without NODE_ENV

### edutrack_be/src/modules/auth/auth.controller.ts

[edutrack_be/src/modules/auth/auth.controller.ts](../src/modules/auth/auth.controller.ts) — 178 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `./auth.service`, `./dto/forgot-password.dto`, `./dto/login.dto`, `./dto/register.dto`, `./dto/resend-password-reset-otp.dto`, `./dto/resend-otp.dto`, `./dto/reset-password.dto`, `./dto/verify-otp.dto`, `./guards/jwt-auth.guard`, `./types/auth-response.type`.

**AuthController** (dòng 25) @Controller('auth')

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| register | 32 | public register(@Body() registerDto: RegisterDto) | @Post('register') |
| verifyOtp | 37 | public verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> | @Post('verify-otp') |
| resendOtp | 48 | public resendOtp(@Body() resendOtpDto: ResendOtpDto) | @Post('resend-otp') |
| forgotPassword | 53 | public forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) | @Post('forgot-password') |
| resetPassword | 58 | public resetPassword(@Body() resetPasswordDto: ResetPasswordDto) | @Post('reset-password') |
| resendPasswordResetOtp | 63 | public resendPasswordResetOtp(@Body() resendPasswordResetOtpDto: ResendPasswordResetOtpDto) | @Post('resend-password-reset-otp') |
| login | 70 | public login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> | @Post('login') |
| refresh | 81 | public refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> | @Post('refresh') |
| logout | 93 | public logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) | @Post('logout') |
| me | 109 | public me(@CurrentUser() user: JwtUser) | @UseGuards(JwtAuthGuard) @Get('me') |
| setRefreshTokenCookie | 115 | private setRefreshTokenCookie(response: Response, session: AuthSession) |  |
| toAuthResponse | 123 | private toAuthResponse(session: AuthSession): AuthResponse |  |
| getRefreshTokenFromRequest | 130 | private getRefreshTokenFromRequest(request: Request) |  |
| getRefreshTokenCookieName | 148 | private getRefreshTokenCookieName() |  |
| getRefreshTokenCookieOptions | 155 | private getRefreshTokenCookieOptions(expires?: Date): CookieOptions |  |

Exports: `AuthController` (25).

### edutrack_be/src/modules/auth/auth.module.ts

[edutrack_be/src/modules/auth/auth.module.ts](../src/modules/auth/auth.module.ts) — 33 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/jwt`, `@nestjs/passport`, `../users/users.module`, `./auth.controller`, `./auth.service`, `./strategies/jwt.strategy`.

**AuthModule** (dòng 11) @Module({ imports: [ UsersModule, PassportModule, JwtModule.registerAsync({ inject: [ConfigService], useFactory: (configService: ConfigService): JwtModuleOptions => { const expiresIn = configService.get<string>('jwt.expiresIn') ?? '1d'; return { secret: configService.get<string>('jwt.secret') ?? 'change-me-in-env', signOptions: { expiresIn, } as JwtModuleOptions['signOptions'], }; }, }), ], controllers: [AuthController], providers: [AuthService, JwtStrategy], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `AuthModule` (11).

### edutrack_be/src/modules/auth/auth.service.ts

[edutrack_be/src/modules/auth/auth.service.ts](../src/modules/auth/auth.service.ts) — 771 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`, `bcrypt`, `@nestjs/event-emitter`, `../users/schemas/user.schema`, `../users/users.service`, `./dto/forgot-password.dto`, `./dto/login.dto`, `./dto/register.dto`, `./dto/resend-password-reset-otp.dto`, `./dto/resend-otp.dto`, `./dto/reset-password.dto`, `./dto/verify-otp.dto`, `./types/auth-response.type`, `./types/jwt-payload.type`.

**AuthService** (dòng 26) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| register | 35 | public register(registerDto: RegisterDto) |  |
| verifyOtp | 89 | public verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthSession> |  |
| resendOtp | 126 | public resendOtp(resendOtpDto: ResendOtpDto) |  |
| forgotPassword | 175 | public forgotPassword(forgotPasswordDto: ForgotPasswordDto) |  |
| resetPassword | 216 | public resetPassword(resetPasswordDto: ResetPasswordDto) |  |
| resendPasswordResetOtp | 254 | public resendPasswordResetOtp(resendPasswordResetOtpDto: ResendPasswordResetOtpDto) |  |
| login | 293 | public login(loginDto: LoginDto): Promise<AuthSession> |  |
| refresh | 327 | public refresh(refreshToken: string): Promise<AuthSession> |  |
| logout | 360 | public logout(refreshToken?: string) |  |
| me | 377 | public me(userId: string) |  |
| ensurePendingOtp | 387 | private ensurePendingOtp(user: UserDocument) |  |
| createAuthSession | 417 | private createAuthSession(user: UserDocument): Promise<AuthSession> |  |
| signAccessToken | 436 | private signAccessToken(user: UserDocument) |  |
| signRefreshToken | 450 | private signRefreshToken(user: UserDocument) |  |
| verifyRefreshToken | 464 | private verifyRefreshToken(refreshToken: string) |  |
| tryVerifyRefreshToken | 485 | private tryVerifyRefreshToken(refreshToken?: string) |  |
| createOtpBundle | 505 | private createOtpBundle(email: string) |  |
| createPasswordResetOtpBundle | 531 | private createPasswordResetOtpBundle(email: string) |  |
| assertUnverifiedAccountIsActive | 550 | private assertUnverifiedAccountIsActive(user: UserDocument) |  |
| isUnverifiedAccountExpired | 562 | private isUnverifiedAccountExpired(user: UserDocument) |  |
| getLegacyEmailVerificationExpiresAt | 574 | private getLegacyEmailVerificationExpiresAt(user: UserDocument) |  |
| assertOtpIsUsable | 587 | private assertOtpIsUsable(user: UserDocument) |  |
| assertPasswordResetOtpIsUsable | 606 | private assertPasswordResetOtpIsUsable(user: UserDocument) |  |
| assertPasswordResetOtpCanBeSent | 630 | private assertPasswordResetOtpCanBeSent(user: UserDocument) |  |
| clearPasswordResetState | 652 | private clearPasswordResetState(user: UserDocument) |  |
| clearRefreshTokenState | 660 | private clearRefreshTokenState(user: UserDocument) |  |
| getOtpCompareValue | 665 | private getOtpCompareValue(email: string, otp: string) |  |
| getPasswordResetOtpCompareValue | 669 | private getPasswordResetOtpCompareValue(email: string, otp: string) |  |
| generateOtp | 673 | private generateOtp() |  |
| getPasswordSaltRounds | 677 | private getPasswordSaltRounds() |  |
| getOtpSaltRounds | 681 | private getOtpSaltRounds() |  |
| getOtpExpiresMinutes | 685 | private getOtpExpiresMinutes() |  |
| getOtpResendCooldownSeconds | 689 | private getOtpResendCooldownSeconds() |  |
| getUnverifiedAccountTtlMinutes | 693 | private getUnverifiedAccountTtlMinutes() |  |
| getRefreshTokenSaltRounds | 699 | private getRefreshTokenSaltRounds() |  |
| getDefaultRefreshTokenExpiresMs | 705 | private getDefaultRefreshTokenExpiresMs() |  |
| getAccessTokenSecret | 712 | private getAccessTokenSecret() |  |
| getRefreshTokenSecret | 716 | private getRefreshTokenSecret() |  |
| getAccessTokenExpiresIn | 723 | private getAccessTokenExpiresIn() |  |
| getRefreshTokenExpiresIn | 728 | private getRefreshTokenExpiresIn() |  |
| getRefreshTokenExpiresAt | 733 | private getRefreshTokenExpiresAt() |  |
| parseDurationToMs | 746 | private parseDurationToMs(value: string \| number, fallbackMs: number) |  |

Exports: `AuthService` (26).

### edutrack_be/src/modules/auth/dto/forgot-password.dto.ts

[edutrack_be/src/modules/auth/dto/forgot-password.dto.ts](../src/modules/auth/dto/forgot-password.dto.ts) — 12 dòng.

Dependencies: `class-validator`.

**ForgotPasswordDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| email | 4 | string | @IsEmail() |
| newPassword | 7 | string | @IsString() @MinLength(8) @MaxLength(72) |

Exports: `ForgotPasswordDto` (3).

### edutrack_be/src/modules/auth/dto/login.dto.ts

[edutrack_be/src/modules/auth/dto/login.dto.ts](../src/modules/auth/dto/login.dto.ts) — 11 dòng.

Dependencies: `class-validator`.

**LoginDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| email | 4 | string | @IsEmail() |
| password | 7 | string | @IsString() @MinLength(8) |

Exports: `LoginDto` (3).

### edutrack_be/src/modules/auth/dto/register.dto.ts

[edutrack_be/src/modules/auth/dto/register.dto.ts](../src/modules/auth/dto/register.dto.ts) — 17 dòng.

Dependencies: `class-validator`.

**RegisterDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| fullName | 4 | string | @IsString() @MinLength(2) @MaxLength(100) |
| email | 9 | string | @IsEmail() |
| password | 12 | string | @IsString() @MinLength(8) @MaxLength(72) |

Exports: `RegisterDto` (3).

### edutrack_be/src/modules/auth/dto/resend-otp.dto.ts

[edutrack_be/src/modules/auth/dto/resend-otp.dto.ts](../src/modules/auth/dto/resend-otp.dto.ts) — 7 dòng.

Dependencies: `class-validator`.

**ResendOtpDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| email | 4 | string | @IsEmail() |

Exports: `ResendOtpDto` (3).

### edutrack_be/src/modules/auth/dto/resend-password-reset-otp.dto.ts

[edutrack_be/src/modules/auth/dto/resend-password-reset-otp.dto.ts](../src/modules/auth/dto/resend-password-reset-otp.dto.ts) — 7 dòng.

Dependencies: `class-validator`.

**ResendPasswordResetOtpDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| email | 4 | string | @IsEmail() |

Exports: `ResendPasswordResetOtpDto` (3).

### edutrack_be/src/modules/auth/dto/reset-password.dto.ts

[edutrack_be/src/modules/auth/dto/reset-password.dto.ts](../src/modules/auth/dto/reset-password.dto.ts) — 12 dòng.

Dependencies: `class-validator`.

**ResetPasswordDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| email | 4 | string | @IsEmail() |
| otp | 7 | string | @Matches(/^\d{6}$/, { message: 'otp must be a 6 digit code', }) |

Exports: `ResetPasswordDto` (3).

### edutrack_be/src/modules/auth/dto/verify-otp.dto.ts

[edutrack_be/src/modules/auth/dto/verify-otp.dto.ts](../src/modules/auth/dto/verify-otp.dto.ts) — 12 dòng.

Dependencies: `class-validator`.

**VerifyOtpDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| email | 4 | string | @IsEmail() |
| otp | 7 | string | @Matches(/^\d{6}$/, { message: 'otp must be a 6 digit code', }) |

Exports: `VerifyOtpDto` (3).

### edutrack_be/src/modules/auth/guards/jwt-auth.guard.ts

[edutrack_be/src/modules/auth/guards/jwt-auth.guard.ts](../src/modules/auth/guards/jwt-auth.guard.ts) — 6 dòng.

Dependencies: `@nestjs/common`, `@nestjs/passport`.

**JwtAuthGuard** (dòng 4) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `JwtAuthGuard` (4).

### edutrack_be/src/modules/auth/strategies/jwt.strategy.ts

[edutrack_be/src/modules/auth/strategies/jwt.strategy.ts](../src/modules/auth/strategies/jwt.strategy.ts) — 31 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/passport`, `passport-jwt`, `../../../common/types/authenticated-request.type`, `../types/jwt-payload.type`.

**JwtStrategy** (dòng 8) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| validate | 19 | public validate(payload: JwtPayload): JwtUser |  |

Exports: `JwtStrategy` (8).

### edutrack_be/src/modules/auth/types/auth-response.type.ts

[edutrack_be/src/modules/auth/types/auth-response.type.ts](../src/modules/auth/types/auth-response.type.ts) — 12 dòng.

Dependencies: `../../users/types/safe-user.type`.

Exports: `AuthResponse` (3), `AuthSession` (8).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
export type AuthResponse = {
  accessToken: string;
  user: SafeUser;
};
// line 8
export type AuthSession = AuthResponse & {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};
```

### edutrack_be/src/modules/auth/types/jwt-payload.type.ts

[edutrack_be/src/modules/auth/types/jwt-payload.type.ts](../src/modules/auth/types/jwt-payload.type.ts) — 11 dòng.

Dependencies: `../../users/schemas/user.schema`.

Exports: `JwtTokenType` (3), `JwtPayload` (5).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
export type JwtTokenType = 'access' | 'refresh';
// line 5
export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tokenType: JwtTokenType;
};
```

### edutrack_be/src/modules/backup/backup-check.cli.ts

[edutrack_be/src/modules/backup/backup-check.cli.ts](../src/modules/backup/backup-check.cli.ts) — 60 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `../../config/configuration`, `./google-drive.service`.

**BackupCheckModule** (dòng 7) @Module({ imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] })], providers: [GoogleDriveService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Functions: `main()` (dòng 14).

### edutrack_be/src/modules/backup/backup-oauth.cli.ts

[edutrack_be/src/modules/backup/backup-oauth.cli.ts](../src/modules/backup/backup-oauth.cli.ts) — 226 dòng.

Dependencies: `node:crypto`, `node:http`, `node:fs`, `node:path`, `googleapis`, `google-auth-library`, `@nestjs/config`, `@nestjs/common`, `@nestjs/core`, `./backup-oauth`.

**OAuthConfigModule** (dòng 23) @Module({ imports: [ConfigModule.forRoot({ isGlobal: true })] })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Functions: `main()` (dòng 26).

### edutrack_be/src/modules/backup/backup-oauth.spec.ts

[edutrack_be/src/modules/backup/backup-oauth.spec.ts](../src/modules/backup/backup-oauth.spec.ts) — 133 dòng.

Dependencies: `dotenv`, `./backup-oauth`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 8: personal Drive OAuth connection helpers
- Dòng 14: accepts Desktop app credentials and rejects service account or web client JSON
- Dòng 37: does not echo malformed credential contents in errors
- Dòng 45: accepts a callback with the expected state and exactly one authorization code
- Dòng 54: rejects invalid or ambiguous OAuth callback %s
- Dòng 67: recognizes cancellation only for the expected state
- Dòng 83: ignores requests outside the callback route
- Dòng 95: preserves other settings and comments, replaces duplicate OAuth keys and keeps CRLF
- Dòng 109: round-trips valid token symbols instead of treating them as env comments
- Dòng 118: rejects values that could corrupt environment settings

### edutrack_be/src/modules/backup/backup-oauth.ts

[edutrack_be/src/modules/backup/backup-oauth.ts](../src/modules/backup/backup-oauth.ts) — 113 dòng.

Dependencies: `node:crypto`.

**OAuthSetupError** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Functions: `parseDesktopOAuthClient(json: string): { clientId: string; clientSecret: string; }` (dòng 5); `validateOAuthCallback(method: string \| undefined, requestUrl: string, state: string): OAuthCallback` (dòng 40); `updateOAuthEnv(current: string, values: OAuthEnvValues): string` (dòng 81).

Exports: `OAuthSetupError` (3), `parseDesktopOAuthClient` (5), `OAuthCallback` (34), `validateOAuthCallback` (40), `OAuthEnvValues` (78), `updateOAuthEnv` (81).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 34
export type OAuthCallback =
  | { kind: 'not_found' }
  | { kind: 'invalid' }
  | { kind: 'denied' }
  | { kind: 'code'; code: string };
// line 78
export type OAuthEnvValues = Record<(typeof OAUTH_ENV_KEYS)[number], string>;
```

### edutrack_be/src/modules/backup/backup.module.ts

[edutrack_be/src/modules/backup/backup.module.ts](../src/modules/backup/backup.module.ts) — 10 dòng.

Dependencies: `@nestjs/common`, `./backup.service`, `./google-drive.service`.

**BackupModule** (dòng 5) @Module({ providers: [BackupService, GoogleDriveService], exports: [BackupService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `BackupModule` (5).

### edutrack_be/src/modules/backup/backup.service.spec.ts

[edutrack_be/src/modules/backup/backup.service.spec.ts](../src/modules/backup/backup.service.spec.ts) — 153 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `mongoose`, `node:zlib`, `./backup.service`, `./google-drive.service`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 8: BackupService scheduling and export
- Dòng 61: compresses exported collections and prunes only after a successful upload
- Dòng 74: checks folder readiness before reading any database collection
- Dòng 83: does not publish a partial backup when any collection export fails
- Dòng 93: keeps old backups when upload fails and allows the next run to retry
- Dòng 101: requires a successful file ID before deleting old backups
- Dòng 106: rejects invalid retention before exporting data
- Dòng 110: does not overlap two scheduled backups
- Dòng 123: catches up a missed 02:00 backup when Render restarts later that day
- Dòng 127: does not create an early backup before 02:00 Vietnam time
- Dòng 133: does not repeat a successful backup from the current backup day
- Dòng 140: ignores a backup created before the current 02:00 boundary
- Dòng 147: does not assume there are no backups when the Drive history cannot be read

### edutrack_be/src/modules/backup/backup.service.ts

[edutrack_be/src/modules/backup/backup.service.ts](../src/modules/backup/backup.service.ts) — 240 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/schedule`, `@nestjs/mongoose`, `mongoose`, `zlib`, `util`, `./google-drive.service`.

**BackupService** (dòng 15) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 17 |  |  |
| maxBackups | 18 | number |  |
| isRunning | 19 |  |  |
| catchUpAfterStartup | 31 | public catchUpAfterStartup(): Promise<void> | @Timeout('backup-catch-up', 15_000) |
| handleScheduledBackup | 70 | public handleScheduledBackup(): Promise<void> | @Cron('0 2 * * *', { name: 'database-backup', timeZone: VIETNAM_TZ, }) |
| exportAllCollections | 156 | private exportAllCollections(): Promise<BackupPayload> |  |
| formatTimestamp | 205 | private formatTimestamp(date: Date): string |  |

Exports: `BackupService` (15).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 230
interface BackupPayload {
  metadata: {
    version: string;
    createdAt: string;
    databaseName: string;
    collectionCount: number;
    totalDocuments: number;
  };
  collections: Record<string, unknown[]>;
}
```

### edutrack_be/src/modules/backup/google-drive.service.spec.ts

[edutrack_be/src/modules/backup/google-drive.service.spec.ts](../src/modules/backup/google-drive.service.spec.ts) — 206 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `googleapis`, `./google-drive.service`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 18: GoogleDriveService backup destination
- Dòng 65: uses a scope that can access an externally created folder and supports Shared Drives
- Dòng 80: rejects My Drive for a service account even when it has Editor permissions
- Dòng 89: reports inaccessible folders with actionable configuration information
- Dòng 95: rejects a read-only destination
- Dòng 103: does not treat a folder URL as a configured folder ID
- Dòng 108: does not silently fall back to a service account when OAuth configuration is incomplete
- Dòng 113: accepts My Drive when using the owner OAuth refresh token
- Dòng 129: uploads to the configured Shared Drive folder and requires a confirmed file ID
- Dòng 145: paginates backups while excluding unrelated files from retention cleanup
- Dòng 168: propagates listing errors instead of reporting an empty backup history
- Dòng 174: does not delete files with invalid retention %s
- Dòng 183: keeps the latest backup and deletes only older backup files with Shared Drive support
- Dòng 196: reports cleanup failures instead of counting unsuccessful deletions

### edutrack_be/src/modules/backup/google-drive.service.ts

[edutrack_be/src/modules/backup/google-drive.service.ts](../src/modules/backup/google-drive.service.ts) — 303 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `googleapis`, `stream`.

**GoogleDriveService** (dòng 20) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 22 |  |  |
| drive | 23 | drive_v3.Drive \| null |  |
| folderId | 24 | string |  |
| authMode | 25 | 'service_account' \| 'oauth' \| null |  |
| initClient | 34 | private initClient(): void |  |
| isConfigured | 97 | public isConfigured(): boolean |  |
| getAuthMode | 101 | public getAuthMode() |  |
| checkBackupFolder | 105 | public checkBackupFolder(): Promise<{ name: string; sharedDrive: boolean }> |  |
| errorMessage | 152 | private errorMessage(error: unknown): string |  |
| uploadFile | 167 | public uploadFile(fileName: string, buffer: Buffer, mimeType: string = 'application/gzip'): Promise<{ fileId: string; webViewLink: string }> |  |
| listBackupFiles | 220 | public listBackupFiles(): Promise<drive_v3.Schema$File[]> |  |
| deleteFile | 254 | public deleteFile(fileId: string): Promise<void> |  |
| pruneOldBackups | 274 | public pruneOldBackups(keepCount: number): Promise<number> |  |

Exports: `GoogleDriveService` (20).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 7
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
```

### edutrack_be/src/modules/classes/attendance-tuition.ts

[edutrack_be/src/modules/classes/attendance-tuition.ts](../src/modules/classes/attendance-tuition.ts) — 30 dòng.

Dependencies: `../school-management/enums`, `./dto/take-attendance.dto`.

Functions: `resolveAttendanceTuition(status: AttendanceStatus, scheduleEventType: AttendanceScheduleEventType \| undefined, regularPrice: number, oneOnOnePrice: number)` (dòng 4).

Exports: `resolveAttendanceTuition` (4).

### edutrack_be/src/modules/classes/classes-attendance-pricing.spec.ts

[edutrack_be/src/modules/classes/classes-attendance-pricing.spec.ts](../src/modules/classes/classes-attendance-pricing.spec.ts) — 27 dòng.

Dependencies: `../school-management/enums`, `./attendance-tuition`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 4: attendance tuition pricing
- Dòng 5: uses the regular price for extra lessons
- Dòng 16: uses the one-on-one price only for one-on-one lessons

### edutrack_be/src/modules/classes/classes-attendance-reset.spec.ts

[edutrack_be/src/modules/classes/classes-attendance-reset.spec.ts](../src/modules/classes/classes-attendance-reset.spec.ts) — 364 dòng.

Dependencies: `class-transformer`, `class-validator`, `mongoose`, `./classes.service`, `./dto/take-attendance.dto`, `../school-management/enums`, `../schedules/schedule-conflicts.service`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 17: ClassesService clearing saved attendance
- Dòng 193: removes attendance and tuition and resets the session after every record is cleared
- Dòng 223: accepts the null status sent by the attendance UI
- Dòng 227: still completes the session and creates tuition when saving regular attendance
- Dòng 264: keeps the session completed while another saved record remains
- Dòng 289: blocks revocation before clearing and permits it after clearing all saved attendance
- Dòng 314: also resets an empty legacy session when saving a blank cell
- Dòng 320: rejects clearing attendance already included in a receipt
- Dòng 331: rejects clearing when billed tuition exists even if the attendance flag is stale
- Dòng 348: resets the status on the MongoDB standalone fallback path too

### edutrack_be/src/modules/classes/classes-schedule-guard.spec.ts

[edutrack_be/src/modules/classes/classes-schedule-guard.spec.ts](../src/modules/classes/classes-schedule-guard.spec.ts) — 77 dòng.

Dependencies: `@nestjs/common`, `mongoose`, `./classes.service`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 10: ClassesService schedule attendance guard
- Dòng 11: does not delete overrides or suspend the fixed schedule when attendance blocks removal

### edutrack_be/src/modules/classes/classes.controller.ts

[edutrack_be/src/modules/classes/classes.controller.ts](../src/modules/classes/classes.controller.ts) — 423 dòng.

Dependencies: `@nestjs/common`, `@nestjs/platform-express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../students/dto/create-student.dto`, `./classes.service`, `../cloudinary/cloudinary.service`, `./dto/create-class.dto`, `./dto/create-fixed-schedule.dto`, `./dto/create-temporary-schedule.dto`, `./dto/enroll-existing-student.dto`, `./dto/enroll-existing-students.dto`, `./dto/query-classes.dto`, `./dto/remove-existing-students.dto`, `./dto/save-class-session-content.dto`, `./dto/take-attendance-batch.dto`, `./dto/update-class.dto`, `./dto/update-temporary-schedule.dto`, `./dto/take-attendance.dto`, `./dto/create-exam.dto`, `./dto/update-exam.dto`, `./dto/take-exam-scores-batch.dto`, `./dto/suspend-fixed-schedule.dto`, `./dto/resume-fixed-schedule.dto`, `./dto/update-enrollment-status.dto`.

**ClassesController** (dòng 44) @Controller('classes') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| findAll | 52 | public findAll(@CurrentUser() user: JwtUser, @Query() query: QueryClassesDto) | @Get() |
| create | 57 | public create(@CurrentUser() user: JwtUser, @Body() dto: CreateClassDto) | @Post() |
| uploadClassImage | 62 | public uploadClassImage(@UploadedFile() file?: UploadImageFile) | @Post('image') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, }, }), ) |
| findDetail | 82 | public findDetail(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @Get(':classId') |
| updateClass | 87 | public updateClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: UpdateClassDto) | @Patch(':classId') |
| archiveClass | 96 | public archiveClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @Delete(':classId') |
| getSchedules | 104 | public getSchedules(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @Get(':classId/schedules') |
| saveFixedSchedule | 112 | public saveFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: CreateFixedScheduleDto) | @Post(':classId/schedules/fixed') |
| previewSuspendFixedSchedule | 121 | public previewSuspendFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: SuspendFixedScheduleDto) | @Post(':classId/schedules/fixed/suspend-preview') |
| suspendFixedSchedule | 134 | public suspendFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: SuspendFixedScheduleDto) | @Post(':classId/schedules/fixed/suspend') |
| resumeFixedSchedule | 143 | public resumeFixedSchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: ResumeFixedScheduleDto) | @Post(':classId/schedules/fixed/resume') |
| createTemporarySchedule | 152 | public createTemporarySchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: CreateTemporaryScheduleDto) | @Post(':classId/schedules/temporary') |
| updateTemporarySchedule | 165 | public updateTemporarySchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('scheduleId') scheduleId: string, @Body() dto: UpdateTemporaryScheduleDto) | @Patch(':classId/schedules/temporary/:scheduleId') |
| revokeTemporarySchedule | 180 | public revokeTemporarySchedule(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('scheduleId') scheduleId: string) | @Delete(':classId/schedules/temporary/:scheduleId') |
| saveSessionContent | 193 | public saveSessionContent(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: SaveClassSessionContentDto) | @Post(':classId/schedules/session-content') |
| enrollExistingStudent | 202 | public enrollExistingStudent(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: EnrollExistingStudentDto) | @Post(':classId/students') |
| enrollExistingStudents | 215 | public enrollExistingStudents(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: EnrollExistingStudentsDto) | @Post(':classId/students/bulk') |
| createStudentAndEnroll | 228 | public createStudentAndEnroll(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: CreateStudentDto) | @Post(':classId/students/new') |
| removeStudentsFromClass | 241 | public removeStudentsFromClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: RemoveExistingStudentsDto) | @Post(':classId/students/bulk-remove') |
| updateStudentEnrollmentStatus | 254 | public updateStudentEnrollmentStatus(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Body() dto: UpdateEnrollmentStatusDto) | @Patch(':classId/students/:studentId/status') |
| hardDeleteStudentFromClass | 269 | public hardDeleteStudentFromClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string) | @Delete(':classId/students/:studentId/hard') |
| removeStudentFromClass | 282 | public removeStudentFromClass(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string) | @Delete(':classId/students/:studentId') |
| getAttendance | 295 | public getAttendance(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Query('date') date: string, @Query('startTime') startTime: string, @Query('endTime') endTime: string) | @Get(':classId/attendance') |
| getAttendanceSheet | 312 | public getAttendanceSheet(@CurrentUser() user: JwtUser, @Param('id') classId: string) | @Get(':id/attendance-sheet') |
| takeAttendanceBatch | 320 | public takeAttendanceBatch(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Body() dto: TakeAttendanceBatchDto) | @Post(':id/attendance-batch') |
| getAttendanceOverview | 329 | public getAttendanceOverview(@CurrentUser() user: JwtUser, @Param('classId') classId: string) | @Get(':classId/attendance-overview') |
| takeAttendance | 337 | public takeAttendance(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Body() dto: TakeAttendanceDto) | @Post(':classId/attendance') |
| getExamSheet | 348 | public getExamSheet(@CurrentUser() user: JwtUser, @Param('id') classId: string) | @Get(':id/exam-sheet') |
| createExam | 353 | public createExam(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Body() dto: CreateExamDto) | @Post(':id/exams') |
| updateExam | 362 | public updateExam(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Param('examId') examId: string, @Body() dto: UpdateExamDto) | @Patch(':id/exams/:examId') |
| deleteExam | 372 | public deleteExam(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Param('examId') examId: string) | @Delete(':id/exams/:examId') |
| uploadExamFile | 381 | public uploadExamFile(@UploadedFile() file?: UploadImageFile) | @Post(':id/exams/file') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, // 5MB }, }), ) |
| takeExamScoresBatch | 396 | public takeExamScoresBatch(@CurrentUser() user: JwtUser, @Param('id') classId: string, @Body() dto: TakeExamScoresBatchDto) | @Post(':id/exam-scores') |
| uploadExamEvidenceImage | 405 | public uploadExamEvidenceImage(@UploadedFile() file?: UploadImageFile) | @Post(':id/exam-scores/evidence') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, // 5MB }, }), ) |

Exports: `ClassesController` (44).

### edutrack_be/src/modules/classes/classes.module.ts

[edutrack_be/src/modules/classes/classes.module.ts](../src/modules/classes/classes.module.ts) — 22 dòng.

Dependencies: `@nestjs/common`, `../school-management/school-management.module`, `../students/students.module`, `../schedules/schedules.module`, `../cloudinary/cloudinary.module`, `./classes.controller`, `./classes.service`, `./listeners/class-enrollment.listener`.

**ClassesModule** (dòng 10) @Module({ imports: [ SchoolManagementModule, StudentsModule, SchedulesModule, CloudinaryModule, ], controllers: [ClassesController], providers: [ClassesService, ClassEnrollmentListener], exports: [ClassesService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `ClassesModule` (10).

### edutrack_be/src/modules/classes/classes.service.ts

[edutrack_be/src/modules/classes/classes.service.ts](../src/modules/classes/classes.service.ts) — 3332 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `mongoose`, `../../common/utils/search-normalizer`, `../../common/utils/vietnam-time`, `../school-management/enums`, `../school-management/schemas/class.schema`, `../school-management/schemas/class-price-version.schema`, `../school-management/schemas/class-session.schema`, `../school-management/schemas/attendance.schema`, `../school-management/schemas/tuition-entry.schema`, `../school-management/schemas/exam.schema`, `../school-management/schemas/exam-score.schema`, `../school-management/schemas/class-enrollment.schema`, `../school-management/schemas/schedule-version.schema`, `../school-management/schemas/schedule-override.schema`, `../school-management/schemas/student.schema`, `../students/dto/create-student.dto`, `../students/students.service`, `../schedules/schedules.service`, `../schedules/schedule-conflicts.service`, `./dto/create-class.dto`, `./dto/create-fixed-schedule.dto`, `./dto/create-temporary-schedule.dto`, `./dto/query-classes.dto`, `./dto/save-class-session-content.dto`, `./dto/update-class.dto`, `./dto/update-temporary-schedule.dto`, `./dto/take-attendance.dto`, `./dto/take-attendance-batch.dto`, `./dto/create-exam.dto`, `./dto/update-exam.dto`, `./dto/take-exam-scores-batch.dto`, `./dto/suspend-fixed-schedule.dto`, `./dto/resume-fixed-schedule.dto`, `./dto/update-enrollment-status.dto`, `./attendance-tuition`.

**ClassesService** (dòng 287) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| create | 316 | public create(teacherId: string, dto: CreateClassDto) |  |
| findAll | 353 | public findAll(teacherId: string, query: QueryClassesDto = {}) |  |
| findDetail | 426 | public findDetail(teacherId: string, classId: string) |  |
| updateClass | 444 | public updateClass(teacherId: string, classId: string, dto: UpdateClassDto) |  |
| archiveClass | 576 | public archiveClass(teacherId: string, classId: string) |  |
| getSchedules | 609 | public getSchedules(teacherId: string, classId: string): Promise<ClassScheduleOverviewResponse> |  |
| saveFixedSchedule | 651 | public saveFixedSchedule(teacherId: string, classId: string, dto: CreateFixedScheduleDto) |  |
| saveFixedScheduleLocked | 661 | private saveFixedScheduleLocked(teacherId: string, classId: string, dto: CreateFixedScheduleDto) |  |
| suspendFixedSchedule | 751 | public suspendFixedSchedule(teacherId: string, classId: string, dto: SuspendFixedScheduleDto) |  |
| previewSuspendFixedSchedule | 816 | public previewSuspendFixedSchedule(teacherId: string, classId: string, suspendFromDate: string) |  |
| resumeFixedSchedule | 847 | public resumeFixedSchedule(teacherId: string, classId: string, dto: ResumeFixedScheduleDto) |  |
| createTemporarySchedule | 929 | public createTemporarySchedule(teacherId: string, classId: string, dto: CreateTemporaryScheduleDto) |  |
| createTemporaryScheduleLocked | 939 | private createTemporaryScheduleLocked(teacherId: string, classId: string, dto: CreateTemporaryScheduleDto) |  |
| updateTemporarySchedule | 969 | public updateTemporarySchedule(teacherId: string, classId: string, scheduleId: string, dto: UpdateTemporaryScheduleDto) |  |
| updateTemporaryScheduleLocked | 980 | private updateTemporaryScheduleLocked(teacherId: string, classId: string, scheduleId: string, dto: UpdateTemporaryScheduleDto) |  |
| revokeTemporarySchedule | 1055 | public revokeTemporarySchedule(teacherId: string, classId: string, scheduleId: string) |  |
| revokeTemporaryScheduleLocked | 1065 | private revokeTemporaryScheduleLocked(teacherId: string, classId: string, scheduleId: string) |  |
| saveSessionContent | 1095 | public saveSessionContent(teacherId: string, classId: string, dto: SaveClassSessionContentDto): Promise<ClassSessionResponse> |  |
| enrollExistingStudent | 1178 | public enrollExistingStudent(teacherId: string, classId: string, studentId: string) |  |
| enrollExistingStudents | 1197 | public enrollExistingStudents(teacherId: string, classId: string, studentIds: string[]): Promise<EnrollmentBulkResponse> |  |
| createStudentAndEnroll | 1242 | public createStudentAndEnroll(teacherId: string, classId: string, dto: CreateStudentDto) |  |
| removeStudentFromClass | 1276 | public removeStudentFromClass(teacherId: string, classId: string, studentId: string) |  |
| removeStudentsFromClass | 1318 | public removeStudentsFromClass(teacherId: string, classId: string, studentIds: string[]): Promise<RemoveStudentsBulkResponse> |  |
| getAttendance | 1383 | public getAttendance(teacherId: string, classId: string, dateString: string, startTimeString: string, endTimeString: string) |  |
| getAttendanceSheet | 1478 | public getAttendanceSheet(teacherId: string, classId: string) |  |
| takeAttendanceBatch | 1560 | public takeAttendanceBatch(teacherId: string, classId: string, dto: TakeAttendanceBatchDto) |  |
| takeAttendanceBatchLocked | 1570 | private takeAttendanceBatchLocked(teacherId: string, classId: string, dto: TakeAttendanceBatchDto) |  |
| takeAttendance | 1617 | public takeAttendance(teacherId: string, classId: string, dto: TakeAttendanceDto) |  |
| takeAttendanceLocked | 1627 | private takeAttendanceLocked(teacherId: string, classId: string, dto: TakeAttendanceDto) |  |
| saveAttendanceForSession | 1656 | private saveAttendanceForSession(teacherId: string, classId: string, dto: TakeAttendanceDto, dbSession?: ClientSession) |  |
| resolveSessionScheduleType | 1960 | private resolveSessionScheduleType(scheduleEventType?: AttendanceScheduleEventType) |  |
| getAttendanceOverview | 1982 | public getAttendanceOverview(teacherIdStr: string, classIdStr: string) |  |
| getPopulatedAttendanceSession | 2031 | private getPopulatedAttendanceSession(session: Types.ObjectId \| PopulatedAttendanceSession \| null \| undefined): PopulatedAttendanceSession \| null |  |
| getAttendanceSessionId | 2046 | private getAttendanceSessionId(session: Types.ObjectId \| PopulatedAttendanceSession \| null \| undefined) |  |
| findBilledTuitionLocks | 2060 | private findBilledTuitionLocks(teacherId: Types.ObjectId, classId: Types.ObjectId, attendanceIdValues: ObjectIdValue[], sessionIdValues: ObjectIdValue[], studentIdValues: ObjectIdValue[], dbSession?: ClientSession): Promise<AttendanceBillingLocks> |  |
| hasBilledTuitionEntry | 2124 | private hasBilledTuitionEntry(teacherId: Types.ObjectId, classId: Types.ObjectId, sessionId: Types.ObjectId, studentId: Types.ObjectId, attendanceId?: Types.ObjectId, dbSession?: ClientSession) |  |
| toUniqueObjectIds | 2149 | private toUniqueObjectIds(values: ObjectIdValue[]) |  |
| calculateAttendanceSummary | 2169 | private calculateAttendanceSummary(records: AttendanceSummaryRecord[]) |  |
| resolveClassColorIndex | 2193 | private resolveClassColorIndex(teacherId: Types.ObjectId, requestedColorIndex?: number) |  |
| normalizeColorIndex | 2224 | private normalizeColorIndex(colorIndex: number) |  |
| normalizeColorHex | 2232 | private normalizeColorHex(colorHex: string \| undefined) |  |
| countActiveStudentsInClass | 2246 | private countActiveStudentsInClass(teacherId: Types.ObjectId, classId: Types.ObjectId) |  |
| deactivateClassEnrollments | 2259 | private deactivateClassEnrollments(teacherId: Types.ObjectId, classId: Types.ObjectId) |  |
| findClassForTeacherOrThrow | 2280 | private findClassForTeacherOrThrow(teacherId: string, classId: string \| Types.ObjectId, session?: ClientSession) |  |
| findActiveStudentsInClass | 2307 | private findActiveStudentsInClass(teacherId: string, classId: Types.ObjectId) |  |
| createActiveEnrollment | 2334 | private createActiveEnrollment(teacherId: string, classId: Types.ObjectId, studentId: Types.ObjectId, session?: ClientSession) |  |
| createStudentEnrollmentEntities | 2398 | private createStudentEnrollmentEntities(teacherId: string, classId: string, dto: CreateStudentDto, session?: ClientSession): Promise<StudentEnrollmentCreationResult> |  |
| toClassResponse | 2423 | private toClassResponse(classroom: ClassDocument, studentCount: number, latestFixedSchedule: LatestFixedScheduleResponse \| null = null): ClassResponse |  |
| resolvePriceEffectiveFrom | 2445 | private resolvePriceEffectiveFrom(value?: string) |  |
| ensureClassPriceBaseline | 2453 | private ensureClassPriceBaseline(teacherId: Types.ObjectId, classroom: ClassDocument) |  |
| upsertClassPriceVersion | 2479 | private upsertClassPriceVersion(teacherId: Types.ObjectId, classId: Types.ObjectId, price: PriceSnapshot, effectiveFrom: Date) |  |
| findClassPriceForDate | 2511 | private findClassPriceForDate(teacherId: Types.ObjectId, classroom: ClassDocument, sessionDate: Date, dbSession?: ClientSession): Promise<PriceSnapshot> |  |
| getFallbackClassPrice | 2534 | private getFallbackClassPrice(classroom: ClassDocument): PriceSnapshot |  |
| normalizeSlot | 2541 | private normalizeSlot(slot: ScheduleSlotDto): ClassScheduleSlotResponse |  |
| buildTemporarySchedulePayload | 2557 | private buildTemporarySchedulePayload(dto: CreateTemporaryScheduleDto) |  |
| buildOptionalTemporaryTimePayload | 2621 | private buildOptionalTemporaryTimePayload(startTime: string \| undefined, endTime: string \| undefined) |  |
| findLatestFixedScheduleMap | 2641 | private findLatestFixedScheduleMap(teacherId: Types.ObjectId, classIds: Types.ObjectId[]) |  |
| findLatestFixedSchedule | 2674 | private findLatestFixedSchedule(teacherId: Types.ObjectId, classId: Types.ObjectId) |  |
| toLatestFixedScheduleResponse | 2690 | private toLatestFixedScheduleResponse(schedule: LeanScheduleVersion): LatestFixedScheduleResponse |  |
| toScheduleOverrideResponse | 2704 | private toScheduleOverrideResponse(schedule: LeanScheduleOverride \| ScheduleOverrideDocument): ScheduleOverrideResponse |  |
| toClassSessionResponse | 2727 | private toClassSessionResponse(session: ClassSessionDocument): ClassSessionResponse |  |
| toVietnamScheduleSlot | 2747 | private toVietnamScheduleSlot(slot: ClassScheduleSlotResponse, timeStorage?: 'utc' \| 'vietnam') |  |
| toVietnamTime | 2764 | private toVietnamTime(time: string \| undefined, timeStorage?: 'utc' \| 'vietnam') |  |
| toEnrollmentResponse | 2775 | private toEnrollmentResponse(enrollment: ClassEnrollmentDocument, student: StudentDocument): EnrollmentResponse |  |
| getEnrollmentErrorMessage | 2790 | private getEnrollmentErrorMessage(error: unknown) |  |
| toObjectId | 2821 | private toObjectId(value: string, fieldName: string) |  |
| parseDate | 2829 | private parseDate(value: string, label: string) |  |
| toVietnamDateKey | 2861 | private toVietnamDateKey(date: Date) |  |
| getCurrentVietnamDate | 2870 | private getCurrentVietnamDate() |  |
| requireDate | 2874 | private requireDate(value: string \| undefined, label: string) |  |
| requireTime | 2882 | private requireTime(value: string \| undefined, label: string) |  |
| getPreviousMoment | 2890 | private getPreviousMoment(date: Date) |  |
| isStartBeforeEnd | 2894 | private isStartBeforeEnd(startTime: string, endTime: string) |  |
| buildClassSessionSourceKey | 2898 | private buildClassSessionSourceKey(classId: string, date: string, startTime: string, endTime: string) |  |
| updateStudentEnrollmentStatus | 2907 | public updateStudentEnrollmentStatus(teacherId: string, classId: string, studentId: string, dto: UpdateEnrollmentStatusDto) |  |
| getEnrollmentDetail | 2944 | private getEnrollmentDetail(enrollment: ClassEnrollmentDocument) |  |
| hardDeleteStudentFromClass | 2955 | public hardDeleteStudentFromClass(teacherId: string, classId: string, studentId: string) |  |
| getExamSheet | 3004 | public getExamSheet(teacherIdStr: string, classIdStr: string) |  |
| createExam | 3050 | public createExam(teacherIdStr: string, classIdStr: string, dto: CreateExamDto) |  |
| updateExam | 3084 | public updateExam(teacherIdStr: string, classIdStr: string, examIdStr: string, dto: UpdateExamDto) |  |
| deleteExam | 3127 | public deleteExam(teacherIdStr: string, classIdStr: string, examIdStr: string) |  |
| takeExamScoresBatch | 3176 | public takeExamScoresBatch(teacherIdStr: string, classIdStr: string, dto: TakeExamScoresBatchDto) |  |
| isDuplicateKeyError | 3293 | private isDuplicateKeyError(error: unknown) |  |
| isTransactionUnsupportedError | 3302 | private isTransactionUnsupportedError(error: unknown) |  |
| getErrorCode | 3319 | private getErrorCode(error: unknown) |  |

Exports: `ClassScheduleSlotResponse` (97), `LatestFixedScheduleResponse` (103), `ScheduleOverrideResponse` (111), `ClassSessionResponse` (124), `ClassResponse` (136), `ClassDetailResponse` (152), `ClassScheduleOverviewResponse` (156), `EnrollmentResponse` (163), `EnrollmentBulkError` (173), `EnrollmentBulkResponse` (179), `RemoveStudentsBulkResponse` (187), `ClassesService` (287).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 97
export type ClassScheduleSlotResponse = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
// line 103
export type LatestFixedScheduleResponse = {
  id: string;
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  schedules: ClassScheduleSlotResponse[];
};
// line 111
export type ScheduleOverrideResponse = {
  id: string;
  classId: string;
  action: ScheduleOverrideAction;
  originalDate?: Date;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate?: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
};
// line 124
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
// line 136
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
  priceEffectiveFrom?: Date | null;
  status: ClassStatus;
  studentCount: number;
  latestFixedSchedule: LatestFixedScheduleResponse | null;
};
// line 152
export type ClassDetailResponse = ClassResponse & {
  students: StudentResponse[];
};
// line 156
export type ClassScheduleOverviewResponse = {
  fixedSchedules: LatestFixedScheduleResponse[];
  latestFixedSchedule: LatestFixedScheduleResponse | null;
  isFixedScheduleSuspended: boolean;
  temporarySchedules: ScheduleOverrideResponse[];
};
// line 163
export type EnrollmentResponse = {
  id: string;
  classId: string;
  studentId: string;
  status: EnrollmentStatus;
  joinedAt: Date;
  leftAt?: Date | null;
  student: StudentResponse;
};
// line 173
export type EnrollmentBulkError = {
  studentId: string;
  studentName?: string;
  message: string;
};
// line 179
export type EnrollmentBulkResponse = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  enrollments: EnrollmentResponse[];
  errors: EnrollmentBulkError[];
};
// line 187
export type RemoveStudentsBulkResponse = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  removedStudents: StudentResponse[];
  errors: EnrollmentBulkError[];
};
// line 195
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
// line 209
type EnrollmentCount = {
  _id: Types.ObjectId;
  count: number;
};
// line 214
type StudentEnrollmentCreationResult = {
  enrollment: ClassEnrollmentDocument;
  student: StudentDocument;
};
// line 219
type PriceSnapshot = {
  regularPrice: number;
  makeupPrice: number;
};
// line 224
type LeanScheduleOverride = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  action: ScheduleOverrideAction;
  originalDate?: Date;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate?: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
  timeStorage?: 'utc' | 'vietnam';
};
// line 238
type PopulatedAttendanceStudent = {
  _id: Types.ObjectId;
  fullName: string;
  studentCode: string;
  avatarUrl?: string;
};
// line 245
type LeanAttendanceWithStudent = {
  _id: Types.ObjectId;
  studentId: PopulatedAttendanceStudent;
  status: AttendanceStatus;
  note?: string;
  isBilled?: boolean;
};
// line 253
type PopulatedAttendanceSession = {
  _id: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  timeStorage?: 'utc' | 'vietnam';
};
// line 261
type LeanAttendanceSheetRecord = {
  _id: Types.ObjectId;
  sessionId?: Types.ObjectId | PopulatedAttendanceSession | null;
  studentId: Types.ObjectId;
  status: AttendanceStatus;
  note?: string;
  isBilled?: boolean;
};
// line 270
type LeanBilledTuitionLock = {
  attendanceId?: Types.ObjectId | null;
  sessionId?: Types.ObjectId | null;
  studentId?: Types.ObjectId | null;
};
// line 276
type AttendanceSummaryRecord = {
  status: AttendanceStatus;
};
// line 280
type AttendanceBillingLocks = {
  attendanceIds: Set<string>;
  sessionStudentKeys: Set<string>;
};
// line 285
type ObjectIdValue = Types.ObjectId | string | null | undefined;
```

### edutrack_be/src/modules/classes/dto/create-class.dto.ts

[edutrack_be/src/modules/classes/dto/create-class.dto.ts](../src/modules/classes/dto/create-class.dto.ts) — 57 dòng.

Dependencies: `class-transformer`, `class-validator`.

**CreateClassDto** (dòng 14) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| name | 15 | string | @IsString() @MaxLength(120) |
| description | 19 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| imageUrl | 24 | string (optional) | @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) |
| colorIndex | 29 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(7) |
| colorHex | 36 | string (optional) | @IsOptional() @IsString() @Matches(/^#([0-9a-fA-F]{6})$/, { message: 'Màu lớp học phải có dạng #RRGGBB.', }) |
| regularPrice | 43 | number | @Type(() => Number) @IsInt() @Min(0) |
| makeupPrice | 48 | number | @Type(() => Number) @IsInt() @Min(0) |
| priceEffectiveFrom | 53 | string (optional) | @IsOptional() @IsDateString() |

Exports: `CreateClassDto` (14).

### edutrack_be/src/modules/classes/dto/create-exam.dto.ts

[edutrack_be/src/modules/classes/dto/create-exam.dto.ts](../src/modules/classes/dto/create-exam.dto.ts) — 35 dòng.

Dependencies: `class-validator`.

**CreateExamDto** (dòng 10) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| title | 11 | string | @IsString() @IsNotEmpty({ message: 'Tên bài kiểm tra không được để trống.' }) |
| testDate | 15 | string | @IsDateString({}, { message: 'Ngày kiểm tra không hợp lệ.' }) @IsNotEmpty({ message: 'Ngày kiểm tra không được để trống.' }) |
| maxScore | 19 | number | @IsNumber() @Min(0, { message: 'Điểm tối đa không được nhỏ hơn 0.' }) |
| description | 23 | string (optional) | @IsString() @IsOptional() |
| fileUrl | 27 | string (optional) | @IsString() @IsOptional() |
| fileName | 31 | string (optional) | @IsString() @IsOptional() |

Exports: `CreateExamDto` (10).

### edutrack_be/src/modules/classes/dto/create-fixed-schedule.dto.ts

[edutrack_be/src/modules/classes/dto/create-fixed-schedule.dto.ts](../src/modules/classes/dto/create-fixed-schedule.dto.ts) — 39 dòng.

Dependencies: `class-transformer`, `class-validator`.

**ScheduleSlotDto** (dòng 15) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| dayOfWeek | 16 | number | @Type(() => Number) @IsInt() @Min(1) @Max(7) |
| startTime | 22 | string | @Matches(timePattern) |
| endTime | 25 | string | @Matches(timePattern) |

**CreateFixedScheduleDto** (dòng 29) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| effectiveFrom | 30 | string | @IsDateString() |
| schedules | 33 | ScheduleSlotDto[] | @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ScheduleSlotDto) |

Exports: `ScheduleSlotDto` (15), `CreateFixedScheduleDto` (29).

### edutrack_be/src/modules/classes/dto/create-temporary-schedule.dto.ts

[edutrack_be/src/modules/classes/dto/create-temporary-schedule.dto.ts](../src/modules/classes/dto/create-temporary-schedule.dto.ts) — 46 dòng.

Dependencies: `class-validator`, `../../school-management/enums`.

**CreateTemporaryScheduleDto** (dòng 13) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| action | 14 | ScheduleOverrideAction | @IsEnum(ScheduleOverrideAction) |
| originalDate | 17 | string (optional) | @IsOptional() @IsDateString() |
| originalStartTime | 21 | string (optional) | @IsOptional() @Matches(timePattern) |
| originalEndTime | 25 | string (optional) | @IsOptional() @Matches(timePattern) |
| newDate | 29 | string (optional) | @IsOptional() @IsDateString() |
| startTime | 33 | string (optional) | @IsOptional() @Matches(timePattern) |
| endTime | 37 | string (optional) | @IsOptional() @Matches(timePattern) |
| reason | 41 | string (optional) | @IsOptional() @IsString() @MaxLength(300) |

Exports: `CreateTemporaryScheduleDto` (13).

### edutrack_be/src/modules/classes/dto/enroll-existing-student.dto.ts

[edutrack_be/src/modules/classes/dto/enroll-existing-student.dto.ts](../src/modules/classes/dto/enroll-existing-student.dto.ts) — 7 dòng.

Dependencies: `class-validator`.

**EnrollExistingStudentDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentId | 4 | string | @IsMongoId() |

Exports: `EnrollExistingStudentDto` (3).

### edutrack_be/src/modules/classes/dto/enroll-existing-students.dto.ts

[edutrack_be/src/modules/classes/dto/enroll-existing-students.dto.ts](../src/modules/classes/dto/enroll-existing-students.dto.ts) — 15 dòng.

Dependencies: `class-validator`.

**EnrollExistingStudentsDto** (dòng 8) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentIds | 9 | string[] | @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @IsMongoId({ each: true }) |

Exports: `EnrollExistingStudentsDto` (8).

### edutrack_be/src/modules/classes/dto/query-classes.dto.ts

[edutrack_be/src/modules/classes/dto/query-classes.dto.ts](../src/modules/classes/dto/query-classes.dto.ts) — 8 dòng.

Dependencies: `class-validator`.

**QueryClassesDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| search | 4 | string (optional) | @IsOptional() @IsString() |

Exports: `QueryClassesDto` (3).

### edutrack_be/src/modules/classes/dto/remove-existing-students.dto.ts

[edutrack_be/src/modules/classes/dto/remove-existing-students.dto.ts](../src/modules/classes/dto/remove-existing-students.dto.ts) — 15 dòng.

Dependencies: `class-validator`.

**RemoveExistingStudentsDto** (dòng 8) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentIds | 9 | string[] | @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @IsMongoId({ each: true }) |

Exports: `RemoveExistingStudentsDto` (8).

### edutrack_be/src/modules/classes/dto/resume-fixed-schedule.dto.ts

[edutrack_be/src/modules/classes/dto/resume-fixed-schedule.dto.ts](../src/modules/classes/dto/resume-fixed-schedule.dto.ts) — 7 dòng.

Dependencies: `class-validator`.

**ResumeFixedScheduleDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| resumeFrom | 4 | string | @IsDateString() |

Exports: `ResumeFixedScheduleDto` (3).

### edutrack_be/src/modules/classes/dto/save-class-session-content.dto.ts

[edutrack_be/src/modules/classes/dto/save-class-session-content.dto.ts](../src/modules/classes/dto/save-class-session-content.dto.ts) — 37 dòng.

Dependencies: `class-validator`, `../../school-management/enums`.

**SaveClassSessionContentDto** (dòng 13) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| date | 14 | string | @IsDateString() |
| startTime | 17 | string | @Matches(timePattern) |
| endTime | 20 | string | @Matches(timePattern) |
| scheduleType | 23 | ScheduleType (optional) | @IsOptional() @IsEnum(ScheduleType) |
| topic | 27 | string (optional) | @IsOptional() @IsString() @MaxLength(160) |
| content | 32 | string (optional) | @IsOptional() @IsString() @MaxLength(1200) |

Exports: `SaveClassSessionContentDto` (13).

### edutrack_be/src/modules/classes/dto/suspend-fixed-schedule.dto.ts

[edutrack_be/src/modules/classes/dto/suspend-fixed-schedule.dto.ts](../src/modules/classes/dto/suspend-fixed-schedule.dto.ts) — 12 dòng.

Dependencies: `class-validator`.

**SuspendFixedScheduleDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| suspendFrom | 4 | string | @IsDateString() |
| reason | 7 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |

Exports: `SuspendFixedScheduleDto` (3).

### edutrack_be/src/modules/classes/dto/take-attendance-batch.dto.ts

[edutrack_be/src/modules/classes/dto/take-attendance-batch.dto.ts](../src/modules/classes/dto/take-attendance-batch.dto.ts) — 11 dòng.

Dependencies: `class-transformer`, `class-validator`, `./take-attendance.dto`.

**TakeAttendanceBatchDto** (dòng 5) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| sessions | 6 | TakeAttendanceDto[] | @IsArray() @ValidateNested({ each: true }) @Type(() => TakeAttendanceDto) |

Exports: `TakeAttendanceBatchDto` (5).

### edutrack_be/src/modules/classes/dto/take-attendance.dto.ts

[edutrack_be/src/modules/classes/dto/take-attendance.dto.ts](../src/modules/classes/dto/take-attendance.dto.ts) — 53 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../school-management/enums`.

**TakeAttendanceRecordDto** (dòng 20) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentId | 21 | string | @IsMongoId() |
| status | 24 | AttendanceStatus (optional) | @IsOptional() @IsEnum(AttendanceStatus) |
| note | 28 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |

**TakeAttendanceDto** (dòng 34) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| date | 35 | string | @IsDateString() |
| startTime | 38 | string | @Matches(timePattern) |
| endTime | 41 | string | @Matches(timePattern) |
| scheduleEventType | 44 | AttendanceScheduleEventType (optional) | @IsOptional() @IsIn(['fixed', 'extra', 'one_on_one', 'reschedule', 'manual']) |
| records | 48 | TakeAttendanceRecordDto[] | @IsArray() @ValidateNested({ each: true }) @Type(() => TakeAttendanceRecordDto) |

Exports: `AttendanceScheduleEventType` (17), `TakeAttendanceRecordDto` (20), `TakeAttendanceDto` (34).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 17
export type AttendanceScheduleEventType =
  'fixed' | 'extra' | 'one_on_one' | 'reschedule' | 'manual';
```

### edutrack_be/src/modules/classes/dto/take-exam-scores-batch.dto.ts

[edutrack_be/src/modules/classes/dto/take-exam-scores-batch.dto.ts](../src/modules/classes/dto/take-exam-scores-batch.dto.ts) — 53 dòng.

Dependencies: `class-transformer`, `class-validator`.

**ExamScoreEntryDto** (dòng 15) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| examId | 16 | string | @IsMongoId({ message: 'ID bài kiểm tra không hợp lệ.' }) @IsNotEmpty({ message: 'ID bài kiểm tra không được để trống.' }) |
| studentId | 20 | string | @IsMongoId({ message: 'ID học sinh không hợp lệ.' }) @IsNotEmpty({ message: 'ID học sinh không được để trống.' }) |
| score | 24 | number \| null (optional) | @IsOptional() @ValidateIf( (entry: ExamScoreEntryDto) => entry.score !== null && entry.score !== undefined, ) @IsNumber( { allowInfinity: false, allowNaN: false }, { message: 'Điểm số phải là một số.' }, ) @Min(0, { message: 'Điểm số không được nhỏ hơn 0.' }) |
| note | 36 | string (optional) | @IsString() @IsOptional() @MaxLength(80, { message: 'Ghi chú điểm không được vượt quá 80 ký tự.' }) |
| evidenceImages | 41 | string[] (optional) | @IsArray() @IsString({ each: true }) @IsOptional() |

**TakeExamScoresBatchDto** (dòng 47) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| scores | 48 | ExamScoreEntryDto[] | @IsArray() @ValidateNested({ each: true }) @Type(() => ExamScoreEntryDto) |

Exports: `ExamScoreEntryDto` (15), `TakeExamScoresBatchDto` (47).

### edutrack_be/src/modules/classes/dto/update-class.dto.ts

[edutrack_be/src/modules/classes/dto/update-class.dto.ts](../src/modules/classes/dto/update-class.dto.ts) — 66 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../school-management/enums`.

**UpdateClassDto** (dòng 16) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| name | 17 | string (optional) | @IsOptional() @IsString() @MaxLength(120) |
| description | 22 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| imageUrl | 27 | string (optional) | @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) |
| colorIndex | 32 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(7) |
| colorHex | 39 | string (optional) | @IsOptional() @IsString() @Matches(/^#([0-9a-fA-F]{6})$/, { message: 'Màu lớp học phải có dạng #RRGGBB.', }) |
| regularPrice | 46 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) |
| makeupPrice | 52 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) |
| priceEffectiveFrom | 58 | string (optional) | @IsOptional() @IsDateString() |
| status | 62 | ClassStatus (optional) | @IsOptional() @IsEnum(ClassStatus) |

Exports: `UpdateClassDto` (16).

### edutrack_be/src/modules/classes/dto/update-enrollment-status.dto.ts

[edutrack_be/src/modules/classes/dto/update-enrollment-status.dto.ts](../src/modules/classes/dto/update-enrollment-status.dto.ts) — 13 dòng.

Dependencies: `class-validator`, `../../school-management/enums`.

**UpdateEnrollmentStatusDto** (dòng 4) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| status | 5 | EnrollmentStatus | @IsEnum(EnrollmentStatus) |
| reason | 8 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |

Exports: `UpdateEnrollmentStatusDto` (4).

### edutrack_be/src/modules/classes/dto/update-exam.dto.ts

[edutrack_be/src/modules/classes/dto/update-exam.dto.ts](../src/modules/classes/dto/update-exam.dto.ts) — 5 dòng.

Dependencies: `@nestjs/mapped-types`, `./create-exam.dto`.

**UpdateExamDto** (dòng 4) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `UpdateExamDto` (4).

### edutrack_be/src/modules/classes/dto/update-temporary-schedule.dto.ts

[edutrack_be/src/modules/classes/dto/update-temporary-schedule.dto.ts](../src/modules/classes/dto/update-temporary-schedule.dto.ts) — 46 dòng.

Dependencies: `class-validator`, `../../school-management/enums`.

**UpdateTemporaryScheduleDto** (dòng 13) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| action | 14 | ScheduleOverrideAction | @IsEnum(ScheduleOverrideAction) |
| originalDate | 17 | string (optional) | @IsOptional() @IsDateString() |
| originalStartTime | 21 | string (optional) | @IsOptional() @Matches(timePattern) |
| originalEndTime | 25 | string (optional) | @IsOptional() @Matches(timePattern) |
| newDate | 29 | string (optional) | @IsOptional() @IsDateString() |
| startTime | 33 | string (optional) | @IsOptional() @Matches(timePattern) |
| endTime | 37 | string (optional) | @IsOptional() @Matches(timePattern) |
| reason | 41 | string (optional) | @IsOptional() @IsString() @MaxLength(300) |

Exports: `UpdateTemporaryScheduleDto` (13).

### edutrack_be/src/modules/classes/listeners/class-enrollment.listener.ts

[edutrack_be/src/modules/classes/listeners/class-enrollment.listener.ts](../src/modules/classes/listeners/class-enrollment.listener.ts) — 53 dòng.

Dependencies: `@nestjs/common`, `@nestjs/event-emitter`, `@nestjs/mongoose`, `mongoose`, `../../school-management/enums`, `../../school-management/schemas/class-enrollment.schema`.

**ClassEnrollmentListener** (dòng 11) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| handleStudentDeletedEvent | 18 | public handleStudentDeletedEvent(payload: { teacherId: string; studentId: string; }) | @OnEvent('student.deleted') |
| handleStudentDeactivatedEvent | 31 | public handleStudentDeactivatedEvent(payload: { teacherId: string; studentId: string; }) | @OnEvent('student.deactivated') |

Exports: `ClassEnrollmentListener` (11).

### edutrack_be/src/modules/cloudinary/cloudinary.module.ts

[edutrack_be/src/modules/cloudinary/cloudinary.module.ts](../src/modules/cloudinary/cloudinary.module.ts) — 9 dòng.

Dependencies: `@nestjs/common`, `./cloudinary.service`.

**CloudinaryModule** (dòng 4) @Module({ providers: [CloudinaryService], exports: [CloudinaryService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `CloudinaryModule` (4).

### edutrack_be/src/modules/cloudinary/cloudinary.service.ts

[edutrack_be/src/modules/cloudinary/cloudinary.service.ts](../src/modules/cloudinary/cloudinary.service.ts) — 276 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `crypto`.

**CloudinaryService** (dòng 41) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| uploadInvoiceImage | 45 | public uploadInvoiceImage(file: UploadImageFile, teacherId: string) |  |
| deleteInvoiceImage | 54 | public deleteInvoiceImage(publicId: string) |  |
| uploadStudentAvatar | 76 | public uploadStudentAvatar(file: UploadImageFile) |  |
| uploadTeacherAvatar | 84 | public uploadTeacherAvatar(file: UploadImageFile) |  |
| uploadTeacherMedia | 92 | public uploadTeacherMedia(file: UploadImageFile, teacherId: string) |  |
| uploadClassImage | 115 | public uploadClassImage(file: UploadImageFile) |  |
| uploadExamFile | 123 | public uploadExamFile(file: UploadImageFile) |  |
| uploadExamEvidenceImage | 131 | public uploadExamEvidenceImage(file: UploadImageFile) |  |
| uploadReceiptPdf | 139 | public uploadReceiptPdf(file: UploadImageFile) |  |
| uploadReceiptPaymentProof | 158 | public uploadReceiptPaymentProof(file: UploadImageFile) |  |
| uploadFile | 166 | private uploadFile(file: UploadImageFile, folder: string, resourceType: 'image' \| 'raw' \| 'video' \| 'auto' = 'image', options: CloudinaryUploadOptions = {}): Promise<CloudinaryUploadResponse> |  |
| ensureFileExtension | 240 | private ensureFileExtension(fileName: string, extension: string) |  |
| toSafeCloudinaryPublicId | 248 | private toSafeCloudinaryPublicId(fileName: string) |  |
| createSignature | 265 | private createSignature(params: Record<string, string>, apiSecret: string) |  |

Exports: `UploadImageFile` (10), `CloudinaryUploadResponse` (17), `CloudinaryService` (41).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 10
export type UploadImageFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};
// line 17
export type CloudinaryUploadResponse = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
};
// line 24
type CloudinaryUploadPayload = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  error?: {
    message?: string;
  };
};
// line 34
type CloudinaryUploadOptions = {
  timeoutMs?: number;
  publicId?: string;
  overwrite?: boolean;
  filenameOverride?: string;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 68: `fetch('https://api.cloudinary.com/v1_1/${cloudName}/image/destroy', { method: 'POST', body, signal: AbortSignal.timeout(30000) })`
- Dòng 214: `fetch('https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload', { method: 'POST', body: formData, ...(options.timeoutMs ? { signal: AbortSignal.timeout(options.timeoutMs) } : {}), })`

### edutrack_be/src/modules/dashboard/dashboard.controller.ts

[edutrack_be/src/modules/dashboard/dashboard.controller.ts](../src/modules/dashboard/dashboard.controller.ts) — 17 dòng.

Dependencies: `@nestjs/common`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `./dashboard.service`.

**DashboardController** (dòng 7) @Controller('dashboard') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getOverview | 12 | public getOverview(@CurrentUser() user: JwtUser) | @Get('overview') |

Exports: `DashboardController` (7).

### edutrack_be/src/modules/dashboard/dashboard.module.ts

[edutrack_be/src/modules/dashboard/dashboard.module.ts](../src/modules/dashboard/dashboard.module.ts) — 13 dòng.

Dependencies: `@nestjs/common`, `../school-management/school-management.module`, `../schedules/schedules.module`, `./dashboard.controller`, `./dashboard.service`.

**DashboardModule** (dòng 7) @Module({ imports: [SchoolManagementModule, SchedulesModule], controllers: [DashboardController], providers: [DashboardService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `DashboardModule` (7).

### edutrack_be/src/modules/dashboard/dashboard.service.ts

[edutrack_be/src/modules/dashboard/dashboard.service.ts](../src/modules/dashboard/dashboard.service.ts) — 443 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `mongoose`, `../school-management/enums`, `../school-management/schemas`, `../schedules/schedules.service`.

**DashboardService** (dòng 62) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getOverview | 76 | public getOverview(teacherIdStr: string) |  |
| toTodayLesson | 188 | private toTodayLesson(event: TeacherScheduleEventResponse, currentMinutes: number) |  |
| resolveLessonTitle | 200 | private resolveLessonTitle(event: TeacherScheduleEventResponse) |  |
| resolveLessonStatus | 204 | private resolveLessonStatus(event: TeacherScheduleEventResponse, currentMinutes: number) |  |
| resolveScheduleTypeLabel | 226 | private resolveScheduleTypeLabel(type: TeacherScheduleEventResponse['type']) |  |
| buildRevenueStats | 250 | private buildRevenueStats(receipts: RevenueReceipt[]) |  |
| sumPaidAmount | 285 | private sumPaidAmount(receipts: RevenueReceipt[]) |  |
| buildMonthlyRevenue | 292 | private buildMonthlyRevenue(receipts: RevenueReceipt[], year: number) |  |
| resolveReceiptPaidAmount | 324 | private resolveReceiptPaidAmount(receipt: RevenueReceipt) |  |
| toPendingPaymentItem | 334 | private toPendingPaymentItem(receipt: PendingReceipt) |  |
| getReceiptClassNames | 362 | private getReceiptClassNames(receipt: PendingReceipt) |  |
| getReceiptClassColor | 371 | private getReceiptClassColor(receipt: PendingReceipt) |  |
| uniqueNonEmpty | 378 | private uniqueNonEmpty(values: unknown[]) |  |
| getVietnamNowContext | 393 | private getVietnamNowContext(now = new Date()) |  |
| parseTimeToMinutes | 413 | private parseTimeToMinutes(time?: string) |  |
| resolveMoney | 427 | private resolveMoney(value?: number) |  |
| toObjectId | 435 | private toObjectId(value: string, fieldName: string) |  |

Exports: `DashboardService` (62).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 28
type RevenueReceipt = {
  _id: Types.ObjectId;
  issuedAt?: Date;
  paidAmount?: number;
  paidAt?: Date;
  paymentStatus: PaymentStatus;
  totalAmount?: number;
};
// line 37
type ReceiptClassSnapshotLite = {
  classId?: Types.ObjectId;
  className?: string;
  colorHex?: string;
};
// line 43
type PendingReceipt = RevenueReceipt & {
  classId?: Types.ObjectId;
  classSnapshot?: ReceiptClassSnapshotLite;
  classSnapshots?: ReceiptClassSnapshotLite[];
  dueDate?: Date;
  lessonCount?: number;
  periodEnd?: Date;
  periodStart?: Date;
  pdfStatus?: ReceiptPdfStatus;
  receiptNumber?: string;
  studentId?: Types.ObjectId;
  studentSnapshot?: {
    fullName?: string;
    parentName?: string;
    parentPhone?: string;
    studentCode?: string;
  };
};
```

### edutrack_be/src/modules/invoice-template/constants/default-invoice-template.ts

[edutrack_be/src/modules/invoice-template/constants/default-invoice-template.ts](../src/modules/invoice-template/constants/default-invoice-template.ts) — 36 dòng.

Dependencies: `../schemas/invoice-template.schema`, `./system-invoice-v2`.

Exports: `SYSTEM_INVOICE_TEMPLATE_ID` (7), `SYSTEM_INVOICE_TEMPLATE_VERSION` (8), `SYSTEM_INVOICE_TEMPLATE_HTML` (9), `SYSTEM_INVOICE_TEMPLATE_CSS` (10), `SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA` (11), `SYSTEM_INVOICE_TEMPLATE` (23).

### edutrack_be/src/modules/invoice-template/constants/invoice-fields.ts

[edutrack_be/src/modules/invoice-template/constants/invoice-fields.ts](../src/modules/invoice-template/constants/invoice-fields.ts) — 124 dòng.

Exports: `InvoiceFieldFormatter` (1), `InvoiceDynamicField` (3), `INVOICE_DYNAMIC_FIELDS` (11), `INVOICE_DYNAMIC_FIELD_MAP` (120).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export type InvoiceFieldFormatter = 'date' | 'money';
// line 3
export type InvoiceDynamicField = {
  key: string;
  label: string;
  category: 'BASIC' | 'STUDENT' | 'CLASS' | 'TUITION' | 'TEACHER' | 'INVOICE';
  previewValue: string;
  formatter?: InvoiceFieldFormatter;
};
```

### edutrack_be/src/modules/invoice-template/constants/invoice-regions.ts

[edutrack_be/src/modules/invoice-template/constants/invoice-regions.ts](../src/modules/invoice-template/constants/invoice-regions.ts) — 58 dòng.

Functions: `invoiceRegionPlaceholder(key: InvoiceRegionKey)` (dòng 21).

Exports: `INVOICE_REGIONS` (1), `InvoiceRegionKey` (16), `INVOICE_REGION_KEYS` (17), `invoiceRegionPlaceholder` (21), `INVOICE_REGION_CSS` (54).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 16
export type InvoiceRegionKey = (typeof INVOICE_REGIONS)[number]['key'];
```

### edutrack_be/src/modules/invoice-template/constants/legacy-invoice-template.ts

[edutrack_be/src/modules/invoice-template/constants/legacy-invoice-template.ts](../src/modules/invoice-template/constants/legacy-invoice-template.ts) — 181 dòng.

Dependencies: `../schemas/invoice-template.schema`.

Exports: `SYSTEM_INVOICE_TEMPLATE_ID` (6), `SYSTEM_INVOICE_TEMPLATE_VERSION` (7), `SYSTEM_INVOICE_TEMPLATE_HTML` (9), `SYSTEM_INVOICE_TEMPLATE_CSS` (71), `SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA` (154), `SYSTEM_INVOICE_TEMPLATE` (168).

### edutrack_be/src/modules/invoice-template/constants/preview-receipt.ts

[edutrack_be/src/modules/invoice-template/constants/preview-receipt.ts](../src/modules/invoice-template/constants/preview-receipt.ts) — 56 dòng.

Exports: `PREVIEW_RECEIPT` (1).

### edutrack_be/src/modules/invoice-template/constants/system-invoice-v2.ts

[edutrack_be/src/modules/invoice-template/constants/system-invoice-v2.ts](../src/modules/invoice-template/constants/system-invoice-v2.ts) — 32 dòng.

Dependencies: `../../receipts/receipt-template.layout`, `../../receipts/receipt-template.styles`, `./invoice-regions`.

Exports: `SYSTEM_V2_HTML` (8), `SYSTEM_V2_CSS` (28).

### edutrack_be/src/modules/invoice-template/dto/create-invoice-template.dto.ts

[edutrack_be/src/modules/invoice-template/dto/create-invoice-template.dto.ts](../src/modules/invoice-template/dto/create-invoice-template.dto.ts) — 43 dòng.

Dependencies: `class-transformer`, `class-validator`.

**CreateInvoiceTemplateDto** (dòng 11) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| name | 12 | string | @IsString() @MaxLength(120) |
| basedOnVersion | 16 | string (optional) | @IsOptional() @IsString() @MaxLength(80) |
| editorData | 21 | Record<string, unknown> | @IsObject() |
| html | 24 | string | @IsString() @MaxLength(700000) |
| css | 28 | string (optional) | @IsOptional() @IsString() @MaxLength(300000) |
| thumbnailUrl | 33 | string (optional) | @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) |
| isDefault | 38 | boolean (optional) | @IsOptional() @Type(() => Boolean) @IsBoolean() |

Exports: `CreateInvoiceTemplateDto` (11).

### edutrack_be/src/modules/invoice-template/dto/duplicate-invoice-template.dto.ts

[edutrack_be/src/modules/invoice-template/dto/duplicate-invoice-template.dto.ts](../src/modules/invoice-template/dto/duplicate-invoice-template.dto.ts) — 15 dòng.

Dependencies: `class-transformer`, `class-validator`.

**DuplicateInvoiceTemplateDto** (dòng 4) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| name | 5 | string (optional) | @IsOptional() @IsString() @MaxLength(120) |
| isDefault | 10 | boolean (optional) | @IsOptional() @Type(() => Boolean) @IsBoolean() |

Exports: `DuplicateInvoiceTemplateDto` (4).

### edutrack_be/src/modules/invoice-template/dto/preview-invoice-template.dto.ts

[edutrack_be/src/modules/invoice-template/dto/preview-invoice-template.dto.ts](../src/modules/invoice-template/dto/preview-invoice-template.dto.ts) — 12 dòng.

Dependencies: `class-validator`.

**PreviewInvoiceTemplateDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| html | 4 | string | @IsString() @MaxLength(700000) |
| css | 8 | string | @IsString() @MaxLength(300000) |

Exports: `PreviewInvoiceTemplateDto` (3).

### edutrack_be/src/modules/invoice-template/dto/query-invoice-images.dto.ts

[edutrack_be/src/modules/invoice-template/dto/query-invoice-images.dto.ts](../src/modules/invoice-template/dto/query-invoice-images.dto.ts) — 8 dòng.

Dependencies: `class-validator`.

**QueryInvoiceImagesDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| before | 4 | string (optional) | @IsOptional() @IsMongoId() |

Exports: `QueryInvoiceImagesDto` (3).

### edutrack_be/src/modules/invoice-template/dto/update-invoice-template.dto.ts

[edutrack_be/src/modules/invoice-template/dto/update-invoice-template.dto.ts](../src/modules/invoice-template/dto/update-invoice-template.dto.ts) — 7 dòng.

Dependencies: `@nestjs/mapped-types`, `./create-invoice-template.dto`.

**UpdateInvoiceTemplateDto** (dòng 4) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `UpdateInvoiceTemplateDto` (4).

### edutrack_be/src/modules/invoice-template/invoice-images.controller.ts

[edutrack_be/src/modules/invoice-template/invoice-images.controller.ts](../src/modules/invoice-template/invoice-images.controller.ts) — 48 dòng.

Dependencies: `@nestjs/common`, `@nestjs/platform-express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../cloudinary/cloudinary.service`, `./dto/query-invoice-images.dto`, `./invoice-images.service`.

**InvoiceImagesController** (dòng 23) @Controller('invoice-images') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| list | 28 | public list(@CurrentUser() user: JwtUser, @Query() query: QueryInvoiceImagesDto) | @Get() |
| upload | 33 | public upload(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile) | @Post() @UseInterceptors( FileInterceptor('file', { limits: { fileSize: INVOICE_IMAGE_MAX_SIZE, files: 1 }, }), ) |
| archive | 43 | public archive(@CurrentUser() user: JwtUser, @Param('imageId') imageId: string) | @Delete(':imageId') |

Exports: `InvoiceImagesController` (23).

### edutrack_be/src/modules/invoice-template/invoice-images.service.spec.ts

[edutrack_be/src/modules/invoice-template/invoice-images.service.spec.ts](../src/modules/invoice-template/invoice-images.service.spec.ts) — 180 dòng.

Dependencies: `@nestjs/common`, `mongoose`, `./invoice-images.service`, `../cloudinary/cloudinary.service`, `./schemas/invoice-image.schema`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 31: invoice image library
- Dòng 59: uploads bytes to Cloudinary and persists only URL and metadata with JWT ownership
- Dòng 78: rejects missing, oversize, SVG and forged MIME images before upload
- Dòng 100: does not persist on Cloudinary failure and removes a new asset if the DB write fails
- Dòng 111: paginates only active images owned by the teacher
- Dòng 127: archives only owned images without deleting URLs referenced by old templates
- Dòng 148: validates image references in both HTML and ProjectJSON, including archived owned images

### edutrack_be/src/modules/invoice-template/invoice-images.service.ts

[edutrack_be/src/modules/invoice-template/invoice-images.service.ts](../src/modules/invoice-template/invoice-images.service.ts) — 174 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `mongoose`, `cheerio`, `../cloudinary/cloudinary.service`, `./schemas/invoice-image.schema`.

**InvoiceImagesService** (dòng 23) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 25 |  |  |
| list | 32 | public list(teacherId: string, before?: string) |  |
| upload | 49 | public upload(teacherId: string, file?: UploadImageFile) |  |
| archive | 99 | public archive(teacherId: string, imageId: string) |  |
| assertReferences | 118 | public assertReferences(teacherId: string, html: string, project: Record<string, unknown>) |  |
| response | 163 |  |  |

Exports: `INVOICE_IMAGE_MAX_SIZE` (21), `InvoiceImagesService` (23).

### edutrack_be/src/modules/invoice-template/invoice-template.controller.spec.ts

[edutrack_be/src/modules/invoice-template/invoice-template.controller.spec.ts](../src/modules/invoice-template/invoice-template.controller.spec.ts) — 118 dòng.

Dependencies: `@nestjs/common`, `@nestjs/testing`, `supertest`, `supertest/types`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../receipts/receipt-template.service`, `../users/schemas/user.schema`, `./constants/invoice-regions`, `./invoice-template.controller`, `./invoice-template.service`.

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 65: `request(app.getHttpServer())`
- Dòng 80: `request(app.getHttpServer())`
- Dòng 92: `request(app.getHttpServer())`
- Dòng 103: `request(app.getHttpServer())`
- Dòng 112: `request(app.getHttpServer())`

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 23: invoice template HTTP routes
- Dòng 64: routes regions to the registry, not the template ID handler
- Dòng 78: keeps the default route separate from template IDs
- Dòng 89: still passes template IDs and the authenticated owner to the service
- Dòng 100: passes deletion through with the authenticated owner
- Dòng 111: requires authentication for the region registry

### edutrack_be/src/modules/invoice-template/invoice-template.controller.ts

[edutrack_be/src/modules/invoice-template/invoice-template.controller.ts](../src/modules/invoice-template/invoice-template.controller.ts) — 112 dòng.

Dependencies: `@nestjs/common`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `./dto/create-invoice-template.dto`, `./dto/duplicate-invoice-template.dto`, `./dto/update-invoice-template.dto`, `./invoice-template.service`, `./constants/invoice-regions`, `../receipts/receipt-template.service`, `./dto/preview-invoice-template.dto`, `./constants/preview-receipt`, `./utils/template-renderer`.

**InvoiceTemplateController** (dòng 31) @Controller('invoice-templates') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getDefaultTemplate | 39 | public getDefaultTemplate(@CurrentUser() user: JwtUser) | @Get('default') |
| regions | 44 | public regions() | @Get('regions') |
| preview | 55 | public preview(@Body() dto: PreviewInvoiceTemplateDto) | @Post('preview') |
| findAll | 69 | public findAll(@CurrentUser() user: JwtUser) | @Get() |
| create | 74 | public create(@CurrentUser() user: JwtUser, @Body() dto: CreateInvoiceTemplateDto) | @Post() |
| resetDefaultTemplate | 79 | public resetDefaultTemplate(@CurrentUser() user: JwtUser) | @Post('reset-default') |
| findOne | 84 | public findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) | @Get(':id') |
| update | 89 | public update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateInvoiceTemplateDto) | @Patch(':id') |
| remove | 98 | public remove(@CurrentUser() user: JwtUser, @Param('id') id: string) | @Delete(':id') |
| duplicate | 103 | public duplicate(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: DuplicateInvoiceTemplateDto = {}) | @Post(':id/duplicate') |

Exports: `InvoiceTemplateController` (31).

### edutrack_be/src/modules/invoice-template/invoice-template.module.ts

[edutrack_be/src/modules/invoice-template/invoice-template.module.ts](../src/modules/invoice-template/invoice-template.module.ts) — 35 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `../cloudinary/cloudinary.module`, `./invoice-images.controller`, `./invoice-images.service`, `./schemas/invoice-image.schema`, `../receipts/receipt-template.service`, `./invoice-template.controller`, `./invoice-template.service`, `./schemas/invoice-template.schema`.

**InvoiceTemplateModule** (dòng 18) @Module({ imports: [ CloudinaryModule, MongooseModule.forFeature([ { name: InvoiceTemplate.name, schema: InvoiceTemplateSchema }, { name: InvoiceImage.name, schema: InvoiceImageSchema }, ]), ], controllers: [InvoiceTemplateController, InvoiceImagesController], providers: [ InvoiceTemplateService, InvoiceImagesService, ReceiptTemplateService, ], exports: [InvoiceTemplateService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `InvoiceTemplateModule` (18).

### edutrack_be/src/modules/invoice-template/invoice-template.service.spec.ts

[edutrack_be/src/modules/invoice-template/invoice-template.service.spec.ts](../src/modules/invoice-template/invoice-template.service.spec.ts) — 142 dòng.

Dependencies: `@nestjs/common`, `mongoose`, `./invoice-template.service`, `./invoice-images.service`, `./schemas/invoice-template.schema`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 19: invoice template saved versions
- Dòng 51: creates a new saved version without replacing the previous template
- Dòng 75: overwrites only the selected owned template and keeps its version number
- Dòng 93: lists active teacher copies newest first without prioritizing the default
- Dòng 108: cannot overwrite the system template or a template owned by another teacher
- Dòng 120: archives an owned custom template instead of deleting its history
- Dòng 132: does not allow system templates to be removed

### edutrack_be/src/modules/invoice-template/invoice-template.service.ts

[edutrack_be/src/modules/invoice-template/invoice-template.service.ts](../src/modules/invoice-template/invoice-template.service.ts) — 471 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `mongoose`, `./constants/legacy-invoice-template`, `./invoice-images.service`, `./constants/default-invoice-template`, `./dto/create-invoice-template.dto`, `./dto/duplicate-invoice-template.dto`, `./dto/update-invoice-template.dto`, `./schemas/invoice-template.schema`, `./utils/sanitize-template`.

**InvoiceTemplateService** (dòng 58) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getDefaultTemplate | 66 | public getDefaultTemplate(teacherIdStr: string) |  |
| findAll | 81 | public findAll(teacherIdStr: string) |  |
| findOne | 99 | public findOne(teacherIdStr: string, templateId: string) |  |
| create | 114 | public create(teacherIdStr: string, dto: CreateInvoiceTemplateDto) |  |
| update | 154 | public update(teacherIdStr: string, templateId: string, dto: UpdateInvoiceTemplateDto) |  |
| duplicate | 218 | public duplicate(teacherIdStr: string, templateId: string, dto: DuplicateInvoiceTemplateDto = {}) |  |
| remove | 264 | public remove(teacherIdStr: string, templateId: string) |  |
| resetDefaultTemplate | 283 | public resetDefaultTemplate(teacherIdStr: string) |  |
| resolveTemplateSource | 306 | private resolveTemplateSource(teacherIdStr: string, templateId: string): Promise<InvoiceTemplateSource> |  |
| findCustomTemplateForTeacherOrThrow | 330 | private findCustomTemplateForTeacherOrThrow(teacherIdStr: string, templateIdStr: string) |  |
| hasActiveDefaultTemplate | 352 | private hasActiveDefaultTemplate(teacherId: Types.ObjectId) |  |
| nextVersion | 365 | private nextVersion(teacherId: Types.ObjectId) |  |
| unsetDefaultTemplates | 374 | private unsetDefaultTemplates(teacherId: Types.ObjectId, exceptTemplateId?: Types.ObjectId) |  |
| cleanHtml | 394 | private cleanHtml(html: string) |  |
| cleanName | 406 | private cleanName(name: string) |  |
| systemResponse | 416 | private systemResponse(): InvoiceTemplateResponse |  |
| toTemplateResponse | 423 |  |  |
| isSystemTemplateId | 443 | private isSystemTemplateId(templateId: string) |  |
| isLegacyTemplateId | 450 | private isLegacyTemplateId(id: string) |  |
| toObjectId | 454 | private toObjectId(value: string, fieldName: string) |  |
| isDuplicateKeyError | 462 | private isDuplicateKeyError(error: unknown) |  |

Exports: `InvoiceTemplateResponse` (31), `InvoiceTemplateService` (58).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 31
export type InvoiceTemplateResponse = {
  id: string;
  teacherId?: string;
  name: string;
  type: InvoiceTemplateType;
  version: number;
  basedOnVersion: string;
  editorData: Record<string, unknown>;
  html: string;
  css: string;
  thumbnailUrl?: string;
  isDefault: boolean;
  status: InvoiceTemplateStatus;
  readonly: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
// line 49
type InvoiceTemplateSource = {
  name: string;
  basedOnVersion: string;
  editorData: Record<string, unknown>;
  html: string;
  css: string;
  thumbnailUrl?: string;
};
```

### edutrack_be/src/modules/invoice-template/schemas/invoice-image.schema.ts

[edutrack_be/src/modules/invoice-template/schemas/invoice-image.schema.ts](../src/modules/invoice-template/schemas/invoice-image.schema.ts) — 40 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`.

**InvoiceImage** (dòng 5) @Schema({ collection: 'invoice_images', timestamps: true, versionKey: false })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 7 | Types.ObjectId | @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true }) |
| name | 10 | string | @Prop({ required: true, maxlength: 180 }) |
| url | 13 | string | @Prop({ required: true }) |
| publicId | 16 | string | @Prop({ required: true, unique: true }) |
| mimeType | 19 | string | @Prop({ required: true, enum: ['image/png', 'image/jpeg', 'image/webp'] }) |
| size | 22 | number | @Prop({ required: true, min: 1 }) |
| width | 25 | number (optional) | @Prop({ min: 1 }) |
| height | 28 | number (optional) | @Prop({ min: 1 }) |
| archivedAt | 31 | Date \| null | @Prop({ type: Date, default: null }) |
| createdAt | 34 | Date |  |

Exports: `InvoiceImage` (5), `InvoiceImageDocument` (37), `InvoiceImageSchema` (38).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 37
export type InvoiceImageDocument = HydratedDocument<InvoiceImage>;
```

Indexes:

- Dòng 39: `InvoiceImageSchema.index({ teacherId: 1, archivedAt: 1, _id: -1 })`

### edutrack_be/src/modules/invoice-template/schemas/invoice-template.schema.ts

[edutrack_be/src/modules/invoice-template/schemas/invoice-template.schema.ts](../src/modules/invoice-template/schemas/invoice-template.schema.ts) — 88 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`.

**InvoiceTemplate** (dòng 15) @Schema({ collection: 'invoice_templates', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 21 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, index: true, }) |
| name | 28 | string | @Prop({ required: true, trim: true, maxlength: 120 }) |
| type | 31 | InvoiceTemplateType | @Prop({ enum: InvoiceTemplateType, required: true, index: true, }) |
| version | 38 | number | @Prop({ default: 1, min: 1 }) |
| basedOnVersion | 41 | string | @Prop({ required: true, trim: true, maxlength: 80 }) |
| editorData | 44 | Record<string, unknown> | @Prop({ type: mongoose.Schema.Types.Mixed, required: true }) |
| html | 47 | string | @Prop({ required: true }) |
| css | 50 | string | @Prop({ default: '' }) |
| thumbnailUrl | 53 | string (optional) | @Prop({ trim: true, maxlength: 500 }) |
| isDefault | 56 | boolean | @Prop({ default: false, index: true }) |
| status | 59 | InvoiceTemplateStatus | @Prop({ enum: InvoiceTemplateStatus, default: InvoiceTemplateStatus.Active, index: true, }) |
| createdAt | 66 | Date (optional) |  |
| updatedAt | 68 | Date (optional) |  |

Exports: `InvoiceTemplateType` (5), `InvoiceTemplateStatus` (10), `InvoiceTemplate` (15), `InvoiceTemplateDocument` (71), `InvoiceTemplateSchema` (72).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 5
export enum InvoiceTemplateType {
  System = 'SYSTEM',
  Custom = 'CUSTOM',
}
// line 10
export enum InvoiceTemplateStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
}
// line 71
export type InvoiceTemplateDocument = HydratedDocument<InvoiceTemplate>;
```

Indexes:

- Dòng 75: `InvoiceTemplateSchema.index({ type: 1, basedOnVersion: 1, status: 1 })`
- Dòng 76: `InvoiceTemplateSchema.index({ teacherId: 1, status: 1, updatedAt: -1 })`
- Dòng 77: `InvoiceTemplateSchema.index( { teacherId: 1, isDefault: 1, status: 1 }, { unique: true, partialFilterExpression: { teacherId: { $exists: true }, isDefault: true, status: InvoiceTemplateStatus.Active, }, }, )`

### edutrack_be/src/modules/invoice-template/utils/region-renderer.spec.ts

[edutrack_be/src/modules/invoice-template/utils/region-renderer.spec.ts](../src/modules/invoice-template/utils/region-renderer.spec.ts) — 79 dòng.

Dependencies: `@nestjs/common`, `cheerio`, `../../receipts/receipt-template.service`, `../constants/preview-receipt`, `../constants/system-invoice-v2`, `../constants/invoice-regions`, `./sanitize-template`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 9: receipt layout with dynamic regions
- Dòng 12: ships the actual receipt layout with symbols instead of hardcoded student/payment data
- Dòng 31: resolves sections through the existing receipt renderer and retains custom static elements
- Dòng 58: renders varying lesson counts without retaining placeholder height and rejects unknown/nested regions

### edutrack_be/src/modules/invoice-template/utils/region-renderer.ts

[edutrack_be/src/modules/invoice-template/utils/region-renderer.ts](../src/modules/invoice-template/utils/region-renderer.ts) — 27 dòng.

Dependencies: `cheerio`, `../constants/invoice-regions`, `./sanitize-template`.

Functions: `renderRegionTemplate(html: string, css: string, fragments: Record<InvoiceRegionKey, string>)` (dòng 10).

Exports: `renderRegionTemplate` (10).

### edutrack_be/src/modules/invoice-template/utils/sanitize-template.spec.ts

[edutrack_be/src/modules/invoice-template/utils/sanitize-template.spec.ts](../src/modules/invoice-template/utils/sanitize-template.spec.ts) — 102 dòng.

Dependencies: `@nestjs/common`, `./sanitize-template`, `./template-renderer`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 9: invoice template sanitization
- Dòng 10: preserves GrapesJS component selectors and text formatting on save
- Dòng 27: removes unsafe html, event handlers, and javascript URLs
- Dòng 46: preserves serialized no-wrap and overflow rules used by receipt headings
- Dòng 57: keeps safe print css and drops dangerous declarations
- Dòng 70: rejects unknown dynamic fields
- Dòng 79: invoice template renderer
- Dòng 80: resolves whitelisted dynamic fields and removes field metadata
- Dòng 93: uses formatter-aware preview values when data is missing

### edutrack_be/src/modules/invoice-template/utils/sanitize-template.ts

[edutrack_be/src/modules/invoice-template/utils/sanitize-template.ts](../src/modules/invoice-template/utils/sanitize-template.ts) — 409 dòng.

Dependencies: `@nestjs/common`, `../constants/invoice-fields`, `cheerio`, `../constants/invoice-regions`.

Functions: `sanitizeTemplateHtml(html: string)` (dòng 160); `sanitizeTemplateCss(css = '')` (dòng 172); `findDynamicFieldKeys(html: string)` (dòng 194); `assertWhitelistedDynamicFields(html: string)` (dòng 205); `stripForbiddenBlocks(html: string)` (dòng 229); `sanitizeTag(tag: string)` (dòng 237); `sanitizeAttributes(tagName: string, attributes: string)` (dòng 261); `sanitizeAttributeValue(attributeName: string, value: string)` (dòng 293); `sanitizeCssDeclarationBlock(css: string)` (dòng 338); `sanitizeCssDeclaration(declaration: string)` (dòng 346); `sanitizeCssSelector(selector: string)` (dòng 367); `isDangerousCssValue(value: string)` (dòng 388); `isSafeUrl(value: string)` (dòng 396); `escapeAttribute(value: string)` (dòng 402).

Exports: `sanitizeTemplateHtml` (160), `sanitizeTemplateCss` (172), `findDynamicFieldKeys` (194), `assertWhitelistedDynamicFields` (205).

### edutrack_be/src/modules/invoice-template/utils/template-renderer.ts

[edutrack_be/src/modules/invoice-template/utils/template-renderer.ts](../src/modules/invoice-template/utils/template-renderer.ts) — 180 dòng.

Dependencies: `@nestjs/common`, `../constants/invoice-fields`, `./sanitize-template`.

Functions: `renderInvoiceTemplateHtml(html: string, context: InvoiceTemplateRenderContext, options: { previewFallback?: boolean } = {})` (dòng 24); `buildMockInvoiceRenderContext(): InvoiceTemplateRenderContext` (dòng 65); `resolveDynamicFieldValue(fieldKey: string, context: InvoiceTemplateRenderContext)` (dòng 97); `formatDynamicFieldValue(value: unknown, field: InvoiceDynamicField, previewFallback: boolean)` (dòng 116); `escapeHtml(value: string)` (dòng 172).

Exports: `InvoiceTemplateRenderContext` (11), `renderInvoiceTemplateHtml` (24), `buildMockInvoiceRenderContext` (65).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 11
export type InvoiceTemplateRenderContext = {
  student?: Record<string, unknown>;
  class?: Record<string, unknown>;
  tuition?: Record<string, unknown>;
  teacher?: Record<string, unknown>;
  invoice?: Record<string, unknown>;
};
```

### edutrack_be/src/modules/mail/listeners/mail.listener.ts

[edutrack_be/src/modules/mail/listeners/mail.listener.ts](../src/modules/mail/listeners/mail.listener.ts) — 35 dòng.

Dependencies: `@nestjs/common`, `@nestjs/event-emitter`, `../mail.service`.

**MailListener** (dòng 5) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| handleUserRegisteredEvent | 9 | public handleUserRegisteredEvent(payload: { email: string; otp: string; fullName: string; }) | @OnEvent('auth.user_registered', { async: true }) |
| handleForgotPasswordRequestedEvent | 22 | public handleForgotPasswordRequestedEvent(payload: { email: string; otp: string; fullName: string; }) | @OnEvent('auth.forgot_password_requested', { async: true }) |

Exports: `MailListener` (5).

### edutrack_be/src/modules/mail/mail.module.ts

[edutrack_be/src/modules/mail/mail.module.ts](../src/modules/mail/mail.module.ts) — 10 dòng.

Dependencies: `@nestjs/common`, `./mail.service`, `./listeners/mail.listener`.

**MailModule** (dòng 5) @Module({ providers: [MailService, MailListener], exports: [MailService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `MailModule` (5).

### edutrack_be/src/modules/mail/mail.service.ts

[edutrack_be/src/modules/mail/mail.service.ts](../src/modules/mail/mail.service.ts) — 160 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `nodemailer`.

**MailService** (dòng 9) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 11 |  |  |
| transporter | 12 | Transporter (optional) |  |
| sendVerificationOtp | 16 | public sendVerificationOtp(email: string, otp: string, fullName: string) |  |
| sendPasswordResetOtp | 50 | public sendPasswordResetOtp(email: string, otp: string, fullName: string) |  |
| sendEmailCore | 84 | private sendEmailCore(to: string, subject: string, html: string, text: string) |  |
| getTransporter | 122 | private getTransporter() |  |
| escapeHtml | 151 | private escapeHtml(value: string) |  |

Exports: `MailService` (9).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 93: `fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ to, subject, html, text }), })`

### edutrack_be/src/modules/push/push.controller.spec.ts

[edutrack_be/src/modules/push/push.controller.spec.ts](../src/modules/push/push.controller.spec.ts) — 271 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/event-emitter`, `@nestjs/testing`, `jsonwebtoken`, `node:http`, `supertest`, `web-push`, `../auth/strategies/jwt.strategy`, `../users/users.service`, `./push.controller`, `./push.service`.

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 103: `request(server)`
- Dòng 106: `request(server)`
- Dòng 110: `request(server)`
- Dòng 114: `request(server)`
- Dòng 122: `request(server)`
- Dòng 140: `request(server)`
- Dòng 150: `request(server)`
- Dòng 155: `request(server)`
- Dòng 164: `request(server)`
- Dòng 187: `request(server)`
- Dòng 195: `request(server)`
- Dòng 210: `request(server)`
- Dòng 228: `request(server)`
- Dòng 237: `request(server)`

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 29: Push API with JWT, validation and real event wiring
- Dòng 102: rejects unauthenticated status, subscription, test, and delete calls
- Dòng 121: returns the runtime public key and own device count without private material
- Dòng 139: validates browser subscriptions and persists with identity taken from JWT
- Dòng 163: captures safe browser metadata and uses the hint for an iPad in desktop mode
- Dòng 186: returns only the authenticated account devices and strips endpoints and push keys
- Dòng 206: returns actual provider acceptance instead of fire-and-forget success
- Dòng 227: does not let another teacher test this device endpoint
- Dòng 236: scopes subscription deletion to JWT identity
- Dòng 248: resolves emitAsync with delivery counts for the scheduler
- Dòng 259: propagates listener database failures back to emitAsync callers

### edutrack_be/src/modules/push/push.controller.ts

[edutrack_be/src/modules/push/push.controller.ts](../src/modules/push/push.controller.ts) — 66 dòng.

Dependencies: `@nestjs/common`, `express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../users/dto/push-subscription.dto`, `../users/users.service`, `../users/types/push-device.type`, `../users/utils/push-device`, `./push.service`.

**PushController** (dòng 23) @Controller('users/me') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getStatus | 31 | public getStatus(@CurrentUser() user: JwtUser) | @Get('push-subscription/status') |
| subscribe | 36 | public subscribe(@CurrentUser() user: JwtUser, @Body() dto: PushSubscriptionDto, @Req() request: Request) | @Post('push-subscription') |
| test | 56 | public test(@CurrentUser() user: JwtUser, @Body() dto: PushEndpointDto) | @Post('push-subscription/test') |
| unsubscribe | 61 | public unsubscribe(@CurrentUser() user: JwtUser, @Body() dto: PushEndpointDto) | @Delete('push-subscription') |

Exports: `PushController` (23).

### edutrack_be/src/modules/push/push.module.ts

[edutrack_be/src/modules/push/push.module.ts](../src/modules/push/push.module.ts) — 13 dòng.

Dependencies: `@nestjs/common`, `./push.service`, `../users/users.module`, `./push.controller`.

**PushModule** (dòng 6) @Module({ imports: [UsersModule], controllers: [PushController], providers: [PushService], exports: [PushService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `PushModule` (6).

### edutrack_be/src/modules/push/push.service.spec.ts

[edutrack_be/src/modules/push/push.service.spec.ts](../src/modules/push/push.service.spec.ts) — 220 dòng.

Dependencies: `@nestjs/common`, `web-push`, `./push.service`.

Functions: `createService(env: Record<string, string \| undefined> = {})` (dòng 21).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 39: PushService
- Dòng 54: reads explicitly selected subscriptions and awaits provider acceptance
- Dòng 74: removes only expired subscriptions for status %s
- Dòng 94: retains subscriptions and reports retryable/diagnostic failure %s
- Dòng 109: reports partial success without losing the accepted delivery on cleanup failure
- Dòng 127: propagates database failures to the cron caller
- Dòng 135: returns zero accepted deliveries when no device is registered
- Dòng 145: deduplicates legacy subscriptions by endpoint
- Dòng 155: tests only the selected device owned by the authenticated user
- Dòng 171: disables delivery and exposes a safe diagnostic for missing keys
- Dòng 184: detects a mismatched VAPID pair without crashing startup or exposing private keys
- Dòng 195: rejects malformed subjects and strips surrounding whitespace from valid settings
- Dòng 208: does not send to arbitrary URLs persisted before DTO validation

### edutrack_be/src/modules/push/push.service.ts

[edutrack_be/src/modules/push/push.service.ts](../src/modules/push/push.service.ts) — 196 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/event-emitter`, `node:crypto`, `web-push`, `../users/dto/push-subscription.dto`, `../users/users.service`, `../users/utils/push-device`.

**PushService** (dòng 18) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 20 |  |  |
| configured | 21 |  |  |
| publicKey | 22 | string \| null |  |
| configurationError | 23 | string (optional) |  |
| getStatus | 66 | public getStatus(userId: string) |  |
| handleNotificationEvent | 81 | public handleNotificationEvent(data: { userId: string; payload: Record<string, unknown>; }): Promise<PushDeliveryResult> | @OnEvent('notification.push', { suppressErrors: false }) |
| sendTestNotification | 89 | public sendTestNotification(userId: string, endpoint: string) |  |
| sendNotification | 112 | public sendNotification(userId: string, payload: Record<string, unknown>, endpoint?: string): Promise<PushDeliveryResult> |  |
| getStatusCode | 184 | private getStatusCode(error: unknown): number \| undefined |  |

Exports: `PushDeliveryResult` (10), `PushService` (18).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 10
export type PushDeliveryResult = {
  configured: boolean;
  attempted: number;
  sent: number;
  failed: number;
  removed: number;
};
```

### edutrack_be/src/modules/receipts/dto/download-receipts.dto.ts

[edutrack_be/src/modules/receipts/dto/download-receipts.dto.ts](../src/modules/receipts/dto/download-receipts.dto.ts) — 15 dòng.

Dependencies: `class-validator`.

**DownloadReceiptsDto** (dòng 8) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| receiptIds | 9 | string[] | @IsArray({ message: 'Danh sách hóa đơn không hợp lệ.' }) @ArrayMinSize(1, { message: 'Vui lòng chọn ít nhất một hóa đơn.' }) @ArrayMaxSize(50, { message: 'Chỉ có thể tải tối đa 50 hóa đơn mỗi lần.' }) @IsMongoId({ each: true, message: 'Mã hóa đơn không hợp lệ.' }) |

Exports: `DownloadReceiptsDto` (8).

### edutrack_be/src/modules/receipts/dto/issue-receipt.dto.ts

[edutrack_be/src/modules/receipts/dto/issue-receipt.dto.ts](../src/modules/receipts/dto/issue-receipt.dto.ts) — 141 dòng.

Dependencies: `class-transformer`, `class-validator`.

**ReceiptExamRemarkDto** (dòng 18) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| examScoreId | 19 | string | @IsMongoId({ message: 'Mã điểm kiểm tra không hợp lệ.' }) |
| teacherRemark | 22 | string | @IsString() @MaxLength(500) |

**IssueReceiptDto** (dòng 27) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| templateId | 28 | string (optional) | @IsOptional() @IsString() @Matches(/^(SYSTEM_INVOICE_V[12]\|system-v[12]\|[a-f\d]{24})$/i, { message: 'Mã mẫu hóa đơn không hợp lệ.', }) |
| templateRevision | 35 | string (optional) | @IsOptional() @IsString() @Matches(/^[a-f\d]{64}$/) |
| scopeType | 40 | 'class' \| 'multi_class' (optional) | @IsOptional() @IsIn(['class', 'multi_class'], { message: 'Phạm vi hóa đơn không hợp lệ.', }) |
| classIds | 46 | string[] (optional) | @IsOptional() @Transform(({ value }) => normalizeStringArray(value)) @IsArray() @ArrayMaxSize(12) @IsMongoId({ each: true, message: 'Mã lớp học không hợp lệ.' }) |
| fromDate | 53 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' }) |
| toDate | 57 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' }) |
| dueDate | 61 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Hạn thanh toán không hợp lệ.' }) |
| tuitionEntryIds | 65 | string[] (optional) | @IsOptional() @IsArray() @ArrayMaxSize(80) @IsMongoId({ each: true, message: 'Mã buổi học cần tính tiền không hợp lệ.' }) |
| targetSessionCount | 71 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(80) |
| discountAmount | 78 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) |
| adjustmentAmount | 84 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) |
| note | 90 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| teacherComment | 95 | string (optional) | @IsOptional() @IsString() @MaxLength(1200) |
| strengthsComment | 100 | string (optional) | @IsOptional() @IsString() @MaxLength(1200) |
| improvementsComment | 105 | string (optional) | @IsOptional() @IsString() @MaxLength(1200) |
| generalComment | 110 | string (optional) | @IsOptional() @IsString() @MaxLength(1200) |
| paymentNote | 115 | string (optional) | @IsOptional() @IsString() @MaxLength(700) |
| examRemarks | 120 | ReceiptExamRemarkDto[] (optional) | @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ReceiptExamRemarkDto) |

Functions: `normalizeStringArray(value: unknown)` (dòng 127).

Exports: `ReceiptExamRemarkDto` (18), `IssueReceiptDto` (27).

### edutrack_be/src/modules/receipts/dto/query-billing.dto.ts

[edutrack_be/src/modules/receipts/dto/query-billing.dto.ts](../src/modules/receipts/dto/query-billing.dto.ts) — 41 dòng.

Dependencies: `class-transformer`, `class-validator`.

**QueryBillingDto** (dòng 10) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| classIds | 11 | string[] (optional) | @IsOptional() @Transform(({ value }) => normalizeStringArray(value)) @IsArray() @ArrayMaxSize(12) @IsMongoId({ each: true, message: 'Mã lớp học không hợp lệ.' }) |
| fromDate | 18 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' }) |
| toDate | 22 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' }) |

Functions: `normalizeStringArray(value: unknown)` (dòng 27).

Exports: `QueryBillingDto` (10).

### edutrack_be/src/modules/receipts/dto/query-receipts.dto.ts

[edutrack_be/src/modules/receipts/dto/query-receipts.dto.ts](../src/modules/receipts/dto/query-receipts.dto.ts) — 25 dòng.

Dependencies: `class-validator`, `../../school-management/enums`.

**QueryReceiptsDto** (dòng 4) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| classId | 5 | string (optional) | @IsOptional() @IsMongoId({ message: 'Mã lớp học không hợp lệ.' }) |
| studentId | 9 | string (optional) | @IsOptional() @IsMongoId({ message: 'Mã học sinh không hợp lệ.' }) |
| paymentStatus | 13 | PaymentStatus (optional) | @IsOptional() @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ.' }) |
| fromDate | 17 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' }) |
| toDate | 21 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' }) |

Exports: `QueryReceiptsDto` (4).

### edutrack_be/src/modules/receipts/dto/update-receipt-payment.dto.ts

[edutrack_be/src/modules/receipts/dto/update-receipt-payment.dto.ts](../src/modules/receipts/dto/update-receipt-payment.dto.ts) — 43 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../school-management/enums`.

**UpdateReceiptPaymentDto** (dòng 14) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| paymentStatus | 15 | PaymentStatus | @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ.' }) |
| paidAmount | 18 | number (optional) | @IsOptional() @Type(() => Number) @IsInt() @Min(0) |
| paidAt | 24 | string (optional) | @IsOptional() @IsDateString({}, { message: 'Ngày thanh toán không hợp lệ.' }) |
| paymentNote | 28 | string (optional) | @IsOptional() @IsString() @MaxLength(700) |
| paymentProofUrl | 33 | string (optional) | @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(700) |
| paymentProofPublicId | 38 | string (optional) | @IsOptional() @IsString() @MaxLength(300) |

Exports: `UpdateReceiptPaymentDto` (14).

### edutrack_be/src/modules/receipts/receipt-design.service.spec.ts

[edutrack_be/src/modules/receipts/receipt-design.service.spec.ts](../src/modules/receipts/receipt-design.service.spec.ts) — 194 dòng.

Dependencies: `@nestjs/common`, `cheerio`, `../invoice-template/invoice-template.service`, `../invoice-template/constants/default-invoice-template`, `../invoice-template/constants/legacy-invoice-template`, `../invoice-template/constants/preview-receipt`, `./receipt-design.service`, `./receipt-template.service`, `./receipt-image-policy`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 17: receipt template selection and snapshots
- Dòng 31: resolves the owned selected template, or the default when omitted
- Dòng 43: rejects an overwritten template after preview and keeps the copied content immutable
- Dòng 64: fills regions from real multi-class receipt data and embeds built-in assets and QR
- Dòng 94: adds bank information to older custom templates without a payment region
- Dòng 112: marks one-on-one lessons in receipt previews and issued template HTML
- Dòng 136: fills legacy field templates without leaking demonstration data into issued invoices
- Dòng 155: rejects template resources that could make the PDF browser access arbitrary hosts

### edutrack_be/src/modules/receipts/receipt-design.service.ts

[edutrack_be/src/modules/receipts/receipt-design.service.ts](../src/modules/receipts/receipt-design.service.ts) — 153 dòng.

Dependencies: `@nestjs/common`, `node:crypto`, `cheerio`, `../invoice-template/invoice-template.service`, `../school-management/schemas/receipt-template-snapshot.schema`, `./receipt-template.service`, `../invoice-template/utils/sanitize-template`, `../invoice-template/utils/template-renderer`, `./receipt-image-policy`.

**ReceiptDesignService** (dòng 22) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| resolve | 29 | public resolve(teacherId: string, templateId?: string, expectedRevision?: string): Promise<ReceiptTemplateSnapshot> |  |
| metadata | 78 | public metadata(snapshot?: ReceiptTemplateSnapshot) |  |
| render | 84 | public render(receipt: Record<string, unknown>, template: ReceiptTemplateSnapshot, qr?: string, bankLogo?: string) |  |

Functions: `record(value: unknown): Record<string, unknown>` (dòng 148).

Exports: `ReceiptDesignService` (22).

### edutrack_be/src/modules/receipts/receipt-image-policy.ts

[edutrack_be/src/modules/receipts/receipt-image-policy.ts](../src/modules/receipts/receipt-image-policy.ts) — 46 dòng.

Functions: `receiptBuiltInImagePath(value: string)` (dòng 8); `isReceiptCloudImage(value: string)` (dòng 17); `isReceiptBrowserRequestAllowed(value: string)` (dòng 21); `isAllowedHttpsHost(value: string, hosts: string[])` (dòng 32).

Exports: `receiptBuiltInImagePath` (8), `isReceiptCloudImage` (17), `isReceiptBrowserRequestAllowed` (21).

### edutrack_be/src/modules/receipts/receipt-pdf.service.spec.ts

[edutrack_be/src/modules/receipts/receipt-pdf.service.spec.ts](../src/modules/receipts/receipt-pdf.service.spec.ts) — 52 dòng.

Dependencies: `./receipt-pdf.service`.

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
type PdfInternals = {
  tryLoadBrowserAutomation: () => Promise<unknown>;
  renderWithBrowser: (...args: unknown[]) => Promise<Buffer>;
  renderFallbackPdf: (...args: unknown[]) => Promise<Buffer>;
};
```

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 9: PDF template fidelity
- Dòng 17: does not silently replace a selected template with the fallback PDF layout
- Dòng 28: propagates browser errors so the receipt can be retried with its original design
- Dòng 42: retains fallback support for old receipts without a design snapshot

### edutrack_be/src/modules/receipts/receipt-pdf.service.ts

[edutrack_be/src/modules/receipts/receipt-pdf.service.ts](../src/modules/receipts/receipt-pdf.service.ts) — 1388 dòng.

Dependencies: `@nestjs/common`, `node:fs`, `node:path`, `./receipt-image-policy`.

**ReceiptPdfService** (dòng 13) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| stickerImageBuffer | 15 |  |  |
| render | 17 | public render(html: string, receipt: Record<string, any>, paymentQrDataUrl?: string, options: { bankLogoDataUrl?: string; requireHtml?: boolean } = {}) |  |
| renderWithBrowser | 54 | private renderWithBrowser(browserAutomation: { chromiumArgs?: string[]; executablePath?: string; module: any; }, html: string, restrictAssets = false) |  |
| printPageToPdf | 132 | private printPageToPdf(page: any) |  |
| createBrowserUserDataDir | 166 | private createBrowserUserDataDir() |  |
| tryLoadBrowserAutomation | 178 | private tryLoadBrowserAutomation() |  |
| tryLoadServerlessChromium | 216 | private tryLoadServerlessChromium() |  |
| dynamicImport | 251 | private dynamicImport(moduleName: string) |  |
| renderFallbackPdf | 260 | private renderFallbackPdf(receipt: Record<string, any>, paymentQrDataUrl?: string, bankLogoDataUrl?: string) |  |
| tryLoadPdfKit | 279 | private tryLoadPdfKit() |  |
| renderPdfKitReceipt | 289 | private renderPdfKitReceipt(PDFDocument: any, receipt: Record<string, any>, paymentQrDataUrl?: string, bankLogoDataUrl?: string) |  |
| registerVietnameseFonts | 323 | private registerVietnameseFonts(doc: any) |  |
| drawPdfKitReceipt | 357 | private drawPdfKitReceipt(doc: any, receipt: Record<string, any>, paymentQrDataUrl?: string, bankLogoDataUrl?: string, fonts?: { boldFont: string; regularFont: string; }) |  |
| drawSectionTitle | 491 | private drawSectionTitle(doc: any, y: number, title: string, color: string, fonts: { boldFont: string }) |  |
| drawLessonTable | 507 | private drawLessonTable(doc: any, sessions: any[], y: number, options: { boldFont: string; left: number; regularFont: string; width: number; }) |  |
| formatLessonContent | 612 | private formatLessonContent(item: any, fallback = 'Nội dung buổi học') |  |
| drawExamTable | 618 | private drawExamTable(doc: any, exams: any[], y: number, options: { boldFont: string; left: number; regularFont: string; width: number; }) |  |
| formatExamScoreText | 717 | private formatExamScoreText(exam: any) |  |
| drawCommentCards | 730 | private drawCommentCards(doc: any, receipt: Record<string, any>, y: number, options: { boldFont: string; left: number; regularFont: string; width: number; }) |  |
| drawPaymentArea | 785 | private drawPaymentArea(doc: any, receipt: Record<string, any>, paymentQrDataUrl: string \| undefined, bankLogoDataUrl: string \| undefined, y: number, options: { boldFont: string; left: number; regularFont: string; width: number; }) |  |
| drawTableRow | 964 | private drawTableRow(doc: any, y: number, values: unknown[], widths: number[], height: number, options: { background: string; boldFont: string; left: number; regularFont: string; }) |  |
| findExistingPath | 1006 | private findExistingPath(paths: Array<string \| undefined>) |  |
| findBrowserExecutablePath | 1010 | private findBrowserExecutablePath() |  |
| drawStickerImage | 1029 | private drawStickerImage(doc: any, x: number, y: number) |  |
| loadStickerBuffer | 1041 | private loadStickerBuffer() |  |
| dataUrlToBuffer | 1053 | private dataUrlToBuffer(value: string) |  |
| numberToPlainVietnameseMoney | 1063 | private numberToPlainVietnameseMoney(value: number) |  |
| renderBasicFallbackPdf | 1067 | private renderBasicFallbackPdf(receipt: Record<string, any>) |  |
| buildFallbackLines | 1103 | private buildFallbackLines(receipt: Record<string, any>) |  |
| buildTextCommands | 1163 | private buildTextCommands(lines: string[]) |  |
| wrapLine | 1178 | private wrapLine(value: string, maxLength: number) |  |
| uniqueNonEmpty | 1201 | private uniqueNonEmpty(values: unknown[]) |  |
| buildTuitionPriceNoteLines | 1216 | private buildTuitionPriceNoteLines(sessions: any[]) |  |
| buildTuitionPriceNotes | 1222 | private buildTuitionPriceNotes(sessions: any[]): TuitionPriceNote[] |  |
| formatSequenceRanges | 1288 | private formatSequenceRanges(values: number[]) |  |
| resolveSessionClassName | 1320 | private resolveSessionClassName(session: any) |  |
| resolveSessionSequence | 1329 | private resolveSessionSequence(session: any, index: number) |  |
| resolveSessionUnitPrice | 1339 | private resolveSessionUnitPrice(session: any) |  |
| formatMoney | 1349 | private formatMoney(value: number) |  |
| formatDate | 1353 | private formatDate(value?: string \| Date) |  |
| toPdfSafeText | 1372 | private toPdfSafeText(value: unknown) |  |
| escapePdfText | 1381 | private escapePdfText(value: string) |  |

Exports: `ReceiptPdfService` (13).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 8
type TuitionPriceNote = {
  label: string;
  unitPrice: number;
};
```

### edutrack_be/src/modules/receipts/receipt-template.layout.ts

[edutrack_be/src/modules/receipts/receipt-template.layout.ts](../src/modules/receipts/receipt-template.layout.ts) — 66 dòng.

Functions: `renderReceiptPage(content: ReceiptPageContent)` (dòng 21); `commentCard(title: string, content: string)` (dòng 63).

Exports: `ReceiptPageContent` (1), `renderReceiptPage` (21).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export type ReceiptPageContent = {
  student: string;
  class: string;
  metadata: string;
  sessions: string;
  exams: string;
  strengths: string;
  improvements: string;
  comment: string;
  total: string;
  payment: string;
  qr: string;
  prices: string;
  stickers: string;
  studentIcon: string;
  classIcon: string;
  pageClass?: string;
};
```

### edutrack_be/src/modules/receipts/receipt-template.service.ts

[edutrack_be/src/modules/receipts/receipt-template.service.ts](../src/modules/receipts/receipt-template.service.ts) — 791 dòng.

Dependencies: `@nestjs/common`, `node:fs`, `node:path`, `./receipt-template.styles`, `./receipt-template.layout`, `cheerio`, `../invoice-template/utils/region-renderer`, `./receipt-image-policy`.

**ReceiptTemplateService** (dòng 17) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| stickerDataUrl | 19 |  |  |
| logoDataUrl | 20 |  |  |
| embedBuiltInImages | 27 | public embedBuiltInImages(html: string) |  |
| embedBankLogo | 53 | public embedBankLogo(html: string, bankLogoDataUrl?: string) |  |
| renderCustomTemplate | 70 | public renderCustomTemplate(receipt: Record<string, any>, template: { html: string; css: string }, paymentQrDataUrl?: string, bankLogoDataUrl?: string) |  |
| ensurePaymentBankLine | 103 | public ensurePaymentBankLine(html: string, teacherSnapshot: Record<string, unknown>, bankLogoDataUrl?: string) |  |
| render | 155 | public render(receipt: Record<string, any>, paymentQrDataUrl?: string, bankLogoDataUrl?: string) |  |
| renderLessonTable | 229 | private renderLessonTable(sessions: any[], isMultiClass = false) |  |
| renderLessonCells | 277 | private renderLessonCells(item?: Record<string, any>, isMultiClass = false) |  |
| renderLessonContent | 292 | private renderLessonContent(item: Record<string, any>, isMultiClass = false) |  |
| renderExamTables | 320 | private renderExamTables(exams: any[], isMultiClass = false) |  |
| renderExamScoreCell | 373 | private renderExamScoreCell(exam: any) |  |
| renderExamTitle | 386 | private renderExamTitle(exam: Record<string, any>, isMultiClass = false) |  |
| uniqueNonEmpty | 395 | private uniqueNonEmpty(values: unknown[]) |  |
| getReceiptClassNames | 410 | private getReceiptClassNames(receipt: Record<string, any>) |  |
| getReceiptClassNameList | 414 | private getReceiptClassNameList(receipt: Record<string, any>) |  |
| paymentLine | 431 | private paymentLine(label: string, value?: string) |  |
| paymentBankLine | 435 | private paymentBankLine(bankName?: string, bankLogoUrl?: string) |  |
| normalizeLabel | 444 | private normalizeLabel(value: string) |  |
| stringValue | 453 | private stringValue(value: unknown) |  |
| safeBankLogoUrl | 457 | private safeBankLogoUrl(value?: string) |  |
| renderTuitionPriceNotes | 474 | private renderTuitionPriceNotes(sessions: any[]) |  |
| buildTuitionPriceNotes | 491 | private buildTuitionPriceNotes(sessions: any[]): TuitionPriceNote[] |  |
| formatSequenceRanges | 557 | private formatSequenceRanges(values: number[]) |  |
| resolveSessionClassName | 589 | private resolveSessionClassName(session: any) |  |
| resolveSessionSequence | 598 | private resolveSessionSequence(session: any, index: number) |  |
| resolveSessionUnitPrice | 608 | private resolveSessionUnitPrice(session: any) |  |
| renderSticker | 618 | private renderSticker(position: 'left' \| 'right') |  |
| renderInfoIcon | 626 | private renderInfoIcon(type: 'class' \| 'student') |  |
| loadStickerDataUrl | 634 | private loadStickerDataUrl() |  |
| loadImageDataUrl | 646 | private loadImageDataUrl(stickerPath?: string) |  |
| findExistingPath | 663 | private findExistingPath(paths: Array<string \| undefined>) |  |
| formatMoney | 667 | private formatMoney(value: number) |  |
| formatDate | 671 | private formatDate(value?: string \| Date) |  |
| numberToVietnameseWords | 690 | private numberToVietnameseWords(value: number) |  |
| readThreeDigits | 727 | private readThreeDigits(value: number, full: boolean) |  |
| capitalize | 772 | private capitalize(value: string) |  |
| escape | 776 | private escape(value: unknown) |  |

Functions: `record(value: unknown): Record<string, unknown>` (dòng 786).

Exports: `ReceiptTemplateService` (17).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 12
type TuitionPriceNote = {
  label: string;
  unitPrice: number;
};
```

### edutrack_be/src/modules/receipts/receipt-template.styles.ts

[edutrack_be/src/modules/receipts/receipt-template.styles.ts](../src/modules/receipts/receipt-template.styles.ts) — 392 dòng.

Exports: `RECEIPT_TEMPLATE_CSS` (1).

### edutrack_be/src/modules/receipts/receipts-template-flow.spec.ts

[edutrack_be/src/modules/receipts/receipts-template-flow.spec.ts](../src/modules/receipts/receipts-template-flow.spec.ts) — 232 dòng.

Dependencies: `@nestjs/common`, `mongoose`, `../school-management/schemas`, `../school-management/enums`, `../school-management/schemas/receipt-template-snapshot.schema`, `./receipts.service`, `./receipt-template.service`, `./dto/issue-receipt.dto`.

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 55
type Internals = {
  buildReceiptDraftForClasses: (
    ...args: unknown[]
  ) => Promise<ReturnType<typeof createDraft>>;
  resolveStudentReceiptClassIds: (...args: unknown[]) => Promise<string[]>;
  getTeacherPaymentQrDataUrl: (...args: unknown[]) => Promise<string>;
  generateReceiptNumber: (...args: unknown[]) => Promise<string>;
  createBillingCycleFromDraft: (
    ...args: unknown[]
  ) => Promise<{ _id: Types.ObjectId }>;
  renderAndUploadReceiptPdf: (...args: unknown[]) => Promise<void>;
  renderReceiptPdfBuffer: (receipt: ReceiptDocument) => Promise<Buffer>;
};
```

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 69: receipt template issue and retry wiring
- Dòng 124: persists selected design and rendered final invoice (merged=%s)
- Dòng 211: rejects stale template revisions before billing writes

### edutrack_be/src/modules/receipts/receipts.controller.ts

[edutrack_be/src/modules/receipts/receipts.controller.ts](../src/modules/receipts/receipts.controller.ts) — 282 dòng.

Dependencies: `@nestjs/common`, `@nestjs/platform-express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../cloudinary/cloudinary.service`, `express`, `./dto/download-receipts.dto`, `./dto/issue-receipt.dto`, `./dto/query-billing.dto`, `./dto/query-receipts.dto`, `./dto/update-receipt-payment.dto`, `./receipts.service`.

**ReceiptsController** (dòng 35) @Controller() @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getClassBillingOverview | 43 | public getClassBillingOverview(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Query() query: QueryBillingDto) | @Get('classes/:classId/billing/overview') |
| getBillingCandidates | 56 | public getBillingCandidates(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Query() query: QueryBillingDto) | @Get('classes/:classId/students/:studentId/billing-candidates') |
| getStudentBillingOverview | 71 | public getStudentBillingOverview(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Query() query: QueryBillingDto) | @Get('students/:studentId/billing/overview') |
| getStudentBillingCandidates | 84 | public getStudentBillingCandidates(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Query() query: QueryBillingDto) | @Get('students/:studentId/billing-candidates') |
| previewReceipt | 97 | public previewReceipt(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @Post('classes/:classId/students/:studentId/receipts/preview') |
| previewStudentReceipt | 112 | public previewStudentReceipt(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @Post('students/:studentId/receipts/preview') |
| issueReceipt | 125 | public issueReceipt(@CurrentUser() user: JwtUser, @Param('classId') classId: string, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @Post('classes/:classId/students/:studentId/receipts') |
| issueStudentReceipt | 140 | public issueStudentReceipt(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Body() dto: IssueReceiptDto) | @Post('students/:studentId/receipts') |
| listReceipts | 153 | public listReceipts(@CurrentUser() user: JwtUser, @Query() query: QueryReceiptsDto) | @Get('receipts') |
| downloadReceipts | 158 | public downloadReceipts(@CurrentUser() user: JwtUser, @Body() dto: DownloadReceiptsDto, @Res({ passthrough: true }) response: Response) | @Post('receipts/download-bulk') |
| findReceipt | 184 | public findReceipt(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string) | @Get('receipts/:receiptId') @Header('Cache-Control', 'no-store') |
| downloadReceipt | 193 | public downloadReceipt(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string, @Res({ passthrough: true }) response: Response) | @Get('receipts/:receiptId/download') |
| retryRenderPdf | 219 | public retryRenderPdf(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string) | @Post('receipts/:receiptId/render-pdf') |
| uploadPaymentProof | 227 | public uploadPaymentProof(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string, @UploadedFile() file?: UploadImageFile) | @Post('receipts/:receiptId/payment-proof') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, }, }), ) |
| updatePayment | 253 | public updatePayment(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string, @Body() dto: UpdateReceiptPaymentDto) | @Patch('receipts/:receiptId/payment') |
| cancelReceipt | 262 | public cancelReceipt(@CurrentUser() user: JwtUser, @Param('receiptId') receiptId: string) | @Delete('receipts/:receiptId') |
| buildFileContentDisposition | 270 | private buildFileContentDisposition(fileName: string) |  |

Exports: `ReceiptsController` (35).

### edutrack_be/src/modules/receipts/receipts.module.ts

[edutrack_be/src/modules/receipts/receipts.module.ts](../src/modules/receipts/receipts.module.ts) — 31 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `../cloudinary/cloudinary.module`, `../school-management/school-management.module`, `../users/schemas/user.schema`, `./receipt-pdf.service`, `./receipt-template.service`, `./receipts.controller`, `./receipts.service`, `../invoice-template/invoice-template.module`, `./receipt-design.service`, `../users/users.module`.

**ReceiptsModule** (dòng 14) @Module({ imports: [ SchoolManagementModule, CloudinaryModule, InvoiceTemplateModule, UsersModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ], controllers: [ReceiptsController], providers: [ ReceiptsService, ReceiptTemplateService, ReceiptPdfService, ReceiptDesignService, ], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `ReceiptsModule` (14).

### edutrack_be/src/modules/receipts/receipts.service.ts

[edutrack_be/src/modules/receipts/receipts.service.ts](../src/modules/receipts/receipts.service.ts) — 2993 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `mongoose`, `../school-management/enums`, `../school-management/schemas`, `../users/schemas/user.schema`, `../users/bank-directory.service`, `../cloudinary/cloudinary.service`, `./dto/issue-receipt.dto`, `./dto/query-billing.dto`, `./dto/query-receipts.dto`, `./dto/update-receipt-payment.dto`, `./receipt-pdf.service`, `./receipt-template.service`, `./receipt-design.service`, `../school-management/schemas/receipt-template-snapshot.schema`.

**ReceiptsService** (dòng 117) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getClassBillingOverview | 151 | public getClassBillingOverview(teacherIdStr: string, classIdStr: string, query: QueryBillingDto) |  |
| getBillingCandidates | 283 | public getBillingCandidates(teacherIdStr: string, classIdStr: string, studentIdStr: string, query: QueryBillingDto) |  |
| getStudentBillingOverview | 300 | public getStudentBillingOverview(teacherIdStr: string, studentIdStr: string, query: QueryBillingDto) |  |
| getStudentBillingCandidates | 438 | public getStudentBillingCandidates(teacherIdStr: string, studentIdStr: string, query: QueryBillingDto) |  |
| getBillingCandidatesForClasses | 459 | private getBillingCandidatesForClasses(teacherId: Types.ObjectId, studentId: Types.ObjectId, classIds: Types.ObjectId[], query: QueryBillingDto) |  |
| previewReceipt | 522 | public previewReceipt(teacherIdStr: string, classIdStr: string, studentIdStr: string, dto: IssueReceiptDto) |  |
| previewStudentReceipt | 552 | public previewStudentReceipt(teacherIdStr: string, studentIdStr: string, dto: IssueReceiptDto) |  |
| issueReceipt | 586 | public issueReceipt(teacherIdStr: string, classIdStr: string, studentIdStr: string, dto: IssueReceiptDto) |  |
| issueStudentReceipt | 635 | public issueStudentReceipt(teacherIdStr: string, studentIdStr: string, dto: IssueReceiptDto) |  |
| listReceipts | 694 | public listReceipts(teacherIdStr: string, query: QueryReceiptsDto) |  |
| findReceiptById | 735 | public findReceiptById(teacherIdStr: string, receiptIdStr: string) |  |
| getReceiptDownload | 744 | public getReceiptDownload(teacherIdStr: string, receiptIdStr: string) |  |
| getReceiptsBulkDownload | 757 | public getReceiptsBulkDownload(teacherIdStr: string, receiptIdStrs: string[]) |  |
| retryRenderPdf | 823 | public retryRenderPdf(teacherIdStr: string, receiptIdStr: string) |  |
| validateReceiptOwnership | 829 | public validateReceiptOwnership(teacherIdStr: string, receiptIdStr: string) |  |
| updatePayment | 835 | public updatePayment(teacherIdStr: string, receiptIdStr: string, dto: UpdateReceiptPaymentDto) |  |
| cancelReceipt | 918 | public cancelReceipt(teacherIdStr: string, receiptIdStr: string) |  |
| persistIssuedReceipt | 938 | private persistIssuedReceipt(teacherIdStr: string, classIdStr: string, studentIdStr: string, dto: IssueReceiptDto, session?: ClientSession) |  |
| persistIssuedReceiptForClasses | 954 | private persistIssuedReceiptForClasses(teacherIdStr: string, classIdStrs: string[], studentIdStr: string, dto: IssueReceiptDto, session?: ClientSession) |  |
| buildReceiptDraft | 1095 | private buildReceiptDraft(teacherIdStr: string, classIdStr: string, studentIdStr: string, dto: IssueReceiptDto, session?: ClientSession): Promise<ReceiptDraft> |  |
| buildReceiptDraftForClasses | 1111 | private buildReceiptDraftForClasses(teacherIdStr: string, classIdStrs: string[], studentIdStr: string, dto: IssueReceiptDto, session?: ClientSession): Promise<ReceiptDraft> |  |
| renderAndUploadReceiptPdf | 1252 | private renderAndUploadReceiptPdf(teacherIdStr: string, receiptIdStr: string) |  |
| renderReceiptPdfBuffer | 1307 | private renderReceiptPdfBuffer(receipt: ReceiptDocument) |  |
| cancelReceiptCore | 1365 | private cancelReceiptCore(teacherIdStr: string, receiptIdStr: string, session?: ClientSession) |  |
| findUnbilledTuitionEntries | 1455 | private findUnbilledTuitionEntries(teacherId: Types.ObjectId, classIds: Types.ObjectId[], studentId: Types.ObjectId, range: DateRange, tuitionEntryIds?: string[], session?: ClientSession) |  |
| findAttendanceMap | 1571 | private findAttendanceMap(teacherId: Types.ObjectId, attendanceIds: Types.ObjectId[], session?: ClientSession) |  |
| findAttendanceBySessionStudentMap | 1598 | private findAttendanceBySessionStudentMap(teacherId: Types.ObjectId, classIds: Types.ObjectId[], studentId: Types.ObjectId, sessionIds: Types.ObjectId[], session?: ClientSession) |  |
| resolveReceiptAttendanceIds | 1635 | private resolveReceiptAttendanceIds(teacherId: Types.ObjectId, classIds: Types.ObjectId[], studentId: Types.ObjectId, refs: ReceiptAttendanceRef[], session?: ClientSession) |  |
| findSessionMap | 1678 | private findSessionMap(teacherId: Types.ObjectId, sessionIds: Types.ObjectId[], session?: ClientSession) |  |
| findExamSnapshots | 1705 | private findExamSnapshots(teacherId: Types.ObjectId, classIds: Types.ObjectId[], studentId: Types.ObjectId, classMap: Map<string, ClassDocument>, periodStart: Date, periodEnd: Date, examRemarkMap: Map<string, string>, session?: ClientSession): Promise<Array<Record<string, unknown>>> |  |
| validateBillingScope | 1786 | private validateBillingScope(teacherId: Types.ObjectId, classId: Types.ObjectId, studentId: Types.ObjectId, session?: ClientSession, includeTeacher = false) |  |
| validateMultiClassBillingScope | 1846 | private validateMultiClassBillingScope(teacherId: Types.ObjectId, classIds: Types.ObjectId[], studentId: Types.ObjectId, session?: ClientSession, includeTeacher = false) |  |
| findStudentForTeacherOrThrow | 1925 | private findStudentForTeacherOrThrow(teacherId: Types.ObjectId, studentId: Types.ObjectId) |  |
| findClassesForTeacherOrThrow | 1943 | private findClassesForTeacherOrThrow(teacherId: Types.ObjectId, classIds: Types.ObjectId[], session?: ClientSession) |  |
| resolveStudentBillingClassIds | 1973 | private resolveStudentBillingClassIds(teacherId: Types.ObjectId, studentId: Types.ObjectId, rawClassIds?: string[], session?: ClientSession) |  |
| filterActiveClassIds | 2020 | private filterActiveClassIds(classIds: Types.ObjectId[], teacherId: Types.ObjectId, session?: ClientSession): Promise<Types.ObjectId[]> |  |
| resolveStudentReceiptClassIds | 2047 | private resolveStudentReceiptClassIds(teacherIdStr: string, studentIdStr: string, dto: IssueReceiptDto, session?: ClientSession) |  |
| toClassDocumentMap | 2070 | private toClassDocumentMap(classrooms: ClassDocument[]) |  |
| withClassMetadata | 2076 | private withClassMetadata(tuitionEntries: Array<Record<string, any>>, classMap: Map<string, ClassDocument>): Array<Record<string, any>> |  |
| getReceiptClassIds | 2109 | private getReceiptClassIds(receipt: Record<string, any>) |  |
| getReceiptClassNames | 2119 | private getReceiptClassNames(receipt: Record<string, any>) |  |
| getReceiptClassObjectIds | 2136 | private getReceiptClassObjectIds(receipt: Record<string, any>) |  |
| findClassForTeacherOrThrow | 2144 | private findClassForTeacherOrThrow(teacherId: Types.ObjectId, classId: Types.ObjectId) |  |
| findReceiptForTeacherOrThrow | 2163 | private findReceiptForTeacherOrThrow(teacherIdStr: string, receiptIdStr: string, session?: ClientSession) |  |
| createBillingCycleFromDraft | 2188 | private createBillingCycleFromDraft(draft: ReceiptDraft, session?: ClientSession) |  |
| generateReceiptNumber | 2226 | private generateReceiptNumber(teacherId: Types.ObjectId, session?: ClientSession) |  |
| resolvePaidAmount | 2248 | private resolvePaidAmount(dto: UpdateReceiptPaymentDto, totalAmount: number) |  |
| resolveDraftPeriod | 2274 | private resolveDraftPeriod(range: DateRange, tuitionEntries: Array<Record<string, any>>) |  |
| parseDateRange | 2314 | private parseDateRange(fromDate?: string, toDate?: string): DateRange |  |
| assignDateRangeFilter | 2334 | private assignDateRangeFilter(filter: Record<string, unknown>, field: string, range: DateRange) |  |
| parseDate | 2354 | private parseDate(value: string, label: string) |  |
| endOfVietnamDate | 2386 | private endOfVietnamDate(date: Date) |  |
| toVietnamDateKey | 2395 | private toVietnamDateKey(date: Date) |  |
| getTeacherPaymentQrDataUrl | 2404 | private getTeacherPaymentQrDataUrl(teacherId: Types.ObjectId) |  |
| getBankLogoDataUrl | 2422 | private getBankLogoDataUrl(teacherSnapshot: Record<string, unknown>) |  |
| renderReceiptDesign | 2432 | private renderReceiptDesign(receipt: Record<string, unknown>, template: ReceiptTemplateSnapshot, paymentQrDataUrl?: string, bankLogoDataUrl?: string) |  |
| toBuffer | 2448 | private toBuffer(value: unknown) |  |
| toReceiptPreviewResponse | 2489 | private toReceiptPreviewResponse(draft: ReceiptDraft) |  |
| toReceiptListItem | 2532 | private toReceiptListItem(receipt: Record<string, any>) |  |
| getPeriodString | 2562 | private getPeriodString(receipt: ReceiptDocument \| Record<string, any>) |  |
| buildReceiptPdfFileName | 2579 | private buildReceiptPdfFileName(receipt: ReceiptDocument \| Record<string, any>) |  |
| toUniqueZipFileName | 2597 | private toUniqueZipFileName(fileName: string, seenFileNames: Set<string>) |  |
| toZipEntryFileName | 2624 | private toZipEntryFileName(fileName: string) |  |
| buildZipArchive | 2635 | private buildZipArchive(files: Array<{ buffer: Buffer; fileName: string; modifiedAt: Date }>) |  |
| toZipDosDateTime | 2716 | private toZipDosDateTime(value: Date) |  |
| crc32 | 2732 | private crc32(buffer: Buffer) |  |
| toFileNamePart | 2742 | private toFileNamePart(value: unknown, fallback: string) |  |
| toReceiptResponse | 2761 | private toReceiptResponse(receipt: ReceiptDocument \| Record<string, any>) |  |
| toTeacherSnapshot | 2819 | private toTeacherSnapshot(teacher: UserDocument) |  |
| toClassSnapshot | 2838 | private toClassSnapshot(classroom: ClassDocument) |  |
| toClassSnapshotResponse | 2848 | private toClassSnapshotResponse(snapshot?: Record<string, any>) |  |
| toReceiptSessionSnapshotResponse | 2859 | private toReceiptSessionSnapshotResponse(item: Record<string, any>) |  |
| toReceiptExamSnapshotResponse | 2872 | private toReceiptExamSnapshotResponse(item: Record<string, any>) |  |
| toClassSummary | 2881 | private toClassSummary(classroom: ClassDocument) |  |
| toStudentSnapshot | 2891 | private toStudentSnapshot(student: StudentDocument) |  |
| toStudentResponse | 2901 | private toStudentResponse(student: StudentDocument \| Record<string, any>) |  |
| toUniqueObjectIds | 2922 | private toUniqueObjectIds(values: unknown[]) |  |
| toObjectId | 2947 | private toObjectId(value: string, fieldName: string) |  |
| getErrorMessage | 2955 | private getErrorMessage(error: unknown) |  |
| isTransactionUnsupportedError | 2963 | private isTransactionUnsupportedError(error: unknown) |  |
| getErrorCode | 2980 | private getErrorCode(error: unknown) |  |

Exports: `ReceiptsService` (117).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 74
type DateRange = {
  from?: Date;
  to?: Date;
};
// line 79
type ReceiptDraft = {
  templateSnapshot: ReceiptTemplateSnapshot;
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
// line 112
type ReceiptAttendanceRef = {
  attendanceId?: unknown;
  sessionId?: unknown;
};
```

### edutrack_be/src/modules/schedules/dto/check-schedule.dto.ts

[edutrack_be/src/modules/schedules/dto/check-schedule.dto.ts](../src/modules/schedules/dto/check-schedule.dto.ts) — 71 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../classes/dto/create-fixed-schedule.dto`, `../../classes/dto/create-temporary-schedule.dto`.

**CheckFixedScheduleDto** (dòng 15) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| classId | 16 | string | @IsMongoId() |

**CheckTemporaryScheduleDto** (dòng 19) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| classId | 20 | string | @IsMongoId() |
| ignoreOverrideId | 23 | string (optional) | @IsOptional() @IsMongoId() |

**ScheduleAvailabilityDto** (dòng 27) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| classId | 28 | string | @IsMongoId() |
| mode | 31 | 'fixed' \| 'temporary' | @IsIn(['fixed', 'temporary']) |
| date | 34 | string | @IsString() |
| dayOfWeek | 37 | number (optional) | @IsOptional() @IsInt() @Min(1) @Max(7) |
| duration | 43 | number | @Type(() => Number) @IsInt() @Min(1) @Max(1439) |
| startTime | 49 | string | @Matches(/^([01]\d\|2[0-3]):[0-5]\d$/) |
| endTime | 52 | string | @Matches(/^([01]\d\|2[0-3]):[0-5]\d$/) |
| ignoreOverrideId | 55 | string (optional) | @IsOptional() @IsMongoId() |
| originalDate | 59 | string (optional) | @IsOptional() @IsString() |
| originalStartTime | 63 | string (optional) | @IsOptional() @Matches(/^([01]\d\|2[0-3]):[0-5]\d$/) |
| originalEndTime | 67 | string (optional) | @IsOptional() @Matches(/^([01]\d\|2[0-3]):[0-5]\d$/) |

Exports: `CheckFixedScheduleDto` (15), `CheckTemporaryScheduleDto` (19), `ScheduleAvailabilityDto` (27).

### edutrack_be/src/modules/schedules/dto/query-teacher-week-schedule.dto.ts

[edutrack_be/src/modules/schedules/dto/query-teacher-week-schedule.dto.ts](../src/modules/schedules/dto/query-teacher-week-schedule.dto.ts) — 8 dòng.

Dependencies: `class-validator`.

**QueryTeacherWeekScheduleDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| weekStart | 4 | string (optional) | @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) |

Exports: `QueryTeacherWeekScheduleDto` (3).

### edutrack_be/src/modules/schedules/push-reminder-store.service.ts

[edutrack_be/src/modules/schedules/push-reminder-store.service.ts](../src/modules/schedules/push-reminder-store.service.ts) — 63 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `node:crypto`, `mongoose`, `./schemas/push-reminder.schema`.

**PushReminderStore** (dòng 10) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| claim | 17 | public claim(key: string, now: Date): Promise<string \| null> |  |
| finish | 50 | public finish(key: string, token: string, sent: boolean) |  |

Exports: `PushReminderStore` (10).

### edutrack_be/src/modules/schedules/schedule-conflict.engine.spec.ts

[edutrack_be/src/modules/schedules/schedule-conflict.engine.spec.ts](../src/modules/schedules/schedule-conflict.engine.spec.ts) — 334 dòng.

Dependencies: `./schedule-conflict.engine`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 52: Schedule conflicts: Vietnam local time
- Dòng 53: blocks overlapping fixed range %s-%s
- Dòng 65: allows touching fixed boundaries %s-%s
- Dòng 75: rejects intersecting draft slots, allows different weekdays
- Dòng 89: uses old and future versions by effective date, without a lookahead cap
- Dòng 107: does not report overlap if no matching weekday occurs during the shared date range
- Dòng 117: ends inserted version at the next scheduled version of the same class
- Dòng 126: ignores replaced same-class fixed versions
- Dòng 132: warns on future temporary overlaps but permits fixed creation
- Dòng 149: still blocks recurring conflict even if that occurrence has been cancelled
- Dòng 166: excludes exactly the original occurrence when moving within its own time range
- Dòng 176: still checks other classes while excluding the source
- Dòng 185: does not exclude another occurrence of the same weekly slot next week
- Dòng 191: ignores the edited override, not other temporary schedules
- Dòng 217: preserves other same-day occurrences when applying an override
- Dòng 227: makes cancelled slots available and does not reserve cancellations
- Dòng 251: rejects ambiguous, nonexistent or already moved source occurrences
- Dòng 273: uses a future version on its boundary date
- Dòng 287: rejects invalid dates, backwards ranges, midnight rollover and AM/PM
- Dòng 300: requires a valid source date when cancelling a lesson
- Dòng 316: finds free intervals after merging occupied ranges and respects minimum duration

### edutrack_be/src/modules/schedules/schedule-conflict.engine.ts

[edutrack_be/src/modules/schedules/schedule-conflict.engine.ts](../src/modules/schedules/schedule-conflict.engine.ts) — 391 dòng.

Dependencies: `@nestjs/common`.

Functions: `isStandaloneAction(action: TemporarySlot['action'])` (dòng 44); `dateKey(value: Date)` (dòng 49); `validDate(value: string \| undefined): string` (dòng 52); `dayOfWeek(date: string)` (dòng 65); `addDate(date: string, days: number)` (dòng 68); `validateTime(slot: { startTime?: string; endTime?: string; }): asserts slot is TimeSlot` (dòng 71); `overlaps(a: TimeSlot, b: TimeSlot)` (dòng 88); `effectiveVersions(versions: FixedVersion[])` (dòng 93); `candidateEnd(snapshot: ScheduleSnapshot, classId: string, from: string)` (dòng 114); `firstOccurrence(from: string, to: string \| undefined, weekday: number)` (dòng 124); `fixedOnDate(snapshot: ScheduleSnapshot, date: string): OccupiedSlot[]` (dòng 132); `sourceMatches(event: OccupiedSlot, schedule: TemporarySlot)` (dòng 150); `occupiedOnDate(snapshot: ScheduleSnapshot, date: string, ignoreId?: string): OccupiedSlot[]` (dòng 165); `conflict(snapshot: ScheduleSnapshot, event: OccupiedSlot): ScheduleConflict` (dòng 197); `checkFixed(snapshot: ScheduleSnapshot, classId: string, from: string, slots: WeeklySlot[]): ConflictResult` (dòng 209); `resolveSource(snapshot: ScheduleSnapshot, draft: TemporarySlot, ignoreId?: string)` (dòng 303); `checkTemporary(snapshot: ScheduleSnapshot, draft: TemporarySlot, ignoreId?: string): ConflictResult` (dòng 339); `freeIntervals(busy: TimeSlot[], startTime: string, endTime: string, duration: number): TimeSlot[]` (dòng 364).

Exports: `TimeSlot` (3), `WeeklySlot` (4), `FixedVersion` (5), `TemporarySlot` (13), `ScheduleSnapshot` (24), `OccupiedSlot` (29), `ScheduleConflict` (35), `ConflictResult` (39), `dateKey` (49), `validDate` (52), `dayOfWeek` (65), `addDate` (68), `validateTime` (71), `overlaps` (88), `effectiveVersions` (93), `candidateEnd` (114), `fixedOnDate` (132), `sourceMatches` (150), `occupiedOnDate` (165), `conflict` (197), `checkFixed` (209), `resolveSource` (303), `checkTemporary` (339), `freeIntervals` (364).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
export type TimeSlot = { startTime: string; endTime: string };
// line 4
export type WeeklySlot = TimeSlot & { dayOfWeek: number };
// line 5
export type FixedVersion = {
  id: string;
  classId: string;
  version: number;
  from: string;
  to?: string;
  schedules: WeeklySlot[];
};
// line 13
export type TemporarySlot = {
  id: string;
  classId: string;
  action: 'extra' | 'one_on_one' | 'reschedule' | 'cancel';
  originalDate?: string;
  newDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  startTime?: string;
  endTime?: string;
};
// line 24
export type ScheduleSnapshot = {
  classes: Map<string, string>;
  versions: FixedVersion[];
  overrides: TemporarySlot[];
};
// line 29
export type OccupiedSlot = TimeSlot & {
  classId: string;
  scheduleId: string;
  date: string;
  type: 'fixed' | 'temporary';
};
// line 35
export type ScheduleConflict = OccupiedSlot & {
  className: string;
  message: string;
};
// line 39
export type ConflictResult = {
  blockingConflicts: ScheduleConflict[];
  warnings: ScheduleConflict[];
};
```

### edutrack_be/src/modules/schedules/schedule-conflicts.service.spec.ts

[edutrack_be/src/modules/schedules/schedule-conflicts.service.spec.ts](../src/modules/schedules/schedule-conflicts.service.spec.ts) — 571 dòng.

Dependencies: `@nestjs/testing`, `@nestjs/mongoose`, `mongoose`, `./schedule-conflicts.service`, `../school-management/enums`, `./schedule-conflict.engine`.

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 15
type QueryStub = {
  select: () => QueryStub;
  lean: () => QueryStub;
  exec: () => Promise<unknown>;
};
// line 20
type SessionQueryFilter = {
  $or: Array<{
    sourceKey?: string;
    timeStorage?: string | { $ne: string };
    startTime?: string;
    endTime?: string;
  }>;
};
```

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 37: ScheduleConflictsService
- Dòng 85: resolves Nest model dependencies and scopes all reads to JWT teacher and owned classes
- Dòng 96: rejects classes not owned by the teacher before schedule reads
- Dòng 102: converts UTC early-morning weekly times back to the correct Vietnam weekday
- Dòng 121: keeps legacy Vietnam times unchanged
- Dòng 138: rejects exclusion of another class override
- Dòng 153: blocks restoring a fixed source now occupied by another class
- Dòng 192: blocks cancelling every fixed lesson in a day when one was attended
- Dòng 235: blocks creating a reschedule for a fixed lesson already attended
- Dòng 264: blocks revoking an attended temporary lesson and normalizes UTC times
- Dòng 302: checks the old target before editing a rescheduled lesson
- Dòng 358: allows changing a scheduled lesson that has no attendance records
- Dòng 373: allows %s of a legacy completed fixed lesson after all attendance was cleared
- Dòng 408: allows revoking an extra lesson with stale completed status but no attendance
- Dòng 433: blocks legacy sessions that have attendance records but are not completed
- Dòng 453: keeps billed lessons locked even if their attendance record is missing
- Dòng 474: blocks bulk removal when a suspended schedule would delete an attended override
- Dòng 526: rejects bulk removal when an override belongs to another class
- Dòng 551: does not run a second mutation while another teacher write lease exists
- Dòng 559: releases the teacher lock when saving fails

### edutrack_be/src/modules/schedules/schedule-conflicts.service.ts

[edutrack_be/src/modules/schedules/schedule-conflicts.service.ts](../src/modules/schedules/schedule-conflicts.service.ts) — 527 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `node:crypto`, `mongoose`, `../../common/utils/vietnam-time`, `../school-management/enums`, `../school-management/schemas/attendance.schema`, `../school-management/schemas/class.schema`, `../school-management/schemas/class-session.schema`, `../school-management/schemas/schedule-version.schema`, `../school-management/schemas/schedule-override.schema`, `../school-management/schemas/tuition-entry.schema`, `../classes/dto/create-fixed-schedule.dto`, `../classes/dto/create-temporary-schedule.dto`, `./dto/check-schedule.dto`, `./schedule-conflict.engine`.

**ScheduleConflictsService** (dòng 65) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| snapshot | 82 | public snapshot(teacherId: string, classId: string): Promise<ScheduleSnapshot> |  |
| checkFixed | 139 | public checkFixed(teacherId: string, classId: string, dto: CreateFixedScheduleDto) |  |
| checkTemporary | 151 | public checkTemporary(teacherId: string, classId: string, dto: CreateTemporaryScheduleDto, ignoreId?: string) |  |
| availability | 213 | public availability(teacherId: string, dto: ScheduleAvailabilityDto) |  |
| sourceSlots | 251 | public sourceSlots(teacherId: string, classId: string, date: string, ignoreId?: string) |  |
| assertAvailable | 271 | public assertAvailable(result: ConflictResult) |  |
| assertCanRevoke | 279 | public assertCanRevoke(teacherId: string, classId: string, id: string) |  |
| assertOverridesNotAttended | 320 | public assertOverridesNotAttended(teacherId: string, classId: string, ids: string[]) |  |
| affectedOccurrences | 350 | private affectedOccurrences(snapshot: ScheduleSnapshot, schedule: TemporarySlot): AttendanceOccurrence[] |  |
| uniqueOccurrences | 399 | private uniqueOccurrences(occurrences: AttendanceOccurrence[]) |  |
| assertOccurrencesNotAttended | 410 | private assertOccurrencesNotAttended(teacherId: string, classId: string, occurrences: AttendanceOccurrence[]) |  |
| occurrenceSessionFilters | 461 | private occurrenceSessionFilters(classId: string, occurrence: AttendanceOccurrence) |  |
| checkOwnedOverride | 487 | private checkOwnedOverride(snapshot: ScheduleSnapshot, classId: string, id?: string) |  |
| withTeacherWrite | 500 | public withTeacherWrite(teacherId: string, write: () => Promise<T>): Promise<T> |  |

Exports: `ScheduleConflictsService` (65).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 60
type AttendanceOccurrence = Pick<
  OccupiedSlot,
  'date' | 'startTime' | 'endTime'
>;
```

### edutrack_be/src/modules/schedules/schedules-cron.service.spec.ts

[edutrack_be/src/modules/schedules/schedules-cron.service.spec.ts](../src/modules/schedules/schedules-cron.service.spec.ts) — 329 dòng.

Dependencies: `@nestjs/common`, `mongoose`, `./schedules-cron.service`, `./schedules.service`.

Functions: `query(value: T)` (dòng 6).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 13: Scheduled push reminders
- Dòng 79: sends pre-class reminders at %s Vietnam time including catch-up
- Dòng 102: does not send outside reminder windows at %s
- Dòng 111: reminds unrecorded attendance at %s
- Dòng 137: skips recorded/cancelled attendance and supports UTC/legacy session matching
- Dòng 160: does not remind attendance after a short lesson has ended
- Dòng 167: skips cancelled and incomplete schedule events
- Dòng 179: sends for %s events returned by the calendar
- Dòng 188: releases unsent reminders for retry when listener returns %j
- Dòng 211: releases a claim and reports status after delivery throws
- Dòng 228: does not send already claimed or delivered reminders
- Dòng 235: fetches both weeks for an upcoming Monday class near Sunday midnight
- Dòng 256: does not overlap scans and recovers from a failed teacher query
- Dòng 277: continues to another teacher when a calendar lookup fails
- Dòng 292: records a heartbeat even with no subscriptions
- Dòng 301: does not send stale pre-class reminders after a slow calendar query
- Dòng 311: rechecks the delivery window after a delayed lease at %s

### edutrack_be/src/modules/schedules/schedules-cron.service.ts

[edutrack_be/src/modules/schedules/schedules-cron.service.ts](../src/modules/schedules/schedules-cron.service.ts) — 253 dòng.

Dependencies: `@nestjs/common`, `@nestjs/schedule`, `@nestjs/mongoose`, `mongoose`, `@nestjs/event-emitter`, `../users/schemas/user.schema`, `../school-management/schemas/class-session.schema`, `../school-management/enums/session-status.enum`, `./schedules.service`, `../../common/utils/vietnam-time`, `./push-reminder-store.service`.

**SchedulesCronService** (dòng 22) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 24 |  |  |
| running | 25 |  |  |
| lastStartedAt | 26 | string \| null |  |
| lastCompletedAt | 27 | string \| null |  |
| lastError | 28 | string \| null |  |
| getStatus | 39 | public getStatus() |  |
| scanAfterStartup | 49 | public scanAfterStartup() | @Timeout('initial-push-reminders', 5_000) |
| handleCron | 54 | public handleCron() | @Cron(CronExpression.EVERY_MINUTE, { name: 'push-reminders', waitForCompletion: true, }) |
| reminderWindow | 173 | private reminderWindow(start: number, end: number) |  |
| getNearbyEvents | 185 | private getNearbyEvents(teacherId: string, now: Date) |  |
| isSessionFinished | 211 | private isSessionFinished(teacherId: Types.ObjectId, event: TeacherScheduleEventResponse) |  |
| vietnamDate | 249 | private vietnamDate(timestamp: number) |  |

Exports: `SchedulesCronService` (22).

### edutrack_be/src/modules/schedules/schedules.controller.ts

[edutrack_be/src/modules/schedules/schedules.controller.ts](../src/modules/schedules/schedules.controller.ts) — 73 dòng.

Dependencies: `@nestjs/common`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `./dto/query-teacher-week-schedule.dto`, `./schedules.service`, `./schedule-conflicts.service`, `./schedules-cron.service`, `./dto/check-schedule.dto`.

**SchedulesController** (dòng 15) @Controller('schedules') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getReminderStatus | 24 | public getReminderStatus() | @Get('reminders/status') |
| checkFixed | 29 | public checkFixed(@CurrentUser() user: JwtUser, @Body() dto: CheckFixedScheduleDto) | @Post('conflicts/check-fixed') |
| checkTemporary | 34 | public checkTemporary(@CurrentUser() user: JwtUser, @Body() dto: CheckTemporaryScheduleDto) | @Post('conflicts/check-temporary') |
| availability | 47 | public availability(@CurrentUser() user: JwtUser, @Body() dto: ScheduleAvailabilityDto) | @Post('availability') |
| sourceSlots | 55 | public sourceSlots(@CurrentUser() user: JwtUser, @Query('classId') classId: string, @Query('date') date: string, @Query('ignoreOverrideId') ignoreId?: string) | @Get('source-slots') |
| getTeacherWeekSchedule | 65 | public getTeacherWeekSchedule(@CurrentUser() user: JwtUser, @Query() query: QueryTeacherWeekScheduleDto) | @Get('week') |

Exports: `SchedulesController` (15).

### edutrack_be/src/modules/schedules/schedules.module.ts

[edutrack_be/src/modules/schedules/schedules.module.ts](../src/modules/schedules/schedules.module.ts) — 38 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `../school-management/school-management.module`, `./schedules.controller`, `./schedules.service`, `./schedule-conflicts.service`, `./schedules-cron.service`, `./push-reminder-store.service`, `./schemas/push-reminder.schema`, `../users/schemas/user.schema`, `../school-management/schemas/class-session.schema`.

**SchedulesModule** (dòng 19) @Module({ imports: [ SchoolManagementModule, MongooseModule.forFeature([ { name: User.name, schema: UserSchema }, { name: ClassSession.name, schema: ClassSessionSchema }, { name: PushReminder.name, schema: PushReminderSchema }, ]), ], controllers: [SchedulesController], providers: [ SchedulesService, ScheduleConflictsService, SchedulesCronService, PushReminderStore, ], exports: [SchedulesService, ScheduleConflictsService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `SchedulesModule` (19).

### edutrack_be/src/modules/schedules/schedules.service.spec.ts

[edutrack_be/src/modules/schedules/schedules.service.spec.ts](../src/modules/schedules/schedules.service.spec.ts) — 354 dòng.

Dependencies: `mongoose`, `./schedules.service`, `../school-management/enums`.

Functions: `query(data: unknown): QueryStub` (dòng 17); `model(data: unknown): T` (dòng 28); `createService(classes: ScheduleModels[0], versions: ScheduleModels[1], overrides: ScheduleModels[2], sessions: ScheduleModels[3], attendance: ScheduleModels[4] = model([]), tuition: ScheduleModels[5] = model([]))` (dòng 51).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 5
type QueryStub = {
  sort: () => QueryStub;
  select: () => QueryStub;
  lean: () => QueryStub;
  exec: () => Promise<unknown>;
};
// line 12
type ModelData = {
  find?: unknown;
  findOne?: unknown;
};
// line 50
type ScheduleModels = ConstructorParameters<typeof SchedulesService>;
```

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 69: Teacher calendar source exclusion
- Dòng 70: moves only the selected fixed slot and returns original Vietnam time to both calendars
- Dòng 123: returns extra schedules for attendance even when the class has no fixed version
- Dòng 175: keeps one-on-one schedules distinct for attendance and billing
- Dòng 219: keeps standalone class sessions visible in attendance history
- Dòng 273: keeps standalone class sessions visible in the teacher week calendar
- Dòng 318: does not resurrect a revoked %s lesson after attendance was cleared

### edutrack_be/src/modules/schedules/schedules.service.ts

[edutrack_be/src/modules/schedules/schedules.service.ts](../src/modules/schedules/schedules.service.ts) — 1093 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `mongoose`, `../../common/utils/vietnam-time`, `../school-management/enums`, `../school-management/schemas/attendance.schema`, `../school-management/schemas/class.schema`, `../school-management/schemas/class-session.schema`, `../school-management/schemas/schedule-override.schema`, `../school-management/schemas/schedule-version.schema`, `../school-management/schemas/tuition-entry.schema`, `./dto/query-teacher-week-schedule.dto`.

**SchedulesService** (dòng 140) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getTeacherWeekSchedule | 157 | public getTeacherWeekSchedule(teacherId: string, query: QueryTeacherWeekScheduleDto = {}): Promise<TeacherWeekScheduleResponse> |  |
| getClassScheduleHistory | 267 | public getClassScheduleHistory(teacherId: string, classId: string): Promise<TeacherScheduleEventResponse[]> |  |
| findClassScheduleHistoryStartDate | 375 | private findClassScheduleHistoryStartDate(teacherId: Types.ObjectId, classId: Types.ObjectId, endDateExclusive: Date) |  |
| buildFixedEvents | 435 | private buildFixedEvents(days: TeacherScheduleDayResponse[], fixedSchedules: LeanScheduleVersion[], classMap: Map<string, LeanClass>, colorMap: Map<string, number>) |  |
| excludeRevokedTemporarySessions | 495 | private excludeRevokedTemporarySessions(teacherId: Types.ObjectId, events: TeacherScheduleEventResponse[], sessions: LeanClassSession[]) |  |
| attachSessionContent | 569 | private attachSessionContent(events: TeacherScheduleEventResponse[], sessions: LeanClassSession[]) |  |
| appendStandaloneClassSessions | 623 | private appendStandaloneClassSessions(events: TeacherScheduleEventResponse[], sessions: LeanClassSession[], classMap: Map<string, LeanClass>, colorMap: Map<string, number>) |  |
| mapSessionScheduleTypeToEventType | 680 | private mapSessionScheduleTypeToEventType(scheduleType?: ScheduleType): Exclude<TeacherScheduleEventType, 'cancel'> |  |
| applyTemporarySchedules | 702 | private applyTemporarySchedules(fixedEvents: TeacherScheduleEventResponse[], temporarySchedules: LeanScheduleOverride[], classMap: Map<string, LeanClass>, colorMap: Map<string, number>, weekStart: Date, weekEndExclusive: Date) |  |
| buildTemporaryEvent | 834 | private buildTemporaryEvent({ schedule, classroom, colorIndex, date, originalDate, type, }: { schedule: LeanScheduleOverride; classroom: LeanClass; colorIndex: number; date: string; originalDate?: string; type: TeacherScheduleEventType; }): TeacherScheduleEventResponse |  |
| findActiveSchedulesForDate | 876 | private findActiveSchedulesForDate(schedules: LeanScheduleVersion[], dayStart: Date, dayEnd: Date) |  |
| removeFixedEvents | 907 | private removeFixedEvents(events: TeacherScheduleEventResponse[], classId: string, date: string, startTime?: string, endTime?: string) |  |
| sortEvents | 937 | private sortEvents(events: TeacherScheduleEventResponse[]) |  |
| buildWeekDays | 949 | private buildWeekDays(weekStart: Date): TeacherScheduleDayResponse[] |  |
| buildDays | 953 | private buildDays(startDate: Date, endDateExclusive: Date): TeacherScheduleDayResponse[] |  |
| buildEmptyWeekResponse | 969 | private buildEmptyWeekResponse(weekStart: Date, days: TeacherScheduleDayResponse[]): TeacherWeekScheduleResponse |  |
| buildClassMap | 982 | private buildClassMap(classes: LeanClass[]) |  |
| buildColorMap | 988 | private buildColorMap(classes: LeanClass[]) |  |
| parseVietnamDateOnly | 997 | private parseVietnamDateOnly(value: string, label: string) |  |
| getCurrentVietnamDate | 1022 | private getCurrentVietnamDate() |  |
| getVietnamWeekStart | 1029 | private getVietnamWeekStart(date: Date) |  |
| getVietnamDayOfWeek | 1035 | private getVietnamDayOfWeek(date: Date) |  |
| toVietnamDateKey | 1042 | private toVietnamDateKey(date: Date) |  |
| isDateKeyInWeek | 1051 | private isDateKeyInWeek(dateKey: string, weekStart: Date, weekEndExclusive: Date) |  |
| addDays | 1061 | private addDays(date: Date, days: number) |  |
| buildSessionKey | 1065 | private buildSessionKey(classId: string, date: string, startTime: string, endTime: string) |  |
| toVietnamTime | 1074 | private toVietnamTime(time: string \| undefined, timeStorage?: 'utc' \| 'vietnam') |  |
| toObjectId | 1085 | private toObjectId(value: string, fieldName: string) |  |

Exports: `TeacherScheduleClassResponse` (47), `TeacherScheduleDayResponse` (55), `TeacherScheduleEventType` (60), `TeacherScheduleEventResponse` (63), `TeacherWeekScheduleResponse` (83), `SchedulesService` (140).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 47
export type TeacherScheduleClassResponse = {
  id: string;
  name: string;
  imageUrl: string;
  colorIndex: number;
  colorHex?: string;
};
// line 55
export type TeacherScheduleDayResponse = {
  date: string;
  dayOfWeek: number;
};
// line 60
export type TeacherScheduleEventType =
  'fixed' | 'extra' | 'one_on_one' | 'reschedule' | 'cancel' | 'manual';
// line 63
export type TeacherScheduleEventResponse = {
  id: string;
  classId: string;
  className: string;
  classImageUrl: string;
  colorIndex: number;
  colorHex?: string;
  date: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  type: TeacherScheduleEventType;
  reason?: string;
  originalDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  topic?: string;
  content?: string;
};
// line 83
export type TeacherWeekScheduleResponse = {
  weekStart: string;
  weekEnd: string;
  days: TeacherScheduleDayResponse[];
  classes: TeacherScheduleClassResponse[];
  events: TeacherScheduleEventResponse[];
};
// line 91
type LeanClass = {
  _id: Types.ObjectId;
  name: string;
  imageUrl?: string;
  colorIndex?: number;
  colorHex?: string;
};
// line 99
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
// line 113
type LeanScheduleOverride = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  action: ScheduleOverrideAction;
  originalDate?: Date;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate?: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
  timeStorage?: 'utc' | 'vietnam';
};
// line 127
type LeanClassSession = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  timeStorage?: 'utc' | 'vietnam';
  scheduleType?: ScheduleType;
  status?: SessionStatus;
  topic?: string;
  content?: string;
};
```

### edutrack_be/src/modules/schedules/schemas/push-reminder.schema.ts

[edutrack_be/src/modules/schedules/schemas/push-reminder.schema.ts](../src/modules/schedules/schemas/push-reminder.schema.ts) — 26 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`.

**PushReminder** (dòng 5) @Schema({ collection: 'push_reminders', versionKey: false })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| _id | 7 | string | @Prop({ type: String, required: true }) |
| leaseToken | 10 | string | @Prop({ required: true }) |
| leaseUntil | 13 | Date | @Prop({ type: Date, required: true }) |
| sentAt | 16 | Date (optional) | @Prop({ type: Date }) |
| expiresAt | 19 | Date | @Prop({ type: Date, required: true }) |

Exports: `PushReminder` (5), `PushReminderDocument` (23), `PushReminderSchema` (24).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 23
export type PushReminderDocument = HydratedDocument<PushReminder>;
```

Indexes:

- Dòng 25: `PushReminderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`

### edutrack_be/src/modules/school-management/enums/attendance-status.enum.ts

[edutrack_be/src/modules/school-management/enums/attendance-status.enum.ts](../src/modules/school-management/enums/attendance-status.enum.ts) — 7 dòng.

Exports: `AttendanceStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Excused = 'excused',
  Late = 'late',
}
```

### edutrack_be/src/modules/school-management/enums/attendance-type.enum.ts

[edutrack_be/src/modules/school-management/enums/attendance-type.enum.ts](../src/modules/school-management/enums/attendance-type.enum.ts) — 5 dòng.

Exports: `AttendanceType` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum AttendanceType {
  Regular = 'regular',
  Makeup = 'makeup',
}
```

### edutrack_be/src/modules/school-management/enums/billing-status.enum.ts

[edutrack_be/src/modules/school-management/enums/billing-status.enum.ts](../src/modules/school-management/enums/billing-status.enum.ts) — 9 dòng.

Exports: `BillingStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum BillingStatus {
  Open = 'open',
  Warning = 'warning',
  Ready = 'ready',
  ClosedEarly = 'closed_early',
  Closed = 'closed',
  Paid = 'paid',
}
```

### edutrack_be/src/modules/school-management/enums/class-status.enum.ts

[edutrack_be/src/modules/school-management/enums/class-status.enum.ts](../src/modules/school-management/enums/class-status.enum.ts) — 6 dòng.

Exports: `ClassStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum ClassStatus {
  Active = 'active',
  Inactive = 'inactive',
  Archived = 'archived',
}
```

### edutrack_be/src/modules/school-management/enums/day-of-week.enum.ts

[edutrack_be/src/modules/school-management/enums/day-of-week.enum.ts](../src/modules/school-management/enums/day-of-week.enum.ts) — 12 dòng.

Exports: `DayOfWeek` (1), `DAY_OF_WEEK_VALUES` (11).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}
```

### edutrack_be/src/modules/school-management/enums/enrollment-status.enum.ts

[edutrack_be/src/modules/school-management/enums/enrollment-status.enum.ts](../src/modules/school-management/enums/enrollment-status.enum.ts) — 6 dòng.

Exports: `EnrollmentStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum EnrollmentStatus {
  Active = 'active',
  OnLeave = 'on_leave',
  Inactive = 'inactive',
}
```

### edutrack_be/src/modules/school-management/enums/gender.enum.ts

[edutrack_be/src/modules/school-management/enums/gender.enum.ts](../src/modules/school-management/enums/gender.enum.ts) — 6 dòng.

Exports: `Gender` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}
```

### edutrack_be/src/modules/school-management/enums/notification-type.enum.ts

[edutrack_be/src/modules/school-management/enums/notification-type.enum.ts](../src/modules/school-management/enums/notification-type.enum.ts) — 6 dòng.

Exports: `NotificationType` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum NotificationType {
  TuitionWarning = 'tuition_warning',
  TuitionReady = 'tuition_ready',
  General = 'general',
}
```

### edutrack_be/src/modules/school-management/enums/payment-status.enum.ts

[edutrack_be/src/modules/school-management/enums/payment-status.enum.ts](../src/modules/school-management/enums/payment-status.enum.ts) — 7 dòng.

Exports: `PaymentStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum PaymentStatus {
  Unpaid = 'unpaid',
  PartiallyPaid = 'partially_paid',
  Paid = 'paid',
  Cancelled = 'cancelled',
}
```

### edutrack_be/src/modules/school-management/enums/receipt-pdf-status.enum.ts

[edutrack_be/src/modules/school-management/enums/receipt-pdf-status.enum.ts](../src/modules/school-management/enums/receipt-pdf-status.enum.ts) — 6 dòng.

Exports: `ReceiptPdfStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum ReceiptPdfStatus {
  Pending = 'pending',
  Generated = 'generated',
  Failed = 'failed',
}
```

### edutrack_be/src/modules/school-management/enums/receipt-reason.enum.ts

[edutrack_be/src/modules/school-management/enums/receipt-reason.enum.ts](../src/modules/school-management/enums/receipt-reason.enum.ts) — 5 dòng.

Exports: `ReceiptReason` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum ReceiptReason {
  CycleCompleted = 'cycle_completed',
  ManualEarly = 'manual_early',
}
```

### edutrack_be/src/modules/school-management/enums/receipt-scope.enum.ts

[edutrack_be/src/modules/school-management/enums/receipt-scope.enum.ts](../src/modules/school-management/enums/receipt-scope.enum.ts) — 5 dòng.

Exports: `ReceiptScope` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum ReceiptScope {
  Class = 'class',
  MultiClass = 'multi_class',
}
```

### edutrack_be/src/modules/school-management/enums/schedule-override-action.enum.ts

[edutrack_be/src/modules/school-management/enums/schedule-override-action.enum.ts](../src/modules/school-management/enums/schedule-override-action.enum.ts) — 7 dòng.

Exports: `ScheduleOverrideAction` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum ScheduleOverrideAction {
  Reschedule = 'reschedule',
  Cancel = 'cancel',
  Extra = 'extra',
  OneOnOne = 'one_on_one',
}
```

### edutrack_be/src/modules/school-management/enums/schedule-type.enum.ts

[edutrack_be/src/modules/school-management/enums/schedule-type.enum.ts](../src/modules/school-management/enums/schedule-type.enum.ts) — 8 dòng.

Exports: `ScheduleType` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum ScheduleType {
  Fixed = 'fixed',
  Temporary = 'temporary',
  Extra = 'extra',
  OneOnOne = 'one_on_one',
  Manual = 'manual',
}
```

### edutrack_be/src/modules/school-management/enums/session-status.enum.ts

[edutrack_be/src/modules/school-management/enums/session-status.enum.ts](../src/modules/school-management/enums/session-status.enum.ts) — 6 dòng.

Exports: `SessionStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum SessionStatus {
  Scheduled = 'scheduled',
  Completed = 'completed',
  Cancelled = 'cancelled',
}
```

### edutrack_be/src/modules/school-management/enums/student-status.enum.ts

[edutrack_be/src/modules/school-management/enums/student-status.enum.ts](../src/modules/school-management/enums/student-status.enum.ts) — 5 dòng.

Exports: `StudentStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum StudentStatus {
  Active = 'active',
  Inactive = 'inactive',
}
```

### edutrack_be/src/modules/school-management/enums/tuition-status.enum.ts

[edutrack_be/src/modules/school-management/enums/tuition-status.enum.ts](../src/modules/school-management/enums/tuition-status.enum.ts) — 6 dòng.

Exports: `TuitionStatus` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum TuitionStatus {
  Unbilled = 'unbilled',
  Billed = 'billed',
  Void = 'void',
}
```

### edutrack_be/src/modules/school-management/enums/tuition-type.enum.ts

[edutrack_be/src/modules/school-management/enums/tuition-type.enum.ts](../src/modules/school-management/enums/tuition-type.enum.ts) — 10 dòng.

Exports: `TuitionType` (1).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum TuitionType {
  Regular = 'regular',
  Makeup = 'makeup',
  Absence = 'absence',
  Extra = 'extra',
  OneOnOne = 'one_on_one',
  Discount = 'discount',
  Adjustment = 'adjustment',
}
```

### edutrack_be/src/modules/school-management/schemas/attendance.schema.ts

[edutrack_be/src/modules/school-management/schemas/attendance.schema.ts](../src/modules/school-management/schemas/attendance.schema.ts) — 96 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./class.schema`, `./class-session.schema`, `./student.schema`.

**Attendance** (dòng 9) @Schema({ collection: 'attendances', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 15 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| sessionId | 23 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ClassSession.name, required: true, index: true, }) |
| classId | 31 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| studentId | 39 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, required: true, index: true, }) |
| status | 47 | AttendanceStatus | @Prop({ enum: AttendanceStatus, required: true, index: true, }) |
| attendanceType | 54 | AttendanceType | @Prop({ enum: AttendanceType, default: AttendanceType.Regular, index: true, }) |
| homeClassId | 61 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| makeupForSessionId | 67 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ClassSession.name, }) |
| note | 73 | string | @Prop({ type: String, maxlength: 500, default: '' }) |
| isBilled | 76 | boolean | @Prop({ type: Boolean, default: false }) |

Exports: `Attendance` (9), `AttendanceDocument` (80), `AttendanceSchema` (81).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 80
export type AttendanceDocument = HydratedDocument<Attendance>;
```

Indexes:

- Dòng 83: `AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true })`
- Dòng 84: `AttendanceSchema.index({ teacherId: 1, sessionId: 1, status: 1 })`
- Dòng 85: `AttendanceSchema.index({ teacherId: 1, studentId: 1, createdAt: -1 })`
- Dòng 86: `AttendanceSchema.index( { teacherId: 1, studentId: 1, makeupForSessionId: 1 }, { unique: true, partialFilterExpression: { attendanceType: AttendanceType.Makeup, makeupForSessionId: { $exists: true }, }, }, )`

### edutrack_be/src/modules/school-management/schemas/billing-cycle.schema.ts

[edutrack_be/src/modules/school-management/schemas/billing-cycle.schema.ts](../src/modules/school-management/schemas/billing-cycle.schema.ts) — 73 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./student.schema`.

**BillingCycle** (dòng 7) @Schema({ collection: 'billing_cycles', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 13 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| studentId | 21 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, required: true, index: true, }) |
| cycleNumber | 29 | number | @Prop({ required: true, min: 1 }) |
| targetSessionCount | 32 | number | @Prop({ required: true, default: 10, min: 1 }) |
| sessionCount | 35 | number | @Prop({ required: true, default: 0, min: 0 }) |
| warningSessionCount | 38 | number | @Prop({ required: true, default: 8, min: 1 }) |
| status | 41 | BillingStatus | @Prop({ enum: BillingStatus, default: BillingStatus.Open, index: true, }) |
| startedAt | 48 | Date | @Prop({ type: Date, required: true, default: Date.now }) |
| readyAt | 51 | Date (optional) | @Prop({ type: Date }) |
| closedAt | 54 | Date (optional) | @Prop({ type: Date }) |
| receiptId | 57 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Receipt', }) |

Exports: `BillingCycle` (7), `BillingCycleDocument` (64), `BillingCycleSchema` (65).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 64
export type BillingCycleDocument = HydratedDocument<BillingCycle>;
```

Indexes:

- Dòng 67: `BillingCycleSchema.index( { teacherId: 1, studentId: 1, cycleNumber: 1 }, { unique: true }, )`
- Dòng 71: `BillingCycleSchema.index({ teacherId: 1, studentId: 1, status: 1 })`
- Dòng 72: `BillingCycleSchema.index({ teacherId: 1, status: 1, updatedAt: -1 })`

### edutrack_be/src/modules/school-management/schemas/class-enrollment.schema.ts

[edutrack_be/src/modules/school-management/schemas/class-enrollment.schema.ts](../src/modules/school-management/schemas/class-enrollment.schema.ts) — 69 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./class.schema`, `./student.schema`.

**ClassEnrollment** (dòng 8) @Schema({ collection: 'class_enrollments', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 14 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| classId | 22 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| studentId | 30 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, required: true, index: true, }) |
| joinedAt | 38 | Date | @Prop({ type: Date, default: Date.now }) |
| leftAt | 41 | Date \| null (optional) | @Prop({ type: Date, default: null }) |
| status | 44 | EnrollmentStatus | @Prop({ enum: EnrollmentStatus, default: EnrollmentStatus.Active, index: true, }) |
| note | 51 | string (optional) | @Prop({ trim: true }) |

Exports: `ClassEnrollment` (8), `ClassEnrollmentDocument` (55), `ClassEnrollmentSchema` (56).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 55
export type ClassEnrollmentDocument = HydratedDocument<ClassEnrollment>;
```

Indexes:

- Dòng 59: `ClassEnrollmentSchema.index({ teacherId: 1, classId: 1, status: 1 })`
- Dòng 60: `ClassEnrollmentSchema.index({ teacherId: 1, studentId: 1, status: 1 })`
- Dòng 61: `ClassEnrollmentSchema.index({ teacherId: 1, classId: 1, studentId: 1 })`
- Dòng 62: `ClassEnrollmentSchema.index( { teacherId: 1, classId: 1, studentId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: EnrollmentStatus.Active }, }, )`

### edutrack_be/src/modules/school-management/schemas/class-price-version.schema.ts

[edutrack_be/src/modules/school-management/schemas/class-price-version.schema.ts](../src/modules/school-management/schemas/class-price-version.schema.ts) — 56 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `./class.schema`.

**ClassPriceVersion** (dòng 11) @Schema({ collection: 'class_price_versions', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 17 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| classId | 25 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| effectiveFrom | 33 | Date | @Prop({ type: Date, required: true, index: true }) |
| regularPrice | 36 | number | @Prop({ required: true, min: 0, validate: integerMoneyValidator }) |
| makeupPrice | 39 | number | @Prop({ required: true, min: 0, validate: integerMoneyValidator }) |

Exports: `ClassPriceVersion` (11), `ClassPriceVersionDocument` (43), `ClassPriceVersionSchema` (44).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 43
export type ClassPriceVersionDocument = HydratedDocument<ClassPriceVersion>;
```

Indexes:

- Dòng 47: `ClassPriceVersionSchema.index( { teacherId: 1, classId: 1, effectiveFrom: 1 }, { unique: true }, )`
- Dòng 51: `ClassPriceVersionSchema.index({ teacherId: 1, classId: 1, effectiveFrom: -1, })`

### edutrack_be/src/modules/school-management/schemas/class-session.schema.ts

[edutrack_be/src/modules/school-management/schemas/class-session.schema.ts](../src/modules/school-management/schemas/class-session.schema.ts) — 100 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./class.schema`, `./schedule-override.schema`, `./schedule-version.schema`.

**ClassSession** (dòng 11) @Schema({ collection: 'class_sessions', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 17 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| classId | 25 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| sessionNumber | 33 | number (optional) | @Prop({ min: 1 }) |
| date | 36 | Date | @Prop({ type: Date, required: true, index: true }) |
| startTime | 39 | string | @Prop({ required: true, match: timePattern }) |
| endTime | 42 | string | @Prop({ required: true, match: timePattern }) |
| timeStorage | 45 | 'utc' \| 'vietnam' | @Prop({ enum: ['utc', 'vietnam'], default: 'utc' }) |
| scheduleVersionId | 48 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ScheduleVersion.name, }) |
| scheduleOverrideId | 54 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ScheduleOverride.name, }) |
| scheduleType | 60 | ScheduleType | @Prop({ enum: ScheduleType, required: true, index: true, }) |
| topic | 67 | string (optional) | @Prop({ trim: true }) |
| content | 70 | string (optional) | @Prop({ trim: true }) |
| status | 73 | SessionStatus | @Prop({ enum: SessionStatus, default: SessionStatus.Scheduled, index: true, }) |
| completedAt | 80 | Date (optional) | @Prop({ type: Date }) |
| sourceKey | 83 | string (optional) | @Prop({ trim: true }) |

Exports: `ClassSession` (11), `ClassSessionDocument` (87), `ClassSessionSchema` (88).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 87
export type ClassSessionDocument = HydratedDocument<ClassSession>;
```

Indexes:

- Dòng 90: `ClassSessionSchema.index({ teacherId: 1, classId: 1, date: 1 })`
- Dòng 91: `ClassSessionSchema.index({ teacherId: 1, date: 1, status: 1 })`
- Dòng 92: `ClassSessionSchema.index({ teacherId: 1, classId: 1, sessionNumber: 1 })`
- Dòng 93: `ClassSessionSchema.index( { teacherId: 1, classId: 1, sourceKey: 1 }, { unique: true, partialFilterExpression: { sourceKey: { $exists: true } }, }, )`

### edutrack_be/src/modules/school-management/schemas/class.schema.ts

[edutrack_be/src/modules/school-management/schemas/class.schema.ts](../src/modules/school-management/schemas/class.schema.ts) — 72 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`.

**Class** (dòng 11) @Schema({ collection: 'classes', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 17 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| name | 25 | string | @Prop({ required: true, trim: true }) |
| searchText | 28 | string | @Prop({ required: true, trim: true, select: false }) |
| description | 31 | string (optional) | @Prop({ trim: true }) |
| imageUrl | 34 | string (optional) | @Prop({ trim: true }) |
| colorIndex | 37 | number | @Prop({ default: 0, min: 0, max: 7 }) |
| colorHex | 40 | string (optional) | @Prop({ trim: true, lowercase: true, match: /^#([0-9a-f]{6})$/, }) |
| regularPrice | 47 | number | @Prop({ required: true, min: 0, validate: integerMoneyValidator }) |
| makeupPrice | 50 | number | @Prop({ required: true, min: 0, validate: integerMoneyValidator }) |
| priceEffectiveFrom | 53 | Date (optional) | @Prop({ type: Date }) |
| status | 56 | ClassStatus | @Prop({ enum: ClassStatus, default: ClassStatus.Active, index: true, }) |

Exports: `Class` (11), `ClassDocument` (64), `ClassSchema` (65).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 64
export type ClassDocument = HydratedDocument<Class>;
```

Indexes:

- Dòng 67: `ClassSchema.index({ teacherId: 1, status: 1 })`
- Dòng 68: `ClassSchema.index({ teacherId: 1, name: 1 })`
- Dòng 69: `ClassSchema.index({ teacherId: 1, searchText: 1 })`
- Dòng 70: `ClassSchema.index({ teacherId: 1, colorIndex: 1 })`
- Dòng 71: `ClassSchema.index({ teacherId: 1, colorHex: 1 })`

### edutrack_be/src/modules/school-management/schemas/exam-score.schema.ts

[edutrack_be/src/modules/school-management/schemas/exam-score.schema.ts](../src/modules/school-management/schemas/exam-score.schema.ts) — 66 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `./class.schema`, `./exam.schema`, `./student.schema`.

**ExamScore** (dòng 8) @Schema({ collection: 'exam_scores', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 14 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| examId | 22 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Exam.name, required: true, index: true, }) |
| classId | 30 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| studentId | 38 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, required: true, index: true, }) |
| score | 46 | number | @Prop({ required: true, min: 0 }) |
| note | 49 | string (optional) | @Prop({ trim: true }) |
| evidenceImages | 52 | string[] (optional) | @Prop({ type: [String], default: [] }) |
| deletedAt | 55 | Date (optional) | @Prop({ type: Date }) |

Exports: `ExamScore` (8), `ExamScoreDocument` (59), `ExamScoreSchema` (60).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 59
export type ExamScoreDocument = HydratedDocument<ExamScore>;
```

Indexes:

- Dòng 62: `ExamScoreSchema.index({ examId: 1, studentId: 1 }, { unique: true })`
- Dòng 63: `ExamScoreSchema.index({ teacherId: 1, studentId: 1, createdAt: -1 })`
- Dòng 64: `ExamScoreSchema.index({ teacherId: 1, examId: 1 })`
- Dòng 65: `ExamScoreSchema.index({ teacherId: 1, classId: 1, studentId: 1 })`

### edutrack_be/src/modules/school-management/schemas/exam.schema.ts

[edutrack_be/src/modules/school-management/schemas/exam.schema.ts](../src/modules/school-management/schemas/exam.schema.ts) — 63 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `./class.schema`, `./class-session.schema`.

**Exam** (dòng 7) @Schema({ collection: 'exams', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 13 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| classId | 21 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| sessionId | 29 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ClassSession.name, }) |
| title | 35 | string | @Prop({ required: true, trim: true }) |
| testDate | 38 | Date | @Prop({ type: Date, required: true, index: true }) |
| maxScore | 41 | number | @Prop({ required: true, min: 0 }) |
| description | 44 | string (optional) | @Prop({ trim: true }) |
| fileUrl | 47 | string (optional) | @Prop({ trim: true }) |
| fileName | 50 | string (optional) | @Prop({ trim: true }) |
| deletedAt | 53 | Date (optional) | @Prop({ type: Date }) |

Exports: `Exam` (7), `ExamDocument` (57), `ExamSchema` (58).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 57
export type ExamDocument = HydratedDocument<Exam>;
```

Indexes:

- Dòng 60: `ExamSchema.index({ teacherId: 1, classId: 1, testDate: -1 })`
- Dòng 61: `ExamSchema.index({ teacherId: 1, testDate: -1 })`
- Dòng 62: `ExamSchema.index({ teacherId: 1, deletedAt: 1, testDate: -1 })`

### edutrack_be/src/modules/school-management/schemas/notification.schema.ts

[edutrack_be/src/modules/school-management/schemas/notification.schema.ts](../src/modules/school-management/schemas/notification.schema.ts) — 63 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./billing-cycle.schema`, `./student.schema`.

**Notification** (dòng 8) @Schema({ collection: 'notifications', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 14 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| studentId | 22 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, }) |
| billingCycleId | 28 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: BillingCycle.name, }) |
| type | 34 | NotificationType | @Prop({ enum: NotificationType, required: true, index: true, }) |
| title | 41 | string | @Prop({ required: true, trim: true }) |
| message | 44 | string | @Prop({ required: true, trim: true }) |
| dedupKey | 47 | string | @Prop({ required: true, trim: true }) |
| isRead | 50 | boolean | @Prop({ default: false, index: true }) |
| readAt | 53 | Date (optional) | @Prop({ type: Date }) |

Exports: `Notification` (8), `NotificationDocument` (57), `NotificationSchema` (58).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 57
export type NotificationDocument = HydratedDocument<Notification>;
```

Indexes:

- Dòng 60: `NotificationSchema.index({ teacherId: 1, isRead: 1, createdAt: -1 })`
- Dòng 61: `NotificationSchema.index({ teacherId: 1, type: 1, createdAt: -1 })`
- Dòng 62: `NotificationSchema.index({ teacherId: 1, dedupKey: 1 }, { unique: true })`

### edutrack_be/src/modules/school-management/schemas/receipt-template-snapshot.schema.ts

[edutrack_be/src/modules/school-management/schemas/receipt-template-snapshot.schema.ts](../src/modules/school-management/schemas/receipt-template-snapshot.schema.ts) — 27 dòng.

Dependencies: `@nestjs/mongoose`.

**ReceiptTemplateSnapshot** (dòng 3) @Schema({ _id: false, versionKey: false })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| id | 5 | string | @Prop({ required: true }) |
| name | 8 | string | @Prop({ required: true }) |
| version | 11 | number | @Prop({ required: true, min: 1 }) |
| revision | 14 | string | @Prop({ required: true }) |
| html | 17 | string | @Prop({ required: true }) |
| css | 20 | string | @Prop({ default: '' }) |

Exports: `ReceiptTemplateSnapshot` (3), `ReceiptTemplateSnapshotSchema` (24).

### edutrack_be/src/modules/school-management/schemas/receipt.schema.ts

[edutrack_be/src/modules/school-management/schemas/receipt.schema.ts](../src/modules/school-management/schemas/receipt.schema.ts) — 492 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./billing-cycle.schema`, `./class.schema`, `./class-session.schema`, `./exam.schema`, `./student.schema`, `./tuition-entry.schema`, `./receipt-template-snapshot.schema`.

**ReceiptStudentSnapshot** (dòng 29) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentCode | 34 | string (optional) | @Prop({ trim: true }) |
| fullName | 37 | string | @Prop({ required: true, trim: true }) |
| phone | 40 | string (optional) | @Prop({ trim: true }) |
| parentName | 43 | string (optional) | @Prop({ trim: true }) |
| parentPhone | 46 | string (optional) | @Prop({ trim: true }) |

**ReceiptTeacherSnapshot** (dòng 54) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| fullName | 59 | string | @Prop({ required: true, trim: true }) |
| email | 62 | string | @Prop({ required: true, trim: true }) |
| phone | 65 | string (optional) | @Prop({ trim: true }) |
| address | 68 | string (optional) | @Prop({ trim: true }) |
| avatarUrl | 71 | string (optional) | @Prop({ trim: true }) |
| bankAccountName | 74 | string (optional) | @Prop({ trim: true }) |
| bankAccountNumber | 77 | string (optional) | @Prop({ trim: true }) |
| bankName | 80 | string (optional) | @Prop({ trim: true }) |
| bankCode | 83 | string (optional) | @Prop({ trim: true }) |
| bankBin | 86 | string (optional) | @Prop({ trim: true }) |
| bankLogoUrl | 89 | string (optional) | @Prop({ trim: true }) |
| hasPaymentQr | 92 | boolean | @Prop({ default: false }) |

**ReceiptClassSnapshot** (dòng 100) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| classId | 105 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| className | 111 | string | @Prop({ required: true, trim: true }) |
| colorHex | 114 | string (optional) | @Prop({ trim: true }) |
| regularPrice | 117 | number | @Prop({ required: true, validate: integerMoneyValidator }) |
| makeupPrice | 120 | number | @Prop({ required: true, validate: integerMoneyValidator }) |

**ReceiptSessionSnapshot** (dòng 127) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| tuitionEntryId | 132 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: TuitionEntry.name, required: true, }) |
| attendanceId | 139 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance', }) |
| sequence | 145 | number | @Prop({ required: true, min: 1 }) |
| sessionId | 148 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ClassSession.name, }) |
| classId | 154 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| attendedClassId | 160 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| billingClassId | 166 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| makeupForClassId | 172 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| date | 178 | Date | @Prop({ type: Date, required: true }) |
| startTime | 181 | string (optional) | @Prop({ trim: true }) |
| endTime | 184 | string (optional) | @Prop({ trim: true }) |
| className | 187 | string | @Prop({ required: true, trim: true }) |
| attendedClassName | 190 | string (optional) | @Prop({ trim: true }) |
| billingClassName | 193 | string (optional) | @Prop({ trim: true }) |
| makeupForClassName | 196 | string (optional) | @Prop({ trim: true }) |
| classColorHex | 199 | string (optional) | @Prop({ trim: true }) |
| topic | 202 | string (optional) | @Prop({ trim: true }) |
| content | 205 | string (optional) | @Prop({ trim: true }) |
| attendanceStatus | 208 | AttendanceStatus | @Prop({ enum: AttendanceStatus, required: true, }) |
| scheduleType | 214 | ScheduleType (optional) | @Prop({ enum: ScheduleType, }) |
| tuitionType | 219 | TuitionType | @Prop({ enum: TuitionType, required: true }) |
| unitPrice | 222 | number | @Prop({ required: true, validate: integerMoneyValidator }) |
| amount | 225 | number | @Prop({ required: true, validate: integerMoneyValidator }) |
| note | 228 | string (optional) | @Prop({ trim: true }) |

**ReceiptExamSnapshot** (dòng 236) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| examId | 241 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Exam.name, }) |
| examScoreId | 247 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ExamScore', }) |
| classId | 253 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| className | 259 | string | @Prop({ required: true, trim: true }) |
| title | 262 | string | @Prop({ required: true, trim: true }) |
| date | 265 | Date | @Prop({ type: Date, required: true }) |
| score | 268 | number | @Prop({ required: true, min: 0 }) |
| maxScore | 271 | number | @Prop({ required: true, min: 0 }) |
| description | 274 | string (optional) | @Prop({ trim: true }) |
| note | 277 | string (optional) | @Prop({ trim: true }) |
| evidenceImages | 280 | string[] (optional) | @Prop({ type: [String], default: [] }) |
| teacherRemark | 283 | string (optional) | @Prop({ trim: true }) |

**Receipt** (dòng 290) @Schema({ collection: 'receipts', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 296 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| studentId | 304 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, required: true, index: true, }) |
| billingCycleId | 312 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: BillingCycle.name, required: true, index: true, }) |
| classId | 320 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| scopeType | 328 | ReceiptScope | @Prop({ enum: ReceiptScope, default: ReceiptScope.Class, index: true, }) |
| classIds | 335 | mongoose.Types.ObjectId[] | @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Class.name }], default: [], }) |
| primaryClassId | 341 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, }) |
| receiptNumber | 347 | string | @Prop({ required: true, trim: true }) |
| issuedAt | 350 | Date | @Prop({ type: Date, required: true, default: Date.now, index: true }) |
| periodStart | 353 | Date | @Prop({ type: Date, required: true, index: true }) |
| periodEnd | 356 | Date | @Prop({ type: Date, required: true, index: true }) |
| dueDate | 359 | Date (optional) | @Prop({ type: Date }) |
| reason | 362 | ReceiptReason | @Prop({ enum: ReceiptReason, required: true, }) |
| teacherSnapshot | 368 | ReceiptTeacherSnapshot | @Prop({ type: ReceiptTeacherSnapshotSchema, required: true }) |
| classSnapshot | 371 | ReceiptClassSnapshot | @Prop({ type: ReceiptClassSnapshotSchema, required: true }) |
| classSnapshots | 374 | ReceiptClassSnapshot[] | @Prop({ type: [ReceiptClassSnapshotSchema], default: [] }) |
| studentSnapshot | 377 | ReceiptStudentSnapshot | @Prop({ type: ReceiptStudentSnapshotSchema, required: true }) |
| sessions | 380 | ReceiptSessionSnapshot[] | @Prop({ type: [ReceiptSessionSnapshotSchema], default: [] }) |
| exams | 383 | ReceiptExamSnapshot[] | @Prop({ type: [ReceiptExamSnapshotSchema], default: [] }) |
| lessonCount | 386 | number | @Prop({ required: true, min: 0 }) |
| subtotal | 389 | number | @Prop({ required: true, validate: integerMoneyValidator }) |
| discountAmount | 392 | number (optional) | @Prop({ default: 0, validate: integerMoneyValidator }) |
| adjustmentAmount | 395 | number (optional) | @Prop({ default: 0, validate: integerMoneyValidator }) |
| totalAmount | 398 | number | @Prop({ required: true, validate: integerMoneyValidator }) |
| paymentStatus | 401 | PaymentStatus | @Prop({ enum: PaymentStatus, default: PaymentStatus.Unpaid, index: true, }) |
| paidAmount | 408 | number (optional) | @Prop({ default: 0, validate: integerMoneyValidator }) |
| paidAt | 411 | Date (optional) | @Prop({ type: Date }) |
| note | 414 | string (optional) | @Prop({ trim: true }) |
| teacherComment | 417 | string (optional) | @Prop({ trim: true }) |
| strengthsComment | 420 | string (optional) | @Prop({ trim: true }) |
| improvementsComment | 423 | string (optional) | @Prop({ trim: true }) |
| generalComment | 426 | string (optional) | @Prop({ trim: true }) |
| paymentNote | 429 | string (optional) | @Prop({ trim: true }) |
| paymentProofUrl | 432 | string (optional) | @Prop({ trim: true }) |
| paymentProofPublicId | 435 | string (optional) | @Prop({ trim: true }) |
| paymentProofUploadedAt | 438 | Date (optional) | @Prop({ type: Date }) |
| htmlTemplateVersion | 441 | string | @Prop({ default: 'v1' }) |
| templateSnapshot | 444 | ReceiptTemplateSnapshot (optional) | @Prop({ type: ReceiptTemplateSnapshotSchema }) |
| renderSnapshot | 447 | Record<string, unknown> (optional) | @Prop({ type: mongoose.Schema.Types.Mixed }) |
| pdfStatus | 450 | ReceiptPdfStatus | @Prop({ enum: ReceiptPdfStatus, default: ReceiptPdfStatus.Pending, index: true, }) |
| pdfUrl | 457 | string (optional) | @Prop({ trim: true }) |
| pdfPublicId | 460 | string (optional) | @Prop({ trim: true }) |
| pdfGeneratedAt | 463 | Date (optional) | @Prop({ type: Date }) |
| pdfFailedReason | 466 | string (optional) | @Prop({ trim: true }) |

Exports: `ReceiptStudentSnapshot` (29), `ReceiptStudentSnapshotSchema` (50), `ReceiptTeacherSnapshot` (54), `ReceiptTeacherSnapshotSchema` (96), `ReceiptClassSnapshot` (100), `ReceiptClassSnapshotSchema` (124), `ReceiptSessionSnapshot` (127), `ReceiptSessionSnapshotSchema` (232), `ReceiptExamSnapshot` (236), `ReceiptExamSnapshotSchema` (287), `Receipt` (290), `ReceiptDocument` (470), `ReceiptSchema` (471).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 470
export type ReceiptDocument = HydratedDocument<Receipt>;
```

Indexes:

- Dòng 473: `ReceiptSchema.index({ teacherId: 1, receiptNumber: 1 }, { unique: true })`
- Dòng 474: `ReceiptSchema.index({ teacherId: 1, classId: 1, issuedAt: -1 })`
- Dòng 475: `ReceiptSchema.index({ teacherId: 1, classIds: 1, issuedAt: -1 })`
- Dòng 476: `ReceiptSchema.index({ teacherId: 1, studentId: 1, issuedAt: -1 })`
- Dòng 477: `ReceiptSchema.index({ teacherId: 1, scopeType: 1, issuedAt: -1 })`
- Dòng 478: `ReceiptSchema.index({ teacherId: 1, issuedAt: -1 })`
- Dòng 479: `ReceiptSchema.index({ teacherId: 1, paymentStatus: 1, issuedAt: -1 })`
- Dòng 480: `ReceiptSchema.index({ teacherId: 1, pdfStatus: 1, issuedAt: -1 })`
- Dòng 481: `ReceiptSchema.index( { teacherId: 1, billingCycleId: 1 }, { unique: true, partialFilterExpression: { paymentStatus: { $ne: PaymentStatus.Cancelled, }, }, }, )`

### edutrack_be/src/modules/school-management/schemas/schedule-override.schema.ts

[edutrack_be/src/modules/school-management/schemas/schedule-override.schema.ts](../src/modules/school-management/schemas/schedule-override.schema.ts) — 70 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./class.schema`.

**ScheduleOverride** (dòng 9) @Schema({ collection: 'schedule_overrides', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 15 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| classId | 23 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| originalDate | 31 | Date (optional) | @Prop({ type: Date }) |
| originalStartTime | 34 | string (optional) | @Prop({ match: timePattern }) |
| originalEndTime | 37 | string (optional) | @Prop({ match: timePattern }) |
| action | 40 | ScheduleOverrideAction | @Prop({ enum: ScheduleOverrideAction, required: true, index: true, }) |
| newDate | 47 | Date (optional) | @Prop({ type: Date }) |
| startTime | 50 | string (optional) | @Prop({ match: timePattern }) |
| endTime | 53 | string (optional) | @Prop({ match: timePattern }) |
| reason | 56 | string (optional) | @Prop({ trim: true }) |
| timeStorage | 59 | 'utc' \| 'vietnam' | @Prop({ enum: ['utc', 'vietnam'], default: 'utc' }) |

Exports: `ScheduleOverride` (9), `ScheduleOverrideDocument` (63), `ScheduleOverrideSchema` (64).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 63
export type ScheduleOverrideDocument = HydratedDocument<ScheduleOverride>;
```

Indexes:

- Dòng 67: `ScheduleOverrideSchema.index({ teacherId: 1, classId: 1, originalDate: 1 })`
- Dòng 68: `ScheduleOverrideSchema.index({ teacherId: 1, classId: 1, newDate: 1 })`
- Dòng 69: `ScheduleOverrideSchema.index({ teacherId: 1, action: 1, createdAt: -1 })`

### edutrack_be/src/modules/school-management/schemas/schedule-version.schema.ts

[edutrack_be/src/modules/school-management/schemas/schedule-version.schema.ts](../src/modules/school-management/schemas/schedule-version.schema.ts) — 83 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./class.schema`.

**ScheduleSlot** (dòng 9) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| dayOfWeek | 14 | DayOfWeek | @Prop({ required: true, enum: DAY_OF_WEEK_VALUES, }) |
| startTime | 20 | string | @Prop({ required: true, match: timePattern }) |
| endTime | 23 | string | @Prop({ required: true, match: timePattern }) |

**ScheduleVersion** (dòng 29) @Schema({ collection: 'schedule_versions', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 35 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| classId | 43 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| version | 51 | number | @Prop({ required: true, min: 1 }) |
| effectiveFrom | 54 | Date | @Prop({ type: Date, required: true }) |
| effectiveTo | 57 | Date \| null (optional) | @Prop({ type: Date, default: null }) |
| schedules | 60 | ScheduleSlot[] | @Prop({ type: [ScheduleSlotSchema], default: [] }) |
| timeStorage | 63 | 'utc' \| 'vietnam' | @Prop({ enum: ['utc', 'vietnam'], default: 'utc' }) |

Exports: `ScheduleSlot` (9), `ScheduleSlotSchema` (27), `ScheduleVersion` (29), `ScheduleVersionDocument` (67), `ScheduleVersionSchema` (68).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 67
export type ScheduleVersionDocument = HydratedDocument<ScheduleVersion>;
```

Indexes:

- Dòng 71: `ScheduleVersionSchema.index( { teacherId: 1, classId: 1, version: 1 }, { unique: true }, )`
- Dòng 75: `ScheduleVersionSchema.index({ teacherId: 1, classId: 1, effectiveFrom: -1 })`
- Dòng 76: `ScheduleVersionSchema.index( { teacherId: 1, classId: 1, effectiveTo: 1 }, { unique: true, partialFilterExpression: { effectiveTo: null }, }, )`

### edutrack_be/src/modules/school-management/schemas/student.schema.ts

[edutrack_be/src/modules/school-management/schemas/student.schema.ts](../src/modules/school-management/schemas/student.schema.ts) — 89 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`.

**StudentParent** (dòng 6) @Schema({ _id: false, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| fullName | 11 | string (optional) | @Prop({ trim: true }) |
| phone | 14 | string (optional) | @Prop({ trim: true }) |
| relation | 17 | string (optional) | @Prop({ trim: true }) |
| note | 20 | string (optional) | @Prop({ trim: true }) |

**Student** (dòng 26) @Schema({ collection: 'students', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 32 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| studentCode | 40 | string | @Prop({ required: true, trim: true }) |
| fullName | 43 | string | @Prop({ required: true, trim: true }) |
| avatarUrl | 46 | string (optional) | @Prop({ trim: true }) |
| searchText | 49 | string | @Prop({ required: true, trim: true, select: false }) |
| dateOfBirth | 52 | Date (optional) | @Prop({ type: Date }) |
| gradeLevel | 55 | string (optional) | @Prop({ trim: true }) |
| gender | 58 | Gender (optional) | @Prop({ enum: Gender }) |
| phone | 61 | string (optional) | @Prop({ trim: true }) |
| parent | 64 | StudentParent (optional) | @Prop({ type: StudentParentSchema }) |
| address | 67 | string (optional) | @Prop({ trim: true }) |
| note | 70 | string (optional) | @Prop({ trim: true }) |
| status | 73 | StudentStatus | @Prop({ enum: StudentStatus, default: StudentStatus.Active, index: true, }) |

Exports: `StudentParent` (6), `StudentParentSchema` (24), `Student` (26), `StudentDocument` (81), `StudentSchema` (82).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 81
export type StudentDocument = HydratedDocument<Student>;
```

Indexes:

- Dòng 84: `StudentSchema.index({ teacherId: 1, studentCode: 1 }, { unique: true })`
- Dòng 85: `StudentSchema.index({ teacherId: 1, status: 1 })`
- Dòng 86: `StudentSchema.index({ teacherId: 1, gradeLevel: 1 })`
- Dòng 87: `StudentSchema.index({ teacherId: 1, fullName: 1 })`
- Dòng 88: `StudentSchema.index({ teacherId: 1, searchText: 1 })`

### edutrack_be/src/modules/school-management/schemas/tuition-entry.schema.ts

[edutrack_be/src/modules/school-management/schemas/tuition-entry.schema.ts](../src/modules/school-management/schemas/tuition-entry.schema.ts) — 159 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../../users/schemas/user.schema`, `../enums`, `./attendance.schema`, `./billing-cycle.schema`, `./class.schema`, `./class-session.schema`, `./student.schema`.

**TuitionEntry** (dòng 16) @Schema({ collection: 'tuition_entries', timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| teacherId | 22 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, index: true, }) |
| studentId | 30 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name, required: true, index: true, }) |
| classId | 38 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, required: true, index: true, }) |
| attendedClassId | 46 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, index: true, }) |
| billingClassId | 53 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, index: true, }) |
| makeupForClassId | 60 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Class.name, index: true, }) |
| sessionId | 67 | mongoose.Types.ObjectId | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ClassSession.name, required: true, index: true, }) |
| attendanceId | 75 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Attendance.name, }) |
| billingCycleId | 81 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: BillingCycle.name, }) |
| receiptId | 87 | mongoose.Types.ObjectId (optional) | @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Receipt', }) |
| type | 93 | TuitionType | @Prop({ enum: TuitionType, required: true, index: true, }) |
| amount | 100 | number | @Prop({ required: true, validate: integerMoneyValidator }) |
| classNameSnapshot | 103 | string | @Prop({ required: true, trim: true }) |
| sessionDate | 106 | Date | @Prop({ type: Date, required: true, index: true }) |
| sessionStartTime | 109 | string (optional) | @Prop({ trim: true }) |
| sessionEndTime | 112 | string (optional) | @Prop({ trim: true }) |
| topicSnapshot | 115 | string (optional) | @Prop({ trim: true }) |
| contentSnapshot | 118 | string (optional) | @Prop({ trim: true }) |
| status | 121 | TuitionStatus | @Prop({ enum: TuitionStatus, default: TuitionStatus.Unbilled, index: true, }) |
| note | 128 | string (optional) | @Prop({ trim: true }) |

Exports: `TuitionEntry` (16), `TuitionEntryDocument` (132), `TuitionEntrySchema` (133).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 132
export type TuitionEntryDocument = HydratedDocument<TuitionEntry>;
```

Indexes:

- Dòng 135: `TuitionEntrySchema.index( { attendanceId: 1 }, { unique: true, partialFilterExpression: { attendanceId: { $exists: true } }, }, )`
- Dòng 142: `TuitionEntrySchema.index({ teacherId: 1, studentId: 1, status: 1, createdAt: 1, })`
- Dòng 148: `TuitionEntrySchema.index({ teacherId: 1, billingCycleId: 1 })`
- Dòng 149: `TuitionEntrySchema.index({ teacherId: 1, receiptId: 1 })`
- Dòng 150: `TuitionEntrySchema.index({ teacherId: 1, studentId: 1, sessionDate: 1 })`
- Dòng 151: `TuitionEntrySchema.index({ teacherId: 1, status: 1, sessionDate: 1 })`
- Dòng 152: `TuitionEntrySchema.index({ teacherId: 1, studentId: 1, billingClassId: 1, status: 1, sessionDate: 1, })`

### edutrack_be/src/modules/school-management/school-management.module.ts

[edutrack_be/src/modules/school-management/school-management.module.ts](../src/modules/school-management/school-management.module.ts) — 56 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `./schemas`.

**SchoolManagementModule** (dòng 34) @Module({ imports: [ MongooseModule.forFeature([ { name: Student.name, schema: StudentSchema }, { name: Class.name, schema: ClassSchema }, { name: ClassEnrollment.name, schema: ClassEnrollmentSchema }, { name: ClassPriceVersion.name, schema: ClassPriceVersionSchema }, { name: ScheduleVersion.name, schema: ScheduleVersionSchema }, { name: ScheduleOverride.name, schema: ScheduleOverrideSchema }, { name: ClassSession.name, schema: ClassSessionSchema }, { name: Attendance.name, schema: AttendanceSchema }, { name: Exam.name, schema: ExamSchema }, { name: ExamScore.name, schema: ExamScoreSchema }, { name: TuitionEntry.name, schema: TuitionEntrySchema }, { name: BillingCycle.name, schema: BillingCycleSchema }, { name: Receipt.name, schema: ReceiptSchema }, { name: Notification.name, schema: NotificationSchema }, ]), ], exports: [MongooseModule], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `SchoolManagementModule` (34).

### edutrack_be/src/modules/students/dto/bulk-delete-students.dto.ts

[edutrack_be/src/modules/students/dto/bulk-delete-students.dto.ts](../src/modules/students/dto/bulk-delete-students.dto.ts) — 20 dòng.

Dependencies: `class-validator`, `./delete-student.dto`.

**BulkDeleteStudentsDto** (dòng 10) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentIds | 11 | string[] | @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @IsMongoId({ each: true }) |
| mode | 17 | DeleteStudentMode | @IsEnum(DeleteStudentMode) |

Exports: `BulkDeleteStudentsDto` (10).

### edutrack_be/src/modules/students/dto/create-student.dto.ts

[edutrack_be/src/modules/students/dto/create-student.dto.ts](../src/modules/students/dto/create-student.dto.ts) — 86 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../school-management/enums`.

**StudentParentDto** (dòng 13) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| fullName | 14 | string (optional) | @IsOptional() @IsString() @MaxLength(120) |
| phone | 19 | string (optional) | @IsOptional() @IsString() @MaxLength(24) |
| relation | 24 | string (optional) | @IsOptional() @IsString() @MaxLength(40) |
| note | 29 | string (optional) | @IsOptional() @IsString() @MaxLength(300) |

**CreateStudentDto** (dòng 35) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentCode | 36 | string (optional) | @IsOptional() @IsString() @MaxLength(40) |
| fullName | 41 | string | @IsString() @MaxLength(120) |
| gender | 45 | Gender | @IsEnum(Gender) |
| avatarUrl | 48 | string (optional) | @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) |
| dateOfBirth | 53 | string (optional) | @IsOptional() @IsDateString() |
| gradeLevel | 57 | string (optional) | @IsOptional() @IsString() @MaxLength(40) |
| phone | 62 | string (optional) | @IsOptional() @IsString() @MaxLength(24) |
| parent | 67 | StudentParentDto (optional) | @IsOptional() @ValidateNested() @Type(() => StudentParentDto) |
| address | 72 | string (optional) | @IsOptional() @IsString() @MaxLength(300) |
| note | 77 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| status | 82 | StudentStatus (optional) | @IsOptional() @IsEnum(StudentStatus) |

Exports: `StudentParentDto` (13), `CreateStudentDto` (35).

### edutrack_be/src/modules/students/dto/delete-student.dto.ts

[edutrack_be/src/modules/students/dto/delete-student.dto.ts](../src/modules/students/dto/delete-student.dto.ts) — 13 dòng.

Dependencies: `class-validator`.

**DeleteStudentDto** (dòng 8) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| mode | 9 | DeleteStudentMode (optional) | @IsOptional() @IsEnum(DeleteStudentMode) |

Exports: `DeleteStudentMode` (3), `DeleteStudentDto` (8).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
export enum DeleteStudentMode {
  Deactivate = 'deactivate',
  Delete = 'delete',
}
```

### edutrack_be/src/modules/students/dto/query-students.dto.ts

[edutrack_be/src/modules/students/dto/query-students.dto.ts](../src/modules/students/dto/query-students.dto.ts) — 53 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../school-management/enums`.

**QueryStudentsDto** (dòng 25) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| search | 26 | string (optional) | @IsOptional() @IsString() |
| status | 30 | StudentStatus (optional) | @IsOptional() @IsEnum(StudentStatus) |
| gradeLevel | 34 | string (optional) | @IsOptional() @IsString() |
| sortBy | 38 | StudentSortField (optional) = 'fullName' | @IsOptional() @IsIn(STUDENT_SORT_FIELDS) |
| sortOrder | 42 | SortOrder (optional) = 'asc' | @IsOptional() @IsIn(SORT_ORDERS) |
| limit | 46 | number (optional) = 20 | @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) |

Exports: `STUDENT_SORT_FIELDS` (13), `SORT_ORDERS` (20), `StudentSortField` (22), `SortOrder` (23), `QueryStudentsDto` (25).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 22
export type StudentSortField = (typeof STUDENT_SORT_FIELDS)[number];
// line 23
export type SortOrder = (typeof SORT_ORDERS)[number];
```

### edutrack_be/src/modules/students/dto/update-student.dto.ts

[edutrack_be/src/modules/students/dto/update-student.dto.ts](../src/modules/students/dto/update-student.dto.ts) — 67 dòng.

Dependencies: `class-transformer`, `class-validator`, `../../school-management/enums`, `./create-student.dto`.

**UpdateStudentDto** (dòng 14) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| studentCode | 15 | string (optional) | @IsOptional() @IsString() @MaxLength(40) |
| fullName | 20 | string (optional) | @IsOptional() @IsString() @MaxLength(120) |
| gender | 25 | Gender (optional) | @IsOptional() @IsEnum(Gender) |
| avatarUrl | 29 | string (optional) | @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) |
| dateOfBirth | 34 | string (optional) | @IsOptional() @IsDateString() |
| gradeLevel | 38 | string (optional) | @IsOptional() @IsString() @MaxLength(40) |
| phone | 43 | string (optional) | @IsOptional() @IsString() @MaxLength(24) |
| parent | 48 | StudentParentDto (optional) | @IsOptional() @ValidateNested() @Type(() => StudentParentDto) |
| address | 53 | string (optional) | @IsOptional() @IsString() @MaxLength(300) |
| note | 58 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| status | 63 | StudentStatus (optional) | @IsOptional() @IsEnum(StudentStatus) |

Exports: `UpdateStudentDto` (14).

### edutrack_be/src/modules/students/students.controller.ts

[edutrack_be/src/modules/students/students.controller.ts](../src/modules/students/students.controller.ts) — 147 dòng.

Dependencies: `@nestjs/common`, `@nestjs/platform-express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../cloudinary/cloudinary.service`, `./dto/bulk-delete-students.dto`, `./dto/create-student.dto`, `./dto/delete-student.dto`, `./dto/query-students.dto`, `./dto/update-student.dto`, `./students.service`, `express`.

**StudentsController** (dòng 34) @Controller('students') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| findAll | 42 | public findAll(@CurrentUser() user: JwtUser, @Query() query: QueryStudentsDto) | @Get() |
| downloadImportTemplate | 47 | public downloadImportTemplate(@Res({ passthrough: true }) response: Response): StreamableFile | @Get('import-template') |
| create | 68 | public create(@CurrentUser() user: JwtUser, @Body() dto: CreateStudentDto) | @Post() |
| importStudents | 75 | public importStudents(@CurrentUser() user: JwtUser, @UploadedFile() file?: StudentImportFile) | @Post('import') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024, }, }), ) |
| deleteMany | 94 | public deleteMany(@CurrentUser() user: JwtUser, @Body() dto: BulkDeleteStudentsDto) | @Post('bulk-delete') |
| update | 103 | public update(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Body() dto: UpdateStudentDto) | @Patch(':studentId') |
| delete | 118 | public delete(@CurrentUser() user: JwtUser, @Param('studentId') studentId: string, @Query() query: DeleteStudentDto) | @Delete(':studentId') |
| uploadAvatar | 127 | public uploadAvatar(@UploadedFile() file?: UploadImageFile) | @Post('avatar') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, }, }), ) |

Exports: `StudentsController` (34).

### edutrack_be/src/modules/students/students.module.ts

[edutrack_be/src/modules/students/students.module.ts](../src/modules/students/students.module.ts) — 14 dòng.

Dependencies: `@nestjs/common`, `../cloudinary/cloudinary.module`, `../school-management/school-management.module`, `./students.controller`, `./students.service`.

**StudentsModule** (dòng 7) @Module({ imports: [SchoolManagementModule, CloudinaryModule], controllers: [StudentsController], providers: [StudentsService], exports: [StudentsService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `StudentsModule` (7).

### edutrack_be/src/modules/students/students.service.ts

[edutrack_be/src/modules/students/students.service.ts](../src/modules/students/students.service.ts) — 1888 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `crypto`, `zlib`, `mongoose`, `../school-management/enums`, `@nestjs/event-emitter`, `../school-management/schemas/student.schema`, `./dto/create-student.dto`, `./dto/delete-student.dto`, `./dto/query-students.dto`, `./dto/update-student.dto`, `../../common/utils/search-normalizer`.

**StudentsService** (dòng 208) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| create | 216 | public create(teacherId: string, dto: CreateStudentDto, session?: ClientSession) |  |
| findAll | 270 | public findAll(teacherId: string, query: QueryStudentsDto) |  |
| getImportTemplate | 315 | public getImportTemplate() |  |
| importFromTemplate | 328 | public importFromTemplate(teacherId: string, file: StudentImportFile): Promise<StudentImportResult> |  |
| update | 378 | public update(teacherId: string, studentId: string, dto: UpdateStudentDto) |  |
| delete | 575 | public delete(teacherId: string, studentId: string, mode: DeleteStudentMode = DeleteStudentMode.Deactivate) |  |
| deleteMany | 634 | public deleteMany(teacherId: string, studentIds: string[], mode: DeleteStudentMode): Promise<StudentBulkDeleteResult> |  |
| findByIdForTeacher | 709 | public findByIdForTeacher(teacherId: string, studentId: string \| Types.ObjectId, session?: ClientSession) |  |
| findByIdForTeacherOrThrow | 729 | public findByIdForTeacherOrThrow(teacherId: string, studentId: string \| Types.ObjectId, session?: ClientSession) |  |
| toStudentResponse | 747 | public toStudentResponse(student: StudentDocument): StudentResponse |  |
| buildSort | 765 | private buildSort(query: QueryStudentsDto): Record<string, 1 \| -1> |  |
| decodeImportFile | 781 | private decodeImportFile(file: StudentImportFile): string |  |
| parseImportRows | 810 | private parseImportRows(file: StudentImportFile): string[][] |  |
| parseXlsxRows | 828 | private parseXlsxRows(buffer: Buffer): string[][] |  |
| resolveFirstWorksheetPath | 860 | private resolveFirstWorksheetPath(workbookXml: string, relationshipsXml: string) |  |
| parseSharedStrings | 906 | private parseSharedStrings(sharedStringsXml: string) |  |
| parseXlsxWorksheetRows | 919 | private parseXlsxWorksheetRows(worksheetXml: string, sharedStrings: string[]): string[][] |  |
| parseXlsxCellValue | 975 | private parseXlsxCellValue(cellXml: string, cellAttributes: Map<string, string>, sharedStrings: string[]) |  |
| parseHtmlTableRows | 1000 | private parseHtmlTableRows(text: string): string[][] |  |
| collectRegexMatches | 1030 | private collectRegexMatches(value: string, regex: RegExp): string[] |  |
| parseDelimitedRows | 1045 | private parseDelimitedRows(text: string): string[][] |  |
| detectDelimiter | 1097 | private detectDelimiter(text: string): string |  |
| countChar | 1113 | private countChar(value: string, needle: string): number |  |
| resolveImportHeaders | 1117 | private resolveImportHeaders(headerRow: string[]): Map<StudentImportColumn, number> |  |
| parseStudentImportRow | 1150 | private parseStudentImportRow(row: string[], headers: Map<StudentImportColumn, number>): ParsedStudentRow |  |
| getImportCell | 1215 | private getImportCell(row: string[], headers: Map<StudentImportColumn, number>, column: StudentImportColumn) |  |
| parseImportGender | 1225 | private parseImportGender(value: string) |  |
| parseImportStudentStatus | 1243 | private parseImportStudentStatus(value: string) |  |
| parseImportAvatarUrl | 1257 | private parseImportAvatarUrl(value: string) |  |
| parseImportDate | 1271 | private parseImportDate(value: string) |  |
| formatValidDate | 1318 | private formatValidDate(year: number, month: number, day: number) |  |
| formatDateInput | 1332 | private formatDateInput(year: number, month: number, day: number) |  |
| normalizeOptionalCell | 1338 | private normalizeOptionalCell(value?: string) |  |
| normalizeImportHeader | 1344 | private normalizeImportHeader(value: string) |  |
| ensureMaxLength | 1350 | private ensureMaxLength(value: string \| undefined, maxLength: number, label: string) |  |
| getImportErrorMessage | 1360 | private getImportErrorMessage(error: unknown) |  |
| getStudentOperationErrorMessage | 1391 | private getStudentOperationErrorMessage(error: unknown) |  |
| buildXlsxTemplate | 1423 | private buildXlsxTemplate(rows: string[][]) |  |
| buildXlsxContentTypesXml | 1454 | private buildXlsxContentTypesXml() |  |
| buildXlsxRootRelationshipsXml | 1465 | private buildXlsxRootRelationshipsXml() |  |
| buildXlsxWorkbookXml | 1472 | private buildXlsxWorkbookXml() |  |
| buildXlsxWorkbookRelationshipsXml | 1481 | private buildXlsxWorkbookRelationshipsXml() |  |
| buildXlsxStylesXml | 1489 | private buildXlsxStylesXml() |  |
| buildXlsxWorksheetXml | 1521 | private buildXlsxWorksheetXml(rows: string[][]) |  |
| buildZipArchive | 1558 | private buildZipArchive(files: Array<{ buffer: Buffer; fileName: string }>) |  |
| readZipEntries | 1627 | private readZipEntries(buffer: Buffer): ZipEntryMap |  |
| findZipEndOfCentralDirectory | 1687 | private findZipEndOfCentralDirectory(buffer: Buffer) |  |
| getZipText | 1701 | private getZipText(entries: ZipEntryMap, fileName: string) |  |
| parseXmlAttributes | 1711 | private parseXmlAttributes(tag: string) |  |
| extractFirstXmlText | 1723 | private extractFirstXmlText(xml: string, tagName: string) |  |
| extractXmlTexts | 1727 | private extractXmlTexts(xml: string, tagName: string) |  |
| columnReferenceToIndex | 1742 | private columnReferenceToIndex(reference: string) |  |
| getColumnName | 1759 | private getColumnName(index: number) |  |
| toZipDosDateTime | 1772 | private toZipDosDateTime(value: Date) |  |
| crc32 | 1787 | private crc32(buffer: Buffer) |  |
| escapeXml | 1797 | private escapeXml(value: string) |  |
| decodeXmlText | 1806 | private decodeXmlText(value: string) |  |
| decodeHtmlCell | 1823 | private decodeHtmlCell(value: string) |  |
| buildStudentSearchText | 1827 | private buildStudentSearchText(student: StudentSearchInput) |  |
| resolveAvatarUrl | 1842 | private resolveAvatarUrl(gender: Gender, avatarUrl?: string) |  |
| cleanParent | 1852 | private cleanParent(parent?: CreateStudentDto['parent']) |  |
| generateStudentCode | 1867 | private generateStudentCode() |  |
| toObjectId | 1871 | private toObjectId(value: string, fieldName: string) |  |
| isDuplicateKeyError | 1879 | private isDuplicateKeyError(error: unknown) |  |

Exports: `StudentResponse` (113), `StudentImportError` (134), `StudentImportResult` (139), `StudentBulkDeleteError` (147), `StudentBulkDeleteResult` (153), `StudentImportFile` (162), `StudentsService` (208).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 80
type StudentImportColumn =
  | 'studentCode'
  | 'fullName'
  | 'gradeLevel'
  | 'gender'
  | 'avatarUrl'
  | 'dateOfBirth'
  | 'phone'
  | 'parentFullName'
  | 'parentPhone'
  | 'parentRelation'
  | 'parentNote'
  | 'address'
  | 'note'
  | 'status';
// line 113
export type StudentResponse = {
  id: string;
  teacherId: string;
  studentCode: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gradeLevel?: string;
  gender?: Gender;
  phone?: string;
  parent?: {
    fullName?: string;
    phone?: string;
    relation?: string;
    note?: string;
  };
  address?: string;
  note?: string;
  status: StudentStatus;
};
// line 134
export type StudentImportError = {
  row: number;
  message: string;
};
// line 139
export type StudentImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  createdStudents: StudentResponse[];
  errors: StudentImportError[];
};
// line 147
export type StudentBulkDeleteError = {
  studentId: string;
  studentName?: string;
  message: string;
};
// line 153
export type StudentBulkDeleteResult = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  mode: DeleteStudentMode;
  affectedStudents: StudentResponse[];
  errors: StudentBulkDeleteError[];
};
// line 162
export type StudentImportFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};
// line 169
type ZipEntryMap = Map<string, Buffer>;
// line 171
type ParsedStudentRow = {
  studentCode?: string;
  fullName: string;
  gradeLevel?: string;
  gender: Gender;
  avatarUrl?: string;
  dateOfBirth?: string;
  phone?: string;
  parent?: CreateStudentDto['parent'];
  address?: string;
  note?: string;
  status?: StudentStatus;
};
// line 185
type StudentSearchInput = {
  studentCode?: string;
  fullName?: string;
  gradeLevel?: string;
  phone?: string;
  parent?: {
    fullName?: string;
    phone?: string;
  };
};
// line 196
type StudentTextFilter = {
  $regex: string;
  $options: string;
};
// line 201
type StudentFilter = {
  teacherId: Types.ObjectId;
  status?: StudentStatus;
  gradeLevel?: StudentTextFilter;
  $or?: Array<Record<string, StudentTextFilter>>;
};
```

### edutrack_be/src/modules/users/bank-directory.service.spec.ts

[edutrack_be/src/modules/users/bank-directory.service.spec.ts](../src/modules/users/bank-directory.service.spec.ts) — 202 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `./bank-directory.service`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 7: BankDirectoryService
- Dòng 34: normalizes and sorts the VietQR bank directory
- Dòng 78: embeds a whitelisted VietQR CDN logo as a data URL
- Dòng 92: looks up an account holder with server-side credentials
- Dòng 131: rejects account lookup when credentials are not configured
- Dòng 146: logs the provider code and description when lookup is rejected
- Dòng 176: reports an unavailable VietQR plan instead of an invalid account

### edutrack_be/src/modules/users/bank-directory.service.ts

[edutrack_be/src/modules/users/bank-directory.service.ts](../src/modules/users/bank-directory.service.ts) — 370 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`.

**BankDirectoryService** (dòng 39) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 41 |  |  |
| bankCache | 42 | TimedCache<PaymentBank[]> (optional) |  |
| logoCache | 43 |  |  |
| getBanks | 47 | public getBanks() |  |
| findBank | 95 | public findBank(identifier?: string) |  |
| lookupAccount | 114 | public lookupAccount(bankBin: string, accountNumber: string): Promise<BankAccountLookup \| null> |  |
| getLogoDataUrl | 243 | public getLogoDataUrl(logoUrl?: string) |  |

Functions: `normalizeBank(value: unknown): PaymentBank \| null` (dòng 289); `isAllowedBankLogoUrl(value?: string): value is string` (dòng 316); `isRecord(value: unknown): value is Record<string, unknown>` (dòng 336); `stringValue(value: unknown)` (dòng 340); `maskAccountNumber(value: string)` (dòng 348); `quotedLogValue(value: string)` (dòng 354); `safeEndpoint(value: string)` (dòng 362).

Exports: `PaymentBank` (19), `BankAccountLookup` (29), `BankDirectoryService` (39).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 19
export type PaymentBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  lookupSupported?: boolean;
};
// line 29
export type BankAccountLookup = {
  accountName: string;
  accountNumber: string;
};
// line 34
type TimedCache<T> = {
  expiresAt: number;
  value: T;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 55: `fetch(BANKS_API_URL, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000), })`
- Dòng 146: `fetch(lookupUrl, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'x-api-key': apiKey, 'x-client-id': clientId, }, body: JSON.stringify({ accountNumber,)`
- Dòng 255: `fetch(logoUrl, { headers: { Accept: 'image/png,image/jpeg,image/webp' }, signal: AbortSignal.timeout(6000), })`

### edutrack_be/src/modules/users/dto/change-password.dto.ts

[edutrack_be/src/modules/users/dto/change-password.dto.ts](../src/modules/users/dto/change-password.dto.ts) — 14 dòng.

Dependencies: `class-validator`.

**ChangePasswordDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| currentPassword | 4 | string | @IsString() @MinLength(8) @MaxLength(72) |
| newPassword | 9 | string | @IsString() @MinLength(8) @MaxLength(72) |

Exports: `ChangePasswordDto` (3).

### edutrack_be/src/modules/users/dto/lookup-bank-account.dto.ts

[edutrack_be/src/modules/users/dto/lookup-bank-account.dto.ts](../src/modules/users/dto/lookup-bank-account.dto.ts) — 16 dòng.

Dependencies: `class-validator`.

**LookupBankAccountDto** (dòng 3) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| bankBin | 4 | string | @IsString() @Matches(/^\d{6}$/, { message: 'Mã BIN ngân hàng không hợp lệ.', }) |
| accountNumber | 10 | string | @IsString() @Matches(/^\d{6,19}$/, { message: 'Số tài khoản phải gồm từ 6 đến 19 chữ số.', }) |

Exports: `LookupBankAccountDto` (3).

### edutrack_be/src/modules/users/dto/push-subscription.dto.spec.ts

[edutrack_be/src/modules/users/dto/push-subscription.dto.spec.ts](../src/modules/users/dto/push-subscription.dto.spec.ts) — 65 dòng.

Dependencies: `@nestjs/common`, `./push-subscription.dto`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 15: Push subscription DTOs
- Dòng 19: accepts browser PushSubscription JSON including null expirationTime
- Dòng 23: rejects invalid or injected subscription fields %#
- Dòng 35: rejects insecure or untrusted endpoint %s
- Dòng 49: accepts browser gateway %s
- Dòng 59: requires a device endpoint for a test request

### edutrack_be/src/modules/users/dto/push-subscription.dto.ts

[edutrack_be/src/modules/users/dto/push-subscription.dto.ts](../src/modules/users/dto/push-subscription.dto.ts) — 81 dòng.

Dependencies: `class-transformer`, `class-validator`.

**PushEndpointDto** (dòng 44) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| endpoint | 45 | string | @IsString() @MaxLength(4096) @IsUrl({ protocols: ['https'], require_protocol: true }) @ValidateBy({ name: 'supportedPushEndpoint', validator: { validate: isSupportedPushEndpoint, defaultMessage: () => 'Endpoint không thuộc dịch vụ Web Push được hỗ trợ.', }, }) |

**PushSubscriptionKeysDto** (dòng 59) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| p256dh | 60 | string | @IsString() @Matches(/^[A-Za-z0-9_-]{87}=?$/) |
| auth | 64 | string | @IsString() @Matches(/^[A-Za-z0-9_-]{22}(?:==)?$/) |

**PushSubscriptionDto** (dòng 69) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| keys | 70 | PushSubscriptionKeysDto | @IsDefined() @ValidateNested() @Type(() => PushSubscriptionKeysDto) |
| expirationTime | 76 | number \| null (optional) | @IsOptional() @IsNumber() @Min(0) |

Functions: `isSupportedPushEndpoint(value: unknown): boolean` (dòng 17).

Exports: `isSupportedPushEndpoint` (17), `PushEndpointDto` (44), `PushSubscriptionDto` (69).

### edutrack_be/src/modules/users/dto/update-profile.dto.ts

[edutrack_be/src/modules/users/dto/update-profile.dto.ts](../src/modules/users/dto/update-profile.dto.ts) — 60 dòng.

Dependencies: `class-validator`.

**UpdateProfileDto** (dòng 9) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| fullName | 10 | string (optional) | @IsOptional() @IsString() @MinLength(2) @MaxLength(100) |
| avatarUrl | 16 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| phone | 21 | string (optional) | @IsOptional() @IsString() @MaxLength(30) @Matches(/^[0-9+\-\s().]*$/, { message: 'Số điện thoại chỉ nên gồm số và ký tự +, -, khoảng trắng.', }) |
| address | 29 | string (optional) | @IsOptional() @IsString() @MaxLength(250) |
| bio | 34 | string (optional) | @IsOptional() @IsString() @MaxLength(500) |
| bankAccountName | 39 | string (optional) | @IsOptional() @IsString() @MaxLength(100) |
| bankAccountNumber | 44 | string (optional) | @IsOptional() @IsString() @MaxLength(50) @Matches(/^[0-9\s-]*$/, { message: 'Số tài khoản chỉ nên gồm số, khoảng trắng hoặc dấu gạch ngang.', }) |
| bankBin | 52 | string (optional) | @IsOptional() @IsString() @MaxLength(20) @Matches(/^$\|^[0-9]{6}$/, { message: 'Mã BIN ngân hàng không hợp lệ.', }) |

Exports: `UpdateProfileDto` (9).

### edutrack_be/src/modules/users/payment-qr.constants.ts

[edutrack_be/src/modules/users/payment-qr.constants.ts](../src/modules/users/payment-qr.constants.ts) — 5 dòng.

Exports: `PAYMENT_QR_INFO_NOT_FOUND_CODE` (1), `PAYMENT_QR_INFO_NOT_FOUND_MESSAGE` (3).

### edutrack_be/src/modules/users/schemas/user.schema.ts

[edutrack_be/src/modules/users/schemas/user.schema.ts](../src/modules/users/schemas/user.schema.ts) — 134 dòng.

Dependencies: `@nestjs/mongoose`, `mongoose`, `../types/push-device.type`.

**User** (dòng 9) @Schema({ timestamps: true, versionKey: false, })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| fullName | 14 | string | @Prop({ required: true, trim: true }) |
| avatarUrl | 17 | string (optional) | @Prop({ trim: true }) |
| phone | 20 | string (optional) | @Prop({ trim: true }) |
| address | 23 | string (optional) | @Prop({ trim: true }) |
| bio | 26 | string (optional) | @Prop({ trim: true, maxlength: 500 }) |
| bankAccountName | 29 | string (optional) | @Prop({ trim: true, maxlength: 100 }) |
| bankAccountNumber | 32 | string (optional) | @Prop({ trim: true, maxlength: 50 }) |
| bankName | 35 | string (optional) | @Prop({ trim: true, maxlength: 120 }) |
| bankCode | 38 | string (optional) | @Prop({ trim: true, maxlength: 30 }) |
| bankBin | 41 | string (optional) | @Prop({ trim: true, maxlength: 20 }) |
| bankLogoUrl | 44 | string (optional) | @Prop({ trim: true, maxlength: 500 }) |
| paymentQrImageData | 47 | Buffer (optional) | @Prop({ type: Buffer, select: false }) |
| paymentQrImageContentType | 50 | string (optional) | @Prop({ trim: true }) |
| paymentQrImageSize | 53 | number (optional) | @Prop({ min: 0 }) |
| paymentQrImageUpdatedAt | 56 | Date (optional) | @Prop({ type: Date }) |
| email | 59 | string | @Prop({ required: true, lowercase: true, trim: true, unique: true, }) |
| passwordHash | 67 | string | @Prop({ required: true, select: false }) |
| role | 70 | UserRole | @Prop({ enum: UserRole, default: UserRole.Teacher, }) |
| isEmailVerified | 76 | boolean | @Prop({ default: false }) |
| otpHash | 79 | string (optional) | @Prop({ select: false }) |
| otpExpiresAt | 82 | Date (optional) | @Prop({ type: Date, select: false }) |
| otpAttempts | 85 | number | @Prop({ default: 0, select: false }) |
| otpResendAvailableAt | 88 | Date (optional) | @Prop({ type: Date, select: false }) |
| emailVerificationExpiresAt | 91 | Date (optional) | @Prop({ type: Date, select: false }) |
| pendingPasswordHash | 94 | string (optional) | @Prop({ select: false }) |
| passwordResetOtpHash | 97 | string (optional) | @Prop({ select: false }) |
| passwordResetOtpExpiresAt | 100 | Date (optional) | @Prop({ type: Date, select: false }) |
| passwordResetOtpAttempts | 103 | number | @Prop({ default: 0, select: false }) |
| passwordResetOtpResendAvailableAt | 106 | Date (optional) | @Prop({ type: Date, select: false }) |
| refreshTokenHash | 109 | string (optional) | @Prop({ select: false }) |
| refreshTokenExpiresAt | 112 | Date (optional) | @Prop({ type: Date, select: false }) |
| lastLoginAt | 115 | Date (optional) | @Prop({ type: Date }) |
| recentMediaUrls | 118 | string[] | @Prop({ type: [String], default: [] }) |
| pushSubscriptions | 121 | StoredPushSubscription[] | @Prop({ type: [{ type: Object }], default: [], select: false }) |

Exports: `UserRole` (5), `User` (9), `UserDocument` (125), `UserSchema` (126).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 5
export enum UserRole {
  Teacher = 'teacher',
}
// line 125
export type UserDocument = HydratedDocument<User>;
```

Indexes:

- Dòng 127: `UserSchema.index( { emailVerificationExpiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { isEmailVerified: false }, }, )`

### edutrack_be/src/modules/users/types/push-device.type.ts

[edutrack_be/src/modules/users/types/push-device.type.ts](../src/modules/users/types/push-device.type.ts) — 28 dòng.

Exports: `PushDeviceType` (1), `PushDeviceInfo` (8), `StoredPushSubscription` (15), `PushDeviceSummary` (23).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export enum PushDeviceType {
  Desktop = 'desktop',
  Mobile = 'mobile',
  Tablet = 'tablet',
  Unknown = 'unknown',
}
// line 8
export type PushDeviceInfo = {
  type: PushDeviceType;
  name: string;
  browser: string | null;
  os: string | null;
};
// line 15
export type StoredPushSubscription = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
  device?: PushDeviceInfo;
  registeredAt?: Date;
  lastSeenAt?: Date;
};
// line 23
export type PushDeviceSummary = PushDeviceInfo & {
  id: string;
  registeredAt: string | null;
  lastSeenAt: string | null;
};
```

### edutrack_be/src/modules/users/types/safe-user.type.ts

[edutrack_be/src/modules/users/types/safe-user.type.ts](../src/modules/users/types/safe-user.type.ts) — 24 dòng.

Dependencies: `../schemas/user.schema`.

Exports: `SafeUser` (3).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
export type SafeUser = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  bio?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankCode?: string;
  bankBin?: string;
  bankLogoUrl?: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  hasPaymentQr: boolean;
  paymentQrImageContentType?: string;
  paymentQrImageSize?: number;
  paymentQrImageUpdatedAt?: string;
};
```

### edutrack_be/src/modules/users/users.controller.ts

[edutrack_be/src/modules/users/users.controller.ts](../src/modules/users/users.controller.ts) — 195 dòng.

Dependencies: `@nestjs/common`, `@nestjs/platform-express`, `express`, `../../common/decorators/current-user.decorator`, `../../common/types/authenticated-request.type`, `../auth/guards/jwt-auth.guard`, `../cloudinary/cloudinary.service`, `./dto/change-password.dto`, `./dto/lookup-bank-account.dto`, `./dto/update-profile.dto`, `./users.service`.

**UsersController** (dòng 37) @Controller('users') @UseGuards(JwtAuthGuard)

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| getProfile | 45 | public getProfile(@CurrentUser() user: JwtUser) | @Get('me') |
| getBanks | 50 | public getBanks() | @Get('banks') |
| lookupBankAccount | 55 | public lookupBankAccount(@Body() dto: LookupBankAccountDto) | @Post('bank-account/lookup') |
| updateProfile | 60 | public updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) | @Patch('me') |
| changePassword | 65 | public changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) | @Patch('me/password') |
| uploadTeacherAvatar | 70 | public uploadTeacherAvatar(@UploadedFile() file?: UploadImageFile) | @Post('me/avatar') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: TEACHER_AVATAR_MAX_SIZE_BYTES, }, }), ) |
| uploadPaymentQr | 89 | public uploadPaymentQr(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile, @Body('qrContent') qrContent?: string, @Body('allowUnrecognized') allowUnrecognized?: string) | @Post('me/payment-qr') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: PAYMENT_QR_MAX_SIZE_BYTES, }, }), ) |
| getPaymentQr | 130 | public getPaymentQr(@CurrentUser() user: JwtUser, @Res() response: Response) | @Get('me/payment-qr') |
| removePaymentQr | 140 | public removePaymentQr(@CurrentUser() user: JwtUser) | @Delete('me/payment-qr') |
| uploadMedia | 145 | public uploadMedia(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile) | @Post('me/media') @UseInterceptors( FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, // 10MB }, }), ) |
| getMediaHistory | 163 | public getMediaHistory(@CurrentUser() user: JwtUser) | @Get('me/media') |
| assertImageFile | 168 | private assertImageFile(file: UploadImageFile \| undefined, options: { allowedMimeTypes?: Set<string>; maxSize: number; missingMessage: string; sizeMessage: string; typeMessage: string; }): asserts file is UploadImageFile |  |

Exports: `UsersController` (37).

### edutrack_be/src/modules/users/users.module.ts

[edutrack_be/src/modules/users/users.module.ts](../src/modules/users/users.module.ts) — 19 dòng.

Dependencies: `@nestjs/common`, `@nestjs/mongoose`, `../cloudinary/cloudinary.module`, `./bank-directory.service`, `./schemas/user.schema`, `./users.controller`, `./users.service`.

**UsersModule** (dòng 9) @Module({ imports: [ CloudinaryModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ], controllers: [UsersController], providers: [BankDirectoryService, UsersService], exports: [BankDirectoryService, UsersService], })

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |

Exports: `UsersModule` (9).

### edutrack_be/src/modules/users/users.push.spec.ts

[edutrack_be/src/modules/users/users.push.spec.ts](../src/modules/users/users.push.spec.ts) — 87 dòng.

Dependencies: `./users.service`, `./schemas/user.schema`.

Functions: `createService()` (dòng 12).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 36: UsersService push subscription persistence
- Dòng 37: explicitly selects hidden push subscriptions without selecting auth secrets
- Dòng 47: upserts a device with an atomic replacement pipeline so renewed keys persist
- Dòng 60: removes only one owned endpoint atomically, preserving other devices
- Dòng 72: returns not found when the authenticated account no longer exists

### edutrack_be/src/modules/users/users.service.spec.ts

[edutrack_be/src/modules/users/users.service.spec.ts](../src/modules/users/users.service.spec.ts) — 281 dòng.

Dependencies: `@nestjs/common`, `./schemas/user.schema`, `./users.service`.

Functions: `createUser(overrides: Partial<MockUser> = {}): MockUser` (dòng 32); `createService(user: ReturnType<typeof createUser>)` (dòng 44).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 15
type MockUser = {
  _id: { toString: () => string };
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBin?: string;
  bankCode?: string;
  bankLogoUrl?: string;
  bankName?: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  paymentQrImageData?: Buffer;
  recentMediaUrls?: string[];
  role: UserRole;
  save: jest.MockedFunction<() => Promise<void>>;
};
```

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 79: UsersService payment QR
- Dòng 89: returns the verified account holder for a bank BIN and account number
- Dòng 111: rejects a bank account whose holder cannot be verified
- Dòng 129: updates bank metadata without replacing manually entered account fields
- Dòng 158: saves a recognized QR without requiring an account holder name
- Dòng 181: does not save before an unrecognized QR is confirmed
- Dòng 198: saves only the image after an unrecognized QR is confirmed
- Dòng 222: updates decoded bank metadata without requiring confirmation
- Dòng 247: UsersService media upload
- Dòng 248: uploads media and keeps up to 5 recent urls

### edutrack_be/src/modules/users/users.service.ts

[edutrack_be/src/modules/users/users.service.ts](../src/modules/users/users.service.ts) — 614 dòng.

Dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/mongoose`, `bcrypt`, `node:crypto`, `mongoose`, `../cloudinary/cloudinary.service`, `./bank-directory.service`, `./dto/change-password.dto`, `./dto/lookup-bank-account.dto`, `./dto/push-subscription.dto`, `./types/push-device.type`, `./utils/push-device`, `./dto/update-profile.dto`, `./payment-qr.constants`, `./schemas/user.schema`, `./types/safe-user.type`, `./utils/vietqr-parser`.

**UsersService** (dòng 45) @Injectable()

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| logger | 47 |  |  |
| normalizeEmail | 56 | public normalizeEmail(email: string) |  |
| createTeacher | 60 | public createTeacher(input: CreateTeacherInput) |  |
| findByEmail | 70 | public findByEmail(email: string) |  |
| findByEmailWithSecrets | 74 | public findByEmailWithSecrets(email: string) |  |
| findByIdWithSecrets | 83 | public findByIdWithSecrets(id: string) |  |
| findById | 96 | public findById(id: string) |  |
| deleteById | 104 | public deleteById(id: string \| Types.ObjectId) |  |
| getProfile | 108 | public getProfile(userId: string) |  |
| getBanks | 114 | public getBanks() |  |
| lookupBankAccount | 118 | public lookupBankAccount(dto: LookupBankAccountDto) |  |
| updateProfile | 178 | public updateProfile(userId: string, dto: UpdateProfileDto) |  |
| changePassword | 238 | public changePassword(userId: string, dto: ChangePasswordDto) |  |
| updatePaymentQr | 269 | public updatePaymentQr(userId: string, file: UploadImageFile, qrContent?: string, allowUnrecognized = false) |  |
| getPaymentQr | 362 | public getPaymentQr(userId: string) |  |
| removePaymentQr | 388 | public removePaymentQr(userId: string) |  |
| uploadMedia | 415 | public uploadMedia(userId: string, file: UploadImageFile) |  |
| getMediaHistory | 437 | public getMediaHistory(userId: string) |  |
| getPushSubscriptions | 444 | public getPushSubscriptions(userId: string) |  |
| addPushSubscription | 454 | public addPushSubscription(userId: string, subscription: PushSubscriptionDto, device?: PushDeviceInfo) |  |
| removePushSubscription | 520 | public removePushSubscription(userId: string, endpoint: string) |  |
| toSafeUser | 532 | public toSafeUser(user: UserDocument): SafeUser |  |
| findByIdOrThrow | 558 | private findByIdOrThrow(userId: string) |  |
| assignPaymentBank | 568 | private assignPaymentBank(user: UserDocument, bank: PaymentBank \| null) |  |
| getPasswordSaltRounds | 575 | private getPasswordSaltRounds() |  |

Functions: `isValidQrAccountIdentifier(value?: string)` (dòng 580); `createPaymentQrTrace(rawValue?: string)` (dòng 584); `maskAccountNumber(value?: string)` (dòng 603).

Exports: `UsersService` (45).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 35
type CreateTeacherInput = {
  fullName: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  otpExpiresAt: Date;
  otpResendAvailableAt: Date;
  emailVerificationExpiresAt: Date;
};
```

### edutrack_be/src/modules/users/utils/push-device.spec.ts

[edutrack_be/src/modules/users/utils/push-device.spec.ts](../src/modules/users/utils/push-device.spec.ts) — 131 dòng.

Dependencies: `../types/push-device.type`, `./push-device`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 13: Push device display metadata
- Dòng 14: describes %s without confusing compatible browser tokens
- Dòng 65: recognizes iPadOS desktop mode from the validated display hint
- Dòng 77: shows legacy devices honestly and never exposes transport credentials
- Dòng 103: deduplicates legacy endpoints, keeps richer metadata, and sorts latest registrations first

### edutrack_be/src/modules/users/utils/push-device.ts

[edutrack_be/src/modules/users/utils/push-device.ts](../src/modules/users/utils/push-device.ts) — 122 dòng.

Dependencies: `node:crypto`, `../types/push-device.type`.

Functions: `describePushDevice(userAgent: string, deviceType?: PushDeviceType): PushDeviceInfo` (dòng 14); `isoDate(value: unknown): string \| null` (dòng 86); `summarizePushDevices(subscriptions: StoredPushSubscription[]): PushDeviceSummary[]` (dòng 92).

Exports: `pushDeviceId` (9), `describePushDevice` (14), `summarizePushDevices` (92).

### edutrack_be/src/modules/users/utils/vietqr-parser.spec.ts

[edutrack_be/src/modules/users/utils/vietqr-parser.spec.ts](../src/modules/users/utils/vietqr-parser.spec.ts) — 66 dòng.

Dependencies: `./vietqr-parser`.

Functions: `tlv(id: string, value: string)` (dòng 3).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 7: parseVietQrPaymentInfo
- Dòng 8: extracts the bank BIN and account number from a VietQR payload
- Dòng 21: extracts bank information from a VietQR quick link
- Dòng 33: extracts an account holder name embedded in a VietQR payload
- Dòng 50: extracts an account holder name from a VietQR quick link
- Dòng 62: ignores QR values that are not VietQR payment data

### edutrack_be/src/modules/users/utils/vietqr-parser.ts

[edutrack_be/src/modules/users/utils/vietqr-parser.ts](../src/modules/users/utils/vietqr-parser.ts) — 137 dòng.

Functions: `parseVietQrPaymentInfo(rawValue?: string): VietQrPaymentInfo \| null` (dòng 16); `parseVietQrQuickLink(value: string): VietQrPaymentInfo \| null` (dòng 67); `normalizeAccountName(value?: string)` (dòng 101); `parseTlv(value: string)` (dòng 107); `findField(fields: TlvField[], id: string)` (dòng 134).

Exports: `VietQrPaymentInfo` (4), `parseVietQrPaymentInfo` (16).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 4
export type VietQrPaymentInfo = {
  accountName?: string;
  accountNumber?: string;
  bankBin?: string;
  bankIdentifier?: string;
};
// line 11
type TlvField = {
  id: string;
  value: string;
};
```

### edutrack_be/test/app.e2e-spec.ts

[edutrack_be/test/app.e2e-spec.ts](../test/app.e2e-spec.ts) — 30 dòng.

Dependencies: `@nestjs/testing`, `@nestjs/common`, `supertest`, `supertest/types`, `./../src/app.module`.

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 20: `request(app.getHttpServer())`

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 7: AppController (e2e)
- Dòng 19: / (GET)

### edutrack_be/test/push-storage.integration-spec.ts

[edutrack_be/test/push-storage.integration-spec.ts](../test/push-storage.integration-spec.ts) — 295 dòng.

Dependencies: `node:crypto`, `@nestjs/common`, `@nestjs/config`, `mongoose`, `../src/modules/cloudinary/cloudinary.service`, `../src/modules/schedules/push-reminder-store.service`, `../src/modules/schedules/schemas/push-reminder.schema`, `../src/modules/users/bank-directory.service`, `../src/modules/users/dto/push-subscription.dto`, `../src/modules/users/schemas/user.schema`, `../src/modules/users/users.service`, `../src/modules/users/types/push-device.type`, `../src/modules/users/utils/push-device`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 32: Push storage integration against isolated local MongoDB
- Dòng 89: reads select:false subscriptions explicitly while profile and auth reads stay private
- Dòng 105: preserves concurrent devices and replaces rotated keys without duplicate endpoints
- Dòng 136: persists device metadata and preserves its registration date on key rotation
- Dòng 170: deduplicates old records and removes only the requested endpoint amid another registration
- Dòng 190: scopes endpoint mutation to the selected user and rejects unknown users
- Dòng 217: grants exactly one lease under concurrent duplicate-key upserts
- Dòng 231: allows lease takeover after expiry and fences completion from the old worker
- Dòng 252: releases failed delivery for retry and preserves accepted delivery across a fresh connection
- Dòng 282: creates the MongoDB retention index for reminder markers

### edutrack_be/test/schedule-revoke.integration-spec.ts

[edutrack_be/test/schedule-revoke.integration-spec.ts](../test/schedule-revoke.integration-spec.ts) — 382 dòng.

Dependencies: `node:crypto`, `@nestjs/common`, `mongoose`, `../src/modules/classes/classes.service`, `../src/modules/schedules/schedule-conflicts.service`, `../src/modules/schedules/schedules.service`, `../src/modules/school-management/enums`, `../src/modules/school-management/schemas`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 50: Temporary lesson withdrawal with real isolated MongoDB
- Dòng 157: blocks partial clearing, then removes a fully cleared lesson from the week, history and attendance sheet after withdrawal
- Dòng 248: repairs already withdrawn legacy lessons while preserving actual attendance, billed tuition and manual lessons
- Dòng 322: restores only the original fixed slot when an unattended move is withdrawn

### edutrack_be/test/schedule-ui-smoke.cjs

[edutrack_be/test/schedule-ui-smoke.cjs](../test/schedule-ui-smoke.cjs) — 129 dòng.

Functions: `main()` (dòng 6).

### edutrack_fe/app/(auth)/forgot-password/page.tsx

[edutrack_fe/app/(auth)/forgot-password/page.tsx](../../edutrack_fe/app/(auth)/forgot-password/page.tsx) — 38 dòng.

Dependencies: `lucide-react`, `@/components/auth/auth-shell`, `@/components/auth/forgot-password-form`.

Functions: `ForgotPasswordPage()` (dòng 26).

Exports: `ForgotPasswordPage` (26).

### edutrack_fe/app/(auth)/login/page.tsx

[edutrack_fe/app/(auth)/login/page.tsx](../../edutrack_fe/app/(auth)/login/page.tsx) — 15 dòng.

Dependencies: `@/components/auth/auth-shell`, `@/components/auth/login-form`.

Functions: `LoginPage()` (dòng 4).

Exports: `LoginPage` (4).

### edutrack_fe/app/(auth)/register/page.tsx

[edutrack_fe/app/(auth)/register/page.tsx](../../edutrack_fe/app/(auth)/register/page.tsx) — 15 dòng.

Dependencies: `@/components/auth/auth-shell`, `@/components/auth/register-form`.

Functions: `RegisterPage()` (dòng 4).

Exports: `RegisterPage` (4).

### edutrack_fe/app/(auth)/verify-otp/page.tsx

[edutrack_fe/app/(auth)/verify-otp/page.tsx](../../edutrack_fe/app/(auth)/verify-otp/page.tsx) — 26 dòng.

Dependencies: `@/components/auth/auth-shell`, `@/components/auth/verify-otp-form`.

Functions: `VerifyOtpPage({ searchParams, }: VerifyOtpPageProps)` (dòng 10).

Exports: `VerifyOtpPage` (10).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 4
type VerifyOtpPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};
```

### edutrack_fe/app/(dashboard)/classes/[classId]/page.tsx

[edutrack_fe/app/(dashboard)/classes/[classId]/page.tsx](../../edutrack_fe/app/(dashboard)/classes/[classId]/page.tsx) — 10 dòng.

Dependencies: `@/components/classes/classroom-detail-page`.

Functions: `ClassDetailRoute({ params, }: PageProps<"/classes/[classId]">)` (dòng 3).

Exports: `ClassDetailRoute` (3).

### edutrack_fe/app/(dashboard)/classes/page.tsx

[edutrack_fe/app/(dashboard)/classes/page.tsx](../../edutrack_fe/app/(dashboard)/classes/page.tsx) — 6 dòng.

Dependencies: `@/components/classes/classrooms-page`.

Functions: `ClassesPage()` (dòng 3).

Exports: `ClassesPage` (3).

### edutrack_fe/app/(dashboard)/dashboard/page.tsx

[edutrack_fe/app/(dashboard)/dashboard/page.tsx](../../edutrack_fe/app/(dashboard)/dashboard/page.tsx) — 6 dòng.

Dependencies: `@/components/dashboard/dashboard-overview`.

Functions: `DashboardPage()` (dòng 3).

Exports: `DashboardPage` (3).

### edutrack_fe/app/(dashboard)/layout.tsx

[edutrack_fe/app/(dashboard)/layout.tsx](../../edutrack_fe/app/(dashboard)/layout.tsx) — 19 dòng.

Dependencies: `react`, `next`, `@/components/layout/dashboard-shell`.

Functions: `DashboardGroupLayout({ children, }: { children: ReactNode; })` (dòng 12).

Exports: `metadata` (5), `DashboardGroupLayout` (12).

### edutrack_fe/app/(dashboard)/notifications/page.tsx

[edutrack_fe/app/(dashboard)/notifications/page.tsx](../../edutrack_fe/app/(dashboard)/notifications/page.tsx) — 27 dòng.

Dependencies: `lucide-react`, `@/components/notifications/push-notification-panel`.

Functions: `NotificationsPage()` (dòng 4).

Exports: `NotificationsPage` (4).

### edutrack_fe/app/(dashboard)/profile/page.tsx

[edutrack_fe/app/(dashboard)/profile/page.tsx](../../edutrack_fe/app/(dashboard)/profile/page.tsx) — 6 dòng.

Dependencies: `@/components/profile/profile-page`.

Functions: `ProfileRoute()` (dòng 3).

Exports: `ProfileRoute` (3).

### edutrack_fe/app/(dashboard)/schedule/page.tsx

[edutrack_fe/app/(dashboard)/schedule/page.tsx](../../edutrack_fe/app/(dashboard)/schedule/page.tsx) — 6 dòng.

Dependencies: `@/components/schedule/teacher-schedule-calendar`.

Functions: `SchedulePage()` (dòng 3).

Exports: `SchedulePage` (3).

### edutrack_fe/app/(dashboard)/settings/invoice-template/layout.tsx

[edutrack_fe/app/(dashboard)/settings/invoice-template/layout.tsx](../../edutrack_fe/app/(dashboard)/settings/invoice-template/layout.tsx) — 11 dòng.

Dependencies: `grapesjs/dist/css/grapes.min.css`, `react`.

Functions: `InvoiceTemplateLayout({ children, }: { children: ReactNode; })` (dòng 4).

Exports: `InvoiceTemplateLayout` (4).

### edutrack_fe/app/(dashboard)/settings/invoice-template/page.tsx

[edutrack_fe/app/(dashboard)/settings/invoice-template/page.tsx](../../edutrack_fe/app/(dashboard)/settings/invoice-template/page.tsx) — 6 dòng.

Dependencies: `@/components/invoice-designer/invoice-designer-loader`.

Functions: `InvoiceTemplatePage()` (dòng 3).

Exports: `InvoiceTemplatePage` (3).

### edutrack_fe/app/(dashboard)/students/page.tsx

[edutrack_fe/app/(dashboard)/students/page.tsx](../../edutrack_fe/app/(dashboard)/students/page.tsx) — 6 dòng.

Dependencies: `@/components/students/student-directory`.

Functions: `StudentsPage()` (dòng 3).

Exports: `StudentsPage` (3).

### edutrack_fe/app/(dashboard)/upload/page.tsx

[edutrack_fe/app/(dashboard)/upload/page.tsx](../../edutrack_fe/app/(dashboard)/upload/page.tsx) — 11 dòng.

Dependencies: `next`, `./upload-page-content`.

Functions: `UploadPage()` (dòng 8).

Exports: `metadata` (4), `UploadPage` (8).

### edutrack_fe/app/(dashboard)/upload/upload-page-content.tsx

[edutrack_fe/app/(dashboard)/upload/upload-page-content.tsx](../../edutrack_fe/app/(dashboard)/upload/upload-page-content.tsx) — 121 dòng.

Dependencies: `react`, `@/components/media/media-upload-board`, `@/components/media/media-history`, `lucide-react`.

Functions: `UploadPageContent()` (dòng 9).

Exports: `UploadPageContent` (9).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 37: `fetch(url)`

### edutrack_fe/app/(public)/about/page.tsx

[edutrack_fe/app/(public)/about/page.tsx](../../edutrack_fe/app/(public)/about/page.tsx) — 34 dòng.

Dependencies: `next`, `next/link`, `@/components/public/information-page`.

Functions: `AboutPage()` (dòng 10).

Exports: `metadata` (5), `AboutPage` (10).

### edutrack_fe/app/(public)/layout.tsx

[edutrack_fe/app/(public)/layout.tsx](../../edutrack_fe/app/(public)/layout.tsx) — 45 dòng.

Dependencies: `next/link`, `react`.

Functions: `PublicLayout({ children }: { children: ReactNode })` (dòng 10).

Exports: `PublicLayout` (10).

### edutrack_fe/app/(public)/privacy/page.tsx

[edutrack_fe/app/(public)/privacy/page.tsx](../../edutrack_fe/app/(public)/privacy/page.tsx) — 39 dòng.

Dependencies: `next`, `@/components/public/information-page`.

Functions: `PrivacyPage()` (dòng 9).

Exports: `metadata` (4), `PrivacyPage` (9).

### edutrack_fe/app/(public)/terms/page.tsx

[edutrack_fe/app/(public)/terms/page.tsx](../../edutrack_fe/app/(public)/terms/page.tsx) — 34 dòng.

Dependencies: `next`, `next/link`, `@/components/public/information-page`.

Functions: `TermsPage()` (dòng 10).

Exports: `metadata` (5), `TermsPage` (10).

### edutrack_fe/app/layout.tsx

[edutrack_fe/app/layout.tsx](../../edutrack_fe/app/layout.tsx) — 89 dòng.

Dependencies: `next`, `@/components/ui/notice-provider`, `@/components/pwa/service-worker-registration`, `@/components/pwa/install-prompt`, `./globals.css`, `./pwa.css`.

Functions: `RootLayout({ children }: LayoutProps<"/">)` (dòng 75).

Exports: `metadata` (8), `viewport` (66), `RootLayout` (75).

### edutrack_fe/app/offline/page.tsx

[edutrack_fe/app/offline/page.tsx](../../edutrack_fe/app/offline/page.tsx) — 79 dòng.

Functions: `OfflinePage()` (dòng 3).

Exports: `OfflinePage` (3).

### edutrack_fe/app/page.tsx

[edutrack_fe/app/page.tsx](../../edutrack_fe/app/page.tsx) — 6 dòng.

Dependencies: `next/navigation`.

Functions: `Home()` (dòng 3).

Exports: `Home` (3).

### edutrack_fe/app/robots.ts

[edutrack_fe/app/robots.ts](../../edutrack_fe/app/robots.ts) — 25 dòng.

Dependencies: `next`.

Functions: `robots(): MetadataRoute.Robots` (dòng 3).

Exports: `robots` (3).

### edutrack_fe/app/sitemap.ts

[edutrack_fe/app/sitemap.ts](../../edutrack_fe/app/sitemap.ts) — 38 dòng.

Dependencies: `next`.

Functions: `sitemap(): MetadataRoute.Sitemap` (dòng 3).

Exports: `sitemap` (3).

### edutrack_fe/components/auth/auth-shell.tsx

[edutrack_fe/components/auth/auth-shell.tsx](../../edutrack_fe/components/auth/auth-shell.tsx) — 180 dòng.

Dependencies: `react`, `next/image`, `lucide-react`, `lucide-react`, `./auth-shell.module.css`.

Functions: `AuthShell({ eyebrow, title, description, children, steps = defaultOnboardingSteps, }: AuthShellProps)` (dòng 49).

Exports: `AuthShell` (49).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 13
type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  steps?: readonly AuthShellStep[];
};
// line 21
type AuthShellStep = {
  step: string;
  title: string;
  description: string;
  Icon: LucideIcon;
};
```

### edutrack_fe/components/auth/forgot-password-form.tsx

[edutrack_fe/components/auth/forgot-password-form.tsx](../../edutrack_fe/components/auth/forgot-password-form.tsx) — 337 dòng.

Dependencies: `react`, `next/link`, `lucide-react`, `@/components/auth/otp-code-input`, `@/components/ui/form-field`, `@/components/ui/primary-button`, `@/lib/api/auth`, `@/lib/api/client`.

Functions: `ForgotPasswordForm()` (dòng 28).

Exports: `ForgotPasswordForm` (28).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 26
type ForgotPasswordStep = "request" | "otp" | "done";
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 56: `authApi.forgotPassword({ email, newPassword, })`
- Dòng 81: `authApi.resetPassword({ email, otp })`
- Dòng 104: `authApi.resendPasswordResetOtp({ email })`

### edutrack_fe/components/auth/login-form.tsx

[edutrack_fe/components/auth/login-form.tsx](../../edutrack_fe/components/auth/login-form.tsx) — 209 dòng.

Dependencies: `react`, `next/link`, `next/navigation`, `lucide-react`, `@/lib/api/auth`, `@/lib/api/client`, `@/lib/auth/token-storage`, `@/components/ui/form-field`, `@/components/ui/primary-button`.

Functions: `LoginForm()` (dòng 19).

Exports: `LoginForm` (19).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 56: `authApi.login({ email, password })`

### edutrack_fe/components/auth/otp-code-input.tsx

[edutrack_fe/components/auth/otp-code-input.tsx](../../edutrack_fe/components/auth/otp-code-input.tsx) — 146 dòng.

Dependencies: `react`.

Functions: `OtpCodeInput({ idPrefix, label = "Mã OTP", value, onChange, disabled = false, autoFocus = false, variant = "default", }: OtpCodeInputProps)` (dòng 19).

Exports: `OtpCodeInput` (19).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 9
type OtpCodeInputProps = {
  idPrefix: string;
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  variant?: "default" | "auth";
};
```

### edutrack_fe/components/auth/register-form.tsx

[edutrack_fe/components/auth/register-form.tsx](../../edutrack_fe/components/auth/register-form.tsx) — 142 dòng.

Dependencies: `react`, `next/link`, `next/navigation`, `lucide-react`, `@/lib/api/auth`, `@/lib/api/client`, `@/lib/auth/token-storage`, `@/components/ui/form-field`, `@/components/ui/primary-button`.

Functions: `RegisterForm()` (dòng 20).

Exports: `RegisterForm` (20).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 35: `authApi.register({ fullName, email, password })`

### edutrack_fe/components/auth/verify-otp-form.tsx

[edutrack_fe/components/auth/verify-otp-form.tsx](../../edutrack_fe/components/auth/verify-otp-form.tsx) — 251 dòng.

Dependencies: `react`, `next/link`, `next/navigation`, `lucide-react`, `@/lib/api/auth`, `@/lib/api/client`, `@/lib/auth/token-storage`, `@/components/ui/form-field`, `@/components/auth/otp-code-input`, `@/components/ui/primary-button`.

Functions: `getRemainingSeconds(target?: string, now = Date.now())` (dòng 20); `formatCountdown(seconds: number)` (dòng 34); `VerifyOtpForm({ initialEmail = "" }: VerifyOtpFormProps)` (dòng 43).

Exports: `VerifyOtpForm` (43).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 14
type VerifyOtpFormProps = {
  initialEmail?: string;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 97: `authApi.verifyOtp({ email, otp })`
- Dòng 121: `authApi.resendOtp({ email })`

### edutrack_fe/components/classes/attendance/attendance-action-bar.tsx

[edutrack_fe/components/classes/attendance/attendance-action-bar.tsx](../../edutrack_fe/components/classes/attendance/attendance-action-bar.tsx) — 53 dòng.

Dependencies: `lucide-react`.

Functions: `AttendanceActionBar({ dirtyCellsSize, editingSessionsSize, isSaving, onCancel, onSaveOrClose, }: AttendanceActionBarProps)` (dòng 11).

Exports: `AttendanceActionBar` (11).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
type AttendanceActionBarProps = {
  dirtyCellsSize: number;
  editingSessionsSize: number;
  isSaving: boolean;
  onCancel: () => void;
  onSaveOrClose: () => void;
};
```

### edutrack_fe/components/classes/attendance/attendance-legend.tsx

[edutrack_fe/components/classes/attendance/attendance-legend.tsx](../../edutrack_fe/components/classes/attendance/attendance-legend.tsx) — 32 dòng.

Functions: `AttendanceLegend({ showingCount, totalCount, }: { showingCount: number; totalCount: number; })` (dòng 1).

Exports: `AttendanceLegend` (1).

### edutrack_fe/components/classes/attendance/attendance-table.tsx

[edutrack_fe/components/classes/attendance/attendance-table.tsx](../../edutrack_fe/components/classes/attendance/attendance-table.tsx) — 229 dòng.

Dependencies: `lucide-react`, `@/types/school`, `../class-attendance-tab.module.css`, `../classroom-utils`.

Functions: `AttendanceTable({ sessions, activeStudents, localRecords, savedSessions, billedCells, editingSessions, overviewStats, onToggleStatus, onUnlockSession, scrollContainerRef, }: AttendanceTableProps)` (dòng 23).

Exports: `AttendanceTable` (23).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 10
type AttendanceTableProps = {
  sessions: TeacherScheduleEvent[];
  activeStudents: Student[];
  localRecords: Record<string, AttendanceStatus>;
  savedSessions: Set<string>;
  billedCells: Set<string>;
  editingSessions: Set<string>;
  overviewStats: Record<string, { present: number; absent: number; excused: number }>;
  onToggleStatus: (sessionId: string, studentId: string) => void;
  onUnlockSession: (sessionId: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};
```

### edutrack_fe/components/classes/class-attendance-tab.tsx

[edutrack_fe/components/classes/class-attendance-tab.tsx](../../edutrack_fe/components/classes/class-attendance-tab.tsx) — 377 dòng.

Dependencies: `react`, `@/lib/api/school`, `@/components/ui/notice-provider`, `@/types/school`, `lucide-react`, `./classroom-ui`, `./attendance/attendance-table`, `./attendance/attendance-legend`, `./attendance/attendance-action-bar`.

Functions: `ClassAttendanceTab({ classroom }: ClassAttendanceTabProps)` (dòng 23); `getApiErrorMessage(error: unknown, fallback: string)` (dòng 349).

Exports: `ClassAttendanceTab` (23).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 19
type ClassAttendanceTabProps = {
  classroom: ClassroomDetail;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 47: `schoolApi.getAttendanceSheet(classroom.id)`
- Dòng 231: `schoolApi.takeAttendanceBatch(classroom.id, { sessions: payloadSessions })`

### edutrack_fe/components/classes/class-schedule-parts.tsx

[edutrack_fe/components/classes/class-schedule-parts.tsx](../../edutrack_fe/components/classes/class-schedule-parts.tsx) — 1498 dòng.

Dependencies: `lucide-react`, `react`, `react`, `react-dom`, `@/types/school`, `./classroom-ui`, `./classroom-utils`, `./classroom-manager.module.css`, `./class-schedule-tab.module.css`.

Functions: `SummaryItem({ icon, label, value, }: { icon: ReactNode; label: string; value: string; })` (dòng 223); `CurrentFixedSchedule({ schedule, isSuspended, onSuspend, onResume, }: { schedule: LatestFixedSchedule \| null; isSuspended?: boolean; onSuspend?: () => void; onResume?: () => void; })` (dòng 243); `WeekCalendar({ days, eventsByDateAndPeriod, onEventSelect, periods, }: { days: TeacherScheduleDay[]; eventsByDateAndPeriod: Map<string, TeacherScheduleEvent[]>; onEventSelect: (event: TeacherScheduleEvent) => void; periods: SchedulePeriod[]; })` (dòng 305); `DayHeader({ day }: { day: TeacherScheduleDay })` (dòng 375); `PeriodHeader({ period }: { period: SchedulePeriod })` (dòng 384); `CalendarCell({ day, events, onEventSelect, period, }: { day: TeacherScheduleDay; events: TeacherScheduleEvent[]; onEventSelect: (event: TeacherScheduleEvent) => void; period: SchedulePeriod; })` (dòng 398); `ScheduleEventCard({ event, onSelect, }: { event: TeacherScheduleEvent; onSelect: () => void; })` (dòng 436); `TemporarySchedulePanel({ isRevoking, onEdit, onRevoke, schedules, }: { isRevoking: boolean; onEdit: (schedule: ClassTemporarySchedule) => void; onRevoke: (scheduleId: string) => void; schedules: ClassTemporarySchedule[]; })` (dòng 486); `LessonAdjustmentControls({ event, form, isSaving, mode, onCancel, onChange, onModeChange, onSave, }: { event: TeacherScheduleEvent; form: TemporaryScheduleForm; isSaving: boolean; mode: ScheduleOverrideAction \| ""; onCancel: () => void; onChange: Dispatch<SetStateAction<TemporaryScheduleForm>>; onModeChange: (mode: ScheduleOverrideAction) => void; onSave: () => void; })` (dòng 555); `CalendarSkeleton({ days, periods, }: { days: TeacherScheduleDay[]; periods: SchedulePeriod[]; })` (dòng 694); `SelectField({ label, onChange, options, value, }: { label: string; onChange: (value: string) => void; options: SelectOption[]; value: string; })` (dòng 748); `DateField({ label, onChange, value, }: { label: string; onChange: (value: string) => void; value: string; })` (dòng 900); `TimeField({ label, onChange, value, }: { label: string; onChange: (value: string) => void; value: string; })` (dòng 925); `buildFixedFormFromSchedule(schedule: LatestFixedSchedule \| null): FixedScheduleForm` (dòng 955); `buildTemporaryFormFromSchedule(schedule: ClassTemporarySchedule): TemporaryScheduleForm` (dòng 970); `buildTemporaryFormFromEvent(event: TeacherScheduleEvent, action: ScheduleOverrideAction): TemporaryScheduleForm` (dòng 985); `validateFixedSchedule(form: FixedScheduleForm)` (dòng 1018); `buildTemporaryPayload(form: TemporaryScheduleForm): CreateTemporarySchedulePayload \| string` (dòng 1044); `formatTemporarySchedule(schedule: ClassTemporarySchedule)` (dòng 1101); `getActionLabel(action: ScheduleOverrideAction)` (dòng 1115); `getTemporaryIcon(action: ScheduleOverrideAction)` (dòng 1131); `getEventStyle(event: TeacherScheduleEvent)` (dòng 1147); `getEventIcon(type: TeacherScheduleEventType)` (dòng 1161); `getEventLabel(type: TeacherScheduleEventType)` (dòng 1181); `formatTimeRange(event: TeacherScheduleEvent)` (dòng 1205); `getLessonContent(event: TeacherScheduleEvent)` (dòng 1213); `getCalendarCellKey(date: string, period: SessionPeriodValue)` (dòng 1219); `compareEventsByStartTime(firstEvent: TeacherScheduleEvent, secondEvent: TeacherScheduleEvent)` (dòng 1223); `getTimeOrderValue(time?: string)` (dòng 1233); `getSessionPeriod(time?: string): { label: string; value: SessionPeriodValue; }` (dòng 1243); `getSessionPeriodIcon(period: SessionPeriodValue)` (dòng 1276); `mapEventTypeToScheduleType(type: TeacherScheduleEventType)` (dòng 1292); `isStandaloneTemporaryAction(action: ScheduleOverrideAction)` (dòng 1312); `getTemporaryScheduleIdFromEvent(event: TeacherScheduleEvent)` (dòng 1316); `isTemporaryScheduleInWeek(schedule: ClassTemporarySchedule, weekStartKey: string)` (dòng 1324); `buildWeekDays(weekStartKey: string): TeacherScheduleDay[]` (dòng 1337); `formatDate(value?: string)` (dòng 1348); `toDateInputValue(value?: string)` (dòng 1362); `normalizeTimeInput(value: string)` (dòng 1381); `normalizeTimeOnBlur(value: string)` (dòng 1391); `getCurrentWeekStartKey(): string` (dòng 1405); `getWeekStartKey(dateKey: string): string` (dòng 1418); `addDaysToDateKey(dateKey: string, days: number): string` (dòng 1430); `isToday(dateKey: string)` (dòng 1440); `parseVietnamDateKey(value: string)` (dòng 1444); `getVietnamDayOfWeek(date: Date)` (dòng 1467); `toVietnamDateKey(date: Date)` (dòng 1474); `addDays(date: Date, days: number)` (dòng 1483); `getDayLabel(dayOfWeek: number)` (dòng 1487).

Exports: `FixedScheduleForm` (43), `TemporaryScheduleForm` (48), `LessonContentForm` (59), `ScheduleConfirmAction` (64), `SelectOption` (71), `SessionPeriodValue` (77), `SchedulePeriod` (80), `emptySlot` (86), `initialFixedForm` (92), `initialTemporaryForm` (97), `initialLessonForm` (106), `dayOptions` (111), `actionOptions` (121), `calendarPeriods` (132), `unknownPeriod` (150), `SummaryItem` (223), `CurrentFixedSchedule` (243), `WeekCalendar` (305), `TemporarySchedulePanel` (486), `LessonAdjustmentControls` (555), `CalendarSkeleton` (694), `SelectField` (748), `DateField` (900), `TimeField` (925), `buildFixedFormFromSchedule` (955), `buildTemporaryFormFromSchedule` (970), `buildTemporaryFormFromEvent` (985), `validateFixedSchedule` (1018), `buildTemporaryPayload` (1044), `getActionLabel` (1115), `getEventStyle` (1147), `getEventIcon` (1161), `formatTimeRange` (1205), `getCalendarCellKey` (1219), `compareEventsByStartTime` (1223), `getSessionPeriod` (1243), `mapEventTypeToScheduleType` (1292), `isStandaloneTemporaryAction` (1312), `getTemporaryScheduleIdFromEvent` (1316), `isTemporaryScheduleInWeek` (1324), `buildWeekDays` (1337), `formatDate` (1348), `getCurrentWeekStartKey` (1405), `getWeekStartKey` (1418), `addDaysToDateKey` (1430).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 43
export type FixedScheduleForm = {
  effectiveFrom: string;
  schedules: ClassScheduleSlot[];
};
// line 48
export type TemporaryScheduleForm = {
  action: ScheduleOverrideAction;
  originalDate: string;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate: string;
  startTime: string;
  endTime: string;
  reason: string;
};
// line 59
export type LessonContentForm = {
  topic: string;
  content: string;
};
// line 64
export type ScheduleConfirmAction =
  | { type: "fixed" }
  | { type: "temporary" }
  | { scheduleId: string; type: "revoke" }
  | { type: "lessonContent" }
  | { type: "lessonAdjustment" };
// line 71
export type SelectOption = {
  icon?: ReactNode;
  label: string;
  value: string;
};
// line 77
export type SessionPeriodValue =
  "morning" | "afternoon" | "evening" | "unknown";
// line 80
export type SchedulePeriod = {
  label: string;
  timeHint: string;
  value: SessionPeriodValue;
};
```

### edutrack_fe/components/classes/class-schedule-tab.tsx

[edutrack_fe/components/classes/class-schedule-tab.tsx](../../edutrack_fe/components/classes/class-schedule-tab.tsx) — 1521 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/lib/api/school`, `@/types/school`, `./classroom-ui`, `./classroom-utils`, `./classroom-manager.module.css`, `./class-schedule-tab.module.css`, `../schedule/schedule-availability-picker`, `../schedule/schedule-source-picker`, `../schedule/schedule-conflict-feedback`, `@/components/ui/notice-provider`, `./class-schedule-parts`.

Functions: `ClassScheduleTab({ classroom, onScheduleChanged, }: { classroom: ClassroomDetail; onScheduleChanged?: () => Promise<void> \| void; })` (dòng 99).

Exports: `ClassScheduleTab` (99).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 151: `schoolApi.getClassSchedules(classroom.id)`
- Dòng 152: `schoolApi.getTeacherWeekSchedule(selectedWeekStart)`
- Dòng 316: `schoolApi.checkFixedSchedule(classroom.id, fixedForm)`
- Dòng 335: `schoolApi.saveFixedSchedule(classroom.id, fixedForm)`
- Dòng 369: `schoolApi.checkTemporarySchedule(classroom.id, payload, editingTemporarySchedule?.id)`
- Dòng 393: `schoolApi.updateTemporarySchedule(classroom.id, editingTemporarySchedule.id, payload)`
- Dòng 400: `schoolApi.createTemporarySchedule(classroom.id, payload)`
- Dòng 428: `schoolApi.revokeTemporarySchedule(classroom.id, scheduleId)`
- Dòng 477: `schoolApi.saveClassSessionContent(classroom.id, { content: lessonForm.content.trim() \|\| undefined, date: selectedEvent.date, endTime: selectedEvent.endTime, scheduleType: mapEventTypeToScheduleType(selectedEvent.type), startTime)`
- Dòng 513: `schoolApi.checkTemporarySchedule(classroom.id, payload, editingTemporarySchedule?.id)`
- Dòng 542: `schoolApi.updateTemporarySchedule(classroom.id, editingTemporarySchedule.id, payload)`
- Dòng 549: `schoolApi.createTemporarySchedule(classroom.id, payload)`
- Dòng 593: `schoolApi.previewSuspendFixedSchedule(classroom.id, { suspendFrom })`
- Dòng 608: `schoolApi.suspendFixedSchedule(classroom.id, { suspendFrom, })`
- Dòng 631: `schoolApi.checkFixedSchedule(classroom.id, { effectiveFrom: resumeFrom, schedules: overview.latestFixedSchedule!.schedules })`
- Dòng 646: `schoolApi.resumeFixedSchedule(classroom.id, { resumeFrom, })`

### edutrack_fe/components/classes/class-tuition-tab.tsx

[edutrack_fe/components/classes/class-tuition-tab.tsx](../../edutrack_fe/components/classes/class-tuition-tab.tsx) — 1135 dòng.

Dependencies: `lucide-react`, `react`, `@/lib/api/school`, `@/lib/files/open-pdf-in-new-tab`, `@/types/invoice-template`, `./tuition/receipt-history`, `./tuition/billing-student-list`, `./tuition/tuition-metric`, `./tuition/receipt-dialogs`, `@/types/school`, `./classroom-utils`, `./classroom-ui`, `@/components/ui/notice-provider`.

Functions: `downloadBlobFile(blob: Blob, fileName: string, fallbackMimeType: string, extension: string)` (dòng 67); `ClassTuitionTab({ classroom, initialIssueMode = "class", initialIssueStudent, onClassUpdated, onInitialIssueHandled, }: { classroom: ClassroomDetail; initialIssueMode?: IssueMode; initialIssueStudent?: Student \| null; onClassUpdated?: (classroom: Classroom) => void; onInitialIssueHandled?: () => void; })` (dòng 94); `ReceiptPreviewDialog({ html, onClose, }: { html: string; onClose: () => void; })` (dòng 991); `PriceSettingsPanel({ form, isLoading, makeupPrice, onChange, onSubmit, priceEffectiveFrom, regularPrice, }: { form: PriceFormState; isLoading: boolean; makeupPrice: number; onChange: (form: PriceFormState) => void; onSubmit: () => void; priceEffectiveFrom?: string \| null; regularPrice: number; })` (dòng 1022); `PriceDateField({ onChange, value, }: { onChange: (value: string) => void; value: string; })` (dòng 1107).

Exports: `ClassTuitionTab` (94).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 158: `schoolApi.getBillingOverview(classroom.id, filters)`
- Dòng 159: `schoolApi.listReceipts({ classId: classroom.id, fromDate: filters.fromDate \|\| undefined, toDate: filters.toDate \|\| undefined, })`
- Dòng 293: `schoolApi.getStudentBillingOverview(student.id, candidateFilters)`
- Dòng 308: `schoolApi.getStudentBillingCandidates(student.id, { ...candidateFilters, classIds: effectiveClassIds, })`
- Dòng 318: `schoolApi.getBillingCandidates(classroom.id, student.id, candidateFilters)`
- Dòng 386: `schoolApi.previewStudentReceipt(selectedStudent.id, payload)`
- Dòng 387: `schoolApi.previewReceipt(classroom.id, selectedStudent.id, payload)`
- Dòng 420: `schoolApi.issueStudentReceipt(selectedStudent.id, payload)`
- Dòng 421: `schoolApi.issueReceipt(classroom.id, selectedStudent.id, payload)`
- Dòng 494: `schoolApi.getReceiptDownload(receipt.id)`
- Dòng 512: `schoolApi.getReceiptDownload(receipt.id)`
- Dòng 532: `schoolApi.downloadReceipts({ receiptIds: selectedReceipts.map((receipt) => receipt.id), })`
- Dòng 557: `schoolApi.retryReceiptPdf(receipt.id)`
- Dòng 577: `schoolApi.cancelReceipt(receiptToCancel.id)`
- Dòng 641: `schoolApi.uploadReceiptPaymentProof(paymentReceipt.id, paymentForm.proofFile)`
- Dòng 647: `schoolApi.updateReceiptPayment(paymentReceipt.id, { paymentStatus: paymentForm.paymentStatus, paidAmount: paymentForm.paymentStatus === "partially_paid" ? parsedPaidAmount : undefined, paidAt: paymentForm.paymentStatus === "unpaid)`
- Dòng 752: `schoolApi.updateClass(classroom.id, { regularPrice, makeupPrice, priceEffectiveFrom: priceForm.priceEffectiveFrom, })`

### edutrack_fe/components/classes/classroom-detail-page.tsx

[edutrack_fe/components/classes/classroom-detail-page.tsx](../../edutrack_fe/components/classes/classroom-detail-page.tsx) — 529 dòng.

Dependencies: `next/link`, `lucide-react`, `next/navigation`, `react`, `react`, `@/lib/api/school`, `@/types/school`, `./classroom-detail-tabs`, `./classroom-types`, `@/components/ui/notice-provider`, `./classroom-ui`, `./classroom-utils`, `./create-class-modal`, `./student-picker-modal`, `./use-deferred-class-image-upload`.

Functions: `ClassroomDetailPage({ classId }: { classId: string })` (dòng 38); `buildClassFormFromClass(classroom: ClassroomDetail): ClassFormState` (dòng 500); `buildClassColorUsages(classrooms: Classroom[], ignoredClassId?: string): ClassColorUsage[]` (dòng 516).

Exports: `ClassroomDetailPage` (38).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 73: `schoolApi.getClassDetail(classId)`
- Dòng 104: `schoolApi.listClasses()`
- Dòng 127: `schoolApi.removeStudentFromClass(classId, student.id)`
- Dòng 147: `schoolApi.hardDeleteStudentFromClass(classId, student.id)`
- Dòng 171: `schoolApi.removeStudentsFromClass(classId, students.map((student) => student.id))`
- Dòng 279: `schoolApi.updateClass(classDetail.id, { name: classForm.name.trim(), description: classForm.description.trim(), imageUrl: uploadedImageUrl ?? (typedImageUrl \|\| undefined), colorIndex: classForm.colorIndex, colorHex: cl)`
- Dòng 330: `schoolApi.deleteClass(classDetail.id)`

### edutrack_fe/components/classes/classroom-detail-tabs.tsx

[edutrack_fe/components/classes/classroom-detail-tabs.tsx](../../edutrack_fe/components/classes/classroom-detail-tabs.tsx) — 765 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/types/school`, `./class-schedule-tab`, `./class-attendance-tab`, `./exam/class-exam-tab`, `./class-tuition-tab`, `./classroom-utils`, `./classroom-ui`, `./student-detail-modal`, `./classroom-manager.module.css`.

Functions: `ClassroomDetailTabs({ classroom, isLoading, initialActiveTab, initialIssueMode, initialIssueStudent, onAddStudent, onArchiveClass, onClassUpdated, onEditClass, onInitialIssueHandled, onRemoveStudent, onRemoveStudents, onDeleteStudent, onScheduleChanged, removingStudentId, removingStudentIds = [], deletingStudentId, }: { classroom: ClassroomDetail \| null; isLoading: boolean; initialActiveTab?: DetailTab; initialIssueMode?: "class" \| "multi_class"; initialIssueStudent?: Student \| null; onAddStudent: () => void; onArchiveClass?: () => void; onClassUpdated?: (classroom: Classroom) => void; onEditClass?: () => void; onInitialIssueHandled?: () => void; onRemoveStudent: (student: Student) => void; onRemoveStudents: (students: Student[]) => void; onDeleteStudent: (student: Student) => void; onScheduleChanged?: () => Promise<void> \| void; removingStudentId: string; removingStudentIds?: string[]; deletingStudentId: string; })` (dòng 55); `StudentActionMenu({ student, isRemoving, isDeleting, disabled, onRemove, onDelete, }: { student: Student; isRemoving: boolean; isDeleting: boolean; disabled: boolean; onRemove: () => void; onDelete: () => void; })` (dòng 318); `StudentsTab({ filteredStudents, onAddStudent, onRemoveStudent, onRemoveStudents, onDeleteStudent, onSelectStudent, removingStudentId, removingStudentIds, deletingStudentId, searchValue, setSearchValue, totalStudents, }: { filteredStudents: Student[]; onAddStudent: () => void; onRemoveStudent: (student: Student) => void; onRemoveStudents: (students: Student[]) => void; onDeleteStudent: (student: Student) => void; onSelectStudent: (student: Student) => void; removingStudentId: string; removingStudentIds: string[]; deletingStudentId: string; searchValue: string; setSearchValue: (value: string) => void; totalStudents: number; })` (dòng 468); `StudentIdentity({ student }: { student: Student })` (dòng 711); `FutureTab({ tab }: { tab: DetailTab })` (dòng 727).

Exports: `ClassroomDetailTabs` (55).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 41
type DetailTab = "students" | "schedule" | "tuition" | "scores" | "attendance";
```

### edutrack_fe/components/classes/classroom-types.ts

[edutrack_fe/components/classes/classroom-types.ts](../../edutrack_fe/components/classes/classroom-types.ts) — 125 dòng.

Dependencies: `@/types/school`.

Functions: `buildStudentPayload(form: StudentFormState): CreateStudentPayload` (dòng 73); `buildStudentFormFromStudent(student: Student): StudentFormState` (dòng 99); `toDateInputValue(value?: string)` (dòng 118).

Exports: `Notice` (9), `ClassFormState` (15), `StudentFormState` (27), `initialClassForm` (44), `initialStudentForm` (56), `buildStudentPayload` (73), `buildStudentFormFromStudent` (99).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 9
export type Notice = {
  type: "success" | "error" | "info" | "warning";
  title?: string;
  text: string;
};
// line 15
export type ClassFormState = {
  name: string;
  description: string;
  imageUrl: string;
  colorIndex: number;
  colorHex: string;
  regularPrice: string;
  makeupPrice: string;
  priceEffectiveFrom: string;
  status: ClassStatus;
};
// line 27
export type StudentFormState = {
  studentCode: string;
  fullName: string;
  gender: Gender;
  avatarUrl: string;
  dateOfBirth: string;
  gradeLevel: string;
  phone: string;
  parentFullName: string;
  parentPhone: string;
  parentRelation: string;
  parentNote: string;
  address: string;
  note: string;
  status: StudentStatus;
};
```

### edutrack_fe/components/classes/classroom-ui.tsx

[edutrack_fe/components/classes/classroom-ui.tsx](../../edutrack_fe/components/classes/classroom-ui.tsx) — 400 dòng.

Dependencies: `lucide-react`, `react`, `react`, `./classroom-types`, `./classroom-manager.module.css`.

Functions: `Modal({ children, onClose, size = "default", title, }: { children: ReactNode; onClose: () => void; size?: "default" \| "sm" \| "wide"; title: string; })` (dòng 23); `ConfirmDialog({ cancelText = "Hủy", confirmText = "Đồng ý", description, icon, isLoading = false, onCancel, onConfirm, title, tone = "default", }: { cancelText?: string; confirmText?: string; description: string; icon?: ReactNode; isLoading?: boolean; onCancel: () => void; onConfirm: () => void; title: string; tone?: "default" \| "danger"; })` (dòng 60); `NoticeBanner({ durationMs = 3500, notice, onClose, }: { durationMs?: number; notice: Notice; onClose?: () => void; })` (dòng 134); `getNoticeToastConfig(type: Notice["type"])` (dòng 195); `InlineLoading({ text }: { text: string })` (dòng 239); `EmptyState({ action, icon, text, title, }: { action?: ReactNode; icon: ReactNode; text: string; title?: string; })` (dòng 251); `TextInput({ icon, label, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode; label: string; })` (dòng 282); `TextArea({ icon, label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { icon?: ReactNode; label: string; })` (dòng 312); `PrimaryAction({ children, className = "", icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; })` (dòng 342); `SecondaryAction({ children, className = "", icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; })` (dòng 361); `StudentAvatar({ alt, size = "md", src, }: { alt: string; size?: "sm" \| "md" \| "lg"; src: string; })` (dòng 380).

Exports: `Modal` (23), `ConfirmDialog` (60), `NoticeBanner` (134), `InlineLoading` (239), `EmptyState` (251), `TextInput` (282), `TextArea` (312), `PrimaryAction` (342), `SecondaryAction` (361), `StudentAvatar` (380).

### edutrack_fe/components/classes/classroom-utils.ts

[edutrack_fe/components/classes/classroom-utils.ts](../../edutrack_fe/components/classes/classroom-utils.ts) — 544 dòng.

Dependencies: `@/types/school`.

Functions: `formatMoney(value: number)` (dòng 58); `formatCurrencyInput(value: string)` (dòng 66); `parseCurrencyInput(value: string)` (dòng 76); `getVietnamTodayInputDate()` (dòng 88); `toVietnamDateInputValue(value?: string \| Date \| null)` (dòng 97); `getCurrencyDigits(value: string)` (dòng 116); `formatCurrencyDigits(digits: string)` (dòng 120); `getErrorMessage(error: unknown)` (dòng 124); `normalizeClassColorHex(value?: string \| null)` (dòng 132); `getClassColorHex({ colorHex, colorIndex, }: { colorHex?: string \| null; colorIndex?: number \| null; })` (dòng 142); `getClassColorLabel(colorHex?: string \| null)` (dòng 154); `getSuggestedClassColors(usedColorHexes: Array<string \| null \| undefined>, count = 3, variation = 0)` (dòng 171); `buildAdaptiveClassColorCandidates(variation: number)` (dòng 235); `getClassColorIndexForHue(hue: number)` (dòng 270); `getGeneratedColorLabel(colorHex: string)` (dòng 302); `getClassColorTheme(colorHex?: string \| null)` (dòng 346); `mixHexColor(color: string, target: string, targetWeight: number)` (dòng 357); `hexToRgb(color: string)` (dòng 369); `getPerceptualColorDistance(firstColor: string, secondColor: string)` (dòng 379); `rgbToOklab({ r, g, b }: { r: number; g: number; b: number })` (dòng 390); `rgbToHsl({ r, g, b }: { r: number; g: number; b: number })` (dòng 425); `hslToHex({ hue, lightness, saturation, }: { hue: number; lightness: number; saturation: number; })` (dòng 453); `normalizeHue(hue: number)` (dòng 495); `getCircularHueDistance(firstHue: number, secondHue: number)` (dòng 499); `rgbToHex({ r, g, b }: { r: number; g: number; b: number })` (dòng 505); `getGenderLabel(gender?: Gender)` (dòng 511); `getStudentAvatar(student: Student)` (dòng 523); `getDefaultAvatarByGender(gender: Gender)` (dòng 532); `normalizeVisibleText(value?: string)` (dòng 536).

Exports: `DEFAULT_BOY_AVATAR_URL` (3), `DEFAULT_GIRL_AVATAR_URL` (5), `DEFAULT_CLASS_IMAGE_URL` (7), `CLASS_COLOR_OPTIONS` (10), `ClassColorSuggestion` (21), `CLASS_COLOR_SUGGESTION_OPTIONS` (32), `DEFAULT_CLASS_COLOR_HEX` (48), `formatMoney` (58), `formatCurrencyInput` (66), `parseCurrencyInput` (76), `getVietnamTodayInputDate` (88), `toVietnamDateInputValue` (97), `getErrorMessage` (124), `normalizeClassColorHex` (132), `getClassColorHex` (142), `getClassColorLabel` (154), `getSuggestedClassColors` (171), `getClassColorTheme` (346), `getGenderLabel` (511), `getStudentAvatar` (523), `getDefaultAvatarByGender` (532), `normalizeVisibleText` (536).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 21
export type ClassColorSuggestion = {
  accent: string;
  colorIndex: number;
  label: string;
};
```

### edutrack_fe/components/classes/classrooms-page.tsx

[edutrack_fe/components/classes/classrooms-page.tsx](../../edutrack_fe/components/classes/classrooms-page.tsx) — 512 dòng.

Dependencies: `next/link`, `lucide-react`, `next/navigation`, `react`, `react`, `@/lib/api/school`, `@/types/school`, `./classroom-types`, `@/components/ui/notice-provider`, `./classroom-ui`, `./classroom-utils`, `./classroom-manager.module.css`, `./create-class-modal`, `./use-deferred-class-image-upload`.

Functions: `ClassroomsPage()` (dòng 52); `buildClassColorUsages(classrooms: Classroom[], ignoredClassId?: string): ClassColorUsage[]` (dòng 277); `ClassroomToolbar({ onCreateClass, onSearchChange, searchValue, }: { onCreateClass: () => void; onSearchChange: (value: string) => void; searchValue: string; })` (dòng 291); `ClassroomGrid({ classes, isLoading, searchTerm, }: { classes: Classroom[]; isLoading: boolean; searchTerm: string; })` (dòng 324); `ClassroomGridItem({ classroom }: { classroom: Classroom })` (dòng 360); `ClassroomGridSkeleton()` (dòng 437); `getStatusLabel(status: ClassStatus)` (dòng 458); `getStatusClassName(status: ClassStatus)` (dòng 470); `getLatestScheduleText(schedule: LatestFixedSchedule \| null)` (dòng 482); `formatScheduleSlot(slot: ClassScheduleSlot)` (dòng 497); `getDayLabel(dayOfWeek: number)` (dòng 501).

Exports: `ClassroomsPage` (52).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 79: `schoolApi.listClasses(classSearch)`
- Dòng 106: `schoolApi.listClasses()`
- Dòng 179: `schoolApi.createClass({ name: classForm.name, description: classForm.description \|\| undefined, imageUrl: uploadedImageUrl ?? (typedImageUrl \|\| undefined), colorIndex: classForm.colorIndex, colorHex: cla)`

### edutrack_fe/components/classes/create-class-modal.tsx

[edutrack_fe/components/classes/create-class-modal.tsx](../../edutrack_fe/components/classes/create-class-modal.tsx) — 639 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/types/school`, `./classroom-types`, `./classroom-ui`, `./classroom-utils`.

Functions: `CurrencyInput({ label, onChange, placeholder, value, }: { label: string; onChange: (value: string) => void; placeholder: string; value: string; })` (dòng 45); `CreateClassModal({ form, imageFileName, imagePreviewUrl, isSubmitting, isUploadingImage, onChange, onClose, onImageFileChange, onImageUrlChange, onSubmit, usedColorUsages, }: { form: ClassFormState; imageFileName: string; imagePreviewUrl?: string; isSubmitting: boolean; isUploadingImage: boolean; onChange: (form: ClassFormState) => void; onClose: () => void; onImageFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onImageUrlChange: (imageUrl: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; usedColorUsages: ClassColorUsage[]; })` (dòng 83); `EditClassModal({ form, imageFileName, imagePreviewUrl, isSubmitting, isUploadingImage, onChange, onClose, onImageFileChange, onImageUrlChange, onSubmit, usedColorUsages, }: { form: ClassFormState; imageFileName: string; imagePreviewUrl?: string; isSubmitting: boolean; isUploadingImage: boolean; onChange: (form: ClassFormState) => void; onClose: () => void; onImageFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onImageUrlChange: (imageUrl: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; usedColorUsages: ClassColorUsage[]; })` (dòng 129); `ClassFormModal({ form, imageFileName, imagePreviewUrl, isEditMode = false, isSubmitting, isUploadingImage, onChange, onClose, onImageFileChange, onImageUrlChange, onSubmit, submitIcon, submitLoadingIcon, submitText, title, usedColorUsages, }: { form: ClassFormState; imageFileName: string; imagePreviewUrl?: string; isEditMode?: boolean; isSubmitting: boolean; isUploadingImage: boolean; onChange: (form: ClassFormState) => void; onClose: () => void; onImageFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onImageUrlChange: (imageUrl: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitIcon: ReactNode; submitLoadingIcon: ReactNode; submitText: string; title: string; usedColorUsages: ClassColorUsage[]; })` (dòng 176); `ClassImagePicker({ fileName, form, imagePreviewUrl, isUploading, onFileChange, onImageUrlChange, }: { fileName: string; form: ClassFormState; imagePreviewUrl?: string; isUploading: boolean; onFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onImageUrlChange: (imageUrl: string) => void; })` (dòng 324); `ClassColorPicker({ onChange, usedColorUsages, value, }: { onChange: (colorHex: string, colorIndex?: number) => void; usedColorUsages: ClassColorUsage[]; value: string; })` (dòng 411); `ClassStatusPicker({ onChange, value, }: { onChange: (status: ClassStatus) => void; value: ClassStatus; })` (dòng 599).

Exports: `ClassColorUsage` (38), `CreateClassModal` (83), `EditClassModal` (129).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 38
export type ClassColorUsage = {
  classId: string;
  className: string;
  colorIndex: number;
  colorHex: string;
};
```

### edutrack_fe/components/classes/exam/class-exam-tab.tsx

[edutrack_fe/components/classes/exam/class-exam-tab.tsx](../../edutrack_fe/components/classes/exam/class-exam-tab.tsx) — 534 dòng.

Dependencies: `react`, `@/lib/api/school`, `@/types/school`, `lucide-react`, `../classroom-ui`, `@/components/ui/notice-provider`, `./exam-desktop-table`, `./exam-mobile-list`, `./exam-create-modal`, `./exam-evidence-modal`.

Functions: `ClassExamTab({ classroom }: ClassExamTabProps)` (dòng 32); `getApiErrorMessage(error: unknown, fallback: string)` (dòng 500); `sortExamsByDate(first: Exam, second: Exam)` (dòng 529).

Exports: `ClassExamTab` (32).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 22
type ClassExamTabProps = {
  classroom: ClassroomDetail;
};
// line 26
type PendingEvidenceFile = {
  id: string;
  file: File;
  previewUrl: string;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 84: `schoolApi.getExamSheet(classroom.id)`
- Dòng 204: `schoolApi.uploadExamEvidenceImage(classroom.id, pendingFile.file)`
- Dòng 218: `schoolApi.takeExamScoresBatch(classroom.id, { scores: scoresPayload })`
- Dòng 251: `schoolApi.uploadExamFile(classroom.id, file)`
- Dòng 263: `schoolApi.updateExam(classroom.id, examToEdit.id, finalPayload as UpdateExamPayload)`
- Dòng 275: `schoolApi.createExam(classroom.id, finalPayload)`
- Dòng 292: `schoolApi.deleteExam(classroom.id, deleteExamConfirmId)`

### edutrack_fe/components/classes/exam/exam-create-modal.tsx

[edutrack_fe/components/classes/exam/exam-create-modal.tsx](../../edutrack_fe/components/classes/exam/exam-create-modal.tsx) — 199 dòng.

Dependencies: `react`, `react`, `date-fns`, `lucide-react`, `@/types/school`, `../classroom-ui`.

Functions: `ExamCreateModal({ examToEdit, onClose, onDelete, onSubmit, isSubmitting, }: ExamCreateModalProps)` (dòng 23).

Exports: `ExamCreateModal` (23).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 15
type ExamCreateModalProps = {
  examToEdit?: Exam;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (payload: CreateExamPayload, file?: File | null) => Promise<void>;
  isSubmitting: boolean;
};
```

### edutrack_fe/components/classes/exam/exam-desktop-table.tsx

[edutrack_fe/components/classes/exam/exam-desktop-table.tsx](../../edutrack_fe/components/classes/exam/exam-desktop-table.tsx) — 147 dòng.

Dependencies: `@/types/school`, `./exam-sheet.module.css`, `../classroom-ui`, `../classroom-utils`, `date-fns`, `lucide-react`.

Functions: `ExamDesktopTable({ students, exams, localScores, localNotes, dirtyCells, onEditExam, onUploadEvidence, }: ExamDesktopTableProps)` (dòng 24).

Exports: `ExamDesktopTable` (24).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 14
type ExamDesktopTableProps = {
  students: Student[];
  exams: Exam[];
  localScores: Record<string, number>;
  localNotes: Record<string, string>;
  dirtyCells: Set<string>;
  onEditExam: (exam: Exam) => void;
  onUploadEvidence: (examId: string, studentId: string) => void;
};
```

### edutrack_fe/components/classes/exam/exam-evidence-modal.tsx

[edutrack_fe/components/classes/exam/exam-evidence-modal.tsx](../../edutrack_fe/components/classes/exam/exam-evidence-modal.tsx) — 168 dòng.

Dependencies: `react`, `react`, `lucide-react`.

Functions: `ExamEvidenceModal({ studentName, examTitle, existingImages, onClose, onUpload, isUploading, score, note, maxScore, onScoreChange, onNoteChange, onRemove, }: ExamEvidenceModalProps)` (dòng 24).

Exports: `ExamEvidenceModal` (24).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 7
type ExamEvidenceModalProps = {
  examId: string;
  studentId: string;
  studentName: string;
  examTitle: string;
  existingImages: string[];
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  score: string;
  note: string;
  maxScore: number;
  onScoreChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onRemove: (imageUrl: string) => void;
};
```

### edutrack_fe/components/classes/exam/exam-mobile-list.tsx

[edutrack_fe/components/classes/exam/exam-mobile-list.tsx](../../edutrack_fe/components/classes/exam/exam-mobile-list.tsx) — 186 dòng.

Dependencies: `react`, `@/types/school`, `date-fns`, `lucide-react`, `../classroom-ui`, `../classroom-utils`.

Functions: `ExamMobileList({ students, exams, localScores, localNotes, dirtyCells, onScoreChange, onNoteChange, onEditExam, onUploadEvidence, }: ExamMobileListProps)` (dòng 22).

Exports: `ExamMobileList` (22).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 10
type ExamMobileListProps = {
  students: Student[];
  exams: Exam[];
  localScores: Record<string, number>;
  localNotes: Record<string, string>;
  dirtyCells: Set<string>;
  onScoreChange: (examId: string, studentId: string, value: string) => void;
  onNoteChange: (examId: string, studentId: string, value: string) => void;
  onEditExam: (exam: Exam) => void;
  onUploadEvidence: (examId: string, studentId: string) => void;
};
```

### edutrack_fe/components/classes/receipt-template-picker.tsx

[edutrack_fe/components/classes/receipt-template-picker.tsx](../../edutrack_fe/components/classes/receipt-template-picker.tsx) — 122 dòng.

Dependencies: `react`, `lucide-react`, `@/lib/api/invoice-template`, `@/components/ui/select-picker`, `@/types/invoice-template`, `./classroom-ui`.

Functions: `ReceiptTemplatePicker({ value, onChange, disabled, }: { value: InvoiceTemplate \| null; onChange: (template: InvoiceTemplate \| null) => void; disabled: boolean; })` (dòng 10).

Exports: `ReceiptTemplatePicker` (10).

### edutrack_fe/components/classes/student-detail-modal.tsx

[edutrack_fe/components/classes/student-detail-modal.tsx](../../edutrack_fe/components/classes/student-detail-modal.tsx) — 541 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/lib/api/school`, `@/types/school`, `./classroom-utils`, `./classroom-ui`, `./student-profile-panel`, `./classroom-manager.module.css`.

Functions: `StudentDetailModal({ actions, classroom, onClose, onIssueReceipt, onIssueMultiClassReceipt, receiptActionLoading = false, student, }: { actions?: ReactNode; classroom?: ClassroomDetail \| null; onClose: () => void; onIssueReceipt?: (student: Student) => void; onIssueMultiClassReceipt?: (student: Student) => void; receiptActionLoading?: boolean; student: Student; })` (dòng 46); `StudentReceiptContent({ candidates, classroom, error, isLoading, onIssueReceipt, onIssueMultiClassReceipt, onReload, receiptActionLoading, receipts, }: { candidates: BillingCandidates \| null; classroom?: ClassroomDetail \| null; error: string; isLoading: boolean; onIssueReceipt?: () => void; onIssueMultiClassReceipt?: () => void; onReload: () => void; receiptActionLoading: boolean; receipts: ReceiptListItem[]; })` (dòng 175); `DetailTabButton({ active, children, icon, onClick, }: { active: boolean; children: ReactNode; icon: ReactNode; onClick: () => void; })` (dòng 379); `MiniMetric({ label, value }: { label: string; value: string })` (dòng 405); `PaymentStatusPill({ status }: { status: PaymentStatus })` (dòng 418); `getPaymentLabel(status: PaymentStatus)` (dòng 435); `getStudentReceiptFilterOptions(receipts: ReceiptListItem[])` (dòng 446); `filterStudentReceipts(receipts: ReceiptListItem[], filter: string)` (dòng 476); `getReceiptClassSnapshots(receipt: ReceiptListItem)` (dòng 498); `SectionTitle({ children, icon, }: { children: ReactNode; icon: ReactNode; })` (dòng 513); `formatDate(value?: string)` (dòng 528).

Exports: `StudentDetailModal` (46).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 42
type StudentDetailTab = "profile" | "receipts";
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 75: `schoolApi.listReceipts({ studentId: student.id, })`
- Dòng 79: `schoolApi.getBillingCandidates(classroom.id, student.id)`

### edutrack_fe/components/classes/student-form-fields.tsx

[edutrack_fe/components/classes/student-form-fields.tsx](../../edutrack_fe/components/classes/student-form-fields.tsx) — 355 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/components/ui/select-picker`, `@/types/school`, `./classroom-types`, `./classroom-utils`, `./classroom-ui`.

Functions: `StudentFormFields({ avatarPreviewUrl, disabled, form, isUploadingAvatar, onAvatarUpload, onChange, showStatus = false, }: { avatarPreviewUrl?: string; disabled?: boolean; form: StudentFormState; isUploadingAvatar: boolean; onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void; onChange: (form: StudentFormState) => void; showStatus?: boolean; })` (dòng 48); `StudentFormSelect({ disabled, icon, label, onChange, options, value, }: { disabled?: boolean; icon?: ReactNode; label: string; onChange: (value: string) => void; options: SelectPickerOption[]; value: string; })` (dòng 324).

Exports: `StudentFormFields` (48).

### edutrack_fe/components/classes/student-picker-modal.tsx

[edutrack_fe/components/classes/student-picker-modal.tsx](../../edutrack_fe/components/classes/student-picker-modal.tsx) — 445 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/lib/api/school`, `@/types/school`, `./classroom-types`, `./classroom-utils`, `./classroom-ui`, `./student-form-fields`, `./use-deferred-student-avatar-upload`.

Functions: `StudentPickerModal({ classroom, onAdded, onClose, onError, }: { classroom: ClassroomDetail; onAdded: (message: string) => void; onClose: () => void; onError: (message: string) => void; })` (dòng 31); `StudentOption({ isInClass, isSelected, onToggle, student, }: { isInClass: boolean; isSelected: boolean; onToggle: () => void; student: Student; })` (dòng 395).

Exports: `StudentPickerModal` (31).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 27
type AddMode = "existing" | "new";
// line 28
type PendingStudentAction =
  { students: Student[]; type: "enroll" } | { type: "create" };
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 82: `schoolApi.searchStudents(search)`
- Dòng 108: `schoolApi.enrollExistingStudents(classroom.id, studentsToEnroll.map((student) => student.id))`
- Dòng 177: `schoolApi.createStudentAndEnroll(classroom.id, payload)`

### edutrack_fe/components/classes/student-profile-panel.tsx

[edutrack_fe/components/classes/student-profile-panel.tsx](../../edutrack_fe/components/classes/student-profile-panel.tsx) — 242 dòng.

Dependencies: `lucide-react`, `react`, `@/types/school`, `./classroom-utils`, `./classroom-ui`.

Functions: `StudentIdentityPanel({ actions, student, }: { actions?: ReactNode; student: Student; })` (dòng 24); `StudentProfileContent({ student }: { student: Student })` (dòng 68); `StudentStatus({ status }: { status: Student["status"] })` (dòng 143); `ProfileSection({ children, columns = 2, icon, title, }: { children: ReactNode; columns?: 1 \| 2; icon: ReactNode; title: string; })` (dòng 163); `DetailItem({ icon, label, value, wide = false, }: { icon: ReactNode; label: string; value?: string; wide?: boolean; })` (dòng 193); `formatProfileDate(value?: string)` (dòng 233).

Exports: `StudentIdentityPanel` (24), `StudentProfileContent` (68).

### edutrack_fe/components/classes/tuition/billing-student-list.tsx

[edutrack_fe/components/classes/tuition/billing-student-list.tsx](../../edutrack_fe/components/classes/tuition/billing-student-list.tsx) — 160 dòng.

Dependencies: `lucide-react`, `@/components/classes/classroom-ui`, `@/components/classes/classroom-utils`, `@/types/school`, `./receipt-dialogs`.

Functions: `BillingStudentList({ onIssue, students, }: { onIssue: (row: BillingOverviewStudent) => void; students: BillingOverviewStudent[]; })` (dòng 16).

Exports: `BillingStudentList` (16).

### edutrack_fe/components/classes/tuition/receipt-dialogs.tsx

[edutrack_fe/components/classes/tuition/receipt-dialogs.tsx](../../edutrack_fe/components/classes/tuition/receipt-dialogs.tsx) — 1115 dòng.

Dependencies: `lucide-react`, `react`, `react`, `react-dom`, `@/types/invoice-template`, `../receipt-template-picker`, `@/types/school`, `../classroom-utils`, `../classroom-manager.module.css`, `../classroom-ui`, `./tuition-metric`.

Functions: `IssueReceiptModal({ selectedTemplate, onTemplateChange, candidates, discountAmount, form, issueMode, isCandidateLoading, isIssuing, isPreviewing, onClose, onFormChange, onLoadCandidates, onPreview, onRequestIssue, onSelectAll, onToggleClass, onToggleEntry, selectedPeriod, selectedClassIds, selectedSubtotal, selectedTotal, selectedTuitionIds, student, studentBillingOverview, }: { selectedTemplate: InvoiceTemplate \| null; onTemplateChange: (template: InvoiceTemplate \| null) => void; candidates: BillingCandidates \| null; discountAmount: number; form: IssueFormState; issueMode: IssueMode; isCandidateLoading: boolean; isIssuing: boolean; isPreviewing: boolean; onClose: () => void; onFormChange: (form: IssueFormState) => void; onLoadCandidates: () => void; onPreview: () => void; onRequestIssue: () => void; onSelectAll: (checked: boolean) => void; onToggleClass: (classId: string) => void; onToggleEntry: (tuitionEntryId: string) => void; selectedPeriod: { from: string; to: string } \| null; selectedClassIds: string[]; selectedSubtotal: number; selectedTotal: number; selectedTuitionIds: string[]; student: Student; studentBillingOverview: StudentBillingOverview \| null; })` (dòng 111); `getReceiptPreviewLoadingHtml()` (dòng 574); `getReceiptPreviewErrorHtml()` (dòng 624); `PaymentModal({ form, isLoading, onChange, onClose, onSubmit, receipt, }: { form: PaymentFormState; isLoading: boolean; onChange: (form: PaymentFormState) => void; onClose: () => void; onSubmit: () => void; receipt: ReceiptListItem; })` (dòng 663); `SelectField({ label, onChange, options, value, }: { label: string; onChange: (value: string) => void; options: ReadonlyArray<SelectOption>; value: string; })` (dòng 771); `CurrencyField({ label, onChange, value, }: { label: string; onChange: (value: string) => void; value: string; })` (dòng 928); `SummaryLine({ label, strong = false, value, }: { label: string; strong?: boolean; value: string; })` (dòng 960); `StatusPill({ children, tone, }: { children: React.ReactNode; tone: "danger" \| "neutral" \| "success" \| "warning"; })` (dòng 981); `getTuitionEntriesPeriod(entries: BillingCandidates["tuitionEntries"])` (dòng 1005); `getTuitionEntryLessonText(entry: BillingCandidates["tuitionEntries"][number])` (dòng 1023); `uniqueNonEmpty(values: unknown[])` (dòng 1036); `toDateInputValue(value?: string \| Date \| null)` (dòng 1051); `buildPriceForm(classroom: Classroom): PriceFormState` (dòng 1070); `formatDateInput(value?: string)` (dòng 1080); `handleProofFile(event: ChangeEvent<HTMLInputElement>, form: PaymentFormState, onChange: (form: PaymentFormState) => void)` (dòng 1084); `formatDate(value?: string)` (dòng 1097).

Exports: `BillingFilterState` (45), `IssueFormState` (50), `PaymentFormState` (60), `PriceFormState` (68), `SelectOption` (74), `IssueMode` (80), `initialFilters` (82), `initialIssueForm` (87), `BULK_RECEIPT_DOWNLOAD_ID` (108), `IssueReceiptModal` (111), `getReceiptPreviewLoadingHtml` (574), `getReceiptPreviewErrorHtml` (624), `PaymentModal` (663), `CurrencyField` (928), `StatusPill` (981), `getTuitionEntriesPeriod` (1005), `toDateInputValue` (1051), `buildPriceForm` (1070), `formatDateInput` (1080).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 45
export type BillingFilterState = {
  fromDate: string;
  toDate: string;
};
// line 50
export type IssueFormState = BillingFilterState & {
  dueDate: string;
  discountAmount: string;
  adjustmentAmount: string;
  strengthsComment: string;
  improvementsComment: string;
  generalComment: string;
  paymentNote: string;
};
// line 60
export type PaymentFormState = {
  paymentStatus: Exclude<PaymentStatus, "cancelled">;
  paidAmount: string;
  paidAt: string;
  paymentNote: string;
  proofFile: File | null;
};
// line 68
export type PriceFormState = {
  regularPrice: string;
  makeupPrice: string;
  priceEffectiveFrom: string;
};
// line 74
export type SelectOption = {
  icon?: ReactNode;
  label: string;
  value: string;
};
// line 80
export type IssueMode = "class" | "multi_class";
```

### edutrack_fe/components/classes/tuition/receipt-history.tsx

[edutrack_fe/components/classes/tuition/receipt-history.tsx](../../edutrack_fe/components/classes/tuition/receipt-history.tsx) — 609 dòng.

Dependencies: `lucide-react`, `react`, `@/components/classes/classroom-ui`, `@/components/classes/classroom-utils`, `@/components/ui/select-picker`, `@/types/school`.

Functions: `ReceiptHistory({ isMutatingReceipt, onBulkDownload, onCancel, onDownload, onPayment, onRetryPdf, onView, receipts, }: { isMutatingReceipt: string; onBulkDownload: (receipts: ReceiptListItem[]) => void; onCancel: (receipt: ReceiptListItem) => void; onDownload: (receipt: ReceiptListItem) => void; onPayment: (receipt: ReceiptListItem) => void; onRetryPdf: (receipt: ReceiptListItem) => void; onView: (receipt: ReceiptListItem) => void; receipts: ReceiptListItem[]; })` (dòng 22); `ReceiptActions({ className = "", isMutatingReceipt, onCancel, onDownload, onPayment, onRetryPdf, onView, receipt, }: { className?: string; isMutatingReceipt: string; onCancel: (receipt: ReceiptListItem) => void; onDownload: (receipt: ReceiptListItem) => void; onPayment: (receipt: ReceiptListItem) => void; onRetryPdf: (receipt: ReceiptListItem) => void; onView: (receipt: ReceiptListItem) => void; receipt: ReceiptListItem; })` (dòng 330); `SelectField({ label, onChange, options, value, }: { label: string; onChange: (value: string) => void; options: ReadonlyArray<SelectOption>; value: string; })` (dòng 407); `StatusPill({ children, tone, }: { children: React.ReactNode; tone: "danger" \| "neutral" \| "success" \| "warning"; })` (dòng 435); `IconButton({ children, danger = false, disabled, label, onClick, }: { children: React.ReactNode; danger?: boolean; disabled?: boolean; label: string; onClick: () => void; })` (dòng 458); `getReceiptPeriodOptions(receipts: ReceiptListItem[])` (dòng 489); `getReceiptPeriodSummary(key: string, label: string, receipts: ReceiptListItem[])` (dòng 526); `getReceiptPeriodKey(receipt: ReceiptListItem)` (dòng 539); `toDateInputValue(value?: string \| Date \| null)` (dòng 545); `formatDate(value?: string)` (dòng 564); `getPaymentLabel(status: PaymentStatus)` (dòng 583); `getPaymentTone(status: PaymentStatus)` (dòng 594).

Exports: `ReceiptHistory` (22).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 402
type SelectOption = {
  label: string;
  value: string;
};
```

### edutrack_fe/components/classes/tuition/tuition-metric.tsx

[edutrack_fe/components/classes/tuition/tuition-metric.tsx](../../edutrack_fe/components/classes/tuition/tuition-metric.tsx) — 66 dòng.

Dependencies: `react`.

Functions: `TuitionMetric({ icon, label, tone, value, }: { icon: ReactNode; label: string; tone: TuitionMetricTone; value: string; })` (dòng 31).

Exports: `TuitionMetric` (31).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
type TuitionMetricTone = "primary" | "info" | "warning" | "success";
```

### edutrack_fe/components/classes/use-deferred-class-image-upload.ts

[edutrack_fe/components/classes/use-deferred-class-image-upload.ts](../../edutrack_fe/components/classes/use-deferred-class-image-upload.ts) — 95 dòng.

Dependencies: `react`, `react`, `@/lib/api/school`.

Functions: `useDeferredClassImageUpload()` (dòng 9).

Exports: `useDeferredClassImageUpload` (9).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 78: `schoolApi.uploadClassImage(classImageFile)`

### edutrack_fe/components/classes/use-deferred-student-avatar-upload.ts

[edutrack_fe/components/classes/use-deferred-student-avatar-upload.ts](../../edutrack_fe/components/classes/use-deferred-student-avatar-upload.ts) — 79 dòng.

Dependencies: `react`, `react`, `@/lib/api/school`.

Functions: `useDeferredStudentAvatarUpload()` (dòng 9).

Exports: `useDeferredStudentAvatarUpload` (9).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 63: `schoolApi.uploadStudentAvatar(avatarFile)`

### edutrack_fe/components/dashboard/dashboard-overview.tsx

[edutrack_fe/components/dashboard/dashboard-overview.tsx](../../edutrack_fe/components/dashboard/dashboard-overview.tsx) — 937 dòng.

Dependencies: `next/link`, `lucide-react`, `react`, `@/components/layout/dashboard-shell`, `@/components/classes/classroom-utils`, `@/lib/api/school`, `@/lib/files/open-pdf-in-new-tab`, `@/components/ui/notice-provider`, `@/components/dashboard/dashboard-welcome-panel`, `@/components/dashboard/yearly-revenue-chart`, `@/types/school`.

Functions: `DashboardOverview()` (dòng 66); `StatsGrid({ overview }: { overview: DashboardOverviewData })` (dòng 180); `TodayLessonsPanel({ compact = false, lessons, today, }: { compact?: boolean; lessons: DashboardTodayLesson[]; today: string; })` (dòng 258); `TodayLessonItem({ compact = false, lesson, }: { compact?: boolean; lesson: DashboardTodayLesson; })` (dòng 314); `RevenuePanel({ revenue, }: { revenue: DashboardOverviewData["revenue"]; })` (dòng 424); `RevenueMetric({ description, icon, label, tone, value, }: { description: string; icon: React.ReactNode; label: string; tone: "amber" \| "brand" \| "emerald" \| "violet"; value: string; })` (dòng 498); `PendingPaymentsPanel({ openingReceiptId, onViewPdf, payments, }: { openingReceiptId: string; onViewPdf: (receiptId: string) => void; payments: DashboardPendingPayment[]; })` (dòng 560); `PendingPaymentItem({ isOpeningPdf, onViewPdf, payment, }: { isOpeningPdf: boolean; onViewPdf: (receiptId: string) => void; payment: DashboardPendingPayment; })` (dòng 613); `PanelHeader({ actionHref, actionLabel, compact = false, description, icon, title, }: { actionHref: string; actionLabel: string; compact?: boolean; description: string; icon: React.ReactNode; title: string; })` (dòng 713); `StatusBadge({ label, tone }: { label: string; tone: StatTone })` (dòng 758); `EmptyState({ icon, text, title, }: { icon: React.ReactNode; text: string; title: string; })` (dòng 777); `ErrorPanel({ message, onRetry, }: { message: string; onRetry: () => void; })` (dòng 803); `DashboardSkeleton()` (dòng 833); `getLessonStatusTone(label: string): StatTone` (dòng 853); `getPaymentLabel(status: PaymentStatus)` (dòng 869); `getPaymentTone(status: PaymentStatus): StatTone` (dòng 885); `formatDate(value?: string \| null)` (dòng 901); `formatCurrentMonthLabel()` (dòng 920); `getInitial(value: string)` (dòng 934).

Exports: `DashboardOverview` (66).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 41
type StatTone = "brand" | "sky" | "emerald" | "amber" | "rose";
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 79: `schoolApi.getDashboardOverview()`
- Dòng 93: `schoolApi.getDashboardOverview()`
- Dòng 125: `schoolApi.getReceiptDownload(receiptId)`

### edutrack_fe/components/dashboard/dashboard-welcome-panel.tsx

[edutrack_fe/components/dashboard/dashboard-welcome-panel.tsx](../../edutrack_fe/components/dashboard/dashboard-welcome-panel.tsx) — 159 dòng.

Dependencies: `next/link`, `lucide-react`, `@/components/classes/classroom-utils`.

Functions: `WelcomePanel({ error, isLoading, onReload, pendingAmount, pendingPaymentCount, unreadNotificationCount, userName, }: { error: string; isLoading: boolean; onReload: () => void; pendingAmount: number; pendingPaymentCount: number; unreadNotificationCount: number; userName: string; })` (dòng 16).

Exports: `WelcomePanel` (16).

### edutrack_fe/components/dashboard/feature-placeholder.tsx

[edutrack_fe/components/dashboard/feature-placeholder.tsx](../../edutrack_fe/components/dashboard/feature-placeholder.tsx) — 50 dòng.

Dependencies: `lucide-react`.

Functions: `FeaturePlaceholder({ description, emptyText, emptyTitle, eyebrow, icon: Icon, title, }: FeaturePlaceholderProps)` (dòng 12).

Exports: `FeaturePlaceholder` (12).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
type FeaturePlaceholderProps = {
  emptyText: string;
  emptyTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};
```

### edutrack_fe/components/dashboard/yearly-revenue-chart.tsx

[edutrack_fe/components/dashboard/yearly-revenue-chart.tsx](../../edutrack_fe/components/dashboard/yearly-revenue-chart.tsx) — 297 dòng.

Dependencies: `react`, `@/components/classes/classroom-utils`, `@/types/school`.

Functions: `YearlyRevenueChart({ revenue, }: { revenue: DashboardOverviewData["revenue"]; })` (dòng 7); `getChartAxisMax(value: number)` (dòng 265); `formatAxisMoney(value: number)` (dòng 274); `formatCompactMoney(value: number)` (dòng 288); `trimDecimal(value: number)` (dòng 292).

Exports: `YearlyRevenueChart` (7).

### edutrack_fe/components/invoice-designer/component-sidebar.tsx

[edutrack_fe/components/invoice-designer/component-sidebar.tsx](../../edutrack_fe/components/invoice-designer/component-sidebar.tsx) — 91 dòng.

Dependencies: `grapesjs`, `react`, `lucide-react`, `./designer-toolbar`, `./invoice-designer.module.css`.

Functions: `ComponentSidebar({ editor, onClose, onImages, }: { editor: Editor \| null; onClose: () => void; onImages: () => void; })` (dòng 7).

Exports: `ComponentSidebar` (7).

### edutrack_fe/components/invoice-designer/configs/blocks.config.ts

[edutrack_fe/components/invoice-designer/configs/blocks.config.ts](../../edutrack_fe/components/invoice-designer/configs/blocks.config.ts) — 106 dòng.

Dependencies: `grapesjs`, `lucide-react`, `react`, `react-dom/server`.

Functions: `registerBlocks(editor: Editor)` (dòng 13).

Exports: `BASIC_BLOCKS` (6), `registerBlocks` (13).

### edutrack_fe/components/invoice-designer/configs/grapesjs.config.ts

[edutrack_fe/components/invoice-designer/configs/grapesjs.config.ts](../../edutrack_fe/components/invoice-designer/configs/grapesjs.config.ts) — 259 dòng.

Dependencies: `grapesjs`, `./blocks.config`, `@/types/invoice-template`, `./regions.config`.

Functions: `getInvoicePage(editor: Editor): Component \| undefined` (dòng 29); `documentScroll(document: Document, noScroll?: boolean)` (dòng 33); `stableResizeOptions(editor: Editor, ratioDefault = false)` (dòng 42); `configureInvoiceEditor(editor: Editor, registry: InvoiceRegionRegistry)` (dòng 90); `invoiceEditorConfig(container: HTMLElement, registry: InvoiceRegionRegistry): EditorConfig` (dòng 205).

Exports: `A4_WIDTH` (25), `A4_HEIGHT` (26), `PAGE_CSS` (27), `getInvoicePage` (29), `configureInvoiceEditor` (90), `invoiceEditorConfig` (205).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 10
type ResizePositionOptions = { noScroll?: boolean };
// line 11
type ResizePosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};
```

### edutrack_fe/components/invoice-designer/configs/project-safety.ts

[edutrack_fe/components/invoice-designer/configs/project-safety.ts](../../edutrack_fe/components/invoice-designer/configs/project-safety.ts) — 304 dòng.

Dependencies: `dompurify`, `grapesjs`.

Functions: `safeImageUrl(value: string): string \| null` (dòng 99); `record(value: unknown): Record<string, unknown>` (dòng 115); `safeStyle(value: unknown): Record<string, string>` (dòng 121); `safeCss(css: string): string` (dòng 135); `declarationStyle(declaration: CSSStyleDeclaration)` (dòng 154); `safeAttributes(value: unknown)` (dòng 165); `safeHtml(value: string): string` (dòng 181); `safeComponent(value: unknown): unknown` (dòng 209); `safeSelectors(value: unknown)` (dòng 243); `safeStyles(value: unknown): unknown` (dòng 257); `safeProject(data: Record<string, unknown>): ProjectData` (dòng 284).

Exports: `safeImageUrl` (99), `safeStyle` (121), `safeHtml` (181), `safeProject` (284).

### edutrack_fe/components/invoice-designer/configs/regions.config.ts

[edutrack_fe/components/invoice-designer/configs/regions.config.ts](../../edutrack_fe/components/invoice-designer/configs/regions.config.ts) — 91 dòng.

Dependencies: `grapesjs`, `lucide-react`, `react`, `react-dom/server`, `@/types/invoice-template`.

Functions: `registerRegions(editor: Editor, registry: InvoiceRegionRegistry)` (dòng 12); `lockRegionContents(editor: Editor)` (dòng 64).

Exports: `REGION_EDITOR_CSS` (7), `registerRegions` (12), `lockRegionContents` (64).

### edutrack_fe/components/invoice-designer/designer-dialogs.tsx

[edutrack_fe/components/invoice-designer/designer-dialogs.tsx](../../edutrack_fe/components/invoice-designer/designer-dialogs.tsx) — 171 dòng.

Dependencies: `react`, `lucide-react`, `@/components/classes/classroom-ui`, `@/types/invoice-template`, `./invoice-designer.module.css`.

Functions: `DialogFocus({ children, title, onClose, }: { children: ReactNode; title: string; onClose: () => void; })` (dòng 15); `SaveTemplateDialog({ template, name, saving, onClose, onSave, }: { template: InvoiceTemplate; name: string; saving: boolean; onClose: () => void; onSave: (mode: TemplateSaveMode, name: string) => Promise<boolean>; })` (dòng 74).

Exports: `DialogFocus` (15), `SaveTemplateDialog` (74).

### edutrack_fe/components/invoice-designer/designer-toolbar.tsx

[edutrack_fe/components/invoice-designer/designer-toolbar.tsx](../../edutrack_fe/components/invoice-designer/designer-toolbar.tsx) — 258 dòng.

Dependencies: `next/link`, `lucide-react`, `@/types/invoice-template`, `grapesjs`, `react`, `@/components/ui/select-picker`, `./invoice-designer.module.css`.

Functions: `ToolButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode; })` (dòng 23); `DesignerToolbar({ editor, selected, name, setName, dirty, saving, deleting, loading, save, template, templates, selectVersion, onDeleteTemplate, toggleComponents, toggleProperties, componentsOpen, propertiesOpen, focused, toggleFocus, onPreview, }: Props)` (dòng 67).

Exports: `ToolButton` (23), `DesignerToolbar` (67).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 44
type Props = {
  editor: Editor | null;
  selected: Component | null;
  name: string;
  setName: (name: string) => void;
  dirty: boolean;
  saving: boolean;
  deleting: boolean;
  loading: boolean;
  save: () => void;
  template: InvoiceTemplate | null;
  templates: InvoiceTemplate[];
  selectVersion: (id: string) => void;
  onDeleteTemplate: () => void;
  toggleComponents: () => void;
  toggleProperties: () => void;
  componentsOpen: boolean;
  propertiesOpen: boolean;
  focused: boolean;
  toggleFocus: () => void;
  onPreview: () => void;
};
```

Indexes:

- Dòng 200: `selected.index()`

### edutrack_fe/components/invoice-designer/image-library-dialog.tsx

[edutrack_fe/components/invoice-designer/image-library-dialog.tsx](../../edutrack_fe/components/invoice-designer/image-library-dialog.tsx) — 284 dòng.

Dependencies: `react`, `lucide-react`, `@/components/classes/classroom-ui`, `@/lib/api/invoice-images`, `@/types/invoice-template`, `./designer-dialogs`, `./designer-toolbar`, `./invoice-designer.module.css`.

Functions: `ImageLibraryDialog({ onClose, onChoose, }: { onClose: () => void; onChoose: (image: InvoiceImage) => void; })` (dòng 16).

Exports: `ImageLibraryDialog` (16).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 86: `invoiceImagesApi.upload(file)`
- Dòng 226: `invoiceImagesApi.list(cursor)`
- Dòng 263: `invoiceImagesApi.archive(archiving.id)`

### edutrack_fe/components/invoice-designer/invoice-canvas.tsx

[edutrack_fe/components/invoice-designer/invoice-canvas.tsx](../../edutrack_fe/components/invoice-designer/invoice-canvas.tsx) — 179 dòng.

Dependencies: `react`, `grapesjs`, `lucide-react`, `./configs/grapesjs.config`, `./designer-toolbar`, `./invoice-designer.module.css`.

Functions: `InvoiceCanvas({ canvasRef, editor, }: { canvasRef: RefObject<HTMLDivElement \| null>; editor: Editor \| null; })` (dòng 11).

Exports: `InvoiceCanvas` (11).

### edutrack_fe/components/invoice-designer/invoice-designer-loader.tsx

[edutrack_fe/components/invoice-designer/invoice-designer-loader.tsx](../../edutrack_fe/components/invoice-designer/invoice-designer-loader.tsx) — 20 dòng.

Dependencies: `next/dynamic`.

Functions: `InvoiceDesignerLoader()` (dòng 17).

Exports: `InvoiceDesignerLoader` (17).

### edutrack_fe/components/invoice-designer/invoice-designer.tsx

[edutrack_fe/components/invoice-designer/invoice-designer.tsx](../../edutrack_fe/components/invoice-designer/invoice-designer.tsx) — 242 dòng.

Dependencies: `react`, `lucide-react`, `@/components/classes/classroom-ui`, `./designer-dialogs`, `./component-sidebar`, `./designer-toolbar`, `./invoice-canvas`, `./property-panel`, `./use-invoice-designer`, `./invoice-designer.module.css`, `grapesjs`, `@/types/invoice-template`, `./image-library-dialog`, `./template-preview-dialog`, `./configs/project-safety`.

Functions: `InvoiceDesigner()` (dòng 26).

Exports: `InvoiceDesigner` (26).

### edutrack_fe/components/invoice-designer/property-panel.tsx

[edutrack_fe/components/invoice-designer/property-panel.tsx](../../edutrack_fe/components/invoice-designer/property-panel.tsx) — 364 dòng.

Dependencies: `grapesjs`, `react`, `lucide-react`, `@/components/ui/notice-provider`, `./configs/project-safety`, `./designer-toolbar`, `./invoice-designer.module.css`.

Functions: `PropertyPanel({ selected, onClose, onImages, }: { selected: Component \| null; onClose: () => void; onImages: () => void; })` (dòng 18).

Exports: `PropertyPanel` (18).

### edutrack_fe/components/invoice-designer/template-preview-dialog.tsx

[edutrack_fe/components/invoice-designer/template-preview-dialog.tsx](../../edutrack_fe/components/invoice-designer/template-preview-dialog.tsx) — 54 dòng.

Dependencies: `react`, `lucide-react`, `@/components/classes/classroom-ui`, `@/lib/api/invoice-template`, `./designer-dialogs`, `./invoice-designer.module.css`.

Functions: `TemplatePreviewDialog({ html, css, onClose, }: { html: string; css: string; onClose: () => void; })` (dòng 8).

Exports: `TemplatePreviewDialog` (8).

### edutrack_fe/components/invoice-designer/use-invoice-designer.ts

[edutrack_fe/components/invoice-designer/use-invoice-designer.ts](../../edutrack_fe/components/invoice-designer/use-invoice-designer.ts) — 346 dòng.

Dependencies: `grapesjs`, `react`, `next/navigation`, `@/lib/api/invoice-template`, `@/components/ui/notice-provider`, `@/types/invoice-template`, `./configs/grapesjs.config`, `./configs/project-safety`, `./configs/regions.config`.

Functions: `errorMessage(error: unknown)` (dòng 21); `sortTemplates(templates: InvoiceTemplate[])` (dòng 27); `useInvoiceDesigner()` (dòng 41).

Exports: `sortTemplates` (27), `useInvoiceDesigner` (41).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 38
type PendingAction =
  { type: "version"; id: string } | { type: "navigate"; href: string };
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 78: `invoiceTemplateApi.list(controller.signal)`
- Dòng 80: `invoiceTemplateApi.regions(controller.signal)`
- Dòng 191: `invoiceTemplateApi.save(template, { name: trimmedName, basedOnVersion: mode === "new" ? template.id : template.basedOnVersion, editorData: structuredClone(activeEditor.getProjectData()), html: safeHtml(activeEditor, mode)`
- Dòng 283: `invoiceTemplateApi.remove(template.id)`

### edutrack_fe/components/layout/dashboard-shell.tsx

[edutrack_fe/components/layout/dashboard-shell.tsx](../../edutrack_fe/components/layout/dashboard-shell.tsx) — 813 dòng.

Dependencies: `next/image`, `next/link`, `next/navigation`, `lucide-react`, `react`, `@/lib/api/auth`, `@/lib/api/client`, `@/lib/auth/access-token`, `@/lib/auth/token-storage`, `@/types/user`, `@/components/schedule/ai-schedule-chat`, `@/hooks/use-push`.

Functions: `useDashboardUser()` (dòng 131); `useDashboardSession()` (dòng 141); `DashboardShell({ children }: { children: ReactNode })` (dòng 151); `MobileBottomNavigation({ activeHref, isMoreOpen, onCloseMore, onToggleMore, scrollDirection, }: { activeHref: string; isMoreOpen: boolean; onCloseMore: () => void; onToggleMore: () => void; scrollDirection: string; })` (dòng 444); `isUnauthorized(error: unknown)` (dòng 561); `Sidebar({ activeHref, isOpen, onClose, }: { activeHref: string; isOpen: boolean; onClose: () => void; })` (dòng 567); `SidebarGroup({ activeHref, className = "", items, label: groupLabel, onClose, }: { activeHref: string; className?: string; items: NavigationItem[]; label: string; onClose: () => void; })` (dòng 633); `useScrollDirection()` (dòng 684); `Header({ activeNavigation, onOpenSidebar, user, userInitial, scrollDirection, }: { activeNavigation: NavigationItem; onOpenSidebar: () => void; user: User; userInitial: string; scrollDirection: string; })` (dòng 714); `formatHeaderDate()` (dòng 803).

Exports: `useDashboardUser` (131), `useDashboardSession` (141), `DashboardShell` (151).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 44
type NavigationItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  group: "main" | "account";
  match: (pathname: string) => boolean;
};
// line 120
type DashboardUserContextValue = {
  updateUser: (user: User) => void;
  user: User;
  logout: () => void;
  push: ReturnType<typeof usePushNotifications>;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 267: `authApi.me(token)`
- Dòng 279: `authApi.refresh()`
- Dòng 330: `authApi.logout()`

### edutrack_fe/components/media/media-history.tsx

[edutrack_fe/components/media/media-history.tsx](../../edutrack_fe/components/media/media-history.tsx) — 118 dòng.

Dependencies: `react`, `lucide-react`, `@/lib/api/profile`, `@/components/ui/notice-provider`.

Functions: `MediaHistory({ onPreview, refreshTrigger, }: { onPreview: (url: string) => void; refreshTrigger: number; })` (dòng 8).

Exports: `MediaHistory` (8).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 45: `profileApi.getMediaHistory()`

### edutrack_fe/components/media/media-trim-slider.tsx

[edutrack_fe/components/media/media-trim-slider.tsx](../../edutrack_fe/components/media/media-trim-slider.tsx) — 110 dòng.

Dependencies: `react`.

Functions: `formatDuration(seconds: number)` (dòng 5); `MediaTrimSlider({ start, end, max, onChange, }: { start: number; end: number; max: number; onChange: (range: { start: number; end: number }) => void; })` (dòng 13).

Exports: `MediaTrimSlider` (13).

### edutrack_fe/components/media/media-upload-board.tsx

[edutrack_fe/components/media/media-upload-board.tsx](../../edutrack_fe/components/media/media-upload-board.tsx) — 525 dòng.

Dependencies: `react`, `lucide-react`, `@/lib/api/profile`, `@/components/profile/profile-qr-crop`, `@/components/ui/notice-provider`, `@/components/media/media-trim-slider`.

Functions: `formatFileSize(size: number)` (dòng 19); `writeString(view: DataView, offset: number, str: string)` (dòng 23); `encodeWav(buffer: AudioBuffer): Blob` (dòng 29); `MediaUploadBoard({ onUploadSuccess }: { onUploadSuccess: (url: string) => void })` (dòng 68).

Exports: `MediaUploadBoard` (68).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 368: `profileApi.uploadMedia(selectedFile)`

### edutrack_fe/components/notifications/push-device-list.tsx

[edutrack_fe/components/notifications/push-device-list.tsx](../../edutrack_fe/components/notifications/push-device-list.tsx) — 72 dòng.

Dependencies: `lucide-react`, `@/types/user`.

Functions: `updatedAt(value: string \| null)` (dòng 11); `PushDeviceList({ devices, currentDeviceId }: { devices: PushDevice[]; currentDeviceId: string \| null; })` (dòng 17).

Exports: `PushDeviceList` (17).

### edutrack_fe/components/notifications/push-notification-panel.tsx

[edutrack_fe/components/notifications/push-notification-panel.tsx](../../edutrack_fe/components/notifications/push-notification-panel.tsx) — 114 dòng.

Dependencies: `lucide-react`, `@/components/layout/dashboard-shell`, `./push-device-list`.

Functions: `PushNotificationPanel()` (dòng 7).

Exports: `PushNotificationPanel` (7).

### edutrack_fe/components/profile/profile-bank-select.tsx

[edutrack_fe/components/profile/profile-bank-select.tsx](../../edutrack_fe/components/profile/profile-bank-select.tsx) — 69 dòng.

Dependencies: `lucide-react`, `@/components/ui/select-picker`, `@/types/user`.

Functions: `ProfileBankSelect({ banks, disabled, isLoading, onChange, value, }: { banks: PaymentBank[]; disabled: boolean; isLoading: boolean; onChange: (value: string) => void; value: string; })` (dòng 9).

Exports: `ProfileBankSelect` (9).

### edutrack_fe/components/profile/profile-page.tsx

[edutrack_fe/components/profile/profile-page.tsx](../../edutrack_fe/components/profile/profile-page.tsx) — 851 dòng.

Dependencies: `lucide-react`, `react`, `react`, `@/components/layout/dashboard-shell`, `@/lib/api/client`, `@/lib/api/profile`, `@/components/classes/classroom-ui`, `@/components/ui/notice-provider`, `@/components/classes/classroom-utils`, `@/components/profile/profile-qr-crop`, `@/components/profile/profile-utils`, `@/components/profile/profile-sections`, `@/types/user`.

Functions: `ProfilePage()` (dòng 71); `ImagePreviewDialog({ alt, onClose, title, url, }: { alt: string; onClose: () => void; title: string; url: string; })` (dòng 795); `isPaymentQrInfoNotFoundError(error: unknown): error is ApiError` (dòng 838); `getPaymentQrWarningDescription(error: ApiError)` (dòng 844); `normalizeBankAccountNumber(value: string)` (dòng 848).

Exports: `ProfilePage` (71).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 59
type PendingQrUpload = {
  file: File;
  qrContent?: string;
  warningDescription?: string;
};
// line 65
type PreviewImage = {
  alt: string;
  title: string;
  url: string;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 154: `profileApi.getBanks()`
- Dòng 189: `profileApi.getPaymentQrBlob()`
- Dòng 317: `profileApi.uploadTeacherAvatar(avatarFile)`
- Dòng 321: `profileApi.updateProfile(payload)`
- Dòng 421: `profileApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, })`
- Dòng 538: `profileApi.uploadPaymentQr(croppedQrFile, qrContent)`
- Dòng 575: `profileApi.uploadPaymentQr(pendingQrUpload.file, pendingQrUpload.qrContent, true)`
- Dòng 613: `profileApi.removePaymentQr()`

### edutrack_fe/components/profile/profile-qr-crop.tsx

[edutrack_fe/components/profile/profile-qr-crop.tsx](../../edutrack_fe/components/profile/profile-qr-crop.tsx) — 324 dòng.

Dependencies: `lucide-react`, `react`.

Functions: `QrCropBox({ crop, onChange, }: { crop: QrCropState; onChange: (crop: QrCropState) => void; })` (dòng 39); `CropHandle({ mode, onPointerDown, }: { mode: QrCropDragMode; onPointerDown: ( mode: QrCropDragMode, event: ReactPointerEvent<HTMLButtonElement>, ) => void; })` (dòng 145); `QrCropToolbar({ onReset }: { onReset: () => void })` (dòng 172); `getEdgeHandleClassName(mode: QrCropDragMode)` (dòng 190); `getCornerHandleClassName(mode: QrCropDragMode)` (dòng 208); `getCropHandleLabel(mode: QrCropDragMode)` (dòng 226); `normalizeQrCrop(crop: QrCropState): QrCropState` (dòng 242); `resizeQrCrop(crop: QrCropState, mode: QrCropDragMode, deltaX: number, deltaY: number)` (dòng 254); `clampNumber(value: number, min: number, max: number)` (dòng 317).

Exports: `QrCropState` (11), `QrCropBox` (39), `QrCropToolbar` (172), `normalizeQrCrop` (242).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 11
export type QrCropState = {
  height: number;
  width: number;
  x: number;
  y: number;
};
// line 18
type QrCropDragMode =
  | "move"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
// line 29
type QrCropDragState = {
  containerHeight: number;
  containerWidth: number;
  crop: QrCropState;
  mode: QrCropDragMode;
  pointerId: number;
  startClientX: number;
  startClientY: number;
};
```

### edutrack_fe/components/profile/profile-sections.tsx

[edutrack_fe/components/profile/profile-sections.tsx](../../edutrack_fe/components/profile/profile-sections.tsx) — 808 dòng.

Dependencies: `lucide-react`, `react`, `@/types/user`, `@/components/classes/classroom-ui`, `@/components/profile/profile-bank-select`, `@/components/profile/profile-qr-crop`, `@/components/profile/profile-utils`.

Functions: `TeacherProfileCard({ avatarFileName, avatarPreviewUrl, isEditing, isSaving, onAvatarFileChange, onAvatarPreview, onResetAvatar, userInitial, }: { avatarFileName: string; avatarPreviewUrl: string; isEditing: boolean; isSaving: boolean; onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onAvatarPreview: () => void; onResetAvatar: () => void; userInitial: string; })` (dòng 62); `ProfileEditFields({ banks, form, isBanksLoading, onAvatarUrlChange, onBankAccountNumberChange, onBankChange, onChange, userEmail, }: { banks: PaymentBank[]; form: ProfileFormState; isBanksLoading: boolean; onAvatarUrlChange: (avatarUrl: string) => void; onBankAccountNumberChange: (accountNumber: string) => void; onBankChange: (bankBin: string) => void; onChange: (form: ProfileFormState) => void; userEmail: string; })` (dòng 142); `ProfileReadonlyFields({ user }: { user: User })` (dòng 268); `ReadonlyItem({ children, className = "", icon, label, tone = "brand", wrapMode = "normal", }: { children: ReactNode; className?: string; icon: ReactNode; label: string; tone?: "amber" \| "brand" \| "emerald" \| "rose" \| "sky" \| "slate" \| "violet"; wrapMode?: "normal" \| "anywhere"; })` (dòng 336); `PaymentQrPanel({ isBusy, isQrLoading, isRemovingQr, isUploadingQr, onQrCropChange, onQrFileChange, onQrPreview, onRemoveQr, onResetQr, onSubmit, qrCrop, qrFile, qrFileName, qrPreviewUrl, user, }: { isBusy: boolean; isQrLoading: boolean; isRemovingQr: boolean; isUploadingQr: boolean; onQrCropChange: (crop: QrCropState) => void; onQrFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onQrPreview: () => void; onRemoveQr: () => void; onResetQr: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; qrCrop: QrCropState; qrFile: File \| null; qrFileName: string; qrPreviewUrl: string; user: User; })` (dòng 386); `PasswordPanel({ form, isBusy, isChangingPassword, isOpen, onChange, onClose, onOpen, onSubmit, onToggleShowPassword, showPassword, }: { form: PasswordFormState; isBusy: boolean; isChangingPassword: boolean; isOpen: boolean; onChange: (form: PasswordFormState) => void; onClose: () => void; onOpen: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onToggleShowPassword: () => void; showPassword: boolean; })` (dòng 578); `PasswordInput({ label, onChange, showPassword, value, }: { label: string; onChange: (value: string) => void; showPassword: boolean; value: string; })` (dòng 719); `SystemSettingsPanel({ onLogout, }: { onLogout: () => void; })` (dòng 743).

Exports: `INITIAL_QR_CROP` (49), `PasswordFormState` (56), `TeacherProfileCard` (62), `ProfileEditFields` (142), `ProfileReadonlyFields` (268), `PaymentQrPanel` (386), `PasswordPanel` (578), `SystemSettingsPanel` (743).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 56
export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
```

### edutrack_fe/components/profile/profile-utils.ts

[edutrack_fe/components/profile/profile-utils.ts](../../edutrack_fe/components/profile/profile-utils.ts) — 250 dòng.

Dependencies: `@/types/user`, `jsqr`, `@/components/profile/profile-qr-crop`.

Functions: `buildProfileForm(user: User): ProfileFormState` (dòng 35); `buildProfilePayload(form: ProfileFormState): UpdateProfilePayload` (dòng 48); `getConfirmConfig(action: ConfirmAction, handlers: { hasAvatarFile: boolean; isChangingPassword: boolean; isRemovingQr: boolean; isSavingProfile: boolean; isUploadingQr: boolean; onChangePassword: () => void; onRemoveQr: () => void; onSaveProfile: () => void; onUploadUnrecognizedQr: () => void; onUploadQr: () => void; unrecognizedPaymentQrDescription?: string; }): ConfirmDialogConfig` (dòng 63); `createCroppedQrFile(file: File, crop: QrCropState)` (dòng 129); `decodeQrContent(file: File)` (dòng 185); `loadImageFromFile(file: File)` (dòng 214); `getCanvasOutputType(fileType: string)` (dòng 231); `formatFileSize(size?: number)` (dòng 239).

Exports: `ProfileFormState` (8), `ConfirmAction` (19), `ConfirmDialogConfig` (26), `buildProfileForm` (35), `buildProfilePayload` (48), `getConfirmConfig` (63), `createCroppedQrFile` (129), `decodeQrContent` (185), `formatFileSize` (239).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 8
export type ProfileFormState = {
  fullName: string;
  avatarUrl: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBin: string;
  phone: string;
  address: string;
  bio: string;
};
// line 19
export type ConfirmAction =
  | "profile"
  | "password"
  | "paymentQr"
  | "unrecognizedPaymentQr"
  | "removePaymentQr";
// line 26
export type ConfirmDialogConfig = {
  confirmText: string;
  description: string;
  isLoading: boolean;
  onConfirm: () => void;
  title: string;
  tone?: "danger";
};
```

### edutrack_fe/components/public/information-page.tsx

[edutrack_fe/components/public/information-page.tsx](../../edutrack_fe/components/public/information-page.tsx) — 25 dòng.

Dependencies: `react`.

Functions: `InformationPage({ title, description, children, }: { title: string; description: string; children: ReactNode; })` (dòng 3).

Exports: `InformationPage` (3).

### edutrack_fe/components/pwa/install-prompt.tsx

[edutrack_fe/components/pwa/install-prompt.tsx](../../edutrack_fe/components/pwa/install-prompt.tsx) — 181 dòng.

Dependencies: `react`.

Functions: `PWAInstallPrompt()` (dòng 11).

Exports: `PWAInstallPrompt` (11).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 6
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
```

### edutrack_fe/components/pwa/service-worker-registration.tsx

[edutrack_fe/components/pwa/service-worker-registration.tsx](../../edutrack_fe/components/pwa/service-worker-registration.tsx) — 28 dòng.

Dependencies: `react`.

Functions: `ServiceWorkerRegistration()` (dòng 5).

Exports: `ServiceWorkerRegistration` (5).

### edutrack_fe/components/schedule/ai-schedule-chat.tsx

[edutrack_fe/components/schedule/ai-schedule-chat.tsx](../../edutrack_fe/components/schedule/ai-schedule-chat.tsx) — 647 dòng.

Dependencies: `lucide-react`, `react`, `@/lib/api/school`, `@/types/school`, `./ai-schedule-chat.module.css`.

Functions: `AiScheduleChatButton({ onClick, }: { onClick: () => void; })` (dòng 72); `AiScheduleChat({ onClose }: { onClose: () => void })` (dòng 160).

Exports: `AiScheduleChatButton` (72), `AiScheduleChat` (160).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 29
type ChatState =
  | { phase: "init" }
  | { phase: "loading" }
  | { phase: "ready"; sessionId: string; greeting: string }
  | { phase: "error"; message: string };
// line 35
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};
// line 40
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};
// line 45
type SpeechRecognitionErrorLike = {
  error: string;
};
// line 49
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};
// line 61
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 225: `schoolApi.createAiScheduleSession()`
- Dòng 254: `schoolApi.getAiScheduleSession(sessionId)`
- Dòng 297: `schoolApi.listAiScheduleSessions()`
- Dòng 325: `schoolApi.sendAiScheduleMessage(chatState.sessionId, userMessage)`

### edutrack_fe/components/schedule/schedule-availability-picker.tsx

[edutrack_fe/components/schedule/schedule-availability-picker.tsx](../../edutrack_fe/components/schedule/schedule-availability-picker.tsx) — 197 dòng.

Dependencies: `lucide-react`, `react`, `@/lib/api/school`, `@/types/school`, `./schedule-conflict-feedback`, `./schedule-planning.module.css`.

Functions: `maskTime(value: string)` (dòng 23); `ScheduleAvailabilityPicker({ context, onSelect, reservedSlots = [], }: { context: Context; onSelect: (slot: ScheduleTimeSlot) => void; reservedSlots?: ScheduleTimeSlot[]; })` (dòng 30).

Exports: `ScheduleAvailabilityPicker` (30).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 14
type Context = Omit<
  ScheduleAvailabilityPayload,
  "duration" | "startTime" | "endTime"
>;
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 66: `schoolApi.getScheduleAvailability({ ...context, duration, startTime, endTime, })`

### edutrack_fe/components/schedule/schedule-conflict-feedback.tsx

[edutrack_fe/components/schedule/schedule-conflict-feedback.tsx](../../edutrack_fe/components/schedule/schedule-conflict-feedback.tsx) — 94 dòng.

Dependencies: `lucide-react`, `react`, `@/lib/api/client`, `@/types/school`, `./schedule-planning.module.css`.

Functions: `useScheduleCheck()` (dòng 9); `ScheduleConflictFeedback({ result, error, }: { result?: ScheduleConflictResult \| null; error?: string; })` (dòng 51).

Exports: `useScheduleCheck` (9), `ScheduleConflictFeedback` (51).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 37: `request()`

### edutrack_fe/components/schedule/schedule-source-picker.tsx

[edutrack_fe/components/schedule/schedule-source-picker.tsx](../../edutrack_fe/components/schedule/schedule-source-picker.tsx) — 88 dòng.

Dependencies: `react`, `@/lib/api/school`, `@/types/school`, `./schedule-planning.module.css`.

Functions: `ScheduleSourcePicker({ classId, date, ignoreOverrideId, startTime, endTime, onChange, }: { classId: string; date: string; ignoreOverrideId?: string; startTime?: string; endTime?: string; onChange: (slot: ScheduleTimeSlot) => void; })` (dòng 8).

Exports: `ScheduleSourcePicker` (8).

### edutrack_fe/components/schedule/teacher-schedule-calendar.tsx

[edutrack_fe/components/schedule/teacher-schedule-calendar.tsx](../../edutrack_fe/components/schedule/teacher-schedule-calendar.tsx) — 394 dòng.

Dependencies: `lucide-react`, `react`, `@/components/classes/classroom-ui`, `@/lib/api/school`, `./schedule-conflict-feedback`, `@/types/school`, `./teacher-schedule-calendar.module.css`, `@/components/ui/notice-provider`, `./teacher-schedule-parts`.

Functions: `TeacherScheduleCalendar()` (dòng 54).

Exports: `TeacherScheduleCalendar` (54).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 76: `schoolApi.getTeacherWeekSchedule(selectedWeekStart)`
- Dòng 194: `schoolApi.checkTemporarySchedule(selectedEvent.classId, payload, getTemporaryScheduleIdFromEvent(selectedEvent) \|\| undefined)`
- Dòng 224: `schoolApi.updateTemporarySchedule(selectedEvent.classId, scheduleId, payload)`
- Dòng 231: `schoolApi.createTemporarySchedule(selectedEvent.classId, payload)`

### edutrack_fe/components/schedule/teacher-schedule-parts.tsx

[edutrack_fe/components/schedule/teacher-schedule-parts.tsx](../../edutrack_fe/components/schedule/teacher-schedule-parts.tsx) — 1134 dòng.

Dependencies: `next/link`, `lucide-react`, `react`, `react`, `@/components/classes/classroom-ui`, `@/components/classes/classroom-utils`, `./schedule-availability-picker`, `./schedule-source-picker`, `@/types/school`, `@/components/classes/classroom-manager.module.css`, `./teacher-schedule-calendar.module.css`.

Functions: `SummaryItem({ icon, label, value, }: { icon: ReactNode; label: string; value: string; })` (dòng 155); `ClassLegend({ classes }: { classes: TeacherScheduleClass[] })` (dòng 175); `WeekCalendar({ days, eventsByDateAndPeriod, onEventView, periods, }: { days: TeacherScheduleDay[]; eventsByDateAndPeriod: Map<string, TeacherScheduleEvent[]>; onEventView: (event: TeacherScheduleEvent) => void; periods: SchedulePeriod[]; })` (dòng 197); `DayHeader({ day }: { day: TeacherScheduleDay })` (dòng 267); `PeriodHeader({ period }: { period: SchedulePeriod })` (dòng 276); `CalendarCell({ day, events, onEventView, period, }: { day: TeacherScheduleDay; events: TeacherScheduleEvent[]; onEventView: (event: TeacherScheduleEvent) => void; period: SchedulePeriod; })` (dòng 290); `ScheduleEventCard({ event, onView, }: { event: TeacherScheduleEvent; onView: () => void; })` (dòng 326); `ScheduleEventModal({ feedback, event, form, isSaving, mode, onCancelAdjustment, onChange, onClose, onModeChange, onSave, }: { feedback: ReactNode; event: TeacherScheduleEvent; form: TemporaryScheduleForm; isSaving: boolean; mode: ScheduleOverrideAction \| ""; onCancelAdjustment: () => void; onChange: Dispatch<SetStateAction<TemporaryScheduleForm>>; onClose: () => void; onModeChange: (mode: ScheduleOverrideAction) => void; onSave: () => void; })` (dòng 382); `InfoBlock({ label, value }: { label: string; value: string })` (dòng 607); `DateField({ label, onChange, value, }: { label: string; onChange: (value: string) => void; value: string; })` (dòng 616); `TimeField({ label, onChange, value, }: { label: string; onChange: (value: string) => void; value: string; })` (dòng 641); `CalendarSkeleton()` (dòng 671); `EmptyScheduleState()` (dòng 721); `getEventStyle(colorIndex: number, colorHex?: string)` (dòng 737); `getEventIcon(type: TeacherScheduleEventType)` (dòng 750); `getEventLabel(event: TeacherScheduleEvent)` (dòng 770); `formatTimeRange(event: TeacherScheduleEvent)` (dòng 790); `getLessonContent(event: TeacherScheduleEvent)` (dòng 798); `buildTemporaryFormFromEvent(event: TeacherScheduleEvent, requestedAction: ScheduleOverrideAction): TemporaryScheduleForm` (dòng 804); `buildTemporaryPayload(form: TemporaryScheduleForm): CreateTemporarySchedulePayload \| string` (dòng 838); `getTemporaryScheduleIdFromEvent(event: TeacherScheduleEvent)` (dòng 913); `getCalendarCellKey(date: string, period: SessionPeriodValue)` (dòng 921); `compareEventsByStartTime(firstEvent: TeacherScheduleEvent, secondEvent: TeacherScheduleEvent)` (dòng 925); `getTimeOrderValue(time?: string)` (dòng 935); `getSessionPeriod(time?: string): { label: string; value: SessionPeriodValue; }` (dòng 945); `getSessionPeriodIcon(period: SessionPeriodValue)` (dòng 978); `getSkeletonDays(): TeacherScheduleDay[]` (dòng 994); `getDayLabel(dayOfWeek: number)` (dòng 1003); `formatDate(value: string)` (dòng 1011); `getCurrentWeekStartKey(): string` (dòng 1021); `getWeekStartKey(dateKey: string): string` (dòng 1034); `addDaysToDateKey(dateKey: string, days: number): string` (dòng 1046); `isToday(dateKey: string)` (dòng 1056); `parseVietnamDateKey(value: string)` (dòng 1060); `getVietnamDayOfWeek(date: Date)` (dòng 1083); `toVietnamDateKey(date: Date)` (dòng 1090); `addDays(date: Date, days: number)` (dòng 1099); `normalizeTimeInput(value: string)` (dòng 1103); `normalizeTimeOnBlur(value: string)` (dòng 1113); `getErrorMessage(error: unknown)` (dòng 1127).

Exports: `SessionPeriodValue` (104), `SchedulePeriod` (106), `calendarPeriods` (112), `unknownPeriod` (130), `TemporaryScheduleForm` (136), `initialTemporaryForm` (147), `SummaryItem` (155), `ClassLegend` (175), `WeekCalendar` (197), `ScheduleEventModal` (382), `CalendarSkeleton` (671), `EmptyScheduleState` (721), `buildTemporaryFormFromEvent` (804), `buildTemporaryPayload` (838), `getTemporaryScheduleIdFromEvent` (913), `getCalendarCellKey` (921), `compareEventsByStartTime` (925), `getSessionPeriod` (945), `formatDate` (1011), `getCurrentWeekStartKey` (1021), `getWeekStartKey` (1034), `addDaysToDateKey` (1046), `getErrorMessage` (1127).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 104
export type SessionPeriodValue = "morning" | "afternoon" | "evening" | "unknown";
// line 106
export type SchedulePeriod = {
  label: string;
  timeHint: string;
  value: SessionPeriodValue;
};
// line 136
export type TemporaryScheduleForm = {
  action: ScheduleOverrideAction;
  originalDate: string;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate: string;
  startTime: string;
  endTime: string;
  reason: string;
};
```

### edutrack_fe/components/students/student-directory-parts.tsx

[edutrack_fe/components/students/student-directory-parts.tsx](../../edutrack_fe/components/students/student-directory-parts.tsx) — 472 dòng.

Dependencies: `lucide-react`, `react`, `@/types/school`, `@/components/classes/classroom-types`, `@/components/classes/classroom-ui`, `@/components/classes/classroom-utils`, `@/components/classes/classroom-manager.module.css`.

Functions: `BulkStudentActionMenu({ disabled, onSelectAction, selectedCount, }: { disabled: boolean; onSelectAction: (mode: DeleteStudentMode) => void; selectedCount: number; })` (dòng 32); `FilterSelect({ label, onChange, options, value, }: { label: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; value: string; })` (dòng 119); `ImportStudentsModal({ file, isImporting, onClose, onConfirm, onDownloadTemplate, onFileChange, result, }: { file: File \| null; isImporting: boolean; onClose: () => void; onConfirm: () => void; onDownloadTemplate: () => void; onFileChange: (event: ChangeEvent<HTMLInputElement>) => void; result: StudentImportResult \| null; })` (dòng 197); `ImportMetric({ label, value }: { label: string; value: number })` (dòng 324); `StudentDirectoryIdentity({ student }: { student: Student })` (dòng 337); `buildStudentUpdatePayload(form: StudentFormState): UpdateStudentPayload` (dòng 353); `DeleteStudentModal({ isDeleting, mode, onChangeMode, onClose, onConfirm, student, }: { isDeleting: boolean; mode: DeleteStudentMode; onChangeMode: (mode: DeleteStudentMode) => void; onClose: () => void; onConfirm: () => void; student: Student; })` (dòng 376).

Exports: `BulkStudentActionMenu` (32), `FilterSelect` (119), `ImportStudentsModal` (197), `StudentDirectoryIdentity` (337), `buildStudentUpdatePayload` (353), `DeleteStudentModal` (376).

### edutrack_fe/components/students/student-directory.tsx

[edutrack_fe/components/students/student-directory.tsx](../../edutrack_fe/components/students/student-directory.tsx) — 1182 dòng.

Dependencies: `next/navigation`, `lucide-react`, `react`, `react`, `@/lib/api/school`, `@/types/school`, `@/components/classes/classroom-types`, `@/components/ui/notice-provider`, `@/components/classes/classroom-utils`, `@/components/classes/classroom-ui`, `@/components/classes/student-detail-modal`, `@/components/classes/student-form-fields`, `@/components/classes/use-deferred-student-avatar-upload`, `@/components/classes/classroom-manager.module.css`, `@/components/students/student-directory-parts`.

Functions: `StudentDirectory()` (dòng 90); `CompactMobileSelect({ ariaLabel, isOpen, onChange, onOpenChange, options, value, }: { ariaLabel: string; isOpen: boolean; onChange: (value: string) => void; onOpenChange: (isOpen: boolean) => void; options: Array<{ label: string; value: string }>; value: string; })` (dòng 1099).

Exports: `StudentDirectory` (90).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 162: `schoolApi.listStudents({ gradeLevel: gradeFilter, limit: "200", search, sortBy, sortOrder, status: statusFilter === "all" ? undefined : statusFilter, })`
- Dòng 192: `schoolApi.listStudents({ gradeLevel: gradeFilter, limit: "200", search, sortBy, sortOrder, status: statusFilter === "all" ? undefined : statusFilter, })`
- Dòng 218: `schoolApi.downloadStudentImportTemplate()`
- Dòng 271: `schoolApi.importStudents(importFile)`
- Dòng 393: `schoolApi.createStudent(payload)`
- Dòng 443: `schoolApi.updateStudent(editingStudent.id, payload)`
- Dòng 470: `schoolApi.deleteStudent(deletingStudent.id, deleteMode)`
- Dòng 497: `schoolApi.deleteStudents(selectedVisibleStudents.map((student) => student.id), bulkDeleteMode)`
- Dòng 526: `schoolApi.getStudentBillingOverview(student.id)`

### edutrack_fe/components/ui/form-field.tsx

[edutrack_fe/components/ui/form-field.tsx](../../edutrack_fe/components/ui/form-field.tsx) — 81 dòng.

Dependencies: `react`.

Functions: `FormField({ label, error, id, className = "", leadingIcon, trailing, variant = "default", ...props }: FormFieldProps)` (dòng 11).

Exports: `FormField` (11).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  variant?: "default" | "auth";
};
```

### edutrack_fe/components/ui/notice-provider.tsx

[edutrack_fe/components/ui/notice-provider.tsx](../../edutrack_fe/components/ui/notice-provider.tsx) — 158 dòng.

Dependencies: `react`, `@/components/classes/classroom-ui`, `@/components/classes/classroom-types`.

Functions: `NoticeProvider({ children }: { children: ReactNode })` (dòng 31); `useNotice()` (dòng 151).

Exports: `NoticeProvider` (31), `useNotice` (151).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 17
type PendingReceipt = {
  receiptNumber: string;
  startedAt: number;
};
// line 22
type NoticeContextType = {
  notice: Notice | null;
  setNotice: (notice: Notice | null) => void;
  unwatchReceipt: (receiptId: string) => void;
  watchReceipt: (receiptId: string, receiptNumber: string) => void;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 81: `schoolApi.getReceiptDetail(id)`

### edutrack_fe/components/ui/primary-button.tsx

[edutrack_fe/components/ui/primary-button.tsx](../../edutrack_fe/components/ui/primary-button.tsx) — 43 dòng.

Dependencies: `react`.

Functions: `PrimaryButton({ children, icon, iconPosition = "start", variant = "default", className = "", disabled, ...props }: PrimaryButtonProps)` (dòng 9).

Exports: `PrimaryButton` (9).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  variant?: "default" | "auth";
};
```

### edutrack_fe/components/ui/select-picker.tsx

[edutrack_fe/components/ui/select-picker.tsx](../../edutrack_fe/components/ui/select-picker.tsx) — 386 dòng.

Dependencies: `lucide-react`, `react`, `react-dom`.

Functions: `SelectPicker({ ariaLabel, disabled = false, leadingIcon, onChange, options, placeholder = "Chọn giá trị", searchable = false, searchEmptyText = "Không tìm thấy kết quả phù hợp.", searchPlaceholder = "Tìm kiếm...", value, variant = "form", }: { ariaLabel: string; disabled?: boolean; leadingIcon?: ReactNode; onChange: (value: string) => void; options: SelectPickerOption[]; placeholder?: string; searchable?: boolean; searchEmptyText?: string; searchPlaceholder?: string; value: string; variant?: "form" \| "toolbar"; })` (dòng 23); `normalizeSearchText(value: string)` (dòng 326); `getTriggerToneClass(tone?: SelectPickerOption["tone"])` (dòng 336); `getOptionToneClass(tone: SelectPickerOption["tone"], selected: boolean)` (dòng 352).

Exports: `SelectPickerOption` (14), `SelectPicker` (23).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 14
export type SelectPickerOption = {
  description?: string;
  icon?: ReactNode;
  label: string;
  searchText?: string;
  tone?: "default" | "success" | "warning" | "danger";
  value: string;
};
```

### edutrack_fe/hooks/use-push.ts

[edutrack_fe/hooks/use-push.ts](../../edutrack_fe/hooks/use-push.ts) — 229 dòng.

Dependencies: `react`, `@/lib/api/profile`, `@/types/user`, `@/components/ui/notice-provider`, `@/lib/push/browser`.

Functions: `usePushNotifications(userId?: string)` (dòng 12).

Exports: `usePushNotifications` (12).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 25: `profileApi.getPushStatus()`
- Dòng 72: `profileApi.subscribeToPush(subscription.toJSON())`
- Dòng 107: `profileApi.getPushStatus()`
- Dòng 114: `profileApi.unsubscribeFromPush(subscription.endpoint)`
- Dòng 121: `profileApi.subscribeToPush(subscription.toJSON())`
- Dòng 181: `profileApi.unsubscribeFromPush(subscription.endpoint)`
- Dòng 209: `profileApi.testPush(subscription.endpoint)`

### edutrack_fe/lib/api/auth.ts

[edutrack_fe/lib/api/auth.ts](../../edutrack_fe/lib/api/auth.ts) — 90 dòng.

Dependencies: `@/types/auth`, `@/types/user`, `./client`.

Exports: `authApi` (19).

Object API: **authApi**

- Dòng 20: `register(payload: RegisterPayload)`
- Dòng 27: `verifyOtp(payload: VerifyOtpPayload)`
- Dòng 34: `resendOtp(payload: ResendOtpPayload)`
- Dòng 41: `forgotPassword(payload: ForgotPasswordPayload)`
- Dòng 48: `resetPassword(payload: ResetPasswordPayload)`
- Dòng 55: `resendPasswordResetOtp(payload: ResendPasswordResetOtpPayload)`
- Dòng 65: `login(payload: LoginPayload)`
- Dòng 73: `refresh()`
- Dòng 77: `logout()`
- Dòng 84: `me(token: string)`

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 21: `apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload), })`
- Dòng 28: `apiRequest("/auth/verify-otp", { method: "POST", body: JSON.stringify(payload), })`
- Dòng 35: `apiRequest("/auth/resend-otp", { method: "POST", body: JSON.stringify(payload), })`
- Dòng 42: `apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload), })`
- Dòng 49: `apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify(payload), })`
- Dòng 56: `apiRequest("/auth/resend-password-reset-otp", { method: "POST", body: JSON.stringify(payload), })`
- Dòng 66: `apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload), skipAuthRefresh: true, })`
- Dòng 78: `apiRequest("/auth/logout", { method: "POST", skipAuthRefresh: true, })`
- Dòng 85: `apiRequest("/auth/me", { token, })`

### edutrack_fe/lib/api/client.ts

[edutrack_fe/lib/api/client.ts](../../edutrack_fe/lib/api/client.ts) — 331 dòng.

Dependencies: `@/types/auth`, `@/lib/auth/access-token`, `@/lib/auth/token-storage`, `./url`.

**ApiError** (dòng 11) 

| Member | Dòng | Hợp đồng / loại | Validation / metadata |
| --- | ---: | --- | --- |
| status | 12 | number |  |
| code | 13 | string (optional) |  |
| details | 14 | unknown |  |

Functions: `apiRequest(path: string, options: ApiRequestOptions = {})` (dòng 39); `apiBlobRequest(path: string, options: ApiRequestOptions = {}): Promise<ApiBlobResponse>` (dòng 54); `executeRequest(path: string, options: ApiRequestOptions)` (dòng 77); `refreshSession(observedAccessToken: string \| null)` (dòng 155); `coordinateRefresh(observedAccessToken: string \| null)` (dòng 169); `refreshOrReuseStoredSession(observedAccessToken: string \| null)` (dòng 179); `getStoredReplacementSession(observedAccessToken: string \| null)` (dòng 191); `getRefreshedAccessToken(session: AuthResponse, expectedUserId: string \| null)` (dòng 207); `performRefreshSession(observedAccessToken: string \| null)` (dòng 225); `refreshAuthSession()` (dòng 248); `createSessionExpiredError()` (dòng 258); `createSessionChangedError()` (dòng 270); `readResponsePayload(response: Response)` (dòng 283); `throwApiError(response: Response, payload: unknown): never` (dòng 298); `getFileNameFromContentDisposition(value: string \| null)` (dòng 314).

Exports: `ApiError` (11), `ApiBlobResponse` (30), `apiRequest` (39), `apiBlobRequest` (54), `refreshAuthSession` (248).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 25
type ApiRequestOptions = RequestInit & {
  token?: string | null;
  skipAuthRefresh?: boolean;
};
// line 30
export type ApiBlobResponse = {
  blob: Blob;
  contentType?: string;
  fileName: string;
};
```

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 117: `fetch(getApiRequestUrl(path), { ...requestOptions, credentials: requestOptions.credentials ?? "include", headers, })`
- Dòng 226: `fetch(getApiRequestUrl("/auth/refresh"), { method: "POST", credentials: "include", })`

### edutrack_fe/lib/api/invoice-images.ts

[edutrack_fe/lib/api/invoice-images.ts](../../edutrack_fe/lib/api/invoice-images.ts) — 29 dòng.

Dependencies: `./client`, `@/lib/auth/token-storage`, `@/types/invoice-template`.

Exports: `invoiceImagesApi` (5).

Object API: **invoiceImagesApi**

- Dòng 6: `list(before?: string, signal?: AbortSignal)`
- Dòng 12: `upload(file: File, signal?: AbortSignal)`
- Dòng 22: `archive(id: string)`

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 7: `apiRequest('/invoice-images${before ? '?before=${encodeURIComponent(before)}' : ""}', { token: tokenStorage.getAccessToken(), signal })`
- Dòng 15: `apiRequest("/invoice-images", { method: "POST", token: tokenStorage.getAccessToken(), body, signal, })`
- Dòng 23: `apiRequest('/invoice-images/${id}', { method: "DELETE", token: tokenStorage.getAccessToken() })`

### edutrack_fe/lib/api/invoice-template.ts

[edutrack_fe/lib/api/invoice-template.ts](../../edutrack_fe/lib/api/invoice-template.ts) — 63 dòng.

Dependencies: `./client`, `@/lib/auth/token-storage`, `@/types/invoice-template`.

Exports: `invoiceTemplateApi` (10).

Object API: **invoiceTemplateApi**

- Dòng 11: `regions(signal?: AbortSignal)`
- Dòng 17: `preview(html: string, css: string, signal?: AbortSignal)`
- Dòng 25: `list(signal?: AbortSignal)`
- Dòng 31: `getDefault(signal?: AbortSignal)`
- Dòng 37: `save(template: InvoiceTemplate, payload: SaveInvoiceTemplate, mode: TemplateSaveMode)`
- Dòng 53: `remove(templateId: string)`

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 12: `apiRequest("/invoice-templates/regions", { token: tokenStorage.getAccessToken(), signal, })`
- Dòng 18: `apiRequest("/invoice-templates/preview", { method: "POST", token: tokenStorage.getAccessToken(), body: JSON.stringify({ html, css }), signal, })`
- Dòng 26: `apiRequest("/invoice-templates", { token: tokenStorage.getAccessToken(), signal, })`
- Dòng 32: `apiRequest("/invoice-templates/default", { token: tokenStorage.getAccessToken(), signal, })`
- Dòng 44: `apiRequest(create ? "/invoice-templates" : '/invoice-templates/${template.id}', { method: create ? "POST" : "PATCH", token: tokenStorage.getAccessToken(), body: JSON.stringify(payload), })`
- Dòng 54: `apiRequest('/invoice-templates/${templateId}', { method: "DELETE", token: tokenStorage.getAccessToken(), })`

### edutrack_fe/lib/api/profile.ts

[edutrack_fe/lib/api/profile.ts](../../edutrack_fe/lib/api/profile.ts) — 218 dòng.

Dependencies: `@/types/user`, `@/lib/auth/token-storage`, `@/lib/push/browser`, `@/types/user`, `./client`.

Functions: `getToken()` (dòng 18); `pushRequest(path: string, options: Parameters<typeof apiRequest>[1] = {})` (dòng 22); `refreshForBinaryRequest()` (dòng 36); `readBinaryError(response: Response)` (dòng 46); `fetchPaymentQrBlob(token: string \| null)` (dòng 67).

Exports: `profileApi` (88).

Object API: **profileApi**

- Dòng 89: `getProfile()`
- Dòng 95: `getBanks()`
- Dòng 101: `updateProfile(payload: UpdateProfilePayload)`
- Dòng 109: `changePassword(payload: ChangePasswordPayload)`
- Dòng 117: `uploadTeacherAvatar(file: File)`
- Dòng 128: `uploadMedia(file: File)`
- Dòng 139: `getMediaHistory()`
- Dòng 145: `uploadPaymentQr(file: File, qrContent?: string, allowUnrecognized = false)`
- Dòng 162: `getPaymentQrBlob()`
- Dòng 182: `removePaymentQr()`
- Dòng 189: `subscribeToPush(subscription: unknown)`
- Dòng 198: `unsubscribeFromPush(endpoint: string)`
- Dòng 206: `getPushStatus()`
- Dòng 210: `testPush(endpoint: string)`

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 27: `apiRequest(path, { ...options, token: getToken(), signal: controller.signal })`
- Dòng 68: `fetch('${getApiBaseUrl()}/users/me/payment-qr', { credentials: "include", headers: token ? { Authorization: 'Bearer ${token}', } : undefined, })`
- Dòng 90: `apiRequest("/users/me", { token: getToken(), })`
- Dòng 96: `apiRequest("/users/banks", { token: getToken(), })`
- Dòng 102: `apiRequest("/users/me", { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 110: `apiRequest("/users/me/password", { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 121: `apiRequest("/users/me/avatar", { method: "POST", token: getToken(), body: formData, })`
- Dòng 132: `apiRequest("/users/me/media", { method: "POST", token: getToken(), body: formData, })`
- Dòng 140: `apiRequest("/users/me/media", { token: getToken(), })`
- Dòng 155: `apiRequest("/users/me/payment-qr", { method: "POST", token: getToken(), body: formData, })`
- Dòng 183: `apiRequest("/users/me/payment-qr", { method: "DELETE", token: getToken(), })`

### edutrack_fe/lib/api/school.ts

[edutrack_fe/lib/api/school.ts](../../edutrack_fe/lib/api/school.ts) — 742 dòng.

Dependencies: `@/lib/auth/token-storage`, `@/types/school`, `./client`.

Functions: `getToken()` (dòng 62); `buildQuery(params: Record<string, string \| string[] \| undefined>)` (dòng 66).

Exports: `schoolApi` (90).

Object API: **schoolApi**

- Dòng 91: `getDashboardOverview()`
- Dòng 97: `checkFixedSchedule(classId: string, payload: SaveFixedSchedulePayload)`
- Dòng 102: `checkTemporarySchedule(classId: string, payload: CreateTemporarySchedulePayload, ignoreOverrideId?: string)`
- Dòng 107: `getScheduleAvailability(payload: ScheduleAvailabilityPayload)`
- Dòng 112: `getScheduleSourceSlots(classId: string, date: string, ignoreOverrideId?: string)`
- Dòng 116: `listStudents(filters: StudentListFilters = {})`
- Dòng 122: `downloadStudentImportTemplate(): Promise<FileDownloadResponse>`
- Dòng 128: `importStudents(file: File)`
- Dòng 139: `listClasses(search?: string)`
- Dòng 153: `createClass(payload: CreateClassPayload)`
- Dòng 161: `updateClass(classId: string, payload: UpdateClassPayload)`
- Dòng 169: `deleteClass(classId: string)`
- Dòng 176: `uploadClassImage(file: File)`
- Dòng 187: `getClassDetail(classId: string)`
- Dòng 193: `getClassSchedules(classId: string)`
- Dòng 199: `saveFixedSchedule(classId: string, payload: SaveFixedSchedulePayload)`
- Dòng 207: `previewSuspendFixedSchedule(classId: string, payload: SuspendFixedSchedulePayload)`
- Dòng 218: `suspendFixedSchedule(classId: string, payload: SuspendFixedSchedulePayload)`
- Dòng 226: `resumeFixedSchedule(classId: string, payload: ResumeFixedSchedulePayload)`
- Dòng 234: `createTemporarySchedule(classId: string, payload: CreateTemporarySchedulePayload)`
- Dòng 248: `updateTemporarySchedule(classId: string, scheduleId: string, payload: UpdateTemporarySchedulePayload)`
- Dòng 263: `revokeTemporarySchedule(classId: string, scheduleId: string)`
- Dòng 273: `saveClassSessionContent(classId: string, payload: SaveClassSessionContentPayload)`
- Dòng 287: `searchStudents(search: string)`
- Dòng 293: `createStudent(payload: CreateStudentPayload)`
- Dòng 301: `updateStudent(studentId: string, payload: UpdateStudentPayload)`
- Dòng 309: `deleteStudent(studentId: string, mode: DeleteStudentMode)`
- Dòng 321: `deleteStudents(studentIds: string[], mode: DeleteStudentMode)`
- Dòng 329: `uploadStudentAvatar(file: File)`
- Dòng 340: `enrollExistingStudent(classId: string, studentId: string)`
- Dòng 348: `enrollExistingStudents(classId: string, studentIds: string[])`
- Dòng 359: `createStudentAndEnroll(classId: string, payload: CreateStudentPayload)`
- Dòng 370: `removeStudentFromClass(classId: string, studentId: string)`
- Dòng 380: `removeStudentsFromClass(classId: string, studentIds: string[])`
- Dòng 391: `updateStudentEnrollmentStatus(classId: string, studentId: string, payload: UpdateEnrollmentStatusPayload)`
- Dòng 399: `hardDeleteStudentFromClass(classId: string, studentId: string)`
- Dòng 406: `getTeacherWeekSchedule(weekStart?: string)`
- Dòng 423: `getAttendance(classId: string, date: string, startTime: string, endTime: string)`
- Dòng 443: `getAttendanceOverview(classId: string)`
- Dòng 450: `takeAttendance(classId: string, payload: TakeAttendancePayload)`
- Dòng 458: `getAttendanceSheet(classId: string)`
- Dòng 465: `takeAttendanceBatch(classId: string, payload: TakeAttendanceBatchPayload)`
- Dòng 474: `getExamSheet(classId: string)`
- Dòng 481: `createExam(classId: string, payload: CreateExamPayload)`
- Dòng 489: `updateExam(classId: string, examId: string, payload: UpdateExamPayload)`
- Dòng 497: `deleteExam(classId: string, examId: string)`
- Dòng 504: `uploadExamFile(classId: string, file: File)`
- Dòng 515: `uploadExamEvidenceImage(classId: string, file: File)`
- Dòng 526: `takeExamScoresBatch(classId: string, payload: TakeExamScoresBatchPayload)`
- Dòng 534: `getBillingOverview(classId: string, filters: { fromDate?: string; toDate?: string } = {})`
- Dòng 546: `getBillingCandidates(classId: string, studentId: string, filters: { fromDate?: string; toDate?: string } = {})`
- Dòng 559: `getStudentBillingOverview(studentId: string, filters: { classIds?: string[]; fromDate?: string; toDate?: string } = {})`
- Dòng 571: `getStudentBillingCandidates(studentId: string, filters: { classIds?: string[]; fromDate?: string; toDate?: string } = {})`
- Dòng 583: `previewReceipt(classId: string, studentId: string, payload: IssueReceiptPayload)`
- Dòng 598: `issueReceipt(classId: string, studentId: string, payload: IssueReceiptPayload)`
- Dòng 609: `previewStudentReceipt(studentId: string, payload: IssueReceiptPayload)`
- Dòng 620: `issueStudentReceipt(studentId: string, payload: IssueReceiptPayload)`
- Dòng 628: `listReceipts(filters: { classId?: string; studentId?: string; paymentStatus?: PaymentStatus; fromDate?: string; toDate?: string; } = {})`
- Dòng 647: `getReceiptDownload(receiptId: string): Promise<ReceiptDownloadResponse>`
- Dòng 656: `getReceiptDetail(receiptId: string)`
- Dòng 663: `downloadReceipts(payload: ReceiptBulkDownloadPayload): Promise<ReceiptDownloadResponse>`
- Dòng 671: `retryReceiptPdf(receiptId: string)`
- Dòng 678: `updateReceiptPayment(receiptId: string, payload: UpdateReceiptPaymentPayload)`
- Dòng 689: `cancelReceipt(receiptId: string)`
- Dòng 696: `uploadReceiptPaymentProof(receiptId: string, file: File)`
- Dòng 712: `createAiScheduleSession()`
- Dòng 719: `sendAiScheduleMessage(sessionId: string, message: string)`
- Dòng 727: `listAiScheduleSessions()`
- Dòng 733: `getAiScheduleSession(sessionId: string)`

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 92: `apiRequest("/dashboard/overview", { token: getToken(), })`
- Dòng 98: `apiRequest("/schedules/conflicts/check-fixed", { method: "POST", token: getToken(), body: JSON.stringify({ ...payload, classId }), })`
- Dòng 103: `apiRequest("/schedules/conflicts/check-temporary", { method: "POST", token: getToken(), body: JSON.stringify({ ...payload, classId, ignoreOverrideId }), })`
- Dòng 108: `apiRequest("/schedules/availability", { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 113: `apiRequest('/schedules/source-slots${buildQuery({ classId, date, ignoreOverrideId })}', { token: getToken() })`
- Dòng 117: `apiRequest('/students${buildQuery(filters)}', { token: getToken(), })`
- Dòng 132: `apiRequest("/students/import", { method: "POST", token: getToken(), body: formData, })`
- Dòng 148: `apiRequest('/classes${queryString ? '?${queryString}' : ""}', { token: getToken(), })`
- Dòng 154: `apiRequest("/classes", { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 162: `apiRequest('/classes/${classId}', { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 170: `apiRequest('/classes/${classId}', { method: "DELETE", token: getToken(), })`
- Dòng 180: `apiRequest("/classes/image", { method: "POST", token: getToken(), body: formData, })`
- Dòng 188: `apiRequest('/classes/${classId}', { token: getToken(), })`
- Dòng 194: `apiRequest('/classes/${classId}/schedules', { token: getToken(), })`
- Dòng 200: `apiRequest('/classes/${classId}/schedules/fixed', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 208: `apiRequest('/classes/${classId}/schedules/fixed/suspend-preview', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 219: `apiRequest('/classes/${classId}/schedules/fixed/suspend', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 227: `apiRequest('/classes/${classId}/schedules/fixed/resume', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 238: `apiRequest('/classes/${classId}/schedules/temporary', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 253: `apiRequest('/classes/${classId}/schedules/temporary/${scheduleId}', { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 264: `apiRequest('/classes/${classId}/schedules/temporary/${scheduleId}', { method: "DELETE", token: getToken(), })`
- Dòng 277: `apiRequest('/classes/${classId}/schedules/session-content', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 288: `apiRequest('/students${buildQuery({ limit: "12", search })}', { token: getToken(), })`
- Dòng 294: `apiRequest("/students", { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 302: `apiRequest('/students/${studentId}', { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 312: `apiRequest('/students/${studentId}?${params.toString()}', { method: "DELETE", token: getToken(), })`
- Dòng 322: `apiRequest("/students/bulk-delete", { method: "POST", token: getToken(), body: JSON.stringify({ mode, studentIds }), })`
- Dòng 333: `apiRequest("/students/avatar", { method: "POST", token: getToken(), body: formData, })`
- Dòng 341: `apiRequest('/classes/${classId}/students', { method: "POST", token: getToken(), body: JSON.stringify({ studentId }), })`
- Dòng 349: `apiRequest('/classes/${classId}/students/bulk', { method: "POST", token: getToken(), body: JSON.stringify({ studentIds }), })`
- Dòng 360: `apiRequest('/classes/${classId}/students/new', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 371: `apiRequest('/classes/${classId}/students/${studentId}', { method: "DELETE", token: getToken(), })`
- Dòng 381: `apiRequest('/classes/${classId}/students/bulk-remove', { method: "POST", token: getToken(), body: JSON.stringify({ studentIds }), })`
- Dòng 392: `apiRequest('/classes/${classId}/students/${studentId}/status', { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 400: `apiRequest('/classes/${classId}/students/${studentId}/hard', { method: "DELETE", token: getToken(), })`
- Dòng 415: `apiRequest('/schedules/week${queryString ? '?${queryString}' : ""}', { token: getToken(), })`
- Dòng 435: `apiRequest('/classes/${classId}/attendance?${params.toString()}', { token: getToken(), })`
- Dòng 444: `apiRequest('/classes/${classId}/attendance-overview', { method: "GET", token: getToken(), })`
- Dòng 451: `apiRequest('/classes/${classId}/attendance', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 459: `apiRequest('/classes/${classId}/attendance-sheet', { method: "GET", token: getToken(), })`
- Dòng 466: `apiRequest('/classes/${classId}/attendance-batch', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 475: `apiRequest('/classes/${classId}/exam-sheet', { method: "GET", token: getToken(), })`
- Dòng 482: `apiRequest('/classes/${classId}/exams', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 490: `apiRequest('/classes/${classId}/exams/${examId}', { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 498: `apiRequest('/classes/${classId}/exams/${examId}', { method: "DELETE", token: getToken(), })`
- Dòng 508: `apiRequest('/classes/${classId}/exams/file', { method: "POST", token: getToken(), body: formData, })`
- Dòng 519: `apiRequest('/classes/${classId}/exam-scores/evidence', { method: "POST", token: getToken(), body: formData, })`
- Dòng 527: `apiRequest('/classes/${classId}/exam-scores', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 538: `apiRequest('/classes/${classId}/billing/overview${buildQuery(filters)}', { token: getToken(), })`
- Dòng 551: `apiRequest('/classes/${classId}/students/${studentId}/billing-candidates${buildQuery(filters)}', { token: getToken(), })`
- Dòng 563: `apiRequest('/students/${studentId}/billing/overview${buildQuery(filters)}', { token: getToken(), })`
- Dòng 575: `apiRequest('/students/${studentId}/billing-candidates${buildQuery(filters)}', { token: getToken(), })`
- Dòng 588: `apiRequest('/classes/${classId}/students/${studentId}/receipts/preview', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 599: `apiRequest('/classes/${classId}/students/${studentId}/receipts', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 610: `apiRequest('/students/${studentId}/receipts/preview', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 621: `apiRequest('/students/${studentId}/receipts', { method: "POST", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 637: `apiRequest('/receipts${buildQuery(filters)}', { token: getToken(), })`
- Dòng 657: `apiRequest('/receipts/${receiptId}', { cache: "no-store", token: getToken(), })`
- Dòng 672: `apiRequest('/receipts/${receiptId}/render-pdf', { method: "POST", token: getToken(), })`
- Dòng 682: `apiRequest('/receipts/${receiptId}/payment', { method: "PATCH", token: getToken(), body: JSON.stringify(payload), })`
- Dòng 690: `apiRequest('/receipts/${receiptId}', { method: "DELETE", token: getToken(), })`
- Dòng 700: `apiRequest('/receipts/${receiptId}/payment-proof', { method: "POST", token: getToken(), body: formData, })`
- Dòng 713: `apiRequest("/ai/schedule-suggest", { method: "POST", token: getToken(), })`
- Dòng 720: `apiRequest("/ai/schedule-suggest/chat", { method: "POST", token: getToken(), body: JSON.stringify({ sessionId, message }), })`
- Dòng 728: `apiRequest("/ai/schedule-suggest/sessions", { token: getToken(), })`
- Dòng 734: `apiRequest('/ai/schedule-suggest/sessions/${sessionId}', { token: getToken(), })`

### edutrack_fe/lib/api/url.ts

[edutrack_fe/lib/api/url.ts](../../edutrack_fe/lib/api/url.ts) — 15 dòng.

Exports: `getApiBaseUrl` (1), `getApiRequestUrl` (11).

### edutrack_fe/lib/auth/access-token.ts

[edutrack_fe/lib/auth/access-token.ts](../../edutrack_fe/lib/auth/access-token.ts) — 55 dòng.

Functions: `getAccessTokenPayload(token: string)` (dòng 6); `getAccessTokenExpiresAt(token: string)` (dòng 25); `getAccessTokenSubject(token: string \| null \| undefined)` (dòng 33); `isAccessTokenExpired(token: string, now = Date.now())` (dòng 43); `shouldRefreshAccessToken(token: string \| null \| undefined, now = Date.now())` (dòng 49).

Exports: `getAccessTokenExpiresAt` (25), `getAccessTokenSubject` (33), `isAccessTokenExpired` (43), `shouldRefreshAccessToken` (49).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
type JwtPayload = {
  exp?: unknown;
  sub?: unknown;
};
```

### edutrack_fe/lib/auth/token-storage.ts

[edutrack_fe/lib/auth/token-storage.ts](../../edutrack_fe/lib/auth/token-storage.ts) — 181 dòng.

Dependencies: `@/types/user`.

Functions: `removeSession()` (dòng 19).

Exports: `AUTH_ACCESS_TOKEN_STORAGE_KEY` (3), `AUTH_USER_STORAGE_KEY` (4), `AUTH_SESSION_EXPIRED_EVENT` (8), `AUTH_SESSION_CHANGED_EVENT` (9), `PendingOtpState` (11), `tokenStorage` (24).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 11
export type PendingOtpState = {
  email: string;
  otpExpiresAt?: string;
  otpResendAvailableAt?: string;
};
```

Object API: **tokenStorage**

- Dòng 25: `getAccessToken()`
- Dòng 33: `getUser()`
- Dòng 52: `setSession(accessToken: string, user: User)`
- Dòng 63: `clearSession()`
- Dòng 71: `expireSession(expectedAccessToken?: string \| null)`
- Dòng 93: `notifySessionChanged()`
- Dòng 101: `setPendingEmail(email: string, otpState?: Omit<PendingOtpState, "email">)`
- Dòng 118: `getPendingEmail()`
- Dòng 126: `getPendingOtp(email?: string)`
- Dòng 150: `setSavedCredentials(email: string, password?: string)`
- Dòng 165: `getSavedCredentials()`

### edutrack_fe/lib/files/open-pdf-in-new-tab.ts

[edutrack_fe/lib/files/open-pdf-in-new-tab.ts](../../edutrack_fe/lib/files/open-pdf-in-new-tab.ts) — 33 dòng.

Functions: `openPdfInNewTab(loadPdf: () => Promise<PdfBlobResponse>)` (dòng 5).

Exports: `openPdfInNewTab` (5).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
type PdfBlobResponse = {
  blob: Blob;
};
```

### edutrack_fe/lib/push/browser.ts

[edutrack_fe/lib/push/browser.ts](../../edutrack_fe/lib/push/browser.ts) — 56 dòng.

Dependencies: `@/types/user`.

Functions: `getPushDeviceType(): PushDeviceType` (dòng 5); `supportsPush()` (dòng 14); `pushSupportMessage()` (dòng 19); `decodePublicKey(value: string)` (dòng 24); `subscriptionMatchesKey(subscription: PushSubscription, key: Uint8Array)` (dòng 32); `readyPushRegistration()` (dòng 39).

Exports: `getPushDeviceType` (5), `supportsPush` (14), `pushSupportMessage` (19), `decodePublicKey` (24), `subscriptionMatchesKey` (32), `readyPushRegistration` (39).

### edutrack_fe/next.config.ts

[edutrack_fe/next.config.ts](../../edutrack_fe/next.config.ts) — 45 dòng.

Dependencies: `next`.

Functions: `normalizeApiUrl(value: string)` (dòng 3).

Object API: **nextConfig**

- Dòng 21: `headers()`
- Dòng 34: `rewrites()`

### edutrack_fe/public/sw.js

[edutrack_fe/public/sw.js](../../edutrack_fe/public/sw.js) — 191 dòng.

Functions: `notificationUrl(value)` (dòng 129).

API calls (trích tham số tĩnh, tối đa 180 ký tự/tham số):

- Dòng 61: `fetch(request)`
- Dòng 89: `fetch(request)`
- Dòng 97: `fetch(request)`
- Dòng 111: `fetch(request)`

### edutrack_fe/tests/access-token.test.mjs

[edutrack_fe/tests/access-token.test.mjs](../../edutrack_fe/tests/access-token.test.mjs) — 100 dòng.

Dependencies: `node:assert/strict`, `node:test`, `../lib/auth/access-token.ts`, `../lib/auth/token-storage.ts`.

Functions: `createToken(payload)` (dòng 15).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 23: reads the access-token identity and expiry from a base64url JWT payload
- Dòng 31: refreshes before a protected request when its token is missing or expired
- Dòng 42: leaves opaque or malformed tokens to the reactive 401 retry
- Dòng 48: does not erase a session replaced by another tab during refresh

### edutrack_fe/tests/attendance-reset.spec.ts

[edutrack_fe/tests/attendance-reset.spec.ts](../../edutrack_fe/tests/attendance-reset.spec.ts) — 254 dòng.

Dependencies: `@playwright/test`, `../types/school`.

Functions: `setup(page: Page, billed = false)` (dòng 50).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 241: billed attendance remains locked

### edutrack_fe/tests/class-color-suggestions.test.mjs

[edutrack_fe/tests/class-color-suggestions.test.mjs](../../edutrack_fe/tests/class-color-suggestions.test.mjs) — 74 dòng.

Dependencies: `node:assert/strict`, `node:test`, `../components/classes/classroom-utils.ts`.

Functions: `getHslLightness(color)` (dòng 65).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 8: class color suggestions return three distinct choices
- Dòng 18: class color suggestions avoid exact colors already in use
- Dòng 27: class color suggestions adapt to colors from other classes
- Dòng 34: class color suggestions can produce alternative sets
- Dòng 41: generated recommendation sets stay medium-light
- Dòng 51: the recommendation palette does not contain overly dark colors
- Dòng 57: the recommendation palette includes a medium-light brown

### edutrack_fe/tests/invoice-designer.spec.ts

[edutrack_fe/tests/invoice-designer.spec.ts](../../edutrack_fe/tests/invoice-designer.spec.ts) — 1083 dòng.

Dependencies: `@playwright/test`, `node:fs`, `node:child_process`, `node:path`, `../../edutrack_be/src/modules/invoice-template/constants/system-invoice-v2`, `../../edutrack_be/src/modules/invoice-template/constants/invoice-regions`.

Functions: `renderReceiptReference(template?: { html: string; css: string })` (dòng 47); `mockApi(page: Page, options: { failSave?: boolean; failLoad?: boolean; template?: Template; versions?: Template[]; failUpload?: boolean; realPreview?: boolean; } = {})` (dòng 95); `saveTemplate(page: Page, mode: "new" \| "overwrite" = "new")` (dòng 233); `openDesigner(page: Page)` (dòng 246).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 42
type Template = Omit<typeof system, "editorData"> & {
  editorData: Record<string, unknown>;
  createdAt?: string;
};
```

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 256: canvas-only scrolling, Ctrl-wheel zoom and collapsible panels keep the page fixed
- Dòng 337: latest version opens by default; save-new preserves old versions and overwrite targets the selected version
- Dòng 427: A4 editor preserves styles, edits and project JSON through create, reload and update
- Dòng 524: load/save failures can be retried without losing the draft
- Dòng 557: pointer drag, resize, text editing and zoom operate on the A4 canvas
- Dòng 641: resizing images and frames at zoom keeps their position
- Dòng 699: project scripts, unsafe attributes, frame heads and base64 images cannot run on load
- Dòng 758: mobile canvas remains visible and controls fit the viewport
- Dòng 795: receipt V2 layout uses locked dynamic regions and survives save/reload
- Dòng 893: designer preview preserves the hardcoded receipt layout after serialization
- Dòng 978: image import previews locally, retries upload, stores image reference and can archive without removing canvas image
- Dòng 1042: mobile region palette and image upload dialog fit without scrolling the page

### edutrack_fe/tests/push-notifications.spec.ts

[edutrack_fe/tests/push-notifications.spec.ts](../../edutrack_fe/tests/push-notifications.spec.ts) — 221 dòng.

Dependencies: `node:crypto`, `@playwright/test`, `../types/user`.

Functions: `setup(page: Page, options: { subscribed?: boolean; permission?: "granted" \| "denied" \| "default"; unsupported?: boolean; configured?: boolean; saveFails?: boolean; testFails?: boolean; rotated?: boolean; registrationFails?: boolean; devices?: PushDevice[] } = {})` (dòng 20).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 86: reconciles a browser subscription with the current account and tests this device
- Dòng 96: asks for notification permission on the first app open and enables the device
- Dòng 106: failed provider delivery never reports success and disables expired subscription
- Dòng 113: server configuration failure is visible instead of claiming push is enabled
- Dòng 119: new subscription is rolled back if saving to the backend fails
- Dòng 129: VAPID rotation requires re-enabling and replaces the old browser subscription
- Dòng 139: denied permission gives actionable guidance without requesting repeatedly
- Dòng 145: unsupported browser still shows guidance and can log out
- Dòng 154: service worker registration failure is reported without leaving an endless spinner
- Dòng 160: attendance notification deep link selects the attendance tab
- Dòng 171: shows device cards with this browser first and safe legacy fallback
- Dòng 186: device cards fit a phone and remain visible when this device is not subscribed
- Dòng 201: enabling and disabling this device updates the cards and empty state
- Dòng 213: unsupported browsers can still inspect and refresh account devices

### edutrack_fe/tests/push-worker.test.mjs

[edutrack_fe/tests/push-worker.test.mjs](../../edutrack_fe/tests/push-worker.test.mjs) — 111 dòng.

Dependencies: `node:assert/strict`, `node:fs`, `node:test`, `node:vm`.

Functions: `harness(overrides = {})` (dòng 8).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 44: failed optional precache downloads do not prevent push worker activation
- Dòng 50: storage unavailable still allows push worker activation
- Dòng 56: activation removes only obsolete EduTrack caches
- Dòng 62: push displays title, body, deduplication tag and corrected attendance link
- Dòng 71: null and plain-text payloads still display a notification
- Dòng 79: notification targets stay on the application origin
- Dòng 85: click focuses exact existing attendance tab
- Dòng 93: click navigates another tab and waits for focus
- Dòng 100: closed tab during navigation opens a new application window
- Dòng 106: notification without stored data opens dashboard

### edutrack_fe/tests/receipt-template-selection.spec.ts

[edutrack_fe/tests/receipt-template-selection.spec.ts](../../edutrack_fe/tests/receipt-template-selection.spec.ts) — 260 dòng.

Dependencies: `@playwright/test`.

Functions: `setup(page: Page, merged = false, failure = { active: false })` (dòng 58); `chooseTemplate(page: Page, picker: ReturnType<Page["getByRole"]>, name: string)` (dòng 185).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 230: blocks issuance on template load errors, retries and fits mobile

### edutrack_fe/tests/session-persistence.spec.ts

[edutrack_fe/tests/session-persistence.spec.ts](../../edutrack_fe/tests/session-persistence.spec.ts) — 329 dòng.

Dependencies: `@playwright/test`.

Functions: `seedSession(page: Page, accessToken = "stored-access-token")` (dòng 47); `fulfillDashboard(route: Route)` (dòng 57).

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 61: reopening the installed app restores the stored session from the root URL
- Dòng 109: an expired access token uses one same-origin refresh and persists the rotated token
- Dòng 165: a temporary backend failure does not erase a locally stored session
- Dòng 201: a device without a session is sent to login
- Dòng 217: the login route shows the form immediately without an access token
- Dòng 275: the dashboard route still restores a valid refresh-cookie session

### edutrack_fe/tests/session-routing.test.mjs

[edutrack_fe/tests/session-routing.test.mjs](../../edutrack_fe/tests/session-routing.test.mjs) — 60 dòng.

Dependencies: `node:assert/strict`, `node:fs/promises`, `node:test`, `../lib/api/url.ts`.

Test labels (khai báo, không phải kết quả thực thi):

- Dòng 7: routes auth through the same-origin proxy and keeps other API calls direct
- Dòng 28: Next proxies only auth endpoints to the backend API
- Dòng 53: the installed PWA opens the protected session-restoring route

### edutrack_fe/types/auth.ts

[edutrack_fe/types/auth.ts](../../edutrack_fe/types/auth.ts) — 70 dòng.

Dependencies: `./user`.

Exports: `RegisterPayload` (3), `LoginPayload` (9), `VerifyOtpPayload` (14), `ForgotPasswordPayload` (19), `ResetPasswordPayload` (24), `ResendOtpPayload` (29), `ResendPasswordResetOtpPayload` (33), `AuthResponse` (37), `RegisterResponse` (42), `ResendOtpResponse` (49), `ForgotPasswordResponse` (56), `ResetPasswordResponse` (63), `LogoutResponse` (67).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 3
export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};
// line 9
export type LoginPayload = {
  email: string;
  password: string;
};
// line 14
export type VerifyOtpPayload = {
  email: string;
  otp: string;
};
// line 19
export type ForgotPasswordPayload = {
  email: string;
  newPassword: string;
};
// line 24
export type ResetPasswordPayload = {
  email: string;
  otp: string;
};
// line 29
export type ResendOtpPayload = {
  email: string;
};
// line 33
export type ResendPasswordResetOtpPayload = {
  email: string;
};
// line 37
export type AuthResponse = {
  accessToken: string;
  user: User;
};
// line 42
export type RegisterResponse = {
  message: string;
  email: string;
  otpExpiresAt: string;
  otpResendAvailableAt: string;
};
// line 49
export type ResendOtpResponse = {
  message: string;
  email?: string;
  otpExpiresAt?: string;
  otpResendAvailableAt?: string;
};
// line 56
export type ForgotPasswordResponse = {
  message: string;
  email?: string;
  otpExpiresAt?: string;
  otpResendAvailableAt?: string;
};
// line 63
export type ResetPasswordResponse = {
  message: string;
};
// line 67
export type LogoutResponse = {
  message: string;
};
```

### edutrack_fe/types/invoice-template.ts

[edutrack_fe/types/invoice-template.ts](../../edutrack_fe/types/invoice-template.ts) — 45 dòng.

Exports: `InvoiceTemplate` (1), `SaveInvoiceTemplate` (17), `TemplateSaveMode` (22), `InvoiceRegion` (24), `InvoiceRegionRegistry` (30), `InvoiceImage` (31), `InvoiceImagePage` (41).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export type InvoiceTemplate = {
  id: string;
  name: string;
  type: "SYSTEM" | "CUSTOM";
  version: number;
  basedOnVersion: string;
  editorData: Record<string, unknown>;
  html: string;
  css: string;
  isDefault: boolean;
  status: "ACTIVE" | "ARCHIVED";
  readonly: boolean;
  createdAt?: string;
  updatedAt?: string;
};
// line 17
export type SaveInvoiceTemplate = Pick<
  InvoiceTemplate,
  "name" | "basedOnVersion" | "editorData" | "html" | "css"
> & { isDefault: true };
// line 22
export type TemplateSaveMode = "new" | "overwrite";
// line 24
export type InvoiceRegion = {
  key: string;
  label: string;
  height: number;
  html: string;
};
// line 30
export type InvoiceRegionRegistry = { regions: InvoiceRegion[]; css: string };
// line 31
export type InvoiceImage = {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  mimeType: string;
  size: number;
  createdAt: string;
};
// line 41
export type InvoiceImagePage = {
  images: InvoiceImage[];
  nextCursor: string | null;
};
```

### edutrack_fe/types/school.ts

[edutrack_fe/types/school.ts](../../edutrack_fe/types/school.ts) — 810 dòng.

Exports: `Gender` (1), `StudentStatus` (3), `ClassStatus` (5), `EnrollmentStatus` (7), `ClassScheduleSlot` (9), `ScheduleOverrideAction` (15), `SuspendFixedSchedulePayload` (21), `ResumeFixedSchedulePayload` (25), `UpdateEnrollmentStatusPayload` (29), `LatestFixedSchedule` (33), `ClassScheduleOverview` (42), `ClassTemporarySchedule` (49), `StudentParent` (62), `Student` (69), `CreateStudentPayload` (85), `UpdateStudentPayload` (99), `DeleteStudentMode` (103), `StudentBulkDeleteResult` (105), `StudentSortField` (118), `StudentSortOrder` (124), `StudentListFilters` (126), `StudentImportResult` (135), `Classroom` (146), `ClassroomDetail` (162), `CreateClassPayload` (166), `UpdateClassPayload` (177), `SaveFixedSchedulePayload` (181), `CreateTemporarySchedulePayload` (186), `UpdateTemporarySchedulePayload` (197), `ClassSessionScheduleType` (199), `SaveClassSessionContentPayload` (206), `ClassSessionContent` (215), `TeacherScheduleEventType` (227), `TeacherScheduleClass` (235), `TeacherScheduleDay` (243), `TeacherScheduleEvent` (248), `TeacherWeekSchedule` (269), `DashboardTodayLesson` (277), `DashboardRevenueStats` (283), `DashboardMonthlyRevenue` (292), `DashboardPendingPayment` (298), `DashboardOverviewData` (321), `ScheduleConflict` (342), `ScheduleConflictResult` (347), `ScheduleAvailabilityPayload` (351), `ScheduleTimeSlot` (357), `ScheduleAvailability` (358), `EnrollmentResponse` (360), `EnrollmentBulkResponse` (370), `RemoveStudentsBulkResponse` (382), `AttendanceStatus` (394), `AttendanceRecord` (396), `AttendanceResponse` (407), `TakeAttendanceRecordPayload` (422), `TakeAttendancePayload` (428), `TakeAttendanceBatchPayload` (436), `FlatAttendanceRecord` (440), `AttendanceSheetResponse` (449), `Exam` (454), `ExamScore` (464), `ExamSheetResponse` (473), `CreateExamPayload` (479), `UpdateExamPayload` (488), `TakeExamScoreEntry` (490), `TakeExamScoresBatchPayload` (498), `PaymentStatus` (502), `ReceiptPdfStatus` (508), `ReceiptScope` (509), `ReceiptTeacherSnapshot` (511), `ReceiptClassSnapshot` (526), `ReceiptStudentSnapshot` (534), `ReceiptSessionSnapshot` (542), `ReceiptExamSnapshot` (569), `ReceiptDetail` (584), `ReceiptListItem` (627), `BillingOverviewStudent` (651), `BillingOverview` (661), `StudentBillingOverviewClass` (675), `StudentBillingOverview` (691), `BillingClassSummary` (702), `BillingCandidates` (710), `IssueReceiptPayload` (727), `ReceiptPreviewResponse` (751), `FileDownloadResponse` (757), `ReceiptDownloadResponse` (763), `ReceiptBulkDownloadPayload` (765), `UpdateReceiptPaymentPayload` (769), `AiChatMessage` (780), `AiScheduleSessionResponse` (786), `AiChatResponse` (792), `AiSessionListItem` (796), `AiSessionDetail` (804).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export type Gender = "male" | "female" | "other";
// line 3
export type StudentStatus = "active" | "inactive";
// line 5
export type ClassStatus = "active" | "inactive" | "archived";
// line 7
export type EnrollmentStatus = "active" | "inactive";
// line 9
export type ClassScheduleSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
// line 15
export type ScheduleOverrideAction =
  | "reschedule"
  | "cancel"
  | "extra"
  | "one_on_one";
// line 21
export type SuspendFixedSchedulePayload = {
  suspendFrom: string;
};
// line 25
export type ResumeFixedSchedulePayload = {
  resumeFrom: string;
};
// line 29
export type UpdateEnrollmentStatusPayload = {
  status: EnrollmentStatus;
};
// line 33
export type LatestFixedSchedule = {
  id: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  schedules: ClassScheduleSlot[];
  warnings?: ScheduleConflict[];
};
// line 42
export type ClassScheduleOverview = {
  fixedSchedules: LatestFixedSchedule[];
  latestFixedSchedule: LatestFixedSchedule | null;
  isFixedScheduleSuspended: boolean;
  temporarySchedules: ClassTemporarySchedule[];
};
// line 49
export type ClassTemporarySchedule = {
  id: string;
  classId: string;
  action: ScheduleOverrideAction;
  originalDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
};
// line 62
export type StudentParent = {
  fullName?: string;
  phone?: string;
  relation?: string;
  note?: string;
};
// line 69
export type Student = {
  id: string;
  teacherId: string;
  studentCode: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gradeLevel?: string;
  gender?: Gender;
  phone?: string;
  parent?: StudentParent;
  address?: string;
  note?: string;
  status: StudentStatus;
};
// line 85
export type CreateStudentPayload = {
  studentCode?: string;
  fullName: string;
  gender: Gender;
  avatarUrl?: string;
  dateOfBirth?: string;
  gradeLevel?: string;
  phone?: string;
  parent?: StudentParent;
  address?: string;
  note?: string;
  status?: StudentStatus;
};
// line 99
export type UpdateStudentPayload = Partial<CreateStudentPayload> & {
  status?: StudentStatus;
};
// line 103
export type DeleteStudentMode = "deactivate" | "delete";
// line 105
export type StudentBulkDeleteResult = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  mode: DeleteStudentMode;
  affectedStudents: Student[];
  errors: Array<{
    studentId: string;
    studentName?: string;
    message: string;
  }>;
};
// line 118
export type StudentSortField =
  | "fullName"
  | "gradeLevel"
  | "createdAt"
  | "updatedAt";
// line 124
export type StudentSortOrder = "asc" | "desc";
// line 126
export type StudentListFilters = {
  search?: string;
  status?: StudentStatus;
  gradeLevel?: string;
  sortBy?: StudentSortField;
  sortOrder?: StudentSortOrder;
  limit?: string;
};
// line 135
export type StudentImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  createdStudents: Student[];
  errors: Array<{
    row: number;
    message: string;
  }>;
};
// line 146
export type Classroom = {
  id: string;
  teacherId: string;
  name: string;
  description?: string;
  imageUrl: string;
  colorIndex: number;
  colorHex?: string;
  regularPrice: number;
  makeupPrice: number;
  priceEffectiveFrom?: string | null;
  status: ClassStatus;
  studentCount: number;
  latestFixedSchedule: LatestFixedSchedule | null;
};
// line 162
export type ClassroomDetail = Classroom & {
  students: Student[];
};
// line 166
export type CreateClassPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  colorIndex?: number;
  colorHex?: string;
  regularPrice: number;
  makeupPrice: number;
  priceEffectiveFrom?: string;
};
// line 177
export type UpdateClassPayload = Partial<CreateClassPayload> & {
  status?: ClassStatus;
};
// line 181
export type SaveFixedSchedulePayload = {
  effectiveFrom: string;
  schedules: ClassScheduleSlot[];
};
// line 186
export type CreateTemporarySchedulePayload = {
  action: ScheduleOverrideAction;
  originalDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  newDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
};
// line 197
export type UpdateTemporarySchedulePayload = CreateTemporarySchedulePayload;
// line 199
export type ClassSessionScheduleType =
  | "fixed"
  | "temporary"
  | "extra"
  | "one_on_one"
  | "manual";
// line 206
export type SaveClassSessionContentPayload = {
  date: string;
  startTime: string;
  endTime: string;
  scheduleType?: ClassSessionScheduleType;
  topic?: string;
  content?: string;
};
// line 215
export type ClassSessionContent = {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  scheduleType: ClassSessionScheduleType;
  status: "scheduled" | "completed" | "cancelled";
  topic?: string;
  content?: string;
};
// line 227
export type TeacherScheduleEventType =
  | "fixed"
  | "extra"
  | "one_on_one"
  | "reschedule"
  | "cancel"
  | "manual";
// line 235
export type TeacherScheduleClass = {
  id: string;
  name: string;
  imageUrl: string;
  colorIndex: number;
  colorHex?: string;
};
// line 243
export type TeacherScheduleDay = {
  date: string;
  dayOfWeek: number;
};
// line 248
export type TeacherScheduleEvent = {
  id: string;
  classId: string;
  className: string;
  classImageUrl: string;
  colorIndex: number;
  colorHex?: string;
  date: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  type: TeacherScheduleEventType;
  reason?: string;
  originalDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  topic?: string;
  content?: string;
  lessonContent?: string;
};
// line 269
export type TeacherWeekSchedule = {
  weekStart: string;
  weekEnd: string;
  days: TeacherScheduleDay[];
  classes: TeacherScheduleClass[];
  events: TeacherScheduleEvent[];
};
// line 277
export type DashboardTodayLesson = TeacherScheduleEvent & {
  displayTitle: string;
  statusLabel: string;
  typeLabel: string;
};
// line 283
export type DashboardRevenueStats = {
  issuedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paidReceiptCount: number;
  pendingReceiptCount: number;
  receiptCount: number;
};
// line 292
export type DashboardMonthlyRevenue = {
  month: number;
  issuedAmount: number;
  collectedAmount: number;
};
// line 298
export type DashboardPendingPayment = {
  id: string;
  classId?: string;
  className: string;
  colorHex?: string;
  dueDate?: string | null;
  issuedAt?: string;
  lessonCount: number;
  paidAmount: number;
  parentName: string;
  parentPhone: string;
  paymentStatus: PaymentStatus;
  pdfStatus?: ReceiptPdfStatus;
  periodEnd?: string;
  periodStart?: string;
  receiptNumber?: string;
  remainingAmount: number;
  studentCode?: string;
  studentId?: string;
  studentName: string;
  totalAmount: number;
};
// line 321
export type DashboardOverviewData = {
  generatedAt: string;
  today: string;
  stats: {
    activeClassCount: number;
    activeStudentCount: number;
    todaySessionCount: number;
    unreadNotificationCount: number;
    pendingPaymentCount: number;
  };
  revenue: {
    year: number;
    monthly: DashboardMonthlyRevenue[];
    currentMonth: DashboardRevenueStats;
    collectedThisMonth: number;
    overall: DashboardRevenueStats;
  };
  todayLessons: DashboardTodayLesson[];
  pendingPayments: DashboardPendingPayment[];
};
// line 342
export type ScheduleConflict = {
  classId: string; className: string; scheduleId: string;
  date: string; startTime: string; endTime: string;
  type: "fixed" | "temporary"; message: string;
};
// line 347
export type ScheduleConflictResult = {
  blockingConflicts: ScheduleConflict[];
  warnings: ScheduleConflict[];
};
// line 351
export type ScheduleAvailabilityPayload = {
  classId: string; mode: "fixed" | "temporary"; date: string;
  dayOfWeek?: number; duration: number; startTime: string; endTime: string;
  ignoreOverrideId?: string; originalDate?: string;
  originalStartTime?: string; originalEndTime?: string;
};
// line 357
export type ScheduleTimeSlot = { startTime: string; endTime: string };
// line 358
export type ScheduleAvailability = { slots: ScheduleTimeSlot[]; warnings: ScheduleConflict[] };
// line 360
export type EnrollmentResponse = {
  id: string;
  classId: string;
  studentId: string;
  status: EnrollmentStatus;
  joinedAt: string;
  leftAt?: string | null;
  student: Student;
};
// line 370
export type EnrollmentBulkResponse = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  enrollments: EnrollmentResponse[];
  errors: Array<{
    studentId: string;
    studentName?: string;
    message: string;
  }>;
};
// line 382
export type RemoveStudentsBulkResponse = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  removedStudents: Student[];
  errors: Array<{
    studentId: string;
    studentName?: string;
    message: string;
  }>;
};
// line 394
export type AttendanceStatus = "present" | "absent" | "excused" | "late";
// line 396
export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentAvatar?: string;
  status: AttendanceStatus;
  note?: string;
  isBilled?: boolean;
};
// line 407
export type AttendanceResponse = {
  sessionId: string | null;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  records: AttendanceRecord[];
  summary: {
    total: number;
    present: number;
    absent: number;
    excused: number;
  };
};
// line 422
export interface TakeAttendanceRecordPayload {
  studentId: string;
  status?: AttendanceStatus | null;
  note?: string;
}
// line 428
export type TakeAttendancePayload = {
  date: string;
  startTime: string;
  endTime: string;
  scheduleEventType?: Exclude<TeacherScheduleEventType, "cancel"> | "manual";
  records: TakeAttendanceRecordPayload[];
};
// line 436
export type TakeAttendanceBatchPayload = {
  sessions: TakeAttendancePayload[];
};
// line 440
export type FlatAttendanceRecord = {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note: string;
  isBilled?: boolean;
};
// line 449
export type AttendanceSheetResponse = {
  sessions: TeacherScheduleEvent[];
  records: FlatAttendanceRecord[];
};
// line 454
export type Exam = {
  id: string;
  title: string;
  testDate: string;
  maxScore: number;
  description?: string;
  fileUrl?: string;
  fileName?: string;
};
// line 464
export type ExamScore = {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  note?: string;
  evidenceImages?: string[];
};
// line 473
export type ExamSheetResponse = {
  students: Student[];
  exams: Exam[];
  scores: ExamScore[];
};
// line 479
export type CreateExamPayload = {
  title: string;
  testDate: string;
  maxScore: number;
  description?: string;
  fileUrl?: string;
  fileName?: string;
};
// line 488
export type UpdateExamPayload = Partial<CreateExamPayload>;
// line 490
export type TakeExamScoreEntry = {
  examId: string;
  studentId: string;
  score: number | null;
  note?: string;
  evidenceImages?: string[];
};
// line 498
export type TakeExamScoresBatchPayload = {
  scores: TakeExamScoreEntry[];
};
// line 502
export type PaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "cancelled";
// line 508
export type ReceiptPdfStatus = "pending" | "generated" | "failed";
// line 509
export type ReceiptScope = "class" | "multi_class";
// line 511
export type ReceiptTeacherSnapshot = {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankCode?: string;
  bankBin?: string;
  bankLogoUrl?: string;
  hasPaymentQr: boolean;
};
// line 526
export type ReceiptClassSnapshot = {
  classId?: string;
  className: string;
  colorHex?: string;
  regularPrice: number;
  makeupPrice: number;
};
// line 534
export type ReceiptStudentSnapshot = {
  studentCode?: string;
  fullName: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
};
// line 542
export type ReceiptSessionSnapshot = {
  tuitionEntryId: string;
  attendanceId?: string;
  sequence: number;
  sessionId?: string;
  classId?: string;
  attendedClassId?: string;
  billingClassId?: string;
  makeupForClassId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  className: string;
  attendedClassName?: string;
  billingClassName?: string;
  makeupForClassName?: string;
  classColorHex?: string;
  topic?: string;
  content?: string;
  attendanceStatus: AttendanceStatus;
  scheduleType?: ClassSessionScheduleType;
  tuitionType: string;
  unitPrice: number;
  amount: number;
  note?: string;
};
// line 569
export type ReceiptExamSnapshot = {
  examId?: string;
  examScoreId?: string;
  classId?: string;
  className: string;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  description?: string;
  note?: string;
  evidenceImages?: string[];
  teacherRemark?: string;
};
// line 584
export type ReceiptDetail = {
  template?: { id: string; name: string; version: number; revision: string };
  id: string;
  teacherId: string;
  classId: string;
  classIds?: string[];
  primaryClassId?: string;
  scopeType?: ReceiptScope;
  studentId: string;
  billingCycleId?: string | null;
  receiptNumber: string;
  issuedAt: string;
  periodStart: string;
  periodEnd: string;
  dueDate?: string | null;
  reason: "cycle_completed" | "manual_early";
  teacherSnapshot: ReceiptTeacherSnapshot;
  classSnapshot: ReceiptClassSnapshot;
  classSnapshots?: ReceiptClassSnapshot[];
  studentSnapshot: ReceiptStudentSnapshot;
  sessions: ReceiptSessionSnapshot[];
  exams: ReceiptExamSnapshot[];
  lessonCount: number;
  subtotal: number;
  discountAmount: number;
  adjustmentAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  paidAt?: string | null;
  note?: string;
  teacherComment?: string;
  strengthsComment?: string;
  improvementsComment?: string;
  generalComment?: string;
  paymentNote?: string;
  paymentProofUrl?: string;
  pdfStatus: ReceiptPdfStatus;
  pdfUrl?: string | null;
  pdfGeneratedAt?: string | null;
  pdfFailedReason?: string | null;
};
// line 627
export type ReceiptListItem = {
  id: string;
  classId: string;
  classIds?: string[];
  primaryClassId?: string;
  scopeType?: ReceiptScope;
  studentId: string;
  receiptNumber: string;
  issuedAt: string;
  periodStart: string;
  periodEnd: string;
  studentName: string;
  className: string;
  classSnapshots?: ReceiptClassSnapshot[];
  lessonCount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  paidAt?: string | null;
  paymentNote?: string;
  pdfStatus: ReceiptPdfStatus;
  pdfUrl?: string | null;
};
// line 651
export type BillingOverviewStudent = {
  student: Student;
  unbilledLessonCount: number;
  unbilledAmount: number;
  firstUnbilledSessionDate?: string;
  lastUnbilledSessionDate?: string;
  reachedSuggestedCycle: boolean;
  latestReceipt?: ReceiptListItem | null;
};
// line 661
export type BillingOverview = {
  classId: string;
  className: string;
  regularPrice: number;
  makeupPrice: number;
  totals: {
    students: number;
    unbilledLessonCount: number;
    unbilledAmount: number;
    readyToIssueCount: number;
  };
  students: BillingOverviewStudent[];
};
// line 675
export type StudentBillingOverviewClass = {
  class: {
    id: string;
    name: string;
    colorHex?: string;
    regularPrice: number;
    makeupPrice: number;
  };
  unbilledLessonCount: number;
  unbilledAmount: number;
  firstUnbilledSessionDate?: string;
  lastUnbilledSessionDate?: string;
  reachedSuggestedCycle: boolean;
  latestReceipt?: ReceiptListItem | null;
};
// line 691
export type StudentBillingOverview = {
  student: Student;
  classes: StudentBillingOverviewClass[];
  totals: {
    classes: number;
    unbilledLessonCount: number;
    unbilledAmount: number;
    readyToIssueCount: number;
  };
};
// line 702
export type BillingClassSummary = {
  id: string;
  name: string;
  colorHex?: string;
  regularPrice: number;
  makeupPrice: number;
};
// line 710
export type BillingCandidates = {
  class: BillingClassSummary;
  classes?: BillingClassSummary[];
  scopeType?: ReceiptScope;
  student: Student;
  periodStart: string;
  periodEnd: string;
  suggestedTuitionEntryIds: string[];
  tuitionEntries: ReceiptSessionSnapshot[];
  exams: ReceiptExamSnapshot[];
  summary: {
    unbilledLessonCount: number;
    unbilledAmount: number;
    examCount: number;
  };
};
// line 727
export type IssueReceiptPayload = {
  templateId?: string;
  templateRevision?: string;
  scopeType?: ReceiptScope;
  classIds?: string[];
  fromDate?: string;
  toDate?: string;
  dueDate?: string;
  tuitionEntryIds?: string[];
  targetSessionCount?: number;
  discountAmount?: number;
  adjustmentAmount?: number;
  note?: string;
  teacherComment?: string;
  strengthsComment?: string;
  improvementsComment?: string;
  generalComment?: string;
  paymentNote?: string;
  examRemarks?: Array<{
    examScoreId: string;
    teacherRemark: string;
  }>;
};
// line 751
export type ReceiptPreviewResponse = {
  template: { id: string; name: string; version: number; revision: string };
  receipt: ReceiptDetail;
  html: string;
};
// line 757
export type FileDownloadResponse = {
  blob: Blob;
  contentType?: string;
  fileName: string;
};
// line 763
export type ReceiptDownloadResponse = FileDownloadResponse;
// line 765
export type ReceiptBulkDownloadPayload = {
  receiptIds: string[];
};
// line 769
export type UpdateReceiptPaymentPayload = {
  paymentStatus: Exclude<PaymentStatus, "cancelled">;
  paidAmount?: number;
  paidAt?: string;
  paymentNote?: string;
  paymentProofUrl?: string;
  paymentProofPublicId?: string;
};
// line 780
export type AiChatMessage = {
  role: "user" | "ai";
  text: string;
  timestamp: string;
};
// line 786
export type AiScheduleSessionResponse = {
  sessionId: string;
  scheduleContext: string;
  greeting: string;
};
// line 792
export type AiChatResponse = {
  reply: string;
};
// line 796
export type AiSessionListItem = {
  sessionId: string;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
  preview: string;
};
// line 804
export type AiSessionDetail = {
  sessionId: string;
  messages: AiChatMessage[];
  scheduleContext: string;
  createdAt: string;
};
```

### edutrack_fe/types/user.ts

[edutrack_fe/types/user.ts](../../edutrack_fe/types/user.ts) — 77 dòng.

Exports: `UserRole` (1), `PushDeviceType` (3), `PushDevice` (5), `PushStatus` (15), `PaymentBank` (23), `User` (32), `UpdateProfilePayload` (54), `PaymentQrUploadResponse` (65), `ChangePasswordPayload` (73).

Type contracts / enum values (mã khai báo tại mốc khảo sát):

```typescript
// line 1
export type UserRole = "teacher";
// line 3
export type PushDeviceType = "desktop" | "mobile" | "tablet" | "unknown";
// line 5
export type PushDevice = {
  id: string;
  type: PushDeviceType;
  name: string;
  browser: string | null;
  os: string | null;
  registeredAt: string | null;
  lastSeenAt: string | null;
};
// line 15
export type PushStatus = {
  configured: boolean;
  publicKey: string | null;
  subscriptionCount: number;
  devices?: PushDevice[];
  configurationError?: string;
};
// line 23
export type PaymentBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
};
// line 32
export type User = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  bio?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankCode?: string;
  bankBin?: string;
  bankLogoUrl?: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  hasPaymentQr: boolean;
  paymentQrImageContentType?: string;
  paymentQrImageSize?: number;
  paymentQrImageUpdatedAt?: string;
};
// line 54
export type UpdateProfilePayload = {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  bio?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBin?: string;
};
// line 65
export type PaymentQrUploadResponse = User & {
  paymentQrBankDetection?: {
    bankBin: string;
    bankLogoUrl: string;
    bankName: string;
  };
};
// line 73
export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
```

