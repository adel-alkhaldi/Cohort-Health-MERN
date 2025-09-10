import Participant from "../models/Participant.js";

export async function registerParticipant(data) {
  return await Participant.create(data);
}