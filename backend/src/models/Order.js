import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        subtotal: Number
      }
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      street: String,
      district: String,
      province: String,
      department: String,
      postalCode: String
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express'],
      default: 'standard'
    },
    subtotal: Number,
    tax: Number,
    shippingCost: Number,
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    notes: String
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
