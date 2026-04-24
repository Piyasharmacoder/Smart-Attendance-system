import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// 🔥 NEW IMPORTS
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import overtimeRoutes from './routes/overtimeRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
    
// 🔥 Morgan + Winston Integration
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// 🔗 Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 🔥 NEW ROUTES ADD
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/leaves', leaveRoutes);

// Test route
app.get('/', (req, res) => {
  res.send("API Running 🚀");
});

export default app;