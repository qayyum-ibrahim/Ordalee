import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
  ownerId: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  currency: string; // ISO 4217, e.g. "NGN"
  receiptPrefix: string;
  taxPercentage: number; // flat %, not a tax-management module
  // Incremented atomically (next milestone) to generate receipt numbers.
  // Never write to this field directly anywhere else.
  receiptSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    logoUrl: { type: String },
    currency: { type: String, default: 'NGN' },
    receiptPrefix: { type: String, default: 'RCPT', trim: true, uppercase: true },
    taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
    receiptSequence: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Business = model<IBusiness>('Business', businessSchema);