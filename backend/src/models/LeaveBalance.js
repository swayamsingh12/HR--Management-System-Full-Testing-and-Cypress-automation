import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  annual: {
    total: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 12 }
  },
  casual: {
    total: { type: Number, default: 6 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 6 }
  },
  sick: {
    total: { type: Number, default: 6 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 6 }
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  }
}, {
  timestamps: true
});

leaveBalanceSchema.pre('save', function(next) {
  this.annual.remaining = this.annual.total - this.annual.used;
  this.casual.remaining = this.casual.total - this.casual.used;
  this.sick.remaining = this.sick.total - this.sick.used;
  next();
});

export default mongoose.model('LeaveBalance', leaveBalanceSchema);

