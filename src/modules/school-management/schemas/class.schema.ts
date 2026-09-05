import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ClassStatus } from '../enums';

const integerMoneyValidator = {
  validator: Number.isInteger,
  message: 'Money amount must be stored as an integer VND value',
};

@Schema({
  collection: 'classes',
  timestamps: true,
  versionKey: false,
})
export class Class {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, select: false })
  searchText: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  imageUrl?: string;

  @Prop({ default: 0, min: 0, max: 7 })
  colorIndex: number;

  @Prop({
    trim: true,
    lowercase: true,
    match: /^#([0-9a-f]{6})$/,
  })
  colorHex?: string;

  @Prop({ required: true, min: 0, validate: integerMoneyValidator })
  regularPrice: number;

  @Prop({ required: true, min: 0, validate: integerMoneyValidator })
  makeupPrice: number;

  @Prop({
    enum: ClassStatus,
    default: ClassStatus.Active,
    index: true,
  })
  status: ClassStatus;
}

export type ClassDocument = HydratedDocument<Class>;
export const ClassSchema = SchemaFactory.createForClass(Class);

ClassSchema.index({ teacherId: 1, status: 1 });
ClassSchema.index({ teacherId: 1, name: 1 });
ClassSchema.index({ teacherId: 1, searchText: 1 });
ClassSchema.index({ teacherId: 1, colorIndex: 1 });
ClassSchema.index({ teacherId: 1, colorHex: 1 });
