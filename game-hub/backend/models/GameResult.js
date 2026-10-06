import mongoose from 'mongoose';

const gameResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: String, required: true },
    score: { type: Number, default: 0 },
    result: { type: String, default: 'completed' },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('GameResult', gameResultSchema);
