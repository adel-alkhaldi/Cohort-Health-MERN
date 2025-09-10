import { getWatchCases } from "../services/watchService.js";

export async function list(req, res) {
  try {
    const cases = await getWatchCases();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { list };