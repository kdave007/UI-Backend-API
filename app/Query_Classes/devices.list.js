const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

/**
 * @brief
 *  CLASS
 *  Query 
 *  devices list 
 *
 */

exports.getLinked = async (userId) => {
     var mainQuery = `SELECT device.deviceId as id, alias, route, lastSeen as lastseen, mac as macflag, gen  FROM device `+
     `RIGHT JOIN user_device `+
     `ON user_device.deviceId = device.deviceId `+
     `WHERE userId=${userId} ORDER BY device.deviceId ASC LIMIT 200`;

     let con = await sql.connect();

     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
          if (rows.length) {
               result = {err:null,data:rows};
               //console.table(rows);
          }else{
               result = {err:null,data:false};
          }    
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:null};
     });
     
     return result;  
}

exports.setNewLink = async (userId,deviceId) => {
     let mainQuery = `INSERT INTO user_device SET userId=${userId},deviceId=${deviceId} `;

     console.log(mainQuery);

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {

          if (rows.affectedRows) {
               result = {err:null,data:rows.affectedRows};
          }else{
               result = {err:null,data:0};
          }
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result;
}

exports.deleteAllLinks = async (userId) => {
     let mainQuery = `DELETE FROM user_device WHERE userId=${userId}`;

     console.log(mainQuery);

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {

          if (rows.affectedRows) {
               result = {err:null,data:rows.affectedRows};
          }else{
               result = {err:null,data:0};
          }
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result;
}

exports.deleteLinkByDevice = async (deviceId) => {
     let mainQuery = `DELETE FROM user_device WHERE deviceId=${deviceId}`;

     console.log(mainQuery);

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {

          if (rows.affectedRows) {
               result = {err:null,data:rows.affectedRows};
          }else{
               result = {err:null,data:0};
          }
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result;
}

exports.create = async (alias,route,bssid,createdBy) => {
     let mainQuery = `INSERT INTO device SET alias='${alias}',route='${route}',bssidCreated='${bssid}',createdBy=${createdBy} `;

     console.log(mainQuery);

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {
          if (rows.affectedRows) {
               result = {err:null,data:rows.affectedRows,insertId:rows.insertId};
          }else{
               result = {err:null,data:0};
          }
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result;
}

exports.deleteWaitingDevice = async (deviceId) => {
     let mainQuery = `DELETE FROM device WHERE deviceId=${deviceId}`;

     console.log(mainQuery);

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {

          if (rows.affectedRows) {
               result = {err:null,data:rows.affectedRows};
          }else{
               result = {err:null,data:0};
          }
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result;
}

exports.getWaitingLine = async (ownerId) => {
     let mainQuery = `SELECT * FROM device WHERE createdBy=${ownerId} AND mac is Null;`;

     let con = await sql.connect();

     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
          if (rows.length) {
               result = {err:null,data:rows};
               //console.table(rows);
          }else{
               result = {err:null,data:false};
          }    
          
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:null};
     });
     
     return result;  
}