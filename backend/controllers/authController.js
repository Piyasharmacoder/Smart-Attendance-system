import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

// 🔹 REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    if (!name || !email || !password) {
  return res.status(400).json({ message: "All fields required" });
}

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const requestedRole = role?.toLowerCase();
    if (requestedRole && requestedRole !== 'employee') {
      return res.status(403).json({
        message: "Only employee signup is allowed"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      manager: managerId || null
    });

    const { password: _, ...userData } = user._doc;

    res.status(201).json({
      user: userData,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
      if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userData } = user._doc;

    res.json({
      user: userData,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 PROFILE
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};


// 🔹 GET USERS (ADMIN / MANAGER)
export const getUsers = async (req, res) => {
  let query = {};

  if (req.user.role === 'manager') {
    query = { manager: req.user._id };
  }

  const users = await User.find(query).select('-password');

  res.json(users);
};