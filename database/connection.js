let mysql = require('mysql');

// let conn = mysql.createConnection({
//     host     : "localhost",
//     user     : "root",
//     password : "",
//     database : "credit_tracker"
// });

let conn = mysql.createConnection({
    host     : "database-1.cohesbi5e4hv.us-east-2.rds.amazonaws.com",
    user     : "admin",
    password : "Createyour1",
    database : "credit_tracker"
});

conn.connect();

module.exports = conn;