import mongoose from 'mongoose';

const PlayerMatchPerformanceSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    playerName: { type: String, required: true },
    played: { type: Boolean, default: true },
    score: { type: Number, default: 0 }, // goals, runs, points
    assistsOrWickets: { type: Number, default: 0 }, // assists, wickets, blocks
    performanceRating: { type: Number, default: 7, min: 1, max: 10 },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const MatchSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    sport: { type: String, required: true },
    opponent: { type: String, required: true },
    location: { type: String, default: 'Dumka Stadium' },
    academyScore: { type: String, default: '0' },
    opponentScore: { type: String, default: '0' },
    result: {
      type: String,
      enum: ['Won', 'Lost', 'Drawn', 'Scheduled'],
      default: 'Won',
    },
    academy: { type: String, default: 'Dumka Sports Academy' },
    players: [PlayerMatchPerformanceSchema],
    topScorer: { type: String, default: '' },
    coachNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);

