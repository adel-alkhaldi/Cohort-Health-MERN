import Attendance from "../models/Attendance.js";
import Participant from "../models/Participant.js";
import Incident from "../models/Incident.js";

// Helper function to get the start of the week (Monday) for a given date (used in indexing)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function createAttendance(data) {
  // If EID is provided, resolve participantId
  if (data.EID && !data.participantId) {
    const participant = await Participant.findOne({ EID: data.EID });
    if (!participant) throw new Error("Participant with given EID not found");
    data.participantId = participant._id;
  }
  // Calculate weekStart from date if not provided from helper function above
  if (data.date && !data.weekStart) {
    data.weekStart = getWeekStart(data.date);
  }
  const attendance = await Attendance.create(data);

  // --- New Incident Flagging Logic ---
  const vitals = attendance.sessionVitals || {};
  const incidentFlags = [];

  // GripStrengthSec: < 20–30 triggers incident
  if (typeof vitals.GripStrengthSec === "number" && vitals.GripStrengthSec < 30) {
    incidentFlags.push({
      severity: vitals.GripStrengthSec < 20 ? "High" : "Medium",
      description: `GripStrengthSec low: ${vitals.GripStrengthSec} sec`
    });
  }

  // HbA1c: ≥ 42 triggers incident
  if (typeof vitals.Hba1c === "number" && vitals.Hba1c >= 42) {
    incidentFlags.push({
      severity: "High",
      description: `HbA1c high: ${vitals.Hba1c} mmol/mol`
    });
  }

  // bpSystolic: < 90 or > 130 triggers incident
  if (typeof vitals.bpSystolic === "number") {
    if (vitals.bpSystolic < 90) {
      incidentFlags.push({
        severity: "High",
        description: `bpSystolic low: ${vitals.bpSystolic} mmHg`
      });
    } else if (vitals.bpSystolic > 130) {
      incidentFlags.push({
        severity: "High",
        description: `bpSystolic high: ${vitals.bpSystolic} mmHg`
      });
    }
  }

  // bpDiastolic: < 60 or > 90 triggers incident
  if (typeof vitals.bpDiastolic === "number") {
    if (vitals.bpDiastolic < 60) {
      incidentFlags.push({
        severity: "High",
        description: `bpDiastolic low: ${vitals.bpDiastolic} mmHg`
      });
    } else if (vitals.bpDiastolic > 90) {
      incidentFlags.push({
        severity: "High",
        description: `bpDiastolic high: ${vitals.bpDiastolic} mmHg`
      });
    }
  }

  // Glucose: < 70 or ≥ 100 triggers incident
  if (typeof vitals.glucoseMgdl === "number") {
    if (vitals.glucoseMgdl < 70) {
      incidentFlags.push({
        severity: "High",
        description: `Glucose low: ${vitals.glucoseMgdl} mg/dL`
      });
    } else if (vitals.glucoseMgdl >= 100) {
      incidentFlags.push({
        severity: "High",
        description: `Glucose high: ${vitals.glucoseMgdl} mg/dL`
      });
    }
  }

  // RHR: < 50 or > 100 triggers incident
  if (typeof vitals.RHR === "number") {
    if (vitals.RHR < 50) {
      incidentFlags.push({
        severity: "High",
        description: `RHR low: ${vitals.RHR} bpm`
      });
    } else if (vitals.RHR > 100) {
      incidentFlags.push({
        severity: "High",
        description: `RHR high: ${vitals.RHR} bpm`
      });
    }
  }

  // Create an incident for each flag
  for (const flag of incidentFlags) {
    await Incident.create({
      attendanceId: attendance._id,
      severity: flag.severity,
      description: flag.description,
      actions: "Auto-generated from flagged attendance, Review required",
      closure: ""
    });
  }

  return attendance;
}