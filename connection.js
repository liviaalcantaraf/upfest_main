let mysql = require('mysql');
require("dotenv").config();

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect();

function queryDB(sql, valores) {
    return new Promise((resolve, reject) => {
        connection.query(sql, valores, function (err, resultados) {
            if (err) {
                reject(err);
            } else {
                resolve(resultados);
            }
        });
    });
}

module.exports = {queryDB, connection};