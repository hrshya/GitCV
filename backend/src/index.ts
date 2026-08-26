import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { githubRouter } from "./routes/github.js";
import { jobsRouter } from "./routes/jobs.js";
import { resumeRouter } from "./routes/resume.js";

dotenv.config();
const PORT = Number(process.env.PORT || 3001);
const allowedOrigins = [
    "http://localhost:3000",
    "https://gitume.vercel.app",
    ...(process.env.FRONTEND_URLS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
];

const app = express();
app.use(express.json());
app.use(cors({}));

app.use('/api/v1/github', githubRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/resume', resumeRouter);
// app.use('/api/v1/product', productRouter);

app.get("/", (_req, res) => {
    res.status(200).json({
        service: "GitCV backend",
        status: "ok",
    });
});

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.listen(PORT, () => {
    console.log("Server is Running on port: ", PORT);
})
