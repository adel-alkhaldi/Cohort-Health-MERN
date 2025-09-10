import Incident from "../models/Incident.js";
import Attendance from "../models/Attendance.js";

export async function createIncident(data) {
  const { attendanceId, severity, description, actions, closure } = data;
  // Validate attendance exists
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw new Error("Attendance not found");

  // All fields are required except actions/closure (optional in schema)
  if (!attendanceId || !severity || !description) {
    throw new Error("attendanceId, severity, and description are required");
  }

  const incident = await Incident.create({
    attendanceId,
    severity,
    description,
    actions,
    closure
  });
  return incident;
}