const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const existing = await User.findOne({ email: 'admin@example.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  const hashed = await bcrypt.hash('Admin@123', 10);
  const admin = new User({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashed,
    role: 'admin',
  });
  await admin.save();
  console.log('✅ Admin created: admin@example.com / Admin@123');
  process.exit(0);
});
