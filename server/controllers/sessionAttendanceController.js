import { getSessionAttendances } from "../services/sessionAttendanceService.js";

export async function listBySession(req, res) {
  try {
    const { sessionId } = req.params;
    const attendances = await getSessionAttendances(sessionId);
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { listBySession };