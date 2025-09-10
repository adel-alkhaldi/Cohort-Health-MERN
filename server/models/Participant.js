import mongoose from "mongoose";

const { Schema, model } = mongoose;

const participantSchema = new Schema({
  EID: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  age: { type: Number, required: true },
  cohort: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Active", "Inactive", "Withdrawn", "Disqualified"], 
    required: true 
  },

  contactInfo: {
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true }
  },

  emergencyContact: {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },

  baselineVitals: {
    weight: { type: Number, required: true },        
    Hba1c: { type: Number, required: true },         
    bpSystolic: { type: Number, required: true },    
    bpDiastolic: { type: Number, required: true },   
    glucoseMgdl: { type: Number, required: true },   
    RHR: { type: Number, required: true },           
    GripStrengthSec: { type: Number, required: true }
  }

}, { timestamps: true });

// Indexes
participantSchema.index({ cohort: 1 });

export default model("Participant", participantSchema);