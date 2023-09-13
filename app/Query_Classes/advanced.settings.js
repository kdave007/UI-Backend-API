const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

/**
 * @brief
 *  queries for advanced settings
 * 
 */
exports.get = async (device) => {
     const mainQuery = `SELECT deviceId,configId,value,pending
     FROM advanced_config
     WHERE deviceId= ${device} 
     ORDER BY configId ASC`;

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

exports.parse = (result)=>{
    let parsed = {};
    console.log("parse advanced got ",result);
    parsed = {
         keep_alive : result[0].value,
         ka_GPS : result[1].value,
         log_GPS : result[2].value
         //key : result[4].value,
    }
    return parsed;
}

async function updateAdvanced(device,configId,value,pending){

     var mainQuery = `UPDATE advanced_config `+
                     `SET value=${value},pending=${pending} `+
                     `WHERE deviceId=${device} AND configId=${configId};`;

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

exports.update = async (device,settings) => {
     let configArray = [
          {configId:1,value:settings.keep_alive},
          {configId:2,value:settings.ka_GPS},//boolean
          {configId:3,value:settings.log_GPS}
     ];
     let pending = 1;
     for(let index = 0; index < configArray.length; index++){
          if(validData(configArray[index])){
               if(configArray[index].configId == 1 || configArray[index].configId == 3 ){
                    configArray[index].value = (configArray[index].value < 0) ? 0 : configArray[index].value; 
               }
               await updateAdvanced(device,configArray[index].configId,configArray[index].value,pending);
          }else{
               console.log("invalid data");
          }
     }
};

function validData(configRow){
     console.log(configRow," is ")
     if(configRow.value != null && configRow.value !=undefined && configRow.value!==''){
          console.log(true)
          return true
     }
     console.log(false)
     return false;
}


