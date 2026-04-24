import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`Register failed - User already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    logger.info(`User registered: ${email}`);

    res.json({
      user,
      token: generateToken(user)
    });

  } catch (error) {
    logger.error(`Register Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Login failed - User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Login failed - Invalid password: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    logger.info(`User logged in: ${email}`);

    res.json({
      user,
      token: generateToken(user)
    });

  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};