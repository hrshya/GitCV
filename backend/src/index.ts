import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { githubRouter } from "./routes/github.js";

dotenv.config();
const PORT = Number(process.env.PORT || 3001);

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [
        "X-Resume-Download-Count",
        "X-Total-Resume-Downloads",
        "X-User-Resume-Download-Count",
    ],
}));

app.use('/api/v1/github', githubRouter);
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
