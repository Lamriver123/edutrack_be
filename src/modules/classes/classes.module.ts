import { Module } from '@nestjs/common';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { StudentsModule } from '../students/students.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassEnrollmentListener } from './listeners/class-enrollment.listener';

@Module({
  imports: [
    SchoolManagementModule,
    StudentsModule,
    SchedulesModule,
    CloudinaryModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService, ClassEnrollmentListener],
  exports: [ClassesService],
})
export class ClassesModule {}
