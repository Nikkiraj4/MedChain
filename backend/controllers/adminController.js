const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password and role are required',
      });
    }

    const allowedRoles = [
      'MANUFACTURER',
      'DISTRIBUTOR',
      'PHARMACY',
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role',
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: 'ACTIVE',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);

    res.status(500).json({
      message: 'Server error while creating user',
    });
  }
};

module.exports = {
  createUser,
};