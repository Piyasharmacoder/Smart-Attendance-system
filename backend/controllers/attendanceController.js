
import Attendance from '../models/Attendance.js';
import logger from '../utils/logger.js';
import { isWithinRadius } from '../utils/geofence.js';
import User from '../models/User.js';

// Office location
const OFFICE_LAT = 22.7196;
const OFFICE_LNG = 75.8577;

// global function to get today's date range
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// 🔹 Punch In
export const punchIn = async (req, res) => {
  try {
    const { lat, lng, selfie } = req.body;
    // ✅ VALIDATION 
    if (
      lat === undefined ||
      lng === undefined ||
      !selfie
    ) {
      return res.status(400).json({ message: "Location and selfie required" });
    }

  //user can punch in only once per day
    const { start, end } = getTodayRange();

    const existing = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (existing) {
      return res.status(400).json({ message: "Already punched in" });
    }

    // 🔥 Geofence check
    const inRange = isWithinRadius(lat, lng, OFFICE_LAT, OFFICE_LNG);

    if (!inRange) {
      return res.status(400).json({ message: "Not within office radius" });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date: new Date(),
      punchIn: {
        time: new Date(),
        location: { lat, lng },
        selfie,
        geoStatus: inRange ? "IN_RANGE" : "OUT_OF_RANGE"

      }
    });

    logger.info(`Punch In: ${req.user._id} | Geo: ${inRange}`);

    res.json({ success: true, data: attendance });

  } catch (error) {
    logger.error(`Punch In Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};



// 🔥 🔹 Punch Out 
export const punchOut = async (req, res) => {
  try {
    const { lat, lng, selfie } = req.body;

    // ✅ VALIDATION 
    if (
      lat === undefined ||
      lng === undefined ||
      !selfie
    ) {
      return res.status(400).json({ message: "Location and selfie required" });
    }

    const { start, end } = getTodayRange();

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (!attendance) {
      return res.status(400).json({ message: "Punch in first" });
    }

    if (attendance.punchOut?.time) {
      return res.status(400).json({ message: "Already punched out" });
    }

    const punchOutTime = new Date();

    // ⏱ Working hours
    const diff =
      (punchOutTime - attendance.punchIn.time) / (1000 * 60 * 60);

    const workingHours = Number(diff.toFixed(2));

    if (workingHours < 0) {
      return res.status(400).json({ message: "Invalid time" });
    }

    // 📍 Geo check
    const inRange = isWithinRadius(lat, lng, OFFICE_LAT, OFFICE_LNG);

    attendance.punchOut = {
      time: punchOutTime,
      location: { lat, lng },
      selfie,
      geoStatus: inRange ? "IN_RANGE" : "OUT_OF_RANGE"
    };

    attendance.workingHours = workingHours;

    // ✅ STATUS LOGIC
    attendance.status =
      workingHours >= 8 ? "Completed" : "Incomplete";

    await attendance.save();

    logger.info(`Punch Out: ${req.user._id} | Hours: ${workingHours}`);

    res.json({ success: true, data: attendance });

  } catch (error) {
    logger.error(`Punch Out Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};


// 🔹 GET ATTENDANCE RECORDS
export const getAttendanceRecords = async (req, res) => {
  try {
    let query = {};

    // 👤 EMPLOYEE → only own
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }

    // 👨‍💼 MANAGER → team + self
    else if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');

      const teamIds = team.map(u => u._id);
      teamIds.push(req.user._id);

      query.user = { $in: teamIds };
    }

    // 👑 ADMIN → all (no filter)

    const records = await Attendance.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records });

  } catch (error) {
    logger.error(`Get Attendance Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

