import dotenv from "dotenv"


dotenv.config()

export const verifyServerToServerCallback = async (req,res,next) => {

    try {
    
        const {svToken} = req.body

        if(!svToken || !svToken.trim()){
            throw new Error("Error not Authorized")
        }

        if(svToken != process.env.SERVER_TO_SERVER_TOKEN){
            throw new Error("Internal Server Error")
        }

        next()
        
    } catch (error) {
      next(error)   
    }

}