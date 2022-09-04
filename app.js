const express = require("express");
const app = express();
const axios =  require("axios")
const redis = require("redis")
//import { createClient } from 'redis';
const responseTime = require("response-time")
const helmet = require("helmet");
const {promisify } = require("util")

app.use(responseTime());
app.use(helmet());

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});


const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

//client.on('error', (err) => console.log('Redis Client Error', err));


app.get("/roket", async (req,res) => {
    try {
        const reply = await GET_ASYNC("rokets")
        if(reply) { 
            
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get("https://api.spacexdata.com/v3/rockets");    
        const saveResult = await SET_ASYNC("rokets",JSON.stringify(response.data),"EX",5)
        console.log("response has been caches", saveResult);
        res.send(response.data)
    } catch (error) {
        res.send(error)
    }
});

app.get("/roket/:roket_id", async (req,res) => {
    const {roket_id} = req.params;
    try {
        const reply = await GET_ASYNC(roket_id)
        if(reply) { 
            
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get(`https://api.spacexdata.com/v3/rockets/${roket_id}`);    
        const saveResult = await SET_ASYNC(roket_id,JSON.stringify(response.data),"EX",5)
        console.log("response has been caches", saveResult);
        res.send(response.data)
    } catch (error) {
        res.send(error)
    }
});

app.listen(3000,() => {
    console.log(`app is running on port ${3000}`)
})