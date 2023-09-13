const alertsConfig = require('../../Query_Classes/user.mail.config');
const logger = require('../../Auxiliary_Classes/logger');

exports.get = async (deviceId,userId) => {
     var response = await alertsConfig.get(deviceId,userId);
     return response;
}

exports.set = async (deviceId,userId,settings) => {
     status = await parsenInsert(deviceId,userId,settings);
     
      var errorsFound = errorsDetection(status.errors);
      if(errorsFound){
          
           return {err:500,data:false};
      }
      let insertResponse = (status.data.insert) ? {insert : status.data.insert} : false;

     return {err:null,data: insertResponse };//send only the row id's insertions
}

function queryGotSomething(result){
     if(result.err==null){
          if(result.data){
               return true;
          }
     }
     return false;
}

async function parsenInsert(deviceId,userId,settings){
     insertStatus = false;deleteStatus=false;a2aStatus=false;
     if(settings.applyToAll){
          //SPECIAL FUNCTION
     }
     if(settings.save){
          insertStatus = await insertOrUpdate(deviceId,userId,settings.save);
     }
     if(settings.delete){
          deleteStatus = await deleteRows(userId,settings.delete);
     }
     return {errors : {insert:insertStatus.error,delete:deleteStatus,applyToAll:a2aStatus},
               data : (insertStatus.data) ? {insert: insertStatus.data } : false//send only the row id's insertions
               }
}

async function insertOrUpdate(deviceId,userId,rows){
     var errorStatus = false;
     var idInsertions =[];
     for(let index=0;index<rows.length;index++){
          var result = await alertsConfig.insertRow(deviceId,userId,rows[index]);
          if(result.err){
               console.log(`mail config's :: couldn't INSERT row alertType = ${rows[index].alertType} to deviceId = ${deviceId}  !.`);
               logger.setLog('pendings').error(`mail config's :: couldn't INSERT row alertType = ${rows[index].alertType} to deviceId = ${deviceId}  !.`);
               errorStatus = true;
          }else{
               if(result.data.insertId) idInsertions.push({id:result.data.insertId,type:rows[index].alertType});
          }
     }
     return {error: errorStatus ,data: (idInsertions.length) ? idInsertions : false};//send only the row id's insertions
}

async function deleteRows(userId,rows){
     var errorStatus = false;
     for(let index=0;index<rows.length;index++){
          var result = await alertsConfig.deleteRowID(userId,rows[index]);
          console.log(`mail config's :: DELETE row ${rows[index]} !.`);
          if(result.err){
               logger.setLog('pendings').error(`mail config's :: couldn't DELETE row ${rows[index]} !.`);
               errorStatus = true;
          }
     }
     return errorStatus;
}

function errorsDetection(errors){
     var errorsPerCase = 0;
     const keys = Object.keys(errors);
  
     for( const key of keys){
          //console.log("key ",key,"state ",errors[key]);
          if(errors[key]){
               errorsPerCase++;
               logger.setLog('server').error(`mail config's :: ${key} error query!.`);
          }
     }

     if(errorsPerCase>=2){
          
          return true;
     }

     return false;
}







//DATA FORMAT RECEIVED EXAMPLES:
//  settings : {
//         deviceId:number,
//         applyToAll:boolean ,
//         save: array or false, 
//         delete:array or false
//       } 

//save []
// id:rowId,
//                     deviceId:deviceId,
//                     lowerLim:lowerLim,
//                     value:value,
//                     value2:value2,
//                     alertType:alertType,
//                     conditionParam:conditionParam


//delete[]
// [id,...]