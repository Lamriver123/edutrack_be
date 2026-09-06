import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { inflateRawSync } from 'zlib';
import { ClientSession, Model, Types } from 'mongoose';
import { Gender, StudentStatus } from '../school-management/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Student,
  StudentDocument,
} from '../school-management/schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { DeleteStudentMode } from './dto/delete-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  escapeRegex,
  normalizeSearchText,
} from '../../common/utils/search-normalizer';

const DEFAULT_BOY_AVATAR_URL =
  'https://img.magnific.com/premium-psd/student-boy-avatar-3d-icon_1723-409.jpg';
const DEFAULT_GIRL_AVATAR_URL =
  'https://png.pngtree.com/png-vector/20250709/ourmid/pngtree-adorable-school-girl-cartoon-with-backpack-pointing-up-cute-chibi-vector-png-image_16736310.webp';

const STUDENT_IMPORT_TEMPLATE_COLUMNS = [
  'Họ tên học sinh',
  'Lớp mấy',
  'Giới tính',
  'Ngày sinh',
  'SĐT học sinh',
  'Tên phụ huynh',
  'SĐT phụ huynh',
  'Quan hệ',
  'Địa chỉ',
  'Ghi chú',
  'Mã học sinh',
  'Trạng thái',
] as const;

const STUDENT_IMPORT_TEMPLATE_ROWS = [
  [
    'Nguyễn Văn An',
    '5',
    'Nam',
    '15/08/2014',
    '0901234567',
    'Nguyễn Thị Bình',
    '0912345678',
    'Mẹ',
    'Hà Nội',
    'Cần theo sát phần từ vựng',
    '',
    'Đang học',
  ],
] as const;

const STUDENT_IMPORT_TEMPLATE_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const ZIP_VERSION_NEEDED = 20;
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const CRC32_TABLE = Array.from({ length: 256 }, (_, tableIndex) => {
  let crc = tableIndex;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});

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

const STUDENT_IMPORT_HEADER_ALIASES: Record<StudentImportColumn, string[]> = {
  address: ['dia chi', 'dia chi lien he', 'address'],
  avatarUrl: ['url anh dai dien', 'anh dai dien', 'avatar url', 'avatar'],
  dateOfBirth: ['ngay sinh', 'date of birth', 'dob'],
  fullName: ['ho ten hoc sinh', 'ho ten', 'ten hoc sinh', 'full name', 'name'],
  gender: ['gioi tinh', 'gender'],
  gradeLevel: ['lop may', 'lop', 'khoi lop', 'grade', 'grade level'],
  note: ['ghi chu', 'ghi chu hoc sinh', 'note'],
  parentFullName: ['ten phu huynh', 'ho ten phu huynh', 'parent name'],
  parentNote: ['ghi chu phu huynh', 'parent note'],
  parentPhone: ['sdt phu huynh', 'so dien thoai phu huynh', 'parent phone'],
  parentRelation: ['quan he', 'moi quan he', 'relation'],
  phone: ['sdt hoc sinh', 'so dien thoai hoc sinh', 'dien thoai hoc sinh'],
  status: ['trang thai', 'status'],
  studentCode: ['ma hoc sinh', 'student code', 'code'],
};

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

export type StudentImportError = {
  row: number;
  message: string;
};

export type StudentImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  createdStudents: StudentResponse[];
  errors: StudentImportError[];
};

export type StudentBulkDeleteError = {
  studentId: string;
  studentName?: string;
  message: string;
};

export type StudentBulkDeleteResult = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  mode: DeleteStudentMode;
  affectedStudents: StudentResponse[];
  errors: StudentBulkDeleteError[];
};

export type StudentImportFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type ZipEntryMap = Map<string, Buffer>;

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

type StudentTextFilter = {
  $regex: string;
  $options: string;
};

type StudentFilter = {
  teacherId: Types.ObjectId;
  status?: StudentStatus;
  gradeLevel?: StudentTextFilter;
  $or?: Array<Record<string, StudentTextFilter>>;
};

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    teacherId: string,
    dto: CreateStudentDto,
    session?: ClientSession,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const studentCode = dto.studentCode?.trim() || this.generateStudentCode();
    const fullName = dto.fullName.trim();
    const gradeLevel = dto.gradeLevel?.trim();
    const parent = this.cleanParent(dto.parent);
    const phone = dto.phone?.trim();

    try {
      const [student] = await this.studentModel.create(
        [
          {
            teacherId: teacherObjectId,
            studentCode,
            fullName,
            avatarUrl: this.resolveAvatarUrl(dto.gender, dto.avatarUrl),
            searchText: this.buildStudentSearchText({
              fullName,
              gradeLevel,
              parent,
              phone,
              studentCode,
            }),
            dateOfBirth: dto.dateOfBirth
              ? new Date(dto.dateOfBirth)
              : undefined,
            gradeLevel,
            gender: dto.gender,
            phone,
            parent,
            address: dto.address?.trim(),
            note: dto.note?.trim(),
            status: dto.status ?? StudentStatus.Active,
          },
        ],
        { session },
      );

      return student;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Mã học sinh đã tồn tại trong tài khoản giáo viên này.',
        );
      }

      throw error;
    }
  }

  async findAll(teacherId: string, query: QueryStudentsDto) {
    const filter: StudentFilter = {
      teacherId: this.toObjectId(teacherId, 'teacherId'),
    };

    if (query.status) {
      filter.status = query.status;
    }

    const gradeLevel = query.gradeLevel?.trim();

    if (gradeLevel) {
      filter.gradeLevel = {
        $regex: escapeRegex(gradeLevel),
        $options: 'i',
      };
    }

    const search = normalizeSearchText(query.search ?? '');

    if (search) {
      const textFilter = {
        $regex: escapeRegex(search),
        $options: 'i',
      };

      filter.$or = [
        { searchText: textFilter },
        { studentCode: textFilter },
        { phone: textFilter },
        { 'parent.fullName': textFilter },
        { 'parent.phone': textFilter },
        { gradeLevel: textFilter },
      ];
    }

    const students = await this.studentModel
      .find(filter)
      .sort(this.buildSort(query))
      .limit(query.limit ?? 20)
      .exec();

    return students.map((student) => this.toStudentResponse(student));
  }

  getImportTemplate() {
    const rows: string[][] = [
      [...STUDENT_IMPORT_TEMPLATE_COLUMNS],
      ...STUDENT_IMPORT_TEMPLATE_ROWS.map((row) => [...row]),
    ];

    return {
      content: this.buildXlsxTemplate(rows),
      contentType: STUDENT_IMPORT_TEMPLATE_CONTENT_TYPE,
      fileName: 'mau-import-hoc-sinh-edutrack.xlsx',
    };
  }

  async importFromTemplate(
    teacherId: string,
    file: StudentImportFile,
  ): Promise<StudentImportResult> {
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File danh sách học sinh tối đa 2MB.');
    }

    const rows = this.parseImportRows(file);
    const [headerRow, ...dataRows] = rows;

    if (!headerRow?.length) {
      throw new BadRequestException('File import chưa có dòng tiêu đề.');
    }

    const headers = this.resolveImportHeaders(headerRow);
    const createdStudents: StudentResponse[] = [];
    const errors: StudentImportError[] = [];
    let totalRows = 0;

    for (const [index, row] of dataRows.entries()) {
      const rowNumber = index + 2;

      if (row.every((cell) => !cell.trim())) {
        continue;
      }

      totalRows += 1;

      try {
        const dto = this.parseStudentImportRow(row, headers);
        const student = await this.create(teacherId, dto);
        createdStudents.push(this.toStudentResponse(student));
      } catch (error) {
        errors.push({
          message: this.getImportErrorMessage(error),
          row: rowNumber,
        });
      }
    }

    return {
      createdStudents,
      errors,
      failedCount: errors.length,
      successCount: createdStudents.length,
      totalRows,
    };
  }

  async update(teacherId: string, studentId: string, dto: UpdateStudentDto) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const studentObjectId = this.toObjectId(studentId, 'studentId');
    const updateSet: Record<string, unknown> = {};
    const updateUnset: Record<string, ''> = {};
    let existingStudent: StudentDocument | null = null;
    const getExistingStudent = async () => {
      existingStudent ??= await this.findByIdForTeacherOrThrow(
        teacherId,
        studentObjectId,
      );

      return existingStudent;
    };
    const shouldRebuildSearchText =
      dto.studentCode !== undefined ||
      dto.fullName !== undefined ||
      dto.gradeLevel !== undefined ||
      dto.phone !== undefined ||
      dto.parent !== undefined;

    if (dto.studentCode !== undefined) {
      const studentCode = dto.studentCode.trim();

      if (!studentCode) {
        throw new BadRequestException('Mã học sinh không được để trống.');
      }

      updateSet.studentCode = studentCode;
    }

    if (dto.fullName !== undefined) {
      const fullName = dto.fullName.trim();

      if (!fullName) {
        throw new BadRequestException('Họ tên học sinh không được để trống.');
      }

      updateSet.fullName = fullName;
    }

    if (dto.gender !== undefined) {
      updateSet.gender = dto.gender;
    }

    if (dto.avatarUrl !== undefined) {
      const avatarUrl = dto.avatarUrl.trim();

      if (avatarUrl) {
        updateSet.avatarUrl = avatarUrl;
      } else if (dto.gender) {
        updateSet.avatarUrl = this.resolveAvatarUrl(dto.gender);
      } else {
        updateUnset.avatarUrl = '';
      }
    } else if (dto.gender !== undefined) {
      const existingStudent = await getExistingStudent();

      if (!existingStudent.avatarUrl) {
        updateSet.avatarUrl = this.resolveAvatarUrl(dto.gender);
      }
    }

    if (dto.dateOfBirth !== undefined) {
      updateSet.dateOfBirth = dto.dateOfBirth
        ? new Date(dto.dateOfBirth)
        : undefined;
    }

    if (dto.gradeLevel !== undefined) {
      const gradeLevel = dto.gradeLevel.trim();

      if (gradeLevel) {
        updateSet.gradeLevel = gradeLevel;
      } else {
        updateUnset.gradeLevel = '';
      }
    }

    if (dto.phone !== undefined) {
      const phone = dto.phone.trim();

      if (phone) {
        updateSet.phone = phone;
      } else {
        updateUnset.phone = '';
      }
    }

    if (dto.parent !== undefined) {
      const parent = this.cleanParent(dto.parent);

      if (parent) {
        updateSet.parent = parent;
      } else {
        updateUnset.parent = '';
      }
    }

    if (dto.address !== undefined) {
      const address = dto.address.trim();

      if (address) {
        updateSet.address = address;
      } else {
        updateUnset.address = '';
      }
    }

    if (dto.note !== undefined) {
      const note = dto.note.trim();

      if (note) {
        updateSet.note = note;
      } else {
        updateUnset.note = '';
      }
    }

    if (dto.status !== undefined) {
      updateSet.status = dto.status;
    }

    if (shouldRebuildSearchText) {
      const student = await getExistingStudent();
      const parent =
        dto.parent !== undefined
          ? this.cleanParent(dto.parent)
          : student.parent;
      updateSet.searchText = this.buildStudentSearchText({
        fullName:
          dto.fullName !== undefined ? dto.fullName.trim() : student.fullName,
        gradeLevel:
          dto.gradeLevel !== undefined
            ? dto.gradeLevel.trim()
            : student.gradeLevel,
        parent,
        phone: dto.phone !== undefined ? dto.phone.trim() : student.phone,
        studentCode:
          dto.studentCode !== undefined
            ? dto.studentCode.trim()
            : student.studentCode,
      });
    }

    const update: {
      $set?: Record<string, unknown>;
      $unset?: Record<string, ''>;
    } = {};

    if (Object.keys(updateSet).length) {
      update.$set = updateSet;
    }

    if (Object.keys(updateUnset).length) {
      update.$unset = updateUnset;
    }

    if (!update.$set && !update.$unset) {
      return this.findByIdForTeacherOrThrow(teacherId, studentObjectId);
    }

    try {
      const student = await this.studentModel
        .findOneAndUpdate(
          {
            _id: studentObjectId,
            teacherId: teacherObjectId,
          },
          update,
          { returnDocument: 'after' },
        )
        .exec();

      if (!student) {
        throw new NotFoundException('Không tìm thấy học sinh.');
      }

      if (dto.status === StudentStatus.Inactive) {
        this.eventEmitter.emit('student.deactivated', {
          teacherId: teacherObjectId.toString(),
          studentId: studentObjectId.toString(),
        });
      }

      return student;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Mã học sinh đã tồn tại trong tài khoản giáo viên này.',
        );
      }

      throw error;
    }
  }

  async delete(
    teacherId: string,
    studentId: string,
    mode: DeleteStudentMode = DeleteStudentMode.Deactivate,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const studentObjectId = this.toObjectId(studentId, 'studentId');

    if (mode === DeleteStudentMode.Delete) {
      const deletedStudent = await this.studentModel
        .findOneAndDelete({
          _id: studentObjectId,
          teacherId: teacherObjectId,
        })
        .exec();

      if (!deletedStudent) {
        throw new NotFoundException('Không tìm thấy học sinh.');
      }

      this.eventEmitter.emit('student.deleted', {
        teacherId: teacherObjectId.toString(),
        studentId: studentObjectId.toString(),
      });

      return {
        message: 'Đã xóa vĩnh viễn hồ sơ học sinh.',
      };
    }

    const student = await this.studentModel
      .findOneAndUpdate(
        {
          _id: studentObjectId,
          teacherId: teacherObjectId,
        },
        {
          $set: {
            status: StudentStatus.Inactive,
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh.');
    }

    this.eventEmitter.emit('student.deactivated', {
      teacherId: teacherObjectId.toString(),
      studentId: studentObjectId.toString(),
    });

    return {
      message: 'Đã chuyển học sinh sang trạng thái tạm nghỉ.',
    };
  }

  async deleteMany(
    teacherId: string,
    studentIds: string[],
    mode: DeleteStudentMode,
  ): Promise<StudentBulkDeleteResult> {
    const uniqueStudentIds = [
      ...new Set(studentIds.map((studentId) => studentId.trim())),
    ];

    if (!uniqueStudentIds.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một học sinh.');
    }

    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const affectedStudents: StudentResponse[] = [];
    const errors: StudentBulkDeleteError[] = [];

    for (const studentId of uniqueStudentIds) {
      try {
        const studentObjectId = this.toObjectId(studentId, 'studentId');
        const student =
          mode === DeleteStudentMode.Delete
            ? await this.studentModel
                .findOneAndDelete({
                  _id: studentObjectId,
                  teacherId: teacherObjectId,
                })
                .exec()
            : await this.studentModel
                .findOneAndUpdate(
                  {
                    _id: studentObjectId,
                    teacherId: teacherObjectId,
                  },
                  {
                    $set: {
                      status: StudentStatus.Inactive,
                    },
                  },
                  { returnDocument: 'after' },
                )
                .exec();

        if (!student) {
          throw new NotFoundException('Không tìm thấy học sinh.');
        }

        affectedStudents.push(this.toStudentResponse(student));
        this.eventEmitter.emit(
          mode === DeleteStudentMode.Delete
            ? 'student.deleted'
            : 'student.deactivated',
          {
            teacherId: teacherObjectId.toString(),
            studentId: studentObjectId.toString(),
          },
        );
      } catch (error) {
        errors.push({
          message: this.getStudentOperationErrorMessage(error),
          studentId,
        });
      }
    }

    return {
      affectedStudents,
      errors,
      failedCount: errors.length,
      mode,
      successCount: affectedStudents.length,
      totalCount: uniqueStudentIds.length,
    };
  }

  async findByIdForTeacher(
    teacherId: string,
    studentId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    const query = this.studentModel.findOne({
      _id:
        studentId instanceof Types.ObjectId
          ? studentId
          : this.toObjectId(studentId, 'studentId'),
      teacherId: this.toObjectId(teacherId, 'teacherId'),
    });

    if (session) {
      query.session(session);
    }

    return query.exec();
  }

  async findByIdForTeacherOrThrow(
    teacherId: string,
    studentId: string | Types.ObjectId,
    session?: ClientSession,
  ) {
    const student = await this.findByIdForTeacher(
      teacherId,
      studentId,
      session,
    );

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh.');
    }

    return student;
  }

  toStudentResponse(student: StudentDocument): StudentResponse {
    return {
      id: student._id.toString(),
      teacherId: student.teacherId.toString(),
      studentCode: student.studentCode,
      fullName: student.fullName,
      avatarUrl: student.avatarUrl,
      dateOfBirth: student.dateOfBirth,
      gradeLevel: student.gradeLevel,
      gender: student.gender,
      phone: student.phone,
      parent: student.parent,
      address: student.address,
      note: student.note,
      status: student.status,
    };
  }

  private buildSort(query: QueryStudentsDto): Record<string, 1 | -1> {
    const direction = query.sortOrder === 'desc' ? -1 : 1;

    switch (query.sortBy) {
      case 'createdAt':
        return { createdAt: direction, fullName: 1 };
      case 'gradeLevel':
        return { gradeLevel: direction, fullName: 1, createdAt: -1 };
      case 'updatedAt':
        return { updatedAt: direction, fullName: 1 };
      case 'fullName':
      default:
        return { fullName: direction, createdAt: -1 };
    }
  }

  private decodeImportFile(file: StudentImportFile): string {
    const isZipBasedExcel =
      file.buffer.length >= 2 && file.buffer.subarray(0, 2).toString() === 'PK';
    const isOleExcel =
      file.buffer.length >= 4 &&
      file.buffer[0] === 0xd0 &&
      file.buffer[1] === 0xcf &&
      file.buffer[2] === 0x11 &&
      file.buffer[3] === 0xe0;

    if (isZipBasedExcel) {
      throw new BadRequestException('File XLSX cần được đọc bằng parser XLSX.');
    }

    if (isOleExcel) {
      throw new BadRequestException(
        'File .xls cũ không được hỗ trợ. Vui lòng tải lại mẫu .xlsx từ hệ thống rồi import.',
      );
    }

    const text = file.buffer.toString('utf8').replace(/^\uFEFF/, '');

    if (!text.trim()) {
      throw new BadRequestException('File import đang trống.');
    }

    return text;
  }

  private parseImportRows(file: StudentImportFile): string[][] {
    const isZipBasedExcel =
      file.buffer.length >= 2 && file.buffer.subarray(0, 2).toString() === 'PK';

    if (isZipBasedExcel) {
      return this.parseXlsxRows(file.buffer);
    }

    const text = this.decodeImportFile(file);
    const lowerText = text.trimStart().toLowerCase();

    if (lowerText.startsWith('<') || lowerText.includes('<table')) {
      return this.parseHtmlTableRows(text);
    }

    return this.parseDelimitedRows(text);
  }

  private parseXlsxRows(buffer: Buffer): string[][] {
    const entries = this.readZipEntries(buffer);
    const workbookXml = this.getZipText(entries, 'xl/workbook.xml');
    const relationshipsXml = this.getZipText(
      entries,
      'xl/_rels/workbook.xml.rels',
    );
    const worksheetPath =
      this.resolveFirstWorksheetPath(workbookXml, relationshipsXml) ??
      [...entries.keys()]
        .filter((fileName) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(fileName))
        .sort()[0];

    if (!worksheetPath) {
      throw new BadRequestException(
        'File XLSX không có sheet danh sách học sinh.',
      );
    }

    const worksheetXml = this.getZipText(entries, worksheetPath);
    const sharedStrings = this.parseSharedStrings(
      entries.get('xl/sharedStrings.xml')?.toString('utf8') ?? '',
    );
    const rows = this.parseXlsxWorksheetRows(worksheetXml, sharedStrings);

    if (!rows.length) {
      throw new BadRequestException('File import đang trống.');
    }

    return rows;
  }

  private resolveFirstWorksheetPath(
    workbookXml: string,
    relationshipsXml: string,
  ) {
    const sheetTag = workbookXml.match(/<sheet\b[^>]*>/i)?.[0];

    if (!sheetTag) {
      return undefined;
    }

    const sheetAttributes = this.parseXmlAttributes(sheetTag);
    const relationshipId =
      sheetAttributes.get('r:id') ?? sheetAttributes.get('id');

    if (!relationshipId) {
      return undefined;
    }

    const relationshipTags = this.collectRegexMatches(
      relationshipsXml,
      /<Relationship\b[^>]*\/?>/gi,
    );

    for (const relationshipTag of relationshipTags) {
      const relationshipAttributes = this.parseXmlAttributes(relationshipTag);

      if (relationshipAttributes.get('Id') !== relationshipId) {
        continue;
      }

      const target = relationshipAttributes.get('Target');

      if (!target) {
        return undefined;
      }

      const normalizedTarget = target.replace(/^\/+/, '').replace(/\\/g, '/');

      return normalizedTarget.startsWith('xl/')
        ? normalizedTarget
        : `xl/${normalizedTarget}`;
    }

    return undefined;
  }

  private parseSharedStrings(sharedStringsXml: string) {
    if (!sharedStringsXml.trim()) {
      return [];
    }

    return this.collectRegexMatches(
      sharedStringsXml,
      /<si\b[^>]*>[\s\S]*?<\/si>/gi,
    ).map((sharedStringXml) =>
      this.extractXmlTexts(sharedStringXml, 't').join(''),
    );
  }

  private parseXlsxWorksheetRows(
    worksheetXml: string,
    sharedStrings: string[],
  ): string[][] {
    const sheetDataXml =
      worksheetXml.match(/<sheetData\b[^>]*>[\s\S]*?<\/sheetData>/i)?.[0] ??
      worksheetXml;
    const rowMatches = this.collectRegexMatches(
      sheetDataXml,
      /<row\b[^>]*(?:\/>|>[\s\S]*?<\/row>)/gi,
    );
    const rows: string[][] = [];

    for (const rowXml of rowMatches) {
      const rowTag = rowXml.match(/^<row\b[^>]*>/i)?.[0] ?? '';
      const rowAttributes = this.parseXmlAttributes(rowTag);
      const rowNumber = Number(rowAttributes.get('r'));
      const rowIndex =
        Number.isInteger(rowNumber) && rowNumber > 0
          ? rowNumber - 1
          : rows.length;
      const cellMatches = this.collectRegexMatches(
        rowXml,
        /<c\b[^>]*(?:\/>|>[\s\S]*?<\/c>)/gi,
      );
      const row: string[] = [];
      let nextColumnIndex = 0;

      for (const cellXml of cellMatches) {
        const cellTag = cellXml.match(/^<c\b[^>]*>/i)?.[0] ?? '';
        const cellAttributes = this.parseXmlAttributes(cellTag);
        const reference = cellAttributes.get('r') ?? '';
        const columnIndex = reference
          ? this.columnReferenceToIndex(reference)
          : nextColumnIndex;

        row[columnIndex] = this.parseXlsxCellValue(
          cellXml,
          cellAttributes,
          sharedStrings,
        );
        nextColumnIndex = columnIndex + 1;
      }

      if (row.some((cell) => cell?.trim())) {
        rows[rowIndex] = row;
      }
    }

    return rows
      .filter((row): row is string[] => Array.isArray(row))
      .map((row) =>
        Array.from({ length: row.length }, (_, index) => row[index] ?? ''),
      );
  }

  private parseXlsxCellValue(
    cellXml: string,
    cellAttributes: Map<string, string>,
    sharedStrings: string[],
  ) {
    const cellType = cellAttributes.get('t');

    if (cellType === 's') {
      const sharedStringIndex = Number(this.extractFirstXmlText(cellXml, 'v'));

      return Number.isInteger(sharedStringIndex)
        ? (sharedStrings[sharedStringIndex] ?? '')
        : '';
    }

    if (cellType === 'inlineStr') {
      return this.extractXmlTexts(cellXml, 't').join('').trim();
    }

    return (
      this.extractFirstXmlText(cellXml, 'v') ??
      this.extractXmlTexts(cellXml, 't').join('')
    ).trim();
  }

  private parseHtmlTableRows(text: string): string[][] {
    const tableMatch = this.collectRegexMatches(
      text,
      /<table[\s\S]*?<\/table>/i,
    );
    const tableHtml = tableMatch?.[0] ?? text;
    const rowMatches = this.collectRegexMatches(
      tableHtml,
      /<tr[\s\S]*?<\/tr>/gi,
    );

    return rowMatches
      .map((rowHtml): string[] => {
        const cellMatches = this.collectRegexMatches(
          rowHtml,
          /<t[dh][\s\S]*?<\/t[dh]>/gi,
        );

        return cellMatches.map((cellHtml) =>
          this.decodeHtmlCell(
            cellHtml
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .trim(),
          ),
        );
      })
      .filter((row) => row.length > 0);
  }

  private collectRegexMatches(value: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(value)) !== null) {
      matches.push(match[0]);

      if (!regex.global) {
        break;
      }
    }

    return matches;
  }

  private parseDelimitedRows(text: string): string[][] {
    const delimiter = this.detectDelimiter(text);
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const nextChar = text[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }

        continue;
      }

      if (char === delimiter && !inQuotes) {
        row.push(cell.trim());
        cell = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';

        if (char === '\r' && nextChar === '\n') {
          index += 1;
        }

        continue;
      }

      cell += char;
    }

    if (cell.length || row.length) {
      row.push(cell.trim());
      rows.push(row);
    }

    return rows;
  }

  private detectDelimiter(text: string): string {
    const firstLine =
      text
        .split(/\r?\n/)
        .find((line) => line.trim().length > 0)
        ?.trim() ?? '';
    const candidates: Array<[string, number]> = [
      [',', this.countChar(firstLine, ',')],
      [';', this.countChar(firstLine, ';')],
      ['\t', this.countChar(firstLine, '\t')],
    ];
    const [delimiter, count] = candidates.sort((a, b) => b[1] - a[1])[0];

    return count > 0 ? delimiter : ',';
  }

  private countChar(value: string, needle: string): number {
    return value.split(needle).length - 1;
  }

  private resolveImportHeaders(
    headerRow: string[],
  ): Map<StudentImportColumn, number> {
    const aliases = new Map<string, StudentImportColumn>();
    const headers = new Map<StudentImportColumn, number>();

    for (const [column, columnAliases] of Object.entries(
      STUDENT_IMPORT_HEADER_ALIASES,
    ) as Array<[StudentImportColumn, string[]]>) {
      columnAliases.forEach((alias) => {
        aliases.set(this.normalizeImportHeader(alias), column);
      });
    }

    headerRow.forEach((header, index) => {
      const column = aliases.get(this.normalizeImportHeader(header));

      if (column && !headers.has(column)) {
        headers.set(column, index);
      }
    });

    if (!headers.has('fullName')) {
      throw new BadRequestException('File import thiếu cột "Họ tên học sinh".');
    }

    if (!headers.has('gender')) {
      throw new BadRequestException('File import thiếu cột "Giới tính".');
    }

    return headers;
  }

  private parseStudentImportRow(
    row: string[],
    headers: Map<StudentImportColumn, number>,
  ): ParsedStudentRow {
    const fullName = this.normalizeOptionalCell(
      this.getImportCell(row, headers, 'fullName'),
    );

    if (!fullName) {
      throw new BadRequestException('Họ tên học sinh không được để trống.');
    }

    const parent = this.cleanParent({
      fullName: this.getImportCell(row, headers, 'parentFullName'),
      note: this.getImportCell(row, headers, 'parentNote'),
      phone: this.getImportCell(row, headers, 'parentPhone'),
      relation: this.getImportCell(row, headers, 'parentRelation'),
    });
    const studentCode = this.normalizeOptionalCell(
      this.getImportCell(row, headers, 'studentCode'),
    );
    const gradeLevel = this.normalizeOptionalCell(
      this.getImportCell(row, headers, 'gradeLevel'),
    );
    const phone = this.normalizeOptionalCell(
      this.getImportCell(row, headers, 'phone'),
    );
    const address = this.normalizeOptionalCell(
      this.getImportCell(row, headers, 'address'),
    );
    const note = this.normalizeOptionalCell(
      this.getImportCell(row, headers, 'note'),
    );
    const avatarUrl = this.parseImportAvatarUrl(
      this.getImportCell(row, headers, 'avatarUrl'),
    );

    this.ensureMaxLength(fullName, 120, 'Họ tên học sinh');
    this.ensureMaxLength(studentCode, 40, 'Mã học sinh');
    this.ensureMaxLength(gradeLevel, 40, 'Lớp mấy');
    this.ensureMaxLength(phone, 24, 'Số điện thoại học sinh');
    this.ensureMaxLength(address, 300, 'Địa chỉ');
    this.ensureMaxLength(note, 500, 'Ghi chú');

    return {
      address,
      avatarUrl,
      dateOfBirth: this.parseImportDate(
        this.getImportCell(row, headers, 'dateOfBirth'),
      ),
      fullName,
      gender: this.parseImportGender(
        this.getImportCell(row, headers, 'gender'),
      ),
      gradeLevel,
      note,
      parent,
      phone,
      status: this.parseImportStudentStatus(
        this.getImportCell(row, headers, 'status'),
      ),
      studentCode,
    };
  }

  private getImportCell(
    row: string[],
    headers: Map<StudentImportColumn, number>,
    column: StudentImportColumn,
  ) {
    const index = headers.get(column);

    return index === undefined ? '' : (row[index] ?? '');
  }

  private parseImportGender(value: string) {
    const normalized = this.normalizeImportHeader(value);

    if (['nam', 'male', 'm'].includes(normalized)) {
      return Gender.Male;
    }

    if (['nu', 'female', 'f'].includes(normalized)) {
      return Gender.Female;
    }

    if (['khac', 'other'].includes(normalized)) {
      return Gender.Other;
    }

    throw new BadRequestException('Giới tính phải là Nam hoặc Nữ.');
  }

  private parseImportStudentStatus(value: string) {
    const normalized = this.normalizeImportHeader(value);

    if (!normalized || ['dang hoc', 'active', 'con hoc'].includes(normalized)) {
      return StudentStatus.Active;
    }

    if (['tam nghi', 'da nghi', 'nghi', 'inactive'].includes(normalized)) {
      return StudentStatus.Inactive;
    }

    throw new BadRequestException('Trạng thái phải là Đang học hoặc Tạm nghỉ.');
  }

  private parseImportAvatarUrl(value: string) {
    const avatarUrl = this.normalizeOptionalCell(value);

    if (!avatarUrl) {
      return undefined;
    }

    if (!/^https?:\/\//i.test(avatarUrl)) {
      throw new BadRequestException('URL ảnh đại diện phải bắt đầu bằng http.');
    }

    return avatarUrl;
  }

  private parseImportDate(value: string) {
    const rawValue = this.normalizeOptionalCell(value);

    if (!rawValue) {
      return undefined;
    }

    const serialValue = Number(rawValue);

    if (
      Number.isInteger(serialValue) &&
      serialValue >= 20000 &&
      serialValue <= 60000
    ) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      const date = new Date(excelEpoch + serialValue * 24 * 60 * 60 * 1000);

      return this.formatDateInput(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
      );
    }

    const isoMatch = rawValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (isoMatch) {
      const [, year, month, day] = isoMatch;

      return this.formatValidDate(Number(year), Number(month), Number(day));
    }

    const vietnameseMatch = rawValue.match(
      /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/,
    );

    if (vietnameseMatch) {
      const [, day, month, year] = vietnameseMatch;

      return this.formatValidDate(Number(year), Number(month), Number(day));
    }

    throw new BadRequestException(
      'Ngày sinh phải theo định dạng dd/mm/yyyy hoặc yyyy-mm-dd.',
    );
  }

  private formatValidDate(year: number, month: number, day: number) {
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      throw new BadRequestException('Ngày sinh không hợp lệ.');
    }

    return this.formatDateInput(year, month, day);
  }

  private formatDateInput(year: number, month: number, day: number) {
    return `${year.toString().padStart(4, '0')}-${month
      .toString()
      .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  private normalizeOptionalCell(value?: string) {
    const normalized = value?.trim();

    return normalized || undefined;
  }

  private normalizeImportHeader(value: string) {
    return normalizeSearchText(value)
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private ensureMaxLength(
    value: string | undefined,
    maxLength: number,
    label: string,
  ) {
    if (value && value.length > maxLength) {
      throw new BadRequestException(`${label} tối đa ${maxLength} ký tự.`);
    }
  }

  private getImportErrorMessage(error: unknown) {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException
    ) {
      const response = error.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object' && response !== null) {
        const message = (response as { message?: unknown }).message;

        if (Array.isArray(message)) {
          return message.join(', ');
        }

        if (typeof message === 'string') {
          return message;
        }
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Không thể tạo học sinh từ dòng này.';
  }

  private getStudentOperationErrorMessage(error: unknown) {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      const response = error.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object' && response !== null) {
        const message = (response as { message?: unknown }).message;

        if (Array.isArray(message)) {
          return message.join(', ');
        }

        if (typeof message === 'string') {
          return message;
        }
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Không thể xử lý học sinh này.';
  }

  private buildXlsxTemplate(rows: string[][]) {
    const files = [
      {
        fileName: '[Content_Types].xml',
        buffer: Buffer.from(this.buildXlsxContentTypesXml(), 'utf8'),
      },
      {
        fileName: '_rels/.rels',
        buffer: Buffer.from(this.buildXlsxRootRelationshipsXml(), 'utf8'),
      },
      {
        fileName: 'xl/workbook.xml',
        buffer: Buffer.from(this.buildXlsxWorkbookXml(), 'utf8'),
      },
      {
        fileName: 'xl/_rels/workbook.xml.rels',
        buffer: Buffer.from(this.buildXlsxWorkbookRelationshipsXml(), 'utf8'),
      },
      {
        fileName: 'xl/styles.xml',
        buffer: Buffer.from(this.buildXlsxStylesXml(), 'utf8'),
      },
      {
        fileName: 'xl/worksheets/sheet1.xml',
        buffer: Buffer.from(this.buildXlsxWorksheetXml(rows), 'utf8'),
      },
    ];

    return this.buildZipArchive(files);
  }

  private buildXlsxContentTypesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
  }

  private buildXlsxRootRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  }

  private buildXlsxWorkbookXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Danh sách học sinh" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
  }

  private buildXlsxWorkbookRelationshipsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  }

  private buildXlsxStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FF1E1B4B"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEEF2FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFC7D2FE"/></left>
      <right style="thin"><color rgb="FFC7D2FE"/></right>
      <top style="thin"><color rgb="FFC7D2FE"/></top>
      <bottom style="thin"><color rgb="FFC7D2FE"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="49" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1" quotePrefix="1"/>
    <xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyNumberFormat="1" quotePrefix="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  }

  private buildXlsxWorksheetXml(rows: string[][]) {
    const columnWidths = [24, 12, 12, 14, 16, 22, 16, 12, 24, 34, 16, 14];
    const cols = columnWidths
      .map(
        (width, index) =>
          `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
      )
      .join('');
    const sheetRows = rows
      .map((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        const styleId = rowIndex === 0 ? 1 : 2;
        const cells = row
          .map((cell, columnIndex) => {
            const reference = `${this.getColumnName(columnIndex)}${rowNumber}`;

            return `<c r="${reference}" s="${styleId}" t="inlineStr"><is><t>${this.escapeXml(cell)}</t></is></c>`;
          })
          .join('');

        return `<row r="${rowNumber}"${rowIndex === 0 ? ' ht="24" customHeight="1"' : ''}>${cells}</row>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${cols}</cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
  }

  private buildZipArchive(files: Array<{ buffer: Buffer; fileName: string }>) {
    const localParts: Buffer[] = [];
    const centralDirectoryParts: Buffer[] = [];
    let offset = 0;

    for (const file of files) {
      const fileNameBuffer = Buffer.from(file.fileName, 'utf8');
      const localHeaderOffset = offset;
      const size = file.buffer.length;
      const crc = this.crc32(file.buffer);
      const dosDateTime = this.toZipDosDateTime(new Date());
      const localHeader = Buffer.alloc(30);

      localHeader.writeUInt32LE(ZIP_LOCAL_FILE_HEADER_SIGNATURE, 0);
      localHeader.writeUInt16LE(ZIP_VERSION_NEEDED, 4);
      localHeader.writeUInt16LE(ZIP_UTF8_FLAG, 6);
      localHeader.writeUInt16LE(0, 8);
      localHeader.writeUInt16LE(dosDateTime.time, 10);
      localHeader.writeUInt16LE(dosDateTime.date, 12);
      localHeader.writeUInt32LE(crc, 14);
      localHeader.writeUInt32LE(size, 18);
      localHeader.writeUInt32LE(size, 22);
      localHeader.writeUInt16LE(fileNameBuffer.length, 26);
      localHeader.writeUInt16LE(0, 28);

      localParts.push(localHeader, fileNameBuffer, file.buffer);
      offset += localHeader.length + fileNameBuffer.length + file.buffer.length;

      const centralDirectoryHeader = Buffer.alloc(46);
      centralDirectoryHeader.writeUInt32LE(ZIP_CENTRAL_DIRECTORY_SIGNATURE, 0);
      centralDirectoryHeader.writeUInt16LE(ZIP_VERSION_NEEDED, 4);
      centralDirectoryHeader.writeUInt16LE(ZIP_VERSION_NEEDED, 6);
      centralDirectoryHeader.writeUInt16LE(ZIP_UTF8_FLAG, 8);
      centralDirectoryHeader.writeUInt16LE(0, 10);
      centralDirectoryHeader.writeUInt16LE(dosDateTime.time, 12);
      centralDirectoryHeader.writeUInt16LE(dosDateTime.date, 14);
      centralDirectoryHeader.writeUInt32LE(crc, 16);
      centralDirectoryHeader.writeUInt32LE(size, 20);
      centralDirectoryHeader.writeUInt32LE(size, 24);
      centralDirectoryHeader.writeUInt16LE(fileNameBuffer.length, 28);
      centralDirectoryHeader.writeUInt16LE(0, 30);
      centralDirectoryHeader.writeUInt16LE(0, 32);
      centralDirectoryHeader.writeUInt16LE(0, 34);
      centralDirectoryHeader.writeUInt16LE(0, 36);
      centralDirectoryHeader.writeUInt32LE(0, 38);
      centralDirectoryHeader.writeUInt32LE(localHeaderOffset, 42);

      centralDirectoryParts.push(centralDirectoryHeader, fileNameBuffer);
    }

    const centralDirectoryOffset = offset;
    const centralDirectorySize = centralDirectoryParts.reduce(
      (sum, part) => sum + part.length,
      0,
    );
    const endRecord = Buffer.alloc(22);

    endRecord.writeUInt32LE(ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(files.length, 8);
    endRecord.writeUInt16LE(files.length, 10);
    endRecord.writeUInt32LE(centralDirectorySize, 12);
    endRecord.writeUInt32LE(centralDirectoryOffset, 16);
    endRecord.writeUInt16LE(0, 20);

    return Buffer.concat([...localParts, ...centralDirectoryParts, endRecord]);
  }

  private readZipEntries(buffer: Buffer): ZipEntryMap {
    const endRecordOffset = this.findZipEndOfCentralDirectory(buffer);
    const entryCount = buffer.readUInt16LE(endRecordOffset + 10);
    const centralDirectoryOffset = buffer.readUInt32LE(endRecordOffset + 16);
    const entries: ZipEntryMap = new Map();
    let offset = centralDirectoryOffset;

    for (let index = 0; index < entryCount; index += 1) {
      if (buffer.readUInt32LE(offset) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
        throw new BadRequestException('File XLSX không hợp lệ.');
      }

      const compressionMethod = buffer.readUInt16LE(offset + 10);
      const compressedSize = buffer.readUInt32LE(offset + 20);
      const fileNameLength = buffer.readUInt16LE(offset + 28);
      const extraLength = buffer.readUInt16LE(offset + 30);
      const commentLength = buffer.readUInt16LE(offset + 32);
      const localHeaderOffset = buffer.readUInt32LE(offset + 42);
      const fileName = buffer
        .subarray(offset + 46, offset + 46 + fileNameLength)
        .toString('utf8')
        .replace(/\\/g, '/');

      if (
        localHeaderOffset < 0 ||
        localHeaderOffset + 30 > buffer.length ||
        buffer.readUInt32LE(localHeaderOffset) !==
          ZIP_LOCAL_FILE_HEADER_SIGNATURE
      ) {
        throw new BadRequestException('File XLSX không hợp lệ.');
      }

      const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart =
        localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const compressedData = buffer.subarray(
        dataStart,
        dataStart + compressedSize,
      );
      const entryBuffer =
        compressionMethod === 0
          ? compressedData
          : compressionMethod === 8
            ? inflateRawSync(compressedData)
            : undefined;

      if (!entryBuffer) {
        throw new BadRequestException(
          'File XLSX dùng kiểu nén chưa được hỗ trợ.',
        );
      }

      entries.set(fileName, entryBuffer);
      offset += 46 + fileNameLength + extraLength + commentLength;
    }

    return entries;
  }

  private findZipEndOfCentralDirectory(buffer: Buffer) {
    const minOffset = Math.max(0, buffer.length - 0xffff - 22);

    for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
      if (
        buffer.readUInt32LE(offset) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE
      ) {
        return offset;
      }
    }

    throw new BadRequestException('File XLSX không hợp lệ.');
  }

  private getZipText(entries: ZipEntryMap, fileName: string) {
    const entry = entries.get(fileName);

    if (!entry) {
      throw new BadRequestException('File XLSX thiếu dữ liệu bắt buộc.');
    }

    return entry.toString('utf8');
  }

  private parseXmlAttributes(tag: string) {
    const attributes = new Map<string, string>();
    const regex = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(tag)) !== null) {
      attributes.set(match[1], this.decodeXmlText(match[2] ?? match[3] ?? ''));
    }

    return attributes;
  }

  private extractFirstXmlText(xml: string, tagName: string) {
    return this.extractXmlTexts(xml, tagName)[0];
  }

  private extractXmlTexts(xml: string, tagName: string) {
    const regex = new RegExp(
      `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
      'gi',
    );
    const values: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(xml)) !== null) {
      values.push(this.decodeXmlText(match[1] ?? ''));
    }

    return values;
  }

  private columnReferenceToIndex(reference: string) {
    const column = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase();

    if (!column) {
      return 0;
    }

    return (
      column
        .split('')
        .reduce(
          (index, character) => index * 26 + character.charCodeAt(0) - 64,
          0,
        ) - 1
    );
  }

  private getColumnName(index: number) {
    let value = index + 1;
    let name = '';

    while (value > 0) {
      const remainder = (value - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      value = Math.floor((value - 1) / 26);
    }

    return name;
  }

  private toZipDosDateTime(value: Date) {
    const source = Number.isNaN(value.getTime()) ? new Date() : value;
    const year = Math.max(1980, source.getFullYear());
    const month = source.getMonth() + 1;
    const day = source.getDate();
    const hours = source.getHours();
    const minutes = source.getMinutes();
    const seconds = Math.floor(source.getSeconds() / 2);

    return {
      date: ((year - 1980) << 9) | (month << 5) | day,
      time: (hours << 11) | (minutes << 5) | seconds,
    };
  }

  private crc32(buffer: Buffer) {
    let crc = 0xffffffff;

    for (const byte of buffer) {
      crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff];
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private decodeXmlText(value: string) {
    return value
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&#(\d+);/g, (_, code: string) =>
        String.fromCodePoint(Number(code)),
      )
      .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
        String.fromCodePoint(Number.parseInt(code, 16)),
      );
  }

  private decodeHtmlCell(value: string) {
    return this.decodeXmlText(value).trim();
  }

  private buildStudentSearchText(student: StudentSearchInput) {
    return normalizeSearchText(
      [
        student.fullName,
        student.studentCode,
        student.gradeLevel,
        student.phone,
        student.parent?.fullName,
        student.parent?.phone,
      ]
        .filter(Boolean)
        .join(' '),
    );
  }

  private resolveAvatarUrl(gender: Gender, avatarUrl?: string) {
    if (avatarUrl?.trim()) {
      return avatarUrl.trim();
    }

    return gender === Gender.Female
      ? DEFAULT_GIRL_AVATAR_URL
      : DEFAULT_BOY_AVATAR_URL;
  }

  private cleanParent(parent?: CreateStudentDto['parent']) {
    if (!parent) {
      return undefined;
    }

    const cleanParent = {
      fullName: parent.fullName?.trim() || undefined,
      phone: parent.phone?.trim() || undefined,
      relation: parent.relation?.trim() || undefined,
      note: parent.note?.trim() || undefined,
    };

    return Object.values(cleanParent).some(Boolean) ? cleanParent : undefined;
  }

  private generateStudentCode() {
    return `HS-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
  }

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    }

    return new Types.ObjectId(value);
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }
}
