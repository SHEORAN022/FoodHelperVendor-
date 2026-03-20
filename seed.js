
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_admin';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async ()=>{
  const existing = await User.findOne({ email: 'admin@example.com' });
  if(existing){ console.log('Admin already exists'); process.exit(0); }
  const hashed = await bcrypt.hash('Admin@123', 10);
  const admin = new User({ name: 'Admin', email: 'admin@example.com', password: hashed, role: 'admin' });
  await admin.save();
  console.log('Admin created: admin@example.com / Admin@123');
  process.exit(0);
}).catch(err=> console.error(err));
