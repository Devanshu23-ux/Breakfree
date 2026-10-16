import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  username: string;
  passwordHash: string;
  habit: string;
  customHabit?: string;
  quitStartTime: Date;
  points: number;
  streak: number;
  lastCheckin?: Date;
  moneySavedPerDay: number;
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name:             { type: String, required: true, trim: true, maxlength: 50 },
    username:         { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 30 },
    passwordHash:     { type: String, required: true },
    habit:            { type: String, required: true, enum: ['smoking', 'alcohol', 'custom'] },
    customHabit:      { type: String, trim: true, maxlength: 100 },
    quitStartTime:    { type: Date, required: true },
    points:           { type: Number, default: 0, min: 0 },
    streak:           { type: Number, default: 0, min: 0 },
    lastCheckin:      { type: Date, default: null },
    moneySavedPerDay: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Prevent model re-compilation during Next.js hot-reload
const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema);

export default User;
