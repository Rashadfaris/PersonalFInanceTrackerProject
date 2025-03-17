import express, { request } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from "./config/connectDB.js"
import userRouter from './route/user.route.js'
import adminRoutes from "./route/adminRoutes.js";
import transactionRoutes from "./route/transactionRoutes.js";   
import budgetRoutes from './route/budgetRoutes.js';
import notificationRoutes from './route/notificationRoutes.js';
import reportsRouter from './route/reportRoutes.js';
import cron from 'node-cron';

import goalRoutes from "./route/goalRoutes.js";

const app =express()
app.use(cors({
    
    Credentials:true,
    origin :process.env.FRONTEND_URL
}))

app.use(express.json())
app.use(cookieParser())
app.use(morgan("combined"))
app.use(helmet({
    crossOriginResourcePolicy:false
}))

const PORT =5000 || process.env.PORT

app.get("/",(request,response)=>{
    //Server to client 
    response.json({
        message :" Server  is Running"+ PORT
    })
})
cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Updating exchange rates...");
    await fetchExchangeRates();
 });

//unit testing
app.get("/hello", (req, res) => {
    res.status(200).json({ message: "Hello, World!" });
});

app.use('/api/user',userRouter);
app.use('/admin', adminRoutes);
app.use("/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use('/api', notificationRoutes);
app.use('/api/reports', reportsRouter); 

app.use('/api/goals', goalRoutes);


connectDB()

app.listen(PORT,()=>{
    console.log("Server is running",PORT)
})

//module.exports = app; // Export for testing
export default app