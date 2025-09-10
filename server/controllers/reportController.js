import { getWeeklyReport, getAllReportWeeks } from "../services/weeklyReportsService.js";

export async function weekly(req, res) {
  try {
    const { cohort, date } = req.query;
    if (!cohort || !date) {
      return res.status(400).json({ error: "cohort and date are required" });
    }
    const report = await getWeeklyReport(cohort, date);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function weeks(req, res) {
  try {
    const weeks = await getAllReportWeeks();
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { weekly, weeks };