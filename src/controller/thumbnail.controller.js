import app from ".."
import { authMiddleware } from "../middleware/auth.middleware"
import { upload } from "../middleware/multer.middleware"

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
