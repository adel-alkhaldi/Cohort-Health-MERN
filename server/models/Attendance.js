import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const attendanceSchema = new Schema({
  participantId: { type: Types.ObjectId, ref: "Participant", required: true },
  sessionId: { type: Types.ObjectId, ref: "Session", required: true },
  date: { type: Date, required: true }, // Date of the session Itself
  hasAttended: { type: Boolean, default: true },
  sessionVitals: {
    bpSystolic: { type: Number },
    bpDiastolic: { type: Number },
    weight: { type: Number },
    glucoseMgdl: { type: Number },
    RHR: { type: Number },
    GripStrengthSec: { type: Number },
    Hba1c: { type: Number }
  },
  weekStart: { type: Date, required: true } // Helper variable for determining what week does this session belong to (WeeklyReportsService uses this)
}, { timestamps: true });

// Indexes for cohort + weekly reporting (TODO: Make a scheduler later on)
attendanceSchema.index({ participantId: 1, date: -1 });
attendanceSchema.index({ sessionId: 1 });
attendanceSchema.index({ weekStart: 1 });

export default model("Attendance", attendanceSchema);
