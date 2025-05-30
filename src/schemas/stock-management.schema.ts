import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockManagement extends Document {

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  itemCode: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

const StockManagementSchema = SchemaFactory.createForClass(StockManagement);

StockManagementSchema.pre(/^find/, function (next) {
  if (this instanceof mongoose.Query) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

StockManagementSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.isActive;
    delete ret.isDeleted;
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  }
});

export { StockManagementSchema };