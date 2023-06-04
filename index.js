require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const { Client } = require('pg')
const client = new Client(process.env.DATABASE_URL)
client.connect()

app.get("/api/v1/add", async (req, res) => {
    const { usage } = req.query;
    console.log(req.query)
    let d = new Date();
    let date = d.toISOString().slice(0,10);
    console.log(date)
    try {
        const results = await client.query("insert into test(fuel_usage, date) values('" + usage + "','" + date + "');");
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

app.get("/api/fuel/daily", async (req, res) => {
    try {
        const results = await client.query("SELECT TO_CHAR(date, 'Day') AS day_name, SUM(fuel_usage) AS fuel_usage FROM tbl_fuel_usage WHERE DATE(date) = CURRENT_DATE AND EXTRACT(month FROM date) = EXTRACT(month FROM CURRENT_DATE) GROUP BY day_name;");
        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/fuel/weekly", async (req, res) => {
    try {
        const results = await client.query("SELECT DATE_TRUNC('week', date) AS week_start_date,EXTRACT(week FROM date) - EXTRACT(week FROM DATE_TRUNC('month', date)) + 1 AS week_in_month,SUM(fuel_usage) AS total_fuel_usage FROM tbl_fuel_usage WHERE EXTRACT(month FROM date) = EXTRACT(month FROM CURRENT_DATE) GROUP BY week_start_date, week_in_month ORDER BY week_start_date;");
        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/fuel/monthly", async (req, res) => {
    try {
        const results = await client.query("SELECT TO_CHAR(date, 'Month') AS month_name, SUM(fuel_usage) AS total_fuel_usage FROM tbl_fuel_usage GROUP BY month_name ORDER BY MIN(date);");
        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})


app.listen(3000, () => {
    console.log("Port listening on 3000...");
});