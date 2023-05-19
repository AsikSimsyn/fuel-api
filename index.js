require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const { Client } = require('pg')
const client = new Client(process.env.DATABASE_URL)
client.connect()

app.get("/api/v1/add", async (req, res) => {
    const { name, age } = req.query;
    console.log(req.query)
    try {
        const results = await client.query("insert into test(name, age) values('" + name + "','" + age + "');");
        res.json("record added successfully")
         
    } catch (err) {
        console.error("error executing query:", err);
        res.send(err)
    } 

})

app.get("/api/v1/get", async (req, res) => {
    try {
        const results = await client.query("select * from test");
         res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})


app.post("/api/v1/add", jsonParser, async (req, res)=> {
    const { name, age } = req.body;
    console.log(req.body)
    try {
        const results = await client.query("insert into test(name, age) values('" + name + "','" + age + "');");
        res.json("record added successfully")
         
    } catch (err) {
        console.error("error executing query:", err);
        res.send(err)
    } 
   
});

app.listen(3000, () => {
    console.log("Port listening on 3000...");
});