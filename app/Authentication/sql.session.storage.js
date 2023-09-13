//Session Storage Connection
//=================================================
const mysql = require("mysql2/promise");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const sql = require("../Data_Base/db.connection");

// const connectionPromise = mysql.createConnection({
//      host: 'sql.coolchain.com.mx',
//      user: 'atechnik_kevin',
//      password: 'K(Qp9G&3igTs',
//      database: 'atechnik_hTelemetry'
// });
//const db = connectionPromise;

let db = sql.connect();

db.query = function (sql, params, callback) {
     this.then((db) => db.query(sql, params))
          .then(([results, model]) => {
               
               callback(null, results);
          }).catch((error) => {
               console.log("HINT");
              
               callback(error, null);
          });
}
const sessionStore = new MySQLStore({
     clearExpired: true,
     checkExpirationInterval: 900000,
     createDatabaseTable: true,
     endConnectionOnClose: true,
     schema: {
          tableName: 'USERS_SESSIONS',
          columnNames: {
               session_id: 'session_id',
               expires: 'expires',
               data: 'data'
          }
     }
}, db);

module.exports = sessionStore;


