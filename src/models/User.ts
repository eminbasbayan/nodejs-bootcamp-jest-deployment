import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'İsim alanı zorunludur'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email alanı zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      min: [0, "Yaş 0'dan küçük olamaz"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
