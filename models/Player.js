import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sport: { type: String, required: true },
    academy: { type: String, default: 'Dumka Sports Academy' },
    contact: { type: String, default: '' },
    position: { type: String, default: '' },
    jerseyNumber: { type: String, default: '' },
    fitnessScore: { type: Number, default: 80, min: 0, max: 100 },
    coachNotes: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);

