const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const existingAdmin = await User.findOne({ role: 'ADMIN' });

    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('MedChain@123', 10);

    const admin = await User.create({
      name: 'MedChain Admin',
      email: 'admin@medchain.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    console.log('Admin created successfully.');
    console.log('Email:', admin.email);
    console.log('Password: MedChain@123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
