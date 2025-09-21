import mongoose from "mongoose";
import dotenv from "dotenv";
import Participant from "./models/Participant.js";
import Session from "./models/Session.js";
import Attendance from "./models/Attendance.js";
import Incident from "./models/Incident.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase();

  // 1. Create 12 participants (4 per cohort)
  const cohorts = ["Cohort A", "Cohort B", "Cohort C"];
  const participants = [];
  for (let i = 0; i < 12; i++) {
    participants.push(await Participant.create({
      EID: `7841234567890${i.toString().padStart(2, "0")}`,
      fullName: `Participant ${i + 1}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      age: 25 + i,
      cohort: cohorts[Math.floor(i / 4)],
      status: i < 5 ? "Inactive" : "Active",
      contactInfo: {
        phoneNumber: `971500000${100 + i}`,
        email: `participant${i + 1}@example.com`
      },
      emergencyContact: {
        name: `Emergency Contact ${i + 1}`,
        phoneNumber: `971500000${200 + i}`
      },
      baselineVitals: {
        weight: 60 + i,
        Hba1c: 45 + i,
        bpSystolic: 120 + (i % 3 === 0 ? 35 : 0),
        bpDiastolic: 80 + (i % 4 === 0 ? 15 : 0),
        glucoseMgdl: 90 + i,
        RHR: 70 + i,
        GripStrengthSec: 30 + i
      }
    }));
  }

  // 2. Create 5 sessions per cohort, one in each week (Aug 4, 11, 18, 25, Sep 1)
  const sessionDates = [];
  const startDate = new Date("2025-08-04T09:00:00Z"); // Monday, Aug 4
  for (let w = 0; w < 5; w++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + w * 7);
    sessionDates.push(d);
  }
  const sessions = [];
  const stages = ["Intro", "Intermediate", "Advanced"];
  let sessionCount = 0;
  for (let week = 0; week < sessionDates.length; week++) {
    for (let c = 0; c < cohorts.length; c++) {
      sessions.push(await Session.create({
        sessionCode: `S${100 + sessionCount}`,
        site: { name: `Site ${sessionCount + 1}`, location: `Location ${sessionCount + 1}` },
        date: sessionDates[week],
        coachName: `Coach ${String.fromCharCode(65 + sessionCount)}`,
        cohort: cohorts[c],
        stage: stages[sessionCount % stages.length],
        notes: `Session ${sessionCount + 1} notes`
      }));
      sessionCount++;
    }
  }

  // 3. Create 5 attendances per participant (one for each week/session in their cohort)
  // Total: 12 participants * 5 weeks = 60 attendances
  const attendances = [];
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const cohortSessions = sessions.filter(s => s.cohort === participant.cohort);
    for (let w = 0; w < cohortSessions.length; w++) {
      // Incident flags for first 5 participants, first week only
      const isFirstWeek = w === 0;
      const highBP = isFirstWeek && i === 0;
      const highDia = isFirstWeek && i === 1;
      const highHba1c = isFirstWeek && i === 2;
      const highHba1c2 = isFirstWeek && i === 3;
      const missed = isFirstWeek && i === 4;
      attendances.push(await Attendance.create({
        participantId: participant._id,
        sessionId: cohortSessions[w]._id,
        date: cohortSessions[w].date,
        hasAttended: missed ? false : true,
        sessionVitals: {
          bpSystolic: highBP ? 155 : 120 + (i % 10),
          bpDiastolic: highDia ? 95 : 80 + (i % 5),
          weight: 60 + (i % 12),
          glucoseMgdl: 90 + (i % 20),
          RHR: 70 + (i % 15),
          GripStrengthSec: 30 + (i % 10),
          Hba1c: highHba1c || highHba1c2 ? 50 : 45 + (i % 5)
        },
        weekStart: getWeekStart(cohortSessions[w].date)
      }));
    }
  }

  // 4. Create incidents for first 5 participants, first week only
  const firstWeekSessions = {};
  for (const cohort of cohorts) {
    firstWeekSessions[cohort] = sessions.find(s => s.cohort === cohort && s.date.getTime() === sessionDates[0].getTime());
  }
  const firstWeekAttendances = attendances.filter(a => {
    const participantObj = participants.find(p => p._id.equals(a.participantId));
    if (!participantObj) return false;
    return a.sessionId.equals(firstWeekSessions[participantObj.cohort]._id);
  });

  for (let i = 0; i < 5; i++) {
    const participant = participants[i];
    const session = firstWeekSessions[participant.cohort];
    const attendance = attendances.find(a =>
      participants.find(p => p._id.equals(a.participantId))?._id.equals(participant._id) &&
      a.sessionId.equals(session._id)
    );
    if (!attendance) continue;
    if (i === 0) {
      await Incident.create({
        attendanceId: attendance._id,
        severity: "High",
        description: "bpSystolic Above 140",
        actions: "Stopped session, monitored vitals",
        closure: "Condition Stabilized"
      });
    } else if (i === 1) {
      await Incident.create({
        attendanceId: attendance._id,
        severity: "High",
        description: "bpDiastolic Above 90",
        actions: "Taken to the hospital",
        closure: "Session stopped and monitored"
      });
    } else if (i === 2) {
      await Incident.create({
        attendanceId: attendance._id,
        severity: "High",
        description: "Hba1c >= 48",
        actions: "Recommended dietary changes",
        closure: "Participant scheduled follow up with GP"
      });
    } else if (i === 3) {
      await Incident.create({
        attendanceId: attendance._id,
        severity: "High",
        description: "Hba1c >= 48",
        actions: "Recommended dietary changes",
        closure: "Participant scheduled follow up with GP"
      });
    } else if (i === 4) {
      await Incident.create({
        attendanceId: attendance._id,
        severity: "Low",
        description: "Missed session",
        actions: "Notified participant",
        closure: "Had a valid excuse"
      });
    }
  }

  console.log("Seeding complete!");
  await mongoose.disconnect();
}

seed().catch(err => console.error(err));