import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { githubRouter } from "./routes/github.js";
import { jobsRouter } from "./routes/jobs.js";

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
app.use(express.json({ limit: "2mb" }));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Cron-Secret"],
    exposedHeaders: [
        "X-Resume-Download-Count",
        "X-Total-Resume-Downloads",
        "X-User-Resume-Download-Count",
    ],
}));

app.use('/api/v1/github', githubRouter);
app.use('/api/v1/jobs', jobsRouter);
// app.use('/api/v1/product', productRouter);

app.get("/", (_req, res) => {
    res.status(200).json({
        service: "Gitume backend",
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
