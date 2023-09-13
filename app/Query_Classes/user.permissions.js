const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.get = async (userId) => {
     let mainQuery = `SELECT compressorControl,samplingSetup,reportSetup,thermistorsCalibration,gpiosOffsets,apSetup,`;
     mainQuery += `lmodulesSetup,advancedSetup,accessId as alarmsAccessId `;
     mainQuery += `FROM user_device_permissions `;
     mainQuery += `LEFT JOIN user_notifications_permissions `;
     mainQuery += `ON user_device_permissions.userId = user_notifications_permissions.userId `
     mainQuery += `WHERE user_device_permissions.userId=${userId}`;

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

exports.setDevicesConfigPermissions = async (userId,values) => {
     let mainQuery = `INSERT INTO user_device_permissions SET userId=${userId},compressorControl=${values.compressor},samplingSetup=${values.sampling}, `
     mainQuery +=` reportSetup=${values.report},thermistorsCalibration=${values.thermistors},gpiosOffsets=${values.gpios},apSetup=${values.ap},`
     mainQuery +=` lmodulesSetup=${values.lightModule},advancedSetup=${values.advanced}`
     mainQuery +=` ON DUPLICATE KEY UPDATE compressorControl=${values.compressor},samplingSetup=${values.sampling},`
     mainQuery +=` reportSetup=${values.report},thermistorsCalibration=${values.thermistors},gpiosOffsets=${values.gpios},apSetup=${values.ap},`
     mainQuery +=` lmodulesSetup=${values.lightModule},advancedSetup=${values.advanced}`;
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

exports.setAlarmsAccess = async (userId,code) => {
     let mainQuery = `INSERT INTO user_notifications_permissions SET userId=${userId},accessId=${code} `
     mainQuery +=`ON DUPLICATE KEY UPDATE accessId=${code}`;
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