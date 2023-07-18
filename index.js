require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const { Client, Pool } = require('pg')
// const client = new Client(process.env.DATABASE_URL)
// client.connect()

const pool = new Pool({
    user: 'fuel_db_user',
    host: 'dpg-chfrogu7avjbbjpunvh0-a.singapore-postgres.render.com',
    database: 'fuel_db',
    password: 'u7OIkPidCZHq980ONCYXjh59dSZZDr1X',
    port: 5432,
    ssl: true
  })

app.get("/api/v1/add", async (req, res) => {
    const { usage } = req.query;
    console.log(req.query)
    let d = new Date();
    let date = d.toISOString().slice(0,10);
    console.log(date)
    try {
        const results = await pool.query("insert into tbl_fuel_usage(fuel_usage, date) values('" + usage + "','" + date + "');");
        res.json("record added successfully")

    } catch (err) {
        console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/v1/get", async (req, res) => {
    try {
        const results = await pool.query("select * from tbl_fuel_usage");
        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/v1/login", async (req, res) => {
    try {
        const results = await pool.query("select * from tbl_login where id=1");
        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/fuel/daily", async (req, res) => {
    try {
        const dayily = await pool.query(`
    select
        TO_CHAR(date,
        'Day') as day_name,
        SUM(fuel_usage) as fuel_usage
    from
        tbl_fuel_usage
    where
        DATE(date) = CURRENT_DATE
        and extract(month
    from
        date) = extract(month
    from
        CURRENT_DATE)
    group by
        day_name;`);

        const totalWeek = await pool.query(` 
        SELECT
    SUM(fuel_usage) AS total_usage
FROM
    tbl_fuel_usage
WHERE
    date >= CURRENT_DATE - INTERVAL '6 days'
    AND date <= CURRENT_DATE;`);

        const daysInWeek = await pool.query(`
        SELECT
        g.date AS date,
        COALESCE(SUM(fu.fuel_usage), 0) AS total_usage,
        TO_CHAR(g.date::date, 'Day') AS day
      FROM
        generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'
        ) AS g(date)
      LEFT JOIN tbl_fuel_usage fu ON fu.date = g.date
      GROUP BY g.date
      ORDER BY g.date desc  
        `);

        let data = {}
        data.daily= dayily.rows[0]
        data.totalInWeek = totalWeek.rows[0]
        data.daysInWeek = daysInWeek.rows
        res.send(data)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/fuel/weekly", async (req, res) => {
    try {
        const results = await pool.query(`
SELECT 
  date_trunc('week', date) AS week_start_date,
  EXTRACT(WEEK FROM date) AS week_number,
  SUM(fuel_usage) AS total_fuel_usage
FROM tbl_fuel_usage
WHERE date BETWEEN current_date - interval '4 weeks' AND current_date
GROUP BY week_start_date, week_number
ORDER BY week_start_date ASC;`);
        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})

app.get("/api/fuel/monthly", async (req, res) => {
    try {
        const results = await pool.query("SELECT TO_CHAR(date, 'Month') AS month_name, SUM(fuel_usage) AS total_fuel_usage FROM tbl_fuel_usage GROUP BY month_name ORDER BY MIN(date);");

        res.send(results.rows)
    } catch (err) {
        // console.error("error executing query:", err);
        res.send(err)
    }

})


app.listen(3000, () => {
    console.log("Port listening on 3000...");
});