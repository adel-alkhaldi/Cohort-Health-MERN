import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";
import Incident from "../models/Incident.js";

/**
 * Returns cohort KPIs (averages, flag percent, retention) using incident-based flag logic.
 */
export async function getCohortKPI(cohortName) {
  const participants = await Participant.find({ cohort: cohortName });
  const participantIds = participants.map(p => p._id);

  // All attendances for this cohort
  const attendances = await Attendance.find({ participantId: { $in: participantIds } });
  const totalAttendances = attendances.length || 1; // Avoid division by zero

  // Find all incidents for these attendances
  const attendanceIds = attendances.map(a => a._id);
  const flaggedIncidents = await Incident.find({ attendanceId: { $in: attendanceIds } }).select("attendanceId");
  // Get unique attendanceIds that have at least one incident
  const flaggedAttendanceIds = new Set(flaggedIncidents.map(i => i.attendanceId.toString()));
  const flaggedAttendancesCount = flaggedAttendanceIds.size;

  // Calculate averages as before
  const avgBPsys = attendances.reduce((sum, a) => sum + (a.sessionVitals?.bpSystolic || 0), 0) / totalAttendances;
  const avgBPdia = attendances.reduce((sum, a) => sum + (a.sessionVitals?.bpDiastolic || 0), 0) / totalAttendances;
  const avgWeight = attendances.reduce((sum, a) => sum + (a.sessionVitals?.weight || 0), 0) / totalAttendances;
  const avgGlucose = attendances.reduce((sum, a) => sum + (a.sessionVitals?.glucoseMgdl || 0), 0) / totalAttendances;
  const avgGripStrengthSec = attendances.reduce((sum, a) => sum + (a.sessionVitals?.GripStrengthSec || 0), 0) / totalAttendances;

  // Correct flag percent logic
  const flagPercent = (flaggedAttendancesCount / totalAttendances) * 100;

  const retention = attendances.filter(a => a.hasAttended).length / totalAttendances * 100;

  return {
    totalAttendances,
    avgBPsys,
    avgBPdia,
    avgWeight,
    avgGlucose,
    avgGripStrengthSec,
    flagPercent,
    retention
  };
}