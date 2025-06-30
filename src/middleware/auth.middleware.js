import dotenv from "dotenv"
import jwt from "jsonwebtoken"

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

export const authMiddleware = async (req,res,next)=>{

    try {

        let token
        const JWT_SECRET = process.env.JWT_SECRET 

        if(!token){
        token = req.header("Authorization").split(" ")[1]
        }

        //const token = req.header("Authorization").split[" "] req.header("Authorization") gives single header req.headers give all headers 

        if(!token){
            throw new Error("Error not Authorized")
        }

        const {_id}  = jwt.verify(token,JWT_SECRET)

        if(!_id){
            throw new Error("Error not Authorized")
        }

        next()
        
    } catch (error) {

        next(error)
    }

}