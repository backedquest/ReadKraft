import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/connectDB.js'
import userRouter from './routes/userRoute.js'


dotenv.config()

const app=express()
app.use(cors({
    credentials:true,
    origin: process.env.FRONTEND_URL
}))

// Special handling for Stripe webhook
app.use('/api/user/webhook', express.raw({ type: 'application/json' }));

app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}))

app.use('/api/user',userRouter)

const PORT = 8080 || process.env.PORT

connectDB().then(()=>{
    app.listen(PORT,()=>{
    console.log("Server is running",PORT)
    })
})
