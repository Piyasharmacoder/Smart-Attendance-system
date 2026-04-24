import mongoose from 'mongoose';

const overtimeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  date: String,

  hours: Number,

  reason: String,

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }

}, { timestamps: true });

export default mongoose.model('Overtime', overtimeSchema);