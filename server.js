import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
const app=express();
const port=process.env.PORT|| 3000

app.use(express.json())
app.use(cors({credentials:true}))
app.use(cookieParser())

connectDB();

app.get('/',(req,res)=>res.send("API working fine"))

app.listen(port,()=>{
    console.log(`Server started on port ${port}`)
})

