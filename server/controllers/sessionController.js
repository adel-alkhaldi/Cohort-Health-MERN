import { createSession } from "../services/sessionService.js";
import Session from "../models/Session.js";

export async function create(req, res) {
  try {
    const session = await createSession(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function list(req, res) {
  try {
    const sessions = await Session.find().sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { create, list };