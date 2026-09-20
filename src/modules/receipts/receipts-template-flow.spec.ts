import { ConflictException } from '@nestjs/common';
import { model, Types } from 'mongoose';
import { ReceiptSchema, ReceiptDocument } from '../school-management/schemas';
import { ReceiptScope, ReceiptReason } from '../school-management/enums';
import { ReceiptTemplateSnapshot } from '../school-management/schemas/receipt-template-snapshot.schema';
import { ReceiptsService } from './receipts.service';
import { ReceiptTemplateService } from './receipt-template.service';
import { IssueReceiptDto } from './dto/issue-receipt.dto';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

const teacherId = new Types.ObjectId();
const studentId = new Types.ObjectId();
const classIds = [new Types.ObjectId(), new Types.ObjectId()];
const template: ReceiptTemplateSnapshot = {
  id: new Types.ObjectId().toString(),
  name: 'Selected design',
  version: 3,
  revision: 'a'.repeat(64),
  html: '<h1>Selected design</h1>',
  css: 'h1 { color: red }',
};
const dto: IssueReceiptDto = {
  templateId: template.id,
  templateRevision: template.revision,
};
const createDraft = (merged: boolean) => ({
  teacherId,
  studentId,
  classId: classIds[0],
  primaryClassId: classIds[0],
  classIds: merged ? classIds : [classIds[0]],
  scopeType: merged ? ReceiptScope.MultiClass : ReceiptScope.Class,
  templateSnapshot: template,
  periodStart: new Date('2026-09-01'),
  periodEnd: new Date('2026-09-01'),
  reason: ReceiptReason.ManualEarly,
  teacherSnapshot: { fullName: 'Teacher' },
  studentSnapshot: { fullName: 'Student' },
  classSnapshot: { classId: classIds[0], className: 'A' },
  classSnapshots: (merged ? classIds : [classIds[0]]).map((id) => ({
    classId: id,
    className: 'A',
  })),
  sessions: [],
  exams: [],
  lessonCount: 1,
  subtotal: 150000,
  totalAmount: 150000,
  discountAmount: 0,
  adjustmentAmount: 0,
  selectedTuitionEntryIds: [new Types.ObjectId()],
  selectedAttendanceIds: [new Types.ObjectId()],
});
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

describe('receipt template issue and retry wiring', () => {
  const ReceiptModel = model('ReceiptTemplateFlowTest', ReceiptSchema);
  const update = jest.fn(() => ({
    exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  }));
  const stubModel = { updateMany: update, updateOne: update };
  const dbSession = {
    withTransaction: jest.fn(async (callback: () => Promise<void>) =>
      callback(),
    ),
    endSession: jest.fn(),
  };
  const design = {
    resolve: jest.fn(),
    metadata: jest.fn((value?: ReceiptTemplateSnapshot) =>
      value
        ? {
            id: value.id,
            name: value.name,
            version: value.version,
            revision: value.revision,
          }
        : undefined,
    ),
    render: jest.fn(
      (receipt: { receiptNumber: string }) =>
        `<html>${receipt.receiptNumber}:selected</html>`,
    ),
  };
  const pdf = { render: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')) };
  const service = new ReceiptsService(
    ...([
      { startSession: jest.fn().mockResolvedValue(dbSession) },
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      stubModel,
      ReceiptModel,
      {},
      new ReceiptTemplateService(),
      pdf,
      design,
    ] as unknown as ConstructorParameters<typeof ReceiptsService>),
  );
  const internal = service as unknown as Internals;

  afterEach(() => jest.restoreAllMocks());
  beforeEach(() => jest.clearAllMocks());

  it.each([false, true])(
    'persists selected design and rendered final invoice (merged=%s)',
    async (merged) => {
      const draft = createDraft(merged);
      const build = jest
        .spyOn(internal, 'buildReceiptDraftForClasses')
        .mockResolvedValue(draft);
      jest
        .spyOn(internal, 'resolveStudentReceiptClassIds')
        .mockResolvedValue(draft.classIds.map(String));
      jest
        .spyOn(internal, 'getTeacherPaymentQrDataUrl')
        .mockResolvedValue('data:image/png;base64,test');
      jest
        .spyOn(internal, 'generateReceiptNumber')
        .mockResolvedValue('INV-FINAL-001');
      jest
        .spyOn(internal, 'createBillingCycleFromDraft')
        .mockResolvedValue({ _id: new Types.ObjectId() });
      jest.spyOn(internal, 'renderAndUploadReceiptPdf').mockResolvedValue();
      jest
        .spyOn(service, 'findReceiptById')
        .mockResolvedValue(
          {} as Awaited<ReturnType<ReceiptsService['findReceiptById']>>,
        );
      const save = jest
        .spyOn(ReceiptModel.prototype, 'save')
        .mockImplementation(function (this: ReceiptDocument) {
          return Promise.resolve(this);
        });
      if (merged)
        await service.issueStudentReceipt(
          String(teacherId),
          String(studentId),
          dto,
        );
      else
        await service.issueReceipt(
          String(teacherId),
          String(classIds[0]),
          String(studentId),
          dto,
        );
      expect(build).toHaveBeenCalledWith(
        String(teacherId),
        draft.classIds.map(String),
        String(studentId),
        dto,
        dbSession,
      );
      const stored = save.mock.contexts[0] as ReceiptDocument;
      expect(stored.templateSnapshot).toMatchObject(template);
      expect(stored.renderSnapshot?.html).toBe(
        '<html>INV-FINAL-001:selected</html>',
      );
      expect(stored.htmlTemplateVersion).toBe(`${template.id}:v3`);
      expect(design.render).toHaveBeenCalledWith(
        expect.objectContaining({
          receiptNumber: 'INV-FINAL-001',
          issuedAt: expect.any(Date) as Date,
        }),
        template,
        'data:image/png;base64,test',
      );
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ classId: { $in: draft.classIds } }),
        expect.anything(),
        { session: dbSession },
      );
      expect(dbSession.endSession).toHaveBeenCalled();

      design.render.mockClear();
      await internal.renderReceiptPdfBuffer(stored);
      expect(pdf.render).toHaveBeenCalledWith(
        '<html>INV-FINAL-001:selected</html>',
        expect.objectContaining({
          template: expect.objectContaining({ id: template.id }) as unknown,
        }),
        undefined,
        { requireHtml: true },
      );
      expect(design.render).not.toHaveBeenCalled();
      expect(design.resolve).not.toHaveBeenCalled();
      expect(internal.getTeacherPaymentQrDataUrl).toHaveBeenCalledTimes(1);
    },
  );

  it('rejects stale template revisions before billing writes', async () => {
    design.resolve.mockRejectedValueOnce(
      new ConflictException('Template changed'),
    );
    await expect(
      service.issueReceipt(
        String(teacherId),
        String(classIds[0]),
        String(studentId),
        dto,
      ),
    ).rejects.toThrow(ConflictException);
    expect(design.resolve).toHaveBeenCalledWith(
      String(teacherId),
      template.id,
      template.revision,
    );
    expect(update).not.toHaveBeenCalled();
    expect(dbSession.endSession).toHaveBeenCalled();
  });
});
