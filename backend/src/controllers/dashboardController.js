const Record = require('../models/Record');

// GET /dashboard/summary
exports.getSummary = async (req, res, next) => {
  try {
    const totals = await Record.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const income = totals.find(t => t._id === 'income')?.total || 0;
    const expenses = totals.find(t => t._id === 'expense')?.total || 0;

    const byCategory = await Record.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    const recent = await Record.find({ deletedAt: null })
      .sort({ date: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        byCategory,
        recentActivity: recent,
      },
    });
  } catch (err) { next(err); }
};

// GET /dashboard/trends?groupBy=month|week
exports.getTrends = async (req, res, next) => {
  try {
    const groupBy = req.query.groupBy === 'week' ? 'week' : 'month';
    const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%V';

    const trends = await Record.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: { period: { $dateToString: { format: dateFormat, date: '$date' } }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.period': 1 } },
    ]);

    // Reshape into { period, income, expenses, net }
    const map = {};
    trends.forEach(({ _id: { period, type }, total }) => {
      if (!map[period]) map[period] = { period, income: 0, expenses: 0, net: 0 };
      if (type === 'income') map[period].income += total;
      else map[period].expenses += total;
      map[period].net = map[period].income - map[period].expenses;
    });

    res.json({ success: true, data: Object.values(map) });
  } catch (err) { next(err); }
};

// GET /dashboard/category-breakdown
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type } = req.query;
    const match = { deletedAt: null };
    if (type) match.type = type;

    const breakdown = await Record.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
    ]);

    res.json({ success: true, data: breakdown });
  } catch (err) { next(err); }
};
