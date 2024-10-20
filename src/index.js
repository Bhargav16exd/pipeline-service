import express from "express";
import cors from "cors";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import{ google} from "googleapis"
import fs from "fs"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

app.listen(process.env.PORT, () => {
    console.log(`Server is Up and Running on PORT ${process.env.PORT}`);
});

app.post('/upload', async (req, res) => {

    try {
        const { team, client, video , token } = req.body;
    
        if (!team || !client || !video || !token ) {
            return res.status(400).send("Missing Parameters");
        }
    
        console.log(token)
    
        oauth2Client.setCredentials({
            access_token: token.access_token,
            refresh_token: token.refresh_token
        });
    
        // GCP Download
        const storage = new Storage();
        const bucketName = "pipeline_oneminus"
        const options = {
            destination: `${video.videoName}.${video.extension}`,
        };
    
       await storage.bucket(bucketName).file(`srushti/${video.videoName}`).download(options);
    
    
    
       // YT Upload
       
       const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
       const videoResponse = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: 'Your Video Title',
                description: 'Your Video Description',
            },
            status: {
                privacyStatus: 'private',  // Set privacy status
            },
        },
        media: {
            body: fs.createReadStream(`${video.videoName}.${video.extension}`),
        },
        });
    
        console.log(videoResponse)

        fs.unlink(`${video.videoName}.${video.extension}`)
    
    } catch (error) {
      
        console.log(error)

    } 
  
});
