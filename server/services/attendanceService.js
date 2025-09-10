import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";
import Incident from "../models/Incident.js"; // <-- Add this import

// Helper function to get the start of the week (Monday) for a given date (used in indexing)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function createAttendance(data) {
  // If EID is provided, resolve participantId
  if (data.EID && !data.participantId) {
    const participant = await Participant.findOne({ EID: data.EID });
    if (!participant) throw new Error("Participant with given EID not found");
    data.participantId = participant._id;
  }
  // Calculate weekStart from date if not provided from helper function above
  if (data.date && !data.weekStart) {
    // Calculate weekStart from date if not provided from helper function above
    data.weekStart = getWeekStart(data.date);
  }
  if (!data.attendanceCode) throw new Error("attendanceCode is required"); // <-- Add this validation
  const attendance = await Attendance.create(data);

  // Check for flag condition
  const vitals = attendance.sessionVitals || {};
  if (
    (vitals.bpSystolic !== undefined && vitals.bpSystolic >= 150) ||
    (vitals.bpDiastolic !== undefined && vitals.bpDiastolic >= 90) ||
    (vitals.Hba1c !== undefined && vitals.Hba1c >= 48)
  ) {
    // Create an incident for this attendance
    await Incident.create({
      attendanceId: attendance._id,
      severity: "High", // or "High" if you want, based on your rules
      description: `Flagged BP: ${vitals.bpSystolic ?? "-"} / ${vitals.bpDiastolic ?? "-"}`,
      actions: "Auto-generated from flagged attendance, Review required",
      closure: ""
    });
  }

  return attendance;
}