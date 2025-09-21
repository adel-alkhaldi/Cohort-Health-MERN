import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";
import { createAttendance } from "../services/attendanceService.js";

export async function create(req, res) {
  try {
    const attendance = await createAttendance(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// QUICK FIX: New controller to get attendance by EID and sessionId
export async function getByEIDAndSession(req, res) {
  try {
    const { EID, sessionId } = req.query;
    if (!EID || !sessionId) return res.status(400).json({ error: "EID and sessionId required" });
    const participant = await Participant.findOne({ EID });
    if (!participant) return res.status(404).json({ error: "Participant not found" });
    const attendance = await Attendance.findOne({ participantId: participant._id, sessionId });
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get all attendances for a participant by EID
export async function getByEID(req, res) {
  try {
    const { EID } = req.params;
    if (!EID) return res.status(400).json({ error: "EID is required" });
    const participant = await Participant.findOne({ EID });
    if (!participant) return res.status(404).json({ error: "Participant not found" });
    const attendances = await Attendance.find({ participantId: participant._id })
      .populate("sessionId")
      .sort({ date: -1 });
    res.json(attendances);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default { create, getByEIDAndSession, getByEID };