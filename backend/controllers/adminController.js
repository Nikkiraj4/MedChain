const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Batch = require('../models/Batch');
const Transaction = require('../models/Transaction');

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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
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

const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      { password: 0 }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);

    res.status(500).json({
      message: 'Server error while retrieving users',
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    if (!name || !email || !role || !status) {
      return res.status(400).json({
        message: 'Name, email, role and status are required',
      });
    }

    const allowedRoles = [
      'MANUFACTURER',
      'DISTRIBUTOR',
      'PHARMACY',
    ];

    const allowedStatuses = ['ACTIVE', 'INACTIVE'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role',
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        message: 'Admin user cannot be modified',
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Another user with this email already exists',
      });
    }

    user.name = name;
    user.email = email;
    user.role = role;
    user.status = status;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);

    res.status(500).json({
      message: 'Server error while updating user',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        message: 'Admin user cannot be deleted',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);

    res.status(500).json({
      message: 'Server error while deleting user',
    });
  }
};

/*
 * Get all batches - Admin only
 */
const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('manufacturer', 'name email role')
      .populate('currentHolder', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      batches,
    });
  } catch (error) {
    console.error('Get batches error:', error);

    res.status(500).json({
      message: 'Server error while retrieving batches',
    });
  }
};

/*
 * Get all transactions - Admin only
 */
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('from', 'name email role')
      .populate('to', 'name email role')
      .sort({ timestamp: -1 });

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);

    res.status(500).json({
      message: 'Server error while retrieving transactions',
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getBatches,
  getTransactions,
};