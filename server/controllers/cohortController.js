import Participant from "../models/Participant.js";
import { getCohortReview } from "../services/cohortReviewService.js";
import { getCohortKPI } from "../services/allCohortService.js";
import { getWatchCasesByCohort } from "../services/cohortWatchService.js";

// List all distinct cohort names.
export async function listCohorts(req, res) {
  try {
    const cohorts = await Participant.distinct("cohort");
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get review data for a cohort (participants + latest attendance).
export async function review(req, res) {
  try {
    const { cohortName } = req.params;
    const data = await getCohortReview(cohortName);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get cohort KPIs (stats).
export async function kpi(req, res) {
  try {
    const { cohortName } = req.params;
    const kpi = await getCohortKPI(cohortName);
    res.json(kpi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get watch cases (incidents) for a specific cohort.
export async function listWatchCasesByCohort(req, res) {
  try {
    const { cohortName } = req.params;
    const cases = await getWatchCasesByCohort(cohortName);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { listCohorts, review, kpi, listWatchCasesByCohort };