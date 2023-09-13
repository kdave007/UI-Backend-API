const userPermissions = require('../../Query_Classes/user.permissions');
const logger = require('../../Auxiliary_Classes/logger');

exports.get = async (userId) => {
     var response = await userPermissions.get(userId);
     return response;
}

exports.set = async (requestUserInfo,usersList) => {
     if(!approveUserLevel(requestUserInfo))return {err:true};
     
     try{
          for(let i = 0; i < usersList.length; i++){
               console.log("index ",i,usersList[i])
               await userPermissions.setDevicesConfigPermissions(usersList[i].userId,usersList[i].values);
               await userPermissions.setAlarmsAccess(usersList[i].userId,usersList[i].values["alarms"]);
          }
          return {err:null,data:true}
     }catch(e){
          logger.setLog("query").fatal(e);
          return {err:true}
     }
}

function approveUserLevel(requestUserInfo){
     return (requestUserInfo.level==1) ? true : false;
}