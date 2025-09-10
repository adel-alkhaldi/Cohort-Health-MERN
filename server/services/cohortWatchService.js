import Incident from "../models/Incident.js";

export async function getWatchCasesByCohort(cohortName) {
  // Find all incidents and populate attendance and participant details
  const incidents = await Incident.find().populate({
    path: "attendanceId",
    populate: {
      path: "participantId",
      select: "fullName cohort gender age status baselineVitals"
    }
  });

  // Filter incidents by cohort
  const filtered = incidents.filter(incident => {
    const participant = incident.attendanceId?.participantId;
    return participant && participant.cohort === cohortName;
  });

  return filtered.map(incident => {
    const attendance = incident.attendanceId;
    const participant = attendance?.participantId;
    return {
      incidentId: incident._id,
      severity: incident.severity,
      description: incident.description,
      actions: incident.actions,
      closure: incident.closure,
      createdAt: incident.createdAt,
      participant: participant ? {
        _id: participant._id,
        fullName: participant.fullName,
        cohort: participant.cohort,
        gender: participant.gender,
        age: participant.age,
        status: participant.status,
        baselineVitals: participant.baselineVitals
      } : null,
      sessionVitals: attendance?.sessionVitals || null,
      attendanceDate: attendance?.date || null,
      sessionId: attendance?.sessionId || null
    };
  });
}