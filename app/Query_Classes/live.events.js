const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.getFlags = async (deviceId) => {
     let mainQuery = `SELECT configId,value,alias `+ 
     `FROM real_time_events_config `+
     `RIGHT JOIN real_time_events_list `+
     `ON real_time_events_list.eventId = real_time_events_config.configId `+
     `WHERE deviceId=${deviceId} `+
     `ORDER BY configId`;
     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {// await this promise
      
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

exports.activate = async (deviceId,configId,flagValue) => {
     let mainQuery = `INSERT INTO real_time_events_config SET configId=${configId},value=${flagValue},pending=1,deviceId=${deviceId} `+
     `ON DUPLICATE KEY UPDATE value=${flagValue},pending=1`;
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

