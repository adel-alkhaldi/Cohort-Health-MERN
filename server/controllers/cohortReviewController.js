import { getCohortReview } from "../services/cohortReviewService.js";

export async function review(req, res) {
  try {
    const { cohortName } = req.params;
    const data = await getCohortReview(cohortName);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { review };