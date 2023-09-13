const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

/**
 * @brief
 *  CLASS
 *  Query 
 *  ALERT CONFIGS
 *
 */
const configProvider={};

configProvider.insertRow = async (deviceId,userId,params) => {
     var mainQuery = `INSERT INTO user_mail_alerts 
     SET deviceId=${deviceId},alertType=${params.alertType},value=${params.value},
     value2=${params.value2},lowerLim=${params.lowerLim},userId=${userId},conditionParam='${params.conditionParam}'
     ON DUPLICATE KEY UPDATE conditionParam='${params.conditionParam}',value=${params.value},value2=${params.value2},lowerLim=${params.lowerLim}`;

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise

     if (rows.affectedRows) {
          result = {err:null,data: {affectedRows :rows.affectedRows, insertId: rows.insertId} };
          console.log(`ID row inserted in last query: ${rows.insertId}`);
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

configProvider.get = async (deviceId,userId) => {
     const mainQuery = `SELECT conditionParam,lowerLim,value,value2,alertType,id as 'rowId'
     FROM user_mail_alerts 
     WHERE deviceId=${deviceId} AND userId=${userId}`;

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
     
         if (rows.length) {
              result = {err:null,data:rows};
              //console.table(rows);
         }else{
              result = {err:null,data:false};
         }    
        
         con.end()
       })
       .catch((error)=>{//handle error
         logger.setLog("query").fatal(error);
         result = {err:error,data:null};
       });

     return result;
}

configProvider.deleteRowID = async (userId,setup) => {
     var mainQuery = `DELETE FROM user_mail_alerts WHERE userId=${userId} AND id=${setup.rowId}`;

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

module.exports = configProvider;