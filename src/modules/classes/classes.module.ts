import { Module } from '@nestjs/common';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { StudentsModule } from '../students/students.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [SchoolManagementModule, StudentsModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
