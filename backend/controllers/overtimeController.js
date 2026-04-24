import Overtime from '../models/Overtime.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// 🔹 REQUEST OT
export const requestOT = async (req, res) => {
  try {
    const { date, requestedHours, reason } = req.body;

    if (!date || !requestedHours || !reason) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (requestedHours <= 0) {
      return res.status(400).json({ message: "Invalid hours" });
    }

    const existing = await Overtime.findOne({
      user: req.user._id,
      date
    });

    if (existing) {
      return res.status(400).json({ message: "Already requested" });
    }

    const ot = await Overtime.create({
      user: req.user._id,
      date,
      requestedHours,
      reason
    });

    res.status(201).json({ success: true, data: ot });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 Update OT (Approve/Reject)
export const updateOT = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ot = await Overtime.findById(req.params.id).populate('user');

    if (!ot) {
      return res.status(404).json({ message: "OT not found" });
    }

    if (ot.status !== 'Pending') {
      return res.status(400).json({ message: "Already processed" });
    }

    // 🔐 Role check
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔥 Manager team check
    if (
      req.user.role === 'manager' &&
      ot.user.manager?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not your team" });
    }

    ot.status = status;
    ot.approvedBy = req.user._id;
    await ot.save();

    // 🔥 UPDATE ATTENDANCE
    if (status === 'Approved') {
      const attendance = await Attendance.findOne({
        user: ot.user._id,
        date: ot.date
      });

      if (attendance) {
        attendance.overtimeHours = ot.requestedHours;
        await attendance.save();
      }
    }

    res.json({ success: true, data: ot });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 GET ALL OT (with filters)
export const getAllOT = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query = {};

    // 🔐 ROLE-BASED ACCESS
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }

    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');

      const teamIds = team.map(u => u._id);
      teamIds.push(req.user._id);

      query.user = { $in: teamIds };
    }

    // 👑 ADMIN → no restriction

    // 📊 STATUS FILTER
    if (status) {
      query.status = status;
    }

    // 📅 DATE FILTER
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const data = await Overtime.find(query)
      .populate('user', 'name email role')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};