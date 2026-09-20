import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum InvoiceTemplateType {
  System = 'SYSTEM',
  Custom = 'CUSTOM',
}

export enum InvoiceTemplateStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
}

@Schema({
  collection: 'invoice_templates',
  timestamps: true,
  versionKey: false,
})
export class InvoiceTemplate {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    index: true,
  })
  teacherId?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({
    enum: InvoiceTemplateType,
    required: true,
    index: true,
  })
  type: InvoiceTemplateType;

  @Prop({ default: 1, min: 1 })
  version: number;

  @Prop({ required: true, trim: true, maxlength: 80 })
  basedOnVersion: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  editorData: Record<string, unknown>;

  @Prop({ required: true })
  html: string;

  @Prop({ default: '' })
  css: string;

  @Prop({ trim: true, maxlength: 500 })
  thumbnailUrl?: string;

  @Prop({ default: false, index: true })
  isDefault: boolean;

  @Prop({
    enum: InvoiceTemplateStatus,
    default: InvoiceTemplateStatus.Active,
    index: true,
  })
  status: InvoiceTemplateStatus;

  createdAt?: Date;

  updatedAt?: Date;
}

export type InvoiceTemplateDocument = HydratedDocument<InvoiceTemplate>;
export const InvoiceTemplateSchema =
  SchemaFactory.createForClass(InvoiceTemplate);

InvoiceTemplateSchema.index({ type: 1, basedOnVersion: 1, status: 1 });
InvoiceTemplateSchema.index({ teacherId: 1, status: 1, updatedAt: -1 });
InvoiceTemplateSchema.index(
  { teacherId: 1, isDefault: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      teacherId: { $exists: true },
      isDefault: true,
      status: InvoiceTemplateStatus.Active,
    },
  },
);
