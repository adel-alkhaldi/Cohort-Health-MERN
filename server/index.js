import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import routes from "./routes/route.js";
import cors from "cors";


dotenv.config();

// (MONGO_URI has Connection & its setup to allow anyone to connect & has seed data)
const MONGO_URI = process.env.MONGO_URI || "test:test@cluster0.r02bnfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; 
const PORT = process.env.PORT || 3000; 

const app = express();
app.use(cors());

app.use(express.json());

app.use("/", routes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });