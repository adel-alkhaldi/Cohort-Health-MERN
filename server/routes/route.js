import express from "express";
import participantController from "../controllers/participantController.js";
import sessionController from "../controllers/sessionController.js";
import attendanceController from "../controllers/attendanceController.js";
import reportController from "../controllers/reportController.js";
import fullCohortController from "../controllers/fullCohortController.js";
import watchController from "../controllers/watchController.js";
import cohortReviewController from "../controllers/cohortReviewController.js";
import cohortController from "../controllers/cohortController.js";
import cohortWatchController from "../controllers/cohortWatchController.js";
import incidentController from "../controllers/incidentController.js";
import sessionAttendanceController from "../controllers/sessionAttendanceController.js";

const router = express.Router();

router.post("/participants", participantController.register);

router.post("/sessions", sessionController.create);

router.post("/attendance", attendanceController.create);

router.get("/reports/weekly", reportController.weekly);

router.get("/reports/weeks", reportController.weeks);

router.get("/reports/cohort/:cohortName", fullCohortController.kpi);

router.get("/watch", watchController.list);

router.get("/watch/cohort/:cohortName", cohortWatchController.listByCohort);

router.get("/cohorts", cohortController.listCohorts);

router.get("/cohort/:cohortName/review", cohortReviewController.review);

router.get("/sessions", sessionController.list);

router.post("/incidents", incidentController.create);

router.get("/sessions/:sessionId/attendances", sessionAttendanceController.listBySession);

export default router;