import Incident from "../models/Incident.js";
import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";

export async function createIncident(data) {
  let attendanceId = data.attendanceId;

  if (!attendanceId && data.EID && data.sessionId) {
    const participant = await Participant.findOne({ EID: data.EID });
    if (!participant) throw new Error("Participant with given EID not found");
    const attendance = await Attendance.findOne({
      participantId: participant._id,
      sessionId: data.sessionId
    });
    if (!attendance) throw new Error(`Attendance not found for EID ${data.EID} and session ${data.sessionId}`);
    attendanceId = attendance._id;
  }

  if (!attendanceId) {
    throw new Error("attendanceId (or EID+sessionId) is required and must match an existing attendance");
  }
  if (!data.severity) {
    throw new Error("severity is required");
  }
  if (!data.description) {
    throw new Error("description is required");
  }

  const incident = await Incident.create({
    attendanceId,
    severity: data.severity,
    description: data.description,
    actions: data.actions,
    closure: data.closure
  });
  return incident;
}