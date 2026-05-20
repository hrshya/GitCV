import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { githubRouter } from "./routes/github.ts";

dotenv.config();
const PORT = Number(process.env.PORT || 3001);

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/api/v1/github', githubRouter);
// app.use('/api/v1/product', productRouter);

app.get("/", async (req, res) => {
    
});

app.listen(PORT, () => {
    console.log("Server is Running on port: ", PORT);
})
