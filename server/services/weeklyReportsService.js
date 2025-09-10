import Participant from "../models/Participant.js";

export async function getWeeklyReport(cohort, weekStart) {
  const pipeline = [
    { $match: { cohort } },
    {
      $lookup: {
        from: "attendances",
        let: { pid: "$_id" },
        pipeline: [
          { $match: {
              $expr: {
                $and: [
                  { $eq: ["$participantId", "$$pid"] },
                  { $eq: ["$weekStart", new Date(weekStart)] }
                ]
              }
          }}
        ],
        as: "attendances"
      }
    },
    { $unwind: { path: "$attendances", preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: "sessions",
        localField: "attendances.sessionId",
        foreignField: "_id",
        as: "session"
      }
    },
    { $unwind: "$session" },
    {
      $lookup: {
        from: "incidents",
        localField: "attendances._id",
        foreignField: "attendanceId",
        as: "incidents"
      }
    },
    {
      $group: {
        _id: { cohort: "$cohort", weekStart: "$attendances.weekStart" },
        totalSessions: { $addToSet: "$session._id" },
        totalAttendances: { $sum: { $cond: ["$attendances.hasAttended", 1, 0] } },
        participantsAttended: { $addToSet: "$_id" },
        avgWeight: { $avg: "$attendances.sessionVitals.weight" },
        avgGlucose: { $avg: "$attendances.sessionVitals.glucoseMgdl" },
        avgBPsys: { $avg: "$attendances.sessionVitals.bpSystolic" },
        avgBPdia: { $avg: "$attendances.sessionVitals.bpDiastolic" },
        avgGripStrengthSec: { $avg: "$attendances.sessionVitals.GripStrengthSec" },
        flagCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gte: ["$attendances.sessionVitals.bpSystolic", 150] },
                  { $gte: ["$attendances.sessionVitals.bpDiastolic", 90] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalAttendanceRecords: { $sum: 1 },
        retentionCount: { $sum: { $cond: ["$attendances.hasAttended", 1, 0] } },
        incidents: { $push: "$incidents" },
        attendanceCodes: { $addToSet: "$attendances.attendanceCode" }
      }
    },
    {
      $project: {
        _id: 0,
        cohort: "$_id.cohort",
        weekStart: "$_id.weekStart",
        totalSessions: { $size: "$totalSessions" },
        totalAttendances: 1,
        participantsAttended: { $size: "$participantsAttended" },
        avgWeight: 1,
        avgGlucose: 1,
        avgBPsys: 1,
        avgBPdia: 1,
        avgGripStrengthSec: 1,
        flagPercent: {
          $cond: [
            { $eq: ["$totalAttendanceRecords", 0] },
            0,
            { $multiply: [{ $divide: ["$flagCount", "$totalAttendanceRecords"] }, 100] }
          ]
        },
        retention: {
          $cond: [
            { $eq: ["$totalAttendanceRecords", 0] },
            0,
            { $multiply: [{ $divide: ["$retentionCount", "$totalAttendanceRecords"] }, 100] }
          ]
        },
        incidentsCount: {
          $size: {
            $reduce: {
              input: "$incidents",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        },
        attendanceCodes: 1
      }
    }
  ];
  return await Participant.aggregate(pipeline);
}

export async function getAllReportWeeks() {
  // Returns all distinct weekStart dates in Attendance collection, sorted descending
  const weeks = await import("../models/Attendance.js").then(({ default: Attendance }) =>
    Attendance.distinct("weekStart")
  );
  // Sort descending (latest first)
  return weeks.sort((a, b) => new Date(b) - new Date(a));
}