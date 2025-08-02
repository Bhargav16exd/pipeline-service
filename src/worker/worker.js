import { Storage } from "@google-cloud/storage";
import { Worker } from "bullmq";
import { google } from "googleapis";
import fs from "fs"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

const storage = new Storage();
const bucketName = "pipeline_oneminus"
let worker ;


function initWorker(){

    worker = new Worker('yt-upload-queue', async (job) => {

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

        
            await storage.bucket(bucketName).file(`${client.username}/${video._id}`).download(options).then(()=>{
                console.log("Download Complete")
            });       

            await oauth2Client.refreshAccessToken()
        
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
            throw(error)
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

    worker.on("error",(error)=>{
        console.log("[ Bull MQ & Redis Connection ] : FAILED " , error)
        process.exit(1)
    })

}



export default initWorker

