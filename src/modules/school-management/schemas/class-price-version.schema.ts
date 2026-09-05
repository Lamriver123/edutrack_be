import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Class } from './class.schema';

const integerMoneyValidator = {
  validator: Number.isInteger,
  message: 'Money amount must be stored as an integer VND value',
};

@Schema({
  collection: 'class_price_versions',
  timestamps: true,
  versionKey: false,
})
export class ClassPriceVersion {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    required: true,
    index: true,
  })
  classId: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  effectiveFrom: Date;

  @Prop({ required: true, min: 0, validate: integerMoneyValidator })
  regularPrice: number;

  @Prop({ required: true, min: 0, validate: integerMoneyValidator })
  makeupPrice: number;
}

export type ClassPriceVersionDocument = HydratedDocument<ClassPriceVersion>;
export const ClassPriceVersionSchema =
  SchemaFactory.createForClass(ClassPriceVersion);

ClassPriceVersionSchema.index(
  { teacherId: 1, classId: 1, effectiveFrom: 1 },
  { unique: true },
);
ClassPriceVersionSchema.index({
  teacherId: 1,
  classId: 1,
  effectiveFrom: -1,
});
