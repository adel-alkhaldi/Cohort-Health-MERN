import { getCohortKPI } from "../services/allCohortService.js";

export async function kpi(req, res) {
  try {
    const { cohortName } = req.params;
    const kpi = await getCohortKPI(cohortName);
    res.json(kpi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { kpi };