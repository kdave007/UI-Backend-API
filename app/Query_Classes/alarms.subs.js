const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.getSubscriptions = async (userId,deviceId) => {
     let mainQuery = `SELECT * FROM live_event_subscribers WHERE userId=${userId} AND deviceId=${deviceId} `+
     `ORDER BY liveEventId`;

     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {// await this promise
      
          if (rows.length) {
               result = {err:null,data:rows};
               console.table(rows);
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

exports.setSubscription = async (userId,deviceId,eventId) => {
     let mainQuery = `INSERT INTO live_event_subscribers SET userId=${userId},deviceId=${deviceId},liveEventId=${eventId} `+
     `ON DUPLICATE KEY UPDATE userId=${userId}`;
     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise

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

exports.deleteSubscription = async (userId,deviceId,eventId) => {
     let mainQuery = `DELETE FROM live_event_subscribers WHERE userId=${userId} AND (deviceId=${deviceId} AND liveEventId=${eventId})`;
     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise

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