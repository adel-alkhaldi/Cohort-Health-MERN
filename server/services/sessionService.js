import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";

/**
 * Create a new session.
 */
export async function createSession(data) {
  return await Session.create(data);
}

/**
 * Get all attendances for a session, masking EID.
 */
export async function getSessionAttendances(sessionId) {
  const attendances = await Attendance.find({ sessionId })
    .populate("participantId", "EID fullName gender age cohort status")
    .lean();

  attendances.forEach(att => {
    if (att.participantId && typeof att.participantId.EID === "string") {
      const eid = att.participantId.EID;
      att.participantId.EID = eid.length > 3
        ? "*".repeat(eid.length - 3) + eid.slice(-3)
        : eid;
    }
  });

  return attendances;
}