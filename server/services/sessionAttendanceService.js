import Attendance from "../models/Attendance.js";

export async function getSessionAttendances(sessionId) {
  // Find all attendances for the session and populate participant details
  return await Attendance.find({ sessionId })
    .populate("participantId", "EID fullName gender age cohort status")
    .lean();
}