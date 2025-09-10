import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";

export async function getCohortKPI(cohortName) {
  const participants = await Participant.find({ cohort: cohortName });
  const participantIds = participants.map(p => p._id);

  const attendances = await Attendance.find({ participantId: { $in: participantIds } });

  const totalAttendances = attendances.length;
  const total = totalAttendances || 1; // Division by zero safeguard

  const avgBPsys = attendances.reduce((sum, a) => sum + (a.sessionVitals?.bpSystolic || 0), 0) / total;
  const avgBPdia = attendances.reduce((sum, a) => sum + (a.sessionVitals?.bpDiastolic || 0), 0) / total;
  const avgWeight = attendances.reduce((sum, a) => sum + (a.sessionVitals?.weight || 0), 0) / total;
  const avgGlucose = attendances.reduce((sum, a) => sum + (a.sessionVitals?.glucoseMgdl || 0), 0) / total;
  const avgGripStrengthSec = attendances.reduce((sum, a) => sum + (a.sessionVitals?.GripStrengthSec || 0), 0) / total;

  const flagCount = attendances.filter(a => (a.sessionVitals?.bpSystolic >= 150 || a.sessionVitals?.bpDiastolic >= 90)).length;
  const flagPercent = (flagCount / total) * 100;

  const retention = attendances.filter(a => a.hasAttended).length / total * 100;

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