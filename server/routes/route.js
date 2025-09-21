import express from "express";
import participantController from "../controllers/participantController.js";
import sessionController from "../controllers/sessionController.js";
import attendanceController from "../controllers/attendanceController.js";
import reportController from "../controllers/reportController.js";
import watchController from "../controllers/watchController.js";
import cohortController from "../controllers/cohortController.js";
import incidentController from "../controllers/incidentController.js";
import sessionAttendanceController from "../controllers/sessionAttendanceController.js";

const router = express.Router();

router.post("/participants", participantController.register);

router.post("/sessions", sessionController.create);

router.post("/attendance", attendanceController.create);

router.get("/reports/weekly", reportController.weekly);

router.get("/reports/weeks", reportController.weeks);

router.get("/reports/cohort/:cohortName", cohortController.kpi); 

router.get("/watch", watchController.list);

router.get("/watch/cohort/:cohortName", cohortController.listWatchCasesByCohort); 

router.get("/cohorts", cohortController.listCohorts); 

router.get("/cohort/:cohortName/review", cohortController.review);

router.get("/sessions", sessionController.list);

router.post("/incidents", incidentController.create);

router.get("/sessions/:sessionId/attendances", sessionAttendanceController.listBySession);

//lets the user pick from front-end attendances using EID
router.get("/attendance/by-eid/:EID", attendanceController.getByEID);

export default router;