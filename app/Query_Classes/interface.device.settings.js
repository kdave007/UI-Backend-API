const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.get = async (deviceId) => {
     let mainQuery = `SELECT * FROM interface_device_config WHERE deviceId = ${deviceId};`;
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

exports.set = async (deviceId,configId,value) => {
     let mainQuery = `INSERT INTO interface_device_config SET configId=${configId},deviceId=${deviceId},value=${value} `
      mainQuery +=` ON DUPLICATE KEY UPDATE value=${value};`;
      console.log(mainQuery)
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
