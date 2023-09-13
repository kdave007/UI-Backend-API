const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.getRaw = async (device,range) => {
     const mainQuery = `SELECT timestamp,temp1,temp2,temp3,temp4
     FROM device_data_temp_volt
     WHERE deviceId=${device} AND (timestamp BETWEEN '${range.start}' AND '${range.end}')
     ORDER BY timestamp ASC;`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
          console.table(rows);
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

exports.getLatest = async (device,limit) => {
     const mainQuery = `SELECT timestamp,temp1,temp2,temp3,temp4
     FROM device_data_temp_volt
     WHERE deviceId=${device}
     ORDER BY timestamp DESC LIMIT ${limit};`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
          console.table(rows);
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