import express from "express";
import cors from "cors";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import{ google} from "googleapis"
import fs from "fs"
import axios from "axios"
import { upload } from "./middleware/multer.middleware.js";
import { authMiddleware , verifyServerToServerCallback } from "./middleware/auth.middleware.js";
import { Worker } from 'bullmq';
import initWorker from "./worker/worker.js";


dotenv.config();

// -- Init --

const app = express();
app.use(express.json());

app.use(cors({
  credentials:true,
  origin:process.env.ORIGIN_URL
}))


app.listen(process.env.PORT, () => {
    console.log(`Server is Up and Running on PORT ${process.env.PORT}`);
});

// Init Worker

initWorker()



export default app





