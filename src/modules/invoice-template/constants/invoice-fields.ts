export type InvoiceFieldFormatter = 'date' | 'money';

export type InvoiceDynamicField = {
  key: string;
  label: string;
  category: 'BASIC' | 'STUDENT' | 'CLASS' | 'TUITION' | 'TEACHER' | 'INVOICE';
  previewValue: string;
  formatter?: InvoiceFieldFormatter;
};

export const INVOICE_DYNAMIC_FIELDS = [
  {
    key: 'student.fullName',
    label: 'Student Name',
    category: 'STUDENT',
    previewValue: 'Nguyễn Minh Anh',
  },
  {
    key: 'student.phone',
    label: 'Student Phone',
    category: 'STUDENT',
    previewValue: '0901234567',
  },
  {
    key: 'student.studentCode',
    label: 'Student Code',
    category: 'STUDENT',
    previewValue: 'HS-0001',
  },
  {
    key: 'class.name',
    label: 'Class Name',
    category: 'CLASS',
    previewValue: 'English 7A',
  },
  {
    key: 'class.schedule',
    label: 'Class Schedule',
    category: 'CLASS',
    previewValue: 'Thứ 2, Thứ 4 - 18:00',
  },
  {
    key: 'tuition.sessionCount',
    label: 'Session Count',
    category: 'TUITION',
    previewValue: '8',
  },
  {
    key: 'tuition.sessionPrice',
    label: 'Session Price',
    category: 'TUITION',
    previewValue: '100.000 VND',
    formatter: 'money',
  },
  {
    key: 'tuition.totalAmount',
    label: 'Total Amount',
    category: 'TUITION',
    previewValue: '800.000 VND',
    formatter: 'money',
  },
  {
    key: 'tuition.paymentDate',
    label: 'Payment Date',
    category: 'TUITION',
    previewValue: '15/09/2026',
    formatter: 'date',
  },
  {
    key: 'teacher.fullName',
    label: 'Teacher Name',
    category: 'TEACHER',
    previewValue: 'Ms. Cheese',
  },
  {
    key: 'teacher.phone',
    label: 'Teacher Phone',
    category: 'TEACHER',
    previewValue: '0912345678',
  },
  {
    key: 'teacher.address',
    label: 'Teacher Address',
    category: 'TEACHER',
    previewValue: 'Hà Nội',
  },
  {
    key: 'invoice.invoiceCode',
    label: 'Invoice Code',
    category: 'INVOICE',
    previewValue: 'INV-202609-0001',
  },
  {
    key: 'invoice.createdAt',
    label: 'Created Date',
    category: 'INVOICE',
    previewValue: '13/09/2026',
    formatter: 'date',
  },
] as const satisfies readonly InvoiceDynamicField[];

export const INVOICE_DYNAMIC_FIELD_MAP: ReadonlyMap<
  string,
  InvoiceDynamicField
> = new Map(INVOICE_DYNAMIC_FIELDS.map((field) => [field.key, field]));
