import Participant from "../models/Participant.js";

export async function listCohorts(req, res) {
  try {
    const cohorts = await Participant.distinct("cohort");
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { listCohorts };