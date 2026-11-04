require("dotenv").config();

const express=require("express");

const cors=require("cors");

const ragRoutes=require("./routes/ragRoutes");

const app=express();

app.use(cors());

app.use(express.json());

app.use("/api/rag",ragRoutes);

module.exports=app;