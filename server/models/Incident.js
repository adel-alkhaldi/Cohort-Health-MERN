import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const incidentSchema = new Schema({
  attendanceId: { type: Types.ObjectId, ref: "Attendance", required: true },
  severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
  description: { type: String, required: true },
  actions: { type: String },
  closure: { type: String }
}, { timestamps: true });

incidentSchema.index({ attendanceId: 1 });

export default model("Incident", incidentSchema);


