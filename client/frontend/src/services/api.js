import axios from "axios";

// If VITE_API_BASE_URL fails to retrieve it, default to the predefined URL & Port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Get cohort KPIs
export const getCohortKPI = async (cohortName) => {
  const res = await api.get(`/reports/cohort/${cohortName}`);
  return res.data;
};

// Get weekly report
export const getWeeklyReport = async (cohort, date) => {
  const res = await api.get(`/reports/weekly?cohort=${cohort}&date=${date}`);
  return res.data;
};

// Get all report weeks
export const getAllReportWeeks = async () => {
  const res = await api.get("/reports/weeks");
  return res.data;
};

// Get watch cases
export const getWatchCases = async () => {
  const res = await api.get("/watch");
  return res.data;
};

// Get all cohorts
export const getCohorts = async () => {
  const res = await api.get("/cohorts");
  return res.data;
};

// Get Cohort Data for Review
export const getCohortReview = async (cohortName) => {
  const res = await api.get(`/cohort/${cohortName}/review`);
  return res.data;
};

// Get Watch Cases by Cohort
export const getWatchCasesByCohort = async (cohortName) => {
  const res = await api.get(`/watch/cohort/${cohortName}`);
  return res.data;
};

// Get Sessions
export const getSessions = async () => {
  const res = await api.get("/sessions");
  return res.data;
};

// Get Attendances for a Session
export const getSessionAttendances = async (sessionId) => {
  const res = await api.get(`/sessions/${sessionId}/attendances`);
  return res.data;
};

// Admin Actions APIs

// Add Attendance
export const addAttendance = async (attendanceData) => {
  const res = await api.post("/attendance", attendanceData);
  return res.data;
};

// Create Session
export const createSession = async (sessionData) => {
  const res = await api.post("/sessions", sessionData);
  return res.data;
};

// Create Participant
export const registerParticipant = async (participantData) => {
  const res = await api.post("/participants", participantData);
  return res.data;
};


// Get Attendance by EID and Session for Incident Creation
export const getAttendanceByEIDAndSession = async (EID, sessionId) => {
  const res = await api.get(`/attendance/by-eid-session?EID=${EID}&sessionId=${sessionId}`);
  return res.data;
};

// Get Attendances by EID
export const getAttendancesByEID = async (EID) => {
  const res = await api.get(`/attendance/by-eid/${EID}`);
  return res.data;
};

// Create Incident
export const createIncident = async (incidentData) => {
  const res = await api.post("/incidents", incidentData);
  return res.data;
};

export default api;