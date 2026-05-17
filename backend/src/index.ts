import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { githubRouter } from "./routes/github.ts";

dotenv.config();
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/github', githubRouter);
// app.use('/api/v1/product', productRouter);

app.get("/", async (req, res) => {
    
});

app.listen(PORT, () => {
    console.log("Server is Running on port: ", PORT);
})
