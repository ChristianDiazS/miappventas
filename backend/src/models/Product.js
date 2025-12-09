import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: ['Laptops', 'Monitores', 'Accesorios', 'Periféricos', 'Mobiliario']
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    images: [
      {
        url: String,
        alt: String
      }
    ],
    features: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
