import Attendance from "../models/Attendance.js";
import { createAttendance } from "../services/attendanceService.js";

export async function create(req, res) {
  try {
    const attendance = await createAttendance(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getByCode(req, res) {
  try {
    const { code } = req.params;
    const attendance = await Attendance.findOne({ attendanceCode: code });
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default { create, getByCode };