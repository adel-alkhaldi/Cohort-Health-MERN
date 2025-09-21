import Incident from "../models/Incident.js";

export async function createIncident(data) {
  if (!data.attendanceId) throw new Error("attendanceId is required");
  if (!data.severity) throw new Error("severity is required");
  if (!data.description) throw new Error("description is required");

  const incident = await Incident.create({
    attendanceId: data.attendanceId,
    severity: data.severity,
    description: data.description,
    actions: data.actions,
    closure: data.closure
  });
  return incident;
}