const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.getSettings = async (deviceId) => {
     let mainQuery = `SELECT truck_monitor_config.configId,value,pending,sortId `+
     `FROM truck_monitor_config `+ 
     `RIGHT JOIN truck_monitor_config_list `+
     `ON truck_monitor_config_list.configId = truck_monitor_config.configId `+
     `WHERE deviceId=${deviceId} `+ 
     `ORDER BY truck_monitor_config.configId`;
   
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

exports.setSettings = async (deviceId,configId,value) => {
     let mainQuery = `INSERT INTO truck_monitor_config SET deviceId=${deviceId},configId=${configId},value=${value},pending=1 `+
     `ON DUPLICATE KEY UPDATE value=${value},pending=1`;
     console.log(mainQuery)
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

