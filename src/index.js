import express from "express";
import cors from "cors";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import{ google} from "googleapis"
import fs from "fs"
import axios from "axios"
import { upload } from "./middleware/multer.middleware.js";
import { authMiddleware, verifyServerToServerCallback } from "./middleware/auth.middleware.js";
import { Worker, Job } from 'bullmq';
import { Console } from "console";


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  credentials:true,
  origin:process.env.ORIGIN_URL
}))

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

const storage = new Storage();
const bucketName = "pipeline_oneminus"


app.listen(process.env.PORT, () => {
    console.log(`Server is Up and Running on PORT ${process.env.PORT}`);
});

const worker = new Worker('yt-upload-queue', async (job) => {

    try {

        //Get data
        const { team, client, video , token , YT_META_DATA } = job.data;
    
        //Data serializaiton
        if (!team || !client || !video || !token || !YT_META_DATA ) {
            return res.status(400).send("Missing Parameters");
        }
    
        //Google OAUTH2 Setup
        oauth2Client.setCredentials({
            access_token: token.access_token,
            refresh_token: token.refresh_token
        });

        // GCP Download    
        const options = {
            destination: `${video._id}.${video.extension}`,
        };

    
       await storage.bucket(bucketName).file(`${client.username}/${video._id}`).download(options,{}).then((data)=>{
        console.log(data)
       });       

    
       // YT Upload   
        const youtube =  google.youtube({ version: 'v3', auth: oauth2Client });
       
        await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: YT_META_DATA.title,
                description: YT_META_DATA.description,
                tags: YT_META_DATA.tags
            },
            status: {
                privacyStatus: YT_META_DATA.privacyStatus,
            },
            
        },
        notifySubscribers:YT_META_DATA.notifySubscribers,
        media: {
            body: fs.createReadStream(`${video._id}.${video.extension}`),
        },
        }).then(async (videoResponse)=>{

            if(!videoResponse){
                return
            }


            if(videoResponse.status == 200){

                await youtube.thumbnails.set({
                    videoId:videoResponse.data.id,
                    media: {
                    body: fs.createReadStream(YT_META_DATA.thumbnail),
                    }
                });

                const data = await axios.post("http://localhost:9000/api/yt/status",{
                    team,
                    video,
                    YT_META_DATA
                })

                if(data.status == 200){
                    fs.unlinkSync(`${video._id}.${video.extension}`)
                    fs.unlinkSync(YT_META_DATA.thumbnail)
                    return 
                }

            }

        })

    } catch (error) {
        console.log(error)
        //return error reponse
    } 
    
},
  { concurrency: parseInt(process.env.CONCURRENCY_COUNT) , 
    connection:{
        host:"localhost"
  } },
);

worker.on("completed",(job)=>{
    console.log("JOB")
})


app.post('/thumbnail',authMiddleware,upload.single('thumbnail'),(req,res)=>{

    if( req.file.size > 2000000 ){
        
        fs.unlinkSync(`${req.file.destination}/${req.file.filename}`)

        return res.json({
        success:false,
        statusCode:400,
        message:"File Size too large",
        })
       
    }

    return res.json({
        success:true,
        statusCode:201,
        message:"Thumbnail Upload Sucesss",
        data:{
            destination:req.file.destination,
            filename:req.file.filename
        }
    })
})






