import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EnrollmentStatus } from '../../school-management/enums';
import {
  ClassEnrollment,
  ClassEnrollmentDocument,
} from '../../school-management/schemas/class-enrollment.schema';

@Injectable()
export class ClassEnrollmentListener {
  constructor(
    @InjectModel(ClassEnrollment.name)
    private readonly enrollmentModel: Model<ClassEnrollmentDocument>,
  ) {}

  @OnEvent('student.deleted')
  async handleStudentDeletedEvent(payload: {
    teacherId: string;
    studentId: string;
  }) {
    await this.enrollmentModel
      .deleteMany({
        teacherId: new Types.ObjectId(payload.teacherId),
        studentId: new Types.ObjectId(payload.studentId),
      })
      .exec();
  }

  @OnEvent('student.deactivated')
  async handleStudentDeactivatedEvent(payload: {
    teacherId: string;
    studentId: string;
  }) {
    await this.enrollmentModel
      .updateMany(
        {
          teacherId: new Types.ObjectId(payload.teacherId),
          studentId: new Types.ObjectId(payload.studentId),
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
}
