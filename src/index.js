import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initWorker from "./worker/uploader.worker.js";
import { router as thumbnailrouter } from "./controller/thumbnail.controller.js";
import initQueues from "./services/init.queues.js";

dotenv.config();

// -- Init --

const app = express();
app.use(express.json());

app.use(cors({
  credentials:true,
  origin:process.env.ORIGIN_URL
}))

app.use('/',thumbnailrouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is Up and Running on PORT ${process.env.PORT}`);
});

//Init Queue
initQueues()

// Init Worker
initWorker()




  
export default app





