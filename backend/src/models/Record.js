const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, required: true, enum: ['income', 'expense'] },
  category: {
    type: String, required: true,
    enum: ['salary','freelance','investment','rental','food','transport',
           'utilities','rent','entertainment','healthcare','education','shopping','other']
  },
  date: { type: Date, required: true },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

recordSchema.index({ date: -1 });
recordSchema.index({ type: 1, category: 1 });
recordSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Record', recordSchema);
