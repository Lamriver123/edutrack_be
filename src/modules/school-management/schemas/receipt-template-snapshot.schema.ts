import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class ReceiptTemplateSnapshot {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  version: number;

  @Prop({ required: true })
  revision: string;

  @Prop({ required: true })
  html: string;

  @Prop({ default: '' })
  css: string;
}

export const ReceiptTemplateSnapshotSchema = SchemaFactory.createForClass(
  ReceiptTemplateSnapshot,
);
