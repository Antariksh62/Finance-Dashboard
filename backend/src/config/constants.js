module.exports = {
  ROLES: {
    ADMIN: 'admin',
    ANALYST: 'analyst',
    VIEWER: 'viewer',
  },

  TRANSACTION_TYPES: ['income', 'expense'],

  CATEGORIES: [
    'salary', 'freelance', 'investment', 'rental',
    'food', 'transport', 'utilities', 'rent',
    'entertainment', 'healthcare', 'education', 'shopping', 'other'
  ],

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  JWT_EXPIRES_IN: '7d',
};