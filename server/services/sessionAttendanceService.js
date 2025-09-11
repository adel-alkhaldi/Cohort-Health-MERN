import Attendance from "../models/Attendance.js";

export async function getSessionAttendances(sessionId) {
  // Find all attendances for the session and populate participant details
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