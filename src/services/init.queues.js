import { Queue } from "bullmq"
import IORedis from 'ioredis';

let statusQueue ;

async function initQueues(){
    statusQueue = new Queue('upload-status-queue');

    //Set Global Concurrecny
    await statusQueue.setGlobalConcurrency(3)

    const connection = new IORedis();
 
    connection.on("ready",()=>{
        console.log("[ Bull MQ & Redis Connection ] : SUCCESS ")
        console.log("[ QUEUE CREATED ]",statusQueue.name)
    })

    connection.on("error",(error)=>{
        console.log("[ Bull MQ & Redis Connection ] : FAILED ", error )
        throw error
    })


    setInterval(async ()=>{
        // console.log(await uploadQueue.getJobCounts())
    },10000)

}


export default initQueues

export {
    statusQueue
}
