import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Regex for EID: starts with 784, 15 digits total
const eidRegex = /^784\d{12}$/;

// Regex for phone: starts with +971, 14 chars (13 Numbers), numbers only after +
const phoneRegex = /^\+971\d{9}$/;

const participantSchema = new Schema({
  EID: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => eidRegex.test(v),
      message: "EID must be 15 digits, start with 784, and contain only numbers"
    }
  },
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
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: v => phoneRegex.test(v),
        message: "Phone number must start with +971 and be 14 characters, numbers only after +"
      }
    },
    email: { type: String, required: true }
  },

  emergencyContact: {
    name: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: v => phoneRegex.test(v),
        message: "Emergency phone must start with +971 and be 14 characters, numbers only after +"
      }
    }
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