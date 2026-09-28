import mongoose from 'mongoose';

export const CATEGORIES = ['books', 'stationery', 'bags', 'audio', 'desk'];

const integer = {
  validator: Number.isInteger,
  message: '{VALUE} must be a whole number',
};

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    priceCents: {
      type: Number,
      required: true,
      min: [1, 'Price must be at least 1 cent'],
      validate: integer,
    },
    category: { type: String, required: true, enum: CATEGORIES, lowercase: true, index: true },
    imageUrl: { type: String, default: '', maxlength: 500 },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      validate: integer,
    },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Public shape — explicit fields, no internals leaked.
export function toPublicProduct(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    priceCents: doc.priceCents,
    category: doc.category,
    imageUrl: doc.imageUrl,
    stock: doc.stock,
    archived: doc.archived,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export default mongoose.model('Product', productSchema);
