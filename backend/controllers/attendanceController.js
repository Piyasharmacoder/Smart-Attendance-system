// controllers/attendanceController.js

import Attendance from '../models/Attendance.js';
import logger from '../utils/logger.js';
import { isWithinRadius } from '../utils/geofence.js';

// Office location
const OFFICE_LAT = 22.7196;
const OFFICE_LNG = 75.8577;


// 🔹 Punch In
export const punchIn = async (req, res) => {
  try {
    const { lat, lng, selfie } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      user: req.user.id,
      date: today
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
      user: req.user.id,
      date: today,
      punchIn: {
        time: new Date(),
        location: { lat, lng },
        selfie,
        geoStatus: inRange ? "IN_RANGE" : "OUT_OF_RANGE"

      }
    });

logger.info(`Punch In: ${req.user.id} | Geo: ${inRange}`);

    res.json(attendance);

  } catch (error) { 
    logger.error(`Punch In Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};



// 🔥 🔹 Punch Out 
export const punchOut = async (req, res) => {
  try {
    const { lat, lng, selfie } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today
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

    logger.info(`Punch Out: ${req.user.id} | Hours: ${workingHours}`);

    res.json(attendance);

  } catch (error) {
    logger.error(`Punch Out Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};