import Incident from "../models/Incident.js";
import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";

export async function createIncident(data) {
  let attendanceId = data.attendanceId;

  // If EID and sessionId are provided, resolve attendanceId
  if (!attendanceId && data.EID && data.sessionId) {
    const participant = await Participant.findOne({ EID: data.EID });
    if (!participant) throw new Error("Participant with given EID not found");
    const attendance = await Attendance.findOne({
      participantId: participant._id,
      sessionId: data.sessionId
    });
    if (!attendance) throw new Error("Attendance not found for given EID and session");
    attendanceId = attendance._id;
  }

  if (!attendanceId || !data.severity || !data.description) {
    throw new Error("attendanceId (or EID+sessionId), severity, and description are required");
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