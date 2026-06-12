import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  punchIn: {
    time: Date,
    location: String
  },
  punchOut: {
    time: Date,
    location: String
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'incomplete'],
    default: 'absent'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  isRegularized: {
    type: Boolean,
    default: false
  },
  regularizationReason: String,
  notes: String
}, {
  timestamps: true
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function(next) {
  if (this.punchIn?.time && this.punchOut?.time) {
    const hours = (this.punchOut.time - this.punchIn.time) / (1000 * 60 * 60);
    this.workingHours = Math.round(hours * 100) / 100;
    
    // Determine status based on punch-in time (assuming 9 AM is standard)
    const punchInHour = new Date(this.punchIn.time).getHours();
    if (punchInHour > 9) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  }
  next();
});

export default mongoose.model('Attendance', attendanceSchema);

