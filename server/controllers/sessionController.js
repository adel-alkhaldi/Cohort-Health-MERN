import { createSession, getSessionAttendances } from "../services/sessionService.js";
import Session from "../models/Session.js";

/**
 * Create a new session.
 */
export async function create(req, res) {
  try {
    const session = await createSession(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * List all sessions, sorted by date (descending).
 */
export async function list(req, res) {
  try {
    const sessions = await Session.find().sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * List all attendances for a given session.
 */
export async function listAttendances(req, res) {
  try {
    const { sessionId } = req.params;
    const attendances = await getSessionAttendances(sessionId);
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { create, list, listAttendances };