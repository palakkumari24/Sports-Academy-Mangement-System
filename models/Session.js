import mongoose from 'mongoose';

const AttendanceRecordSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    playerName: { type: String, required: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Excused', 'Late'],
      default: 'Present',
    },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    sport: { type: String, required: true },
    sessionType: { type: String, default: 'Practice' },
    academy: { type: String, default: 'Dumka Sports Academy' },
    focusArea: { type: String, default: 'General Skills & Conditioning' },
    attendance: [AttendanceRecordSchema],
    totalPlayers: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);

