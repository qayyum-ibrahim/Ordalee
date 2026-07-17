import { Schema, model, Document, Types } from 'mongoose';

export type PaymentMethod = 'cash' | 'transfer' | 'pos' | 'other';
export type ReceiptStatus = 'completed' | 'void';
export type DiscountType = 'flat' | 'percentage';

export interface IReceiptItem {
  name: string;
  quantity: number;
  unitPriceMinor: number; // integers in kobo, never a float
  subtotalMinor: number;
}

export interface IReceipt extends Document {
  businessId: Types.ObjectId;
  clientReceiptId: string; // UUID, generated client-side at save time — the offline sync idempotency key
  receiptNumber: string; // e.g. "RCPT-000001", unique per business
  customerName?: string;
  items: IReceiptItem[];
  subtotalMinor: number;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmountMinor: number;
  taxPercentage: number; // snapshotted from Business.taxPercentage at creation
  taxAmountMinor: number;
  totalMinor: number;
  notes?: string;
  paymentMethod: PaymentMethod; // how the already-completed sale was settled — not a payment processor
  status: ReceiptStatus;
  createdOffline: boolean;
  voidedAt?: Date;
  clientCreatedAt: Date; // when the user actually made the sale, per their device clock
  createdAt: Date;
  updatedAt: Date;
}

const receiptItemSchema = new Schema<IReceiptItem>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceMinor: { type: Number, required: true, min: 0 },
    subtotalMinor: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const receiptSchema = new Schema<IReceipt>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    clientReceiptId: { type: String, required: true },
    receiptNumber: { type: String, required: true },
    customerName: { type: String, trim: true },
    items: {
      type: [receiptItemSchema],
      required: true,
      validate: {
        validator: (v: IReceiptItem[]) => Array.isArray(v) && v.length > 0,
        message: 'A receipt must have at least one item.',
      },
    },
    subtotalMinor: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['flat', 'percentage'] },
    discountValue: { type: Number, min: 0 },
    discountAmountMinor: { type: Number, required: true, default: 0, min: 0 },
    taxPercentage: { type: Number, required: true, default: 0 },
    taxAmountMinor: { type: Number, required: true, default: 0, min: 0 },
    totalMinor: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'pos', 'other'],
      default: 'cash',
      required: true,
    },
    status: { type: String, enum: ['completed', 'void'], default: 'completed', required: true },
    createdOffline: { type: Boolean, default: false },
    voidedAt: { type: Date },
    clientCreatedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

receiptSchema.index({ businessId: 1, receiptNumber: 1 }, { unique: true });
receiptSchema.index({ businessId: 1, clientReceiptId: 1 }, { unique: true });
receiptSchema.index({ businessId: 1, clientCreatedAt: -1 });

export const Receipt = model<IReceipt>('Receipt', receiptSchema);