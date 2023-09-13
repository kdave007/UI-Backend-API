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

configProvider.getMain = async (deviceId,pendingOnly) => {
     let mainQuery = `SELECT control_comp_slots.slot,available,pendingUpdate,deleteReq,
     daysArray,powerCheck,startHour,startMin,endHour,endMin,controlID,eventTitle,ev
     FROM control_comp_slots
     LEFT JOIN control_comp_main
     ON control_comp_slots.deviceId = control_comp_main.deviceId AND control_comp_slots.slot = control_comp_main.slot
     WHERE control_comp_slots.deviceId = ${deviceId} AND available=0
     ORDER BY control_comp_slots.slot`;

     if(pendingOnly){
          mainQuery = `SELECT control_comp_slots.slot,available,pendingUpdate,deleteReq,
          daysArray,powerCheck,startHour,startMin,endHour,endMin,controlID,eventTitle,ev
          FROM control_comp_slots
          LEFT JOIN control_comp_main
          ON control_comp_slots.deviceId = control_comp_main.deviceId AND control_comp_slots.slot = control_comp_main.slot
          WHERE control_comp_slots.deviceId = ${deviceId} AND (control_comp_slots.available=0 AND control_comp_slots.pendingUpdate = 1)
          ORDER BY control_comp_slots.slot`;
     }

     let con = await sql.connect();

     await con.query(mainQuery).then( ([rows,fields]) => {// await this promise
      
          if (rows.length) {
               result = {err:null,data:rows};
               //console.table(rows);
          }else{
               result = {err:null,data:false};
               console.log("control compressor settings :: zero rows");
          }    
         
          con.end();
     })
     .catch((error)=>{//handle error
     logger.setLog("query").fatal(error);
     result = {err:error,data:null};
     });

     return result;
}

configProvider.getPcheck = async (deviceId) => {
     let mainQuery = `SELECT slot,ON_N,ON_E,timeout,incremental
     FROM control_comp_Pcheck
     WHERE deviceId =  ${deviceId}
     ORDER BY slot`;

     let con = await sql.connect();

     await con.query(mainQuery).then( ([rows,fields]) => {// await this promise
      
          if (rows.length) {
               result = {err:null,data:rows};
               //console.table(rows);
          }else{
               result = {err:null,data:false};
               console.log("control compressor settings :: zero rows");
          }    
         
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:null};
     });

     return result;
}

configProvider.getSlots = async (deviceId) => {
     let mainQuery = `SELECT *
     FROM control_comp_slots
     WHERE deviceId = ${deviceId} ORDER BY slot`;

     let con = await sql.connect();

     await con.query(mainQuery).then( ([rows,fields]) => {// await this promise
      
          if (rows.length) {
               result = {err:null,data:rows};
               //console.table(rows);
          }else{
               result = {err:null,data:false};
               console.log("control compressor settings :: zero rows");
          }    
         
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:null};
     });

     return result;
}


configProvider.setSetup = async (setup) => {
     var mainQuery = `INSERT control_comp_main 
     SET slot=${setup.slot},deviceId=${setup.deviceId},powercheck=${setup.powerCheck},daysArray='${setup.days}',startHour=${setup.startH},startMin=${setup.startM},endHour=${setup.endH},endMin=${setup.endM},
     controlID=${setup.controlID},ev=${setup.ev},eventTitle='${setup.title}'
     ON DUPLICATE KEY UPDATE powercheck=${setup.powerCheck},daysArray='${setup.days}',startHour=${setup.startH},startMin=${setup.startM},endHour=${setup.endH},endMin=${setup.endM},
     controlID=${setup.controlID},ev=${setup.ev},eventTitle='${setup.title}'`;

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

configProvider.setPcheck = async (setup,deviceId,slot) => {
     var mainQuery = `INSERT control_comp_Pcheck 
     SET deviceId=${deviceId},slot=${slot},ON_N=${setup.ON_N},ON_E=${setup.ON_E},timeout=${setup.timeout},incremental=${setup.incremental}
     ON DUPLICATE KEY UPDATE ON_N=${setup.ON_N},ON_E=${setup.ON_E},timeout=${setup.timeout},incremental=${setup.incremental}`;
     
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
          console.log(mainQuery);
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result; 
}

configProvider.setSlot = async (deviceId,slot) => {
     var mainQuery = `INSERT control_comp_slots SET available=0,pendingUpdate=1,deleteReq=0,deviceId=${deviceId},slot=${slot}
     ON DUPLICATE KEY UPDATE available=0,pendingUpdate=1,deleteReq=0`;

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

configProvider.deletePcheck = async (deviceId,slot) => {
     var mainQuery = `DELETE FROM control_comp_Pcheck WHERE deviceId=${deviceId} AND slot=${slot}`;

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

configProvider.deleteSetup = async (deviceId,slot) => {
     var mainQuery = `DELETE FROM control_comp_main WHERE deviceId=${deviceId} AND slot=${slot}`;
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

configProvider.resetSlot = async (deviceId,slot) => {
     var mainQuery = `UPDATE control_comp_slots SET available=1,pendingUpdate=0,deleteReq=1 
     WHERE deviceId=${deviceId} AND slot=${slot}`;

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