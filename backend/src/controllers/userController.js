const { body, param } = require('express-validator');
const User = require('../models/User');
const validate = require('../middlewares/validate');

// GET /users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    const users = await User.find(filter);
    res.json({ success: true, data: users, total: users.length });
  } catch (err) { next(err); }
};

// GET /users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PATCH /users/:id/role
exports.updateRole = [
  body('role').isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role.'),
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
      }
      user.role = req.body.role;
      await user.save();
      res.json({ success: true, message: 'Role updated.', data: user });
    } catch (err) { next(err); }
  },
];

// PATCH /users/:id/status
exports.updateStatus = [
  body('status').isIn(['active', 'inactive']).withMessage('Invalid status.'),
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate yourself.' });
      }
      user.status = req.body.status;
      await user.save();
      res.json({ success: true, message: 'Status updated.', data: user });
    } catch (err) { next(err); }
  },
];

// DELETE /users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};
