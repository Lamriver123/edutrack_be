import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'invoice_images', timestamps: true, versionKey: false })
export class InvoiceImage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true, maxlength: 180 })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, unique: true })
  publicId: string;

  @Prop({ required: true, enum: ['image/png', 'image/jpeg', 'image/webp'] })
  mimeType: string;

  @Prop({ required: true, min: 1 })
  size: number;

  @Prop({ min: 1 })
  width?: number;

  @Prop({ min: 1 })
  height?: number;

  @Prop({ type: Date, default: null })
  archivedAt: Date | null;

  createdAt: Date;
}

export type InvoiceImageDocument = HydratedDocument<InvoiceImage>;
export const InvoiceImageSchema = SchemaFactory.createForClass(InvoiceImage);
InvoiceImageSchema.index({ teacherId: 1, archivedAt: 1, _id: -1 });
