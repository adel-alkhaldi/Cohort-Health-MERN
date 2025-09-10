import { createIncident } from "../services/incidentService.js";

export async function create(req, res) {
  try {
    const { attendanceId, severity, description, actions, closure } = req.body;
    // All fields are passed from frontend, no backend defaults
    const incident = await createIncident({
      attendanceId,
      severity,
      description,
      actions,
      closure
    });
    res.status(201).json(incident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default { create };