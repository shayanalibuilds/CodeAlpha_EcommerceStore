import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    priceCents: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    address: { type: addressSchema, required: true },
    // Mock payments only: card / upi / cash. No real payment SDK anywhere.
    paymentMethod: { type: String, enum: ['card', 'upi', 'cash'], required: true },
    status: {
      type: String,
      enum: ['placed', 'packed', 'shipped', 'cancelled'],
      default: 'placed',
      index: true,
    },
    totalCents: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
