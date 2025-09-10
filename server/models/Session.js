import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sessionSchema = new Schema({
  sessionCode: { type: String, required: true, unique: true },

  site: {
    name: { type: String, required: true },
    location: { type: String, required: true }
  },

  date: { type: Date, required: true },
  coachName: { type: String, required: true },
  cohort: { type: String, required: true },
  stage: { type: String, enum: ["Intro", "Intermediate", "Advanced"], required: true },
  notes: { type: String }
}, { timestamps: true });

sessionSchema.index({ cohort: 1, date: -1 });

export default model("Session", sessionSchema);
