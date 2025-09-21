import Participant from "../models/Participant.js";

/**
 * Returns the weekly report for a cohort and weekStart, using new incident flagging rules.
 */
export async function getWeeklyReport(cohort, weekStart) {
  const pipeline = [
    { $match: { cohort } },
    {
      $lookup: {
        from: "attendances",
        let: { pid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$participantId", "$$pid"] },
                  { $eq: ["$weekStart", new Date(weekStart)] }
                ]
              }
            }
          }
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
        // New flagCount logic
        flagCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.GripStrengthSec", null] },
                    { $lt: ["$attendances.sessionVitals.GripStrengthSec", 30] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.Hba1c", null] },
                    { $gte: ["$attendances.sessionVitals.Hba1c", 42] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.bpSystolic", null] },
                    { $lt: ["$attendances.sessionVitals.bpSystolic", 90] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.bpSystolic", null] },
                    { $gt: ["$attendances.sessionVitals.bpSystolic", 130] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.bpDiastolic", null] },
                    { $lt: ["$attendances.sessionVitals.bpDiastolic", 60] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.bpDiastolic", null] },
                    { $gt: ["$attendances.sessionVitals.bpDiastolic", 90] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.glucoseMgdl", null] },
                    { $lt: ["$attendances.sessionVitals.glucoseMgdl", 70] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.glucoseMgdl", null] },
                    { $gte: ["$attendances.sessionVitals.glucoseMgdl", 100] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.RHR", null] },
                    { $lt: ["$attendances.sessionVitals.RHR", 50] }
                  ]},
                  { $and: [
                    { $ne: ["$attendances.sessionVitals.RHR", null] },
                    { $gt: ["$attendances.sessionVitals.RHR", 100] }
                  ]}
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
        attendanceCodes: { $addToSet: "$attendances.attendanceCode" },
        attendanceDetails: {
          $addToSet: {
            attendanceId: "$attendances._id",
            participantId: "$_id",
            participantName: "$fullName",
            sessionId: "$attendances.sessionId",
            attendanceDate: "$attendances.date",
            hasAttended: "$attendances.hasAttended",
            sessionVitals: "$attendances.sessionVitals"
          }
        }
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
        // Correct flagPercent logic: flagged attendances / total attendances * 100
        flagPercent: {
          $cond: [
            { $eq: ["$totalAttendanceRecords", 0] },
            0,
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: "$attendanceDetails",
                          as: "att",
                          cond: {
                            $in: [
                              "$$att.attendanceId",
                              {
                                $setUnion: {
                                  $reduce: {
                                    input: "$incidents",
                                    initialValue: [],
                                    in: { $concatArrays: ["$$value", "$$this.attendanceId"] }
                                  }
                                }
                              }
                            ]
                          }
                        }
                      }
                    },
                    "$totalAttendanceRecords"
                  ]
                },
                100
              ]
            }
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
        attendanceCodes: 1,
        attendanceDetails: 1
      }
    }
  ];
  return await Participant.aggregate(pipeline);
}

export async function getAllReportWeeks() {
  // Returns all distinct weekStart dates in Attendance collection, sorted descending (newest first)
  const weeks = await import("../models/Attendance.js").then(({ default: Attendance }) =>
    Attendance.distinct("weekStart")
  );
  // Sort descending (latest first)
  return weeks.sort((a, b) => new Date(b) - new Date(a));
}