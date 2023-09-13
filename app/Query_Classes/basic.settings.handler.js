const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

/**
 * @brief
 *  methods to select and update basic device settings values
 * notice that wifi settings is the only setup that must be inserted by the user
 * cause the other settings get inserted when the device is successfully registered
 * the first time, in order to achieve that, wifi settings must be inserted already
 * 
 * note: check possible bug with the compressor schedule insertion the first time!
 * 
 */


/**
 * @brief
 *  queries for the REPORT setup
 * 
 */
exports.getReport= async (device) => {
     let mainQuery = `SELECT value,configId `
     mainQuery += `FROM device_config `;
     mainQuery += `WHERE deviceId=${device} AND configId in (2,3,4,27,28) `;
     mainQuery += `ORDER BY configId;`;

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

exports.parseReport = (result)=>{

     return {
          mode: (result.data[0].value == 'INT') ? 0 : 1,
          scheduled : parseInt(result.data[1].value),
          interval : parseInt(result.data[2].value),
          lte_en : parseInt(result.data[3].value),
          gps_en : parseInt(result.data[4].value)
     }
}

/**
 * @brief
 *  queries for the THERMISTORS setup
 * 
 */
exports.getThermistors = async (device) => {
     const mainQuery = `SELECT value,configId
     FROM device_config
     WHERE deviceId=${device} AND (configId>6 AND (configId<11))
     ORDER BY configId;`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
          //     console.table(rows);
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

exports.parseThermistors = (result)=>{
     let parsed = [];
     for(let i = 0; i < result.data.length; i++){
          parsed = [...parsed, result.data[i].value];
     }

     return parsed;
}

/**
 * @brief
 *  queries for the SAMPLING setup
 * 
 */
exports.getSampling = async (device) => {
     const mainQuery = `SELECT value,configId
     FROM device_config
     WHERE deviceId=${device} AND (configId>4 AND (configId<7))
     ORDER BY configId;`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
          //     console.table(rows);
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

exports.parseSampling = (result)=>{

     return {
          interval : parseInt(result.data[0].value),
          samples : parseInt(result.data[1].value)
     }
}

/**
 * @brief
 *  queries for the SENSORS setup
 * 
 */
exports.getSensors = async (device) => {
     const mainQuery = `SELECT value,configId
     FROM device_config
     WHERE deviceId=${device} AND (configId>10 AND (configId<27))
     ORDER BY configId;`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
          //     console.table(rows);
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

exports.parseSensors = (result)=>{
     let parsed = [];
     for(let i = 0; i < result.data.length; i++){
          parsed = [...parsed, result.data[i].value];
     }

     return parsed;
}

/**
 * @brief
 *  UPDATE query
 * 
 */

exports.update = async (device,configId,value) => {
     let mainQuery = `UPDATE device_config SET pending=1,value=${value} WHERE deviceId=${device} AND configId=${configId}`;
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

