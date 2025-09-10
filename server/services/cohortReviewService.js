import Participant from "../models/Participant.js";
import Attendance from "../models/Attendance.js";

export async function getCohortReview(cohortName) {
  // Get all participants in the cohort
  const participants = await Participant.find({ cohort: cohortName });

  // For each participant, get their latest attendance
  const results = await Promise.all(
    participants.map(async (p) => {
      // EID Masking (last 3 characters visble)
      const eidStr = typeof p.EID === "string" ? p.EID : "";
      const maskedEID =
        eidStr.length > 3
          ? "*".repeat(eidStr.length - 3) + eidStr.slice(-3)
          : eidStr;

      // Get latest attendance by date
      const latestAttendance = await Attendance.findOne({ participantId: p._id })
        .sort({ date: -1 })
        .lean();

      return {
        participant: {
          _id: p._id,
          EID: maskedEID,
          fullName: p.fullName,
          gender: p.gender,
          age: p.age,
          status: p.status,
          baselineVitals: p.baselineVitals,
        },
        latestAttendance: latestAttendance
          ? {
              date: latestAttendance.date,
              sessionVitals: latestAttendance.sessionVitals,
              hasAttended: latestAttendance.hasAttended,
              sessionId: latestAttendance.sessionId,
            }
          : null,
      };
    })
  );

  return results;
}