import { createIncident } from "../services/incidentService.js";

export async function create(req, res) {
  try {
    const incident = await createIncident(req.body);
    res.status(201).json(incident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default { create };