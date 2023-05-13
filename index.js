var axios = require("axios");
require('dotenv').config()
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

require('dotenv').config()
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')

app.get("/api/v1/get", function(req, res){
    const query = 'select * from fuel';
    connection.query(query, (err, rows)=>{
        if(err) throw err

        return res.send(rows)
    })

})

app.post("/api/v1/add", jsonParser, function (req, res) {
    const query = "insert into fuel(name, Age) values('" + req.body.name + "','" + req.body.Age + "');";
    connection.query(query, (err, rows) => {
        if (err) throw err

        return res.send("record added")
    })
});

app.listen(3000, () => {
    console.log("Port listening on 3000...");
});