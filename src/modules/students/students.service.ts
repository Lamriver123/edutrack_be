import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { ClientSession, Model, Types } from 'mongoose';
import {
  EnrollmentStatus,
  Gender,
  StudentStatus,
} from '../school-management/enums';
import {
  ClassEnrollment,
  ClassEnrollmentDocument,
} from '../school-management/schemas/class-enrollment.schema';
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

export type StudentResponse = {
  id: string;
  teacherId: string;
  studentCode: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
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

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(ClassEnrollment.name)
    private readonly enrollmentModel: Model<ClassEnrollmentDocument>,
  ) {}

  async create(
    teacherId: string,
    dto: CreateStudentDto,
    session?: ClientSession,
  ) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const studentCode = dto.studentCode?.trim() || this.generateStudentCode();
    const fullName = dto.fullName.trim();

    try {
      const [student] = await this.studentModel.create(
        [
          {
            teacherId: teacherObjectId,
            studentCode,
            fullName,
            avatarUrl: this.resolveAvatarUrl(dto.gender, dto.avatarUrl),
            searchText: normalizeSearchText(fullName),
            dateOfBirth: dto.dateOfBirth
              ? new Date(dto.dateOfBirth)
              : undefined,
            gender: dto.gender,
            phone: dto.phone?.trim(),
            parent: dto.parent,
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
    const filter: {
      teacherId: Types.ObjectId;
      status?: StudentStatus;
      searchText?: {
        $regex: string;
        $options: string;
      };
    } = {
      teacherId: this.toObjectId(teacherId, 'teacherId'),
    };

    if (query.status) {
      filter.status = query.status;
    }

    const search = normalizeSearchText(query.search ?? '');

    if (search) {
      filter.searchText = {
        $regex: escapeRegex(search),
        $options: 'i',
      };
    }

    const students = await this.studentModel
      .find(filter)
      .sort({ fullName: 1, createdAt: -1 })
      .limit(query.limit ?? 20)
      .exec();

    return students.map((student) => this.toStudentResponse(student));
  }

  async update(teacherId: string, studentId: string, dto: UpdateStudentDto) {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const studentObjectId = this.toObjectId(studentId, 'studentId');
    const updateSet: Record<string, unknown> = {};
    const updateUnset: Record<string, ''> = {};

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
      updateSet.searchText = normalizeSearchText(fullName);
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
      const existingStudent = await this.findByIdForTeacherOrThrow(
        teacherId,
        studentObjectId,
      );

      if (!existingStudent.avatarUrl) {
        updateSet.avatarUrl = this.resolveAvatarUrl(dto.gender);
      }
    }

    if (dto.dateOfBirth !== undefined) {
      updateSet.dateOfBirth = dto.dateOfBirth
        ? new Date(dto.dateOfBirth)
        : undefined;
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
          { new: true },
        )
        .exec();

      if (!student) {
        throw new NotFoundException('Không tìm thấy học sinh.');
      }

      if (dto.status === StudentStatus.Inactive) {
        await this.deactivateStudentEnrollments(
          teacherObjectId,
          studentObjectId,
        );
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

      await this.enrollmentModel
        .deleteMany({
          teacherId: teacherObjectId,
          studentId: studentObjectId,
        })
        .exec();

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
        { new: true },
      )
      .exec();

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh.');
    }

    await this.deactivateStudentEnrollments(teacherObjectId, studentObjectId);

    return {
      message: 'Đã chuyển học sinh sang trạng thái tạm nghỉ.',
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
      gender: student.gender,
      phone: student.phone,
      parent: student.parent,
      address: student.address,
      note: student.note,
      status: student.status,
    };
  }

  private resolveAvatarUrl(gender: Gender, avatarUrl?: string) {
    if (avatarUrl?.trim()) {
      return avatarUrl.trim();
    }

    return gender === Gender.Female
      ? DEFAULT_GIRL_AVATAR_URL
      : DEFAULT_BOY_AVATAR_URL;
  }

  private cleanParent(parent: UpdateStudentDto['parent']) {
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

  private deactivateStudentEnrollments(
    teacherId: Types.ObjectId,
    studentId: Types.ObjectId,
  ) {
    return this.enrollmentModel
      .updateMany(
        {
          teacherId,
          studentId,
          status: EnrollmentStatus.Active,
        },
        {
          $set: {
            status: EnrollmentStatus.Inactive,
            leftAt: new Date(),
          },
        },
      )
      .exec();
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
