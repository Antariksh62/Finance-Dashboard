require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Record = require('./models/Record');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await User.deleteMany({});
  await Record.deleteMany({});

  const pw = await bcrypt.hash('password123', 10);

  const [admin, analyst] = await User.insertMany([
    { name: 'Alice Admin', email: 'admin@finance.dev', password: pw, role: 'admin', status: 'active' },
    { name: 'Ana Analyst', email: 'analyst@finance.dev', password: pw, role: 'analyst', status: 'active' },
    { name: 'Victor Viewer', email: 'viewer@finance.dev', password: pw, role: 'viewer', status: 'active' },
  ]);

  await Record.insertMany([
    { amount: 75000, type: 'income', category: 'salary', date: '2024-01-31', notes: 'January salary', createdBy: admin._id },
    { amount: 12000, type: 'expense', category: 'rent', date: '2024-02-01', notes: 'Monthly rent', createdBy: admin._id },
    { amount: 3500, type: 'expense', category: 'food', date: '2024-02-05', notes: 'Groceries', createdBy: admin._id },
    { amount: 75000, type: 'income', category: 'salary', date: '2024-02-28', notes: 'February salary', createdBy: admin._id },
    { amount: 15000, type: 'income', category: 'freelance', date: '2024-02-20', notes: 'Design project', createdBy: admin._id },
    { amount: 2000, type: 'expense', category: 'transport', date: '2024-02-10', notes: 'Fuel', createdBy: admin._id },
    { amount: 5000, type: 'expense', category: 'utilities', date: '2024-02-15', notes: 'Electricity + internet', createdBy: admin._id },
    { amount: 20000, type: 'income', category: 'investment', date: '2024-03-01', notes: 'Stock dividends', createdBy: analyst._id },
    { amount: 75000, type: 'income', category: 'salary', date: '2024-03-31', notes: 'March salary', createdBy: admin._id },
    { amount: 8000, type: 'expense', category: 'healthcare', date: '2024-03-20', notes: 'Annual checkup', createdBy: admin._id },
    { amount: 4500, type: 'expense', category: 'entertainment', date: '2024-03-15', notes: 'Weekend trip', createdBy: admin._id },
    { amount: 25000, type: 'income', category: 'freelance', date: '2024-03-10', notes: 'App development', createdBy: admin._id },
  ]);

  console.log('✅ Seed complete!');
  console.log('   admin@finance.dev    / password123  (admin)');
  console.log('   analyst@finance.dev  / password123  (analyst)');
  console.log('   viewer@finance.dev   / password123  (viewer)');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});