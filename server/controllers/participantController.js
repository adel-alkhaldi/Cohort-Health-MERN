import { registerParticipant } from "../services/participantService.js";
import Participant from "../models/Participant.js";

export async function register(req, res) {
  try {
    const participant = await registerParticipant(req.body);
    res.status(201).json(participant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default { register };