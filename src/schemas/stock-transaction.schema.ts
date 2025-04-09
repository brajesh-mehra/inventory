import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StockTransaction extends Document {

  @Prop({ required: true })
  companyName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'StockManagement', required: true })
  stockItemId: Types.ObjectId;

  @Prop({ required: true, enum: ['IN', 'OUT'] })
  type: 'IN' | 'OUT';

  @Prop({ required: true })
  quantity: number;

  // @Prop({ required: true })
  // date: Date;

  @Prop({ type: String, required: false })
  invoiceAttachment?: string;
}

const StockTransactionSchema = SchemaFactory.createForClass(StockTransaction);

StockTransactionSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export { StockTransactionSchema };