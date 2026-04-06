const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middlewares/validate');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  

// POST /auth/register
exports.register = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters.'),
  body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role.'),
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role = 'viewer' } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
      const user = await User.create({ name, email, password, role });
      const token = signToken(user);
      res.status(201).json({
        success: true,
        message: 'Registered successfully.',
        data: { user, token },
      });
    } catch (err) { next(err); }
  },
];



// POST /auth/login
exports.login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, message: 'Account inactive. Contact admin.' });
      }
      const token = signToken(user);
      const safeUser = user.toJSON();
      res.json({
        success: true,
        message: 'Login successful.',
        data: { user: safeUser, token },
      });
    } catch (err) { next(err); }
  },
];


// GET /auth/me
exports.me = async (req, res) => {
  res.json({ success: true, data: req.user });
};
