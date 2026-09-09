import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ _id: false, versionKey: false })
export class AiChatMessage {
  @Prop({ required: true, enum: ['user', 'ai'] })
  role: 'user' | 'ai';

  @Prop({ required: true })
  text: string;

  @Prop({ type: Date, default: () => new Date() })
  timestamp: Date;
}

export const AiChatMessageSchema = SchemaFactory.createForClass(AiChatMessage);

@Schema({
  collection: 'ai_sessions',
  timestamps: true,
  versionKey: false,
})
export class AiSession {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  scheduleContext: string;

  @Prop({ type: [AiChatMessageSchema], default: [] })
  messages: AiChatMessage[];

  @Prop({ type: Date, default: () => new Date() })
  lastActivityAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type AiSessionDocument = HydratedDocument<AiSession>;
export const AiSessionSchema = SchemaFactory.createForClass(AiSession);

AiSessionSchema.index({ teacherId: 1, createdAt: -1 });
AiSessionSchema.index({ lastActivityAt: 1 });
