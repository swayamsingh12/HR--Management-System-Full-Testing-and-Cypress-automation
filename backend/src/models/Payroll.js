import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  salary: {
    basic: Number,
    hra: Number,
    allowances: Number,
    gross: Number
  },
  deductions: {
    tax: Number,
    providentFund: Number,
    other: Number,
    total: Number
  },
  netSalary: {
    type: Number,
    required: true
  },
  workingDays: Number,
  presentDays: Number,
  leaveDays: Number,
  status: {
    type: String,
    enum: ['draft', 'generated', 'paid'],
    default: 'generated'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

payrollSchema.index({ employee: 1, month: 1, year: 1 });

export default mongoose.model('Payroll', payrollSchema);

