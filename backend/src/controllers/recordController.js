const { body, query, param } = require('express-validator');
const Record = require('../models/Record');
const validate = require('../middlewares/validate');

const CATEGORIES = ['salary','freelance','investment','rental','food','transport',
                    'utilities','rent','entertainment','healthcare','education','shopping','other'];

// GET /records
exports.getRecords = [
  query('type').optional().isIn(['income','expense']),
  query('category').optional().isIn(CATEGORIES),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate,
  async (req, res, next) => {
    try {
      const { type, category, from, to, page = 1, limit = 20 } = req.query;
      const filter = { deletedAt: null };
      if (type) filter.type = type;
      if (category) filter.category = category;
      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
      }
      const total = await Record.countDocuments(filter);
      const records = await Record.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email');
      res.json({
        success: true,
        data: records,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      });
    } catch (err) { next(err); }
  },
];

// GET /records/:id
exports.getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, deletedAt: null })
      .populate('createdBy', 'name email');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

// POST /records
exports.createRecord = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive.'),
  body('type').isIn(['income','expense']).withMessage('Type must be income or expense.'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category.'),
  body('date').isISO8601().withMessage('Date must be YYYY-MM-DD.'),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  validate,
  async (req, res, next) => {
    try {
      const { amount, type, category, date, notes = '' } = req.body;
      const record = await Record.create({
        amount, type, category,
        date: new Date(date),
        notes,
        createdBy: req.user._id,
      });
      res.status(201).json({ success: true, message: 'Record created.', data: record });
    } catch (err) { next(err); }
  },
];

// PATCH /records/:id
exports.updateRecord = [
  body('amount').optional().isFloat({ gt: 0 }),
  body('type').optional().isIn(['income','expense']),
  body('category').optional().isIn(CATEGORIES),
  body('date').optional().isISO8601(),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  validate,
  async (req, res, next) => {
    try {
      const record = await Record.findOne({ _id: req.params.id, deletedAt: null });
      if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
      const allowed = ['amount', 'type', 'category', 'date', 'notes'];
      allowed.forEach(f => { if (req.body[f] !== undefined) record[f] = req.body[f]; });
      if (req.body.date) record.date = new Date(req.body.date);
      await record.save();
      res.json({ success: true, message: 'Record updated.', data: record });
    } catch (err) { next(err); }
  },
];

// DELETE /records/:id (soft delete)
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, deletedAt: null });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    record.deletedAt = new Date();
    await record.save();
    res.json({ success: true, message: 'Record deleted.' });
  } catch (err) { next(err); }
};
