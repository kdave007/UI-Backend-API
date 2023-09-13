const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

/**
 * @brief
 *  queries for the Light modules setup
 * 
 */
const L_Mod={};

L_Mod.get = async (device) => {
     const mainQuery = `SELECT ligth_sens_mod_code.modulePos, ligth_sens_mod_code.enable, ligth_sens_mod_code.moduleAddress, ligth_sens_config.moduleCode, 
     ligth_sens_config.statusActive, ligth_sens_config.sensor, ligth_sens_config.edge, ligth_sens_config.filter, ligth_sens_config.treshold
     FROM atechnik_hTelemetry.ligth_sens_mod_code
     RIGHT JOIN ligth_sens_config
     ON ligth_sens_mod_code.moduleCode = ligth_sens_config.moduleCode
     WHERE deviceId = ${device} ORDER BY ligth_sens_config.sensor ASC;`;

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

L_Mod.parseModules = (result)=> {
     return sortModules(result.data);
}

function sortModules(settings){
     let parsedModules = [];//must be defined cause the modules are ordered by sensor position, not module position
    
     for(let i = 0; i < settings.length; i++){
          let indexFound = getModuleIndex(settings[i]);

          if(parsedModules[indexFound] == undefined){
               parsedModules[indexFound] = {
                         sensor: [formatValues(settings[i])], 
                         enable: settings[i].enable,
                         moduleCode : settings[i].moduleCode,
                         address: settings[i].moduleAddress
                    };
          }else{
               parsedModules[indexFound].sensor.push(formatValues(settings[i]));
          }
          
     }
     console.log("parsed light modules:",parsedModules);
     return parsedModules;
}

function getModuleIndex(moduleRef){// finds out the module position translated to the array position
     return parseInt(moduleRef.modulePos)-1;
}

function formatValues(row){
     return {
          module : row.modulePos,
          sensor : row.sensor,
          edge : row.edge,
          filter : row.filter,
          status : row.statusActive,
          treshold : row.treshold
     }
}

L_Mod.updateModule = async (deviceId,modulePos,enable,address,pending,nextFunction) => {
     // const mainQuery = `INSERT INTO ligth_sens_mod_code `+
     //             `SET deviceId=${deviceId},modulePos=${modulePos},enable=${enable},`+
     //             `moduleAddress=${address},pending=${pending} `+
     //             `ON DUPLICATE KEY UPDATE enable=${enable},moduleAddress=${address},pending=${pending}; `;

     const mainQuery = `UPDATE ligth_sens_mod_code `+
                 `SET enable=${enable},moduleAddress=${address},pending=${pending} `+
                 `WHERE deviceId=${deviceId} AND modulePos=${modulePos};`;            
     
     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise

     if (rows.affectedRows) {
          result = {err: null, data: rows.affectedRows, insertedId: rows.insertId};
     }else{
          result = {err:null,data:0};
     }
     
     con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          logger.setLog("pendings").fatal(error);
          result = {err:error,data:0};
     });

     nextFunction(result);
}



L_Mod.updateSensor = async (moduleCode,sensor,treshold,edge,filter,statusActive) => {//treshold is float
     // const mainQuery = `INSERT INTO ligth_sens_config `+
     //                `SET moduleCode=${moduleCode},sensor=${sensor},treshold=${treshold},`+
     //                `edge=${edge},filter=${filter},statusActive=${statusActive} `+
     //                `ON DUPLICATE KEY UPDATE treshold=${treshold},statusActive=${statusActive},edge=${edge},filter=${filter},statusActive=${statusActive}`;
     
     const mainQuery = `UPDATE ligth_sens_config `+          
                    `SET treshold=${treshold},statusActive=${statusActive},edge=${edge},filter=${filter} `+
                    `WHERE moduleCode=${moduleCode} AND sensor=${sensor};`;
                
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
          logger.setLog("pendings").fatal(error);
          result = {err:error,data:0};
     });
     return result;
}

function validData(moduleParams,index){
     let valid = false;
     if(moduleParams.address!=null && moduleParams.address!=='' && moduleParams.address!=undefined){
          if(moduleParams.moduleCode!=null && moduleParams.moduleCode!=0 && moduleParams.moduleCode!=undefined){
               for(let i = 0; i < moduleParams.sensor.length; i++){
                    valid = validSensorsData(moduleParams.sensor[i],index);
                    //console.log("module",index," sensor:",i," valid:",valid);
                    if(!valid){
                         return false;
                    } 
               }
          }
     }
     return valid;
}

function validSensorsData(sensorParams,index){
     if(sensorParams.edge!=null && sensorParams.edge!=undefined){
          if(sensorParams.status!=null && sensorParams.status!=undefined){
               if(sensorParams.treshold!=null && sensorParams.treshold!=undefined && sensorParams.treshold!==''){
                    if(sensorParams.filter!=null && sensorParams.filter!=undefined && sensorParams.filter!==''){
                         return true;
                    }
               }
          }
     }
     return false;
}


L_Mod.update = async (device,moduleParams) => { 
     for(let index = 0; index < moduleParams.length; index++){
       
          if(validData(moduleParams[index],index,device)){
               // console.log("valid data ",moduleParams[index]);
               let modulePosition = index+1;
               const pending = 1;
               await L_Mod.updateModule( device,modulePosition,moduleParams[index].enable,moduleParams[index].address,pending, async () => {
                    for(let i = 0; i < moduleParams[index].sensor.length; i++){
                         let sensorParams =  moduleParams[index].sensor[i];
                         await L_Mod.updateSensor(
                              moduleParams[index].moduleCode,
                              sensorParams.sensor,
                              sensorParams.treshold,
                              sensorParams.edge,
                              sensorParams.filter,
                              sensorParams.status
                         );
                    }
               });
          }else{
               // console.log("INvalid data ",moduleParams[index]);
          }
     }
     
}

function fetchModuleCode(reference,target){
     let resultArray = reference.filter( element => element.modulePos === target); 
     return (resultArray.length) ? resultArray[0].moduleCode : null;
}

L_Mod.getOnlyModules = async (device) => {
     const mainQuery = `SELECT modulePos, enable, moduleAddress, moduleCode `+ 
     `FROM ligth_sens_mod_code `+
     `WHERE deviceId = ${device} ORDER BY modulePos ASC;`;

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

module.exports = L_Mod;