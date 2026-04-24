import Overtime from '../models/Overtime.js';
import Attendance from '../models/Attendance.js';

// 🔹Employee Request OT
export const requestOT = async (req, res) => {
  try {
    const { date, hours, reason } = req.body;

    if (!date || !hours) {
      return res.status(400).json({ message: "Date and hours required" });
    }

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid OT hours" });
    }

    const existing = await Overtime.findOne({
      user: req.user.id,
      date
    });

    if (existing) {
      return res.status(400).json({ message: "OT already requested" });
    }

    const ot = await Overtime.create({
      user: req.user.id,
      date,
      hours,
      reason
    });

    res.json(ot);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 Update OT (Approve/Reject)
export const updateOT = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ot = await Overtime.findById(req.params.id);

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

    ot.status = status;
    await ot.save();

    // 🔥 Update attendance if approved
    if (status === 'Approved') {
      const attendance = await Attendance.findOne({
        user: ot.user,
        date: ot.date
      });

      if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }

      attendance.overtimeHours = ot.hours;
      await attendance.save();
    }

    res.json({
      message: `OT ${status}`,
      ot
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 Get all OT
export const getAllOT = async (req, res) => {
  try {
    const data = await Overtime.find().populate('user');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};