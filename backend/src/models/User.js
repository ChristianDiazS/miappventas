import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      required: true
    },
    addresses: [
      {
        label: String,
        street: String,
        district: String,
        province: String,
        department: String,
        postalCode: String,
        isDefault: Boolean
      }
    ],
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Verificar que password es una cadena válida
    if (!this.password || typeof this.password !== 'string') {
      throw new Error('Password must be a string');
    }
    
    // No hashear si ya está hasheado (comienza con $2a, $2b, $2x, $2y)
    if (this.password.startsWith('$2')) {
      return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
