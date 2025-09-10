import { getWatchCasesByCohort } from "../services/cohortWatchService.js";

export async function listByCohort(req, res) {
  try {
    const { cohortName } = req.params;
    const cases = await getWatchCasesByCohort(cohortName);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { listByCohort };