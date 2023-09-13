const logger = require('../Auxiliary_Classes/logger');
const task = require('./task.utils');
const mailAlerts = require('./Controllers/mail.configs');
const compSettings = require('./Controllers/compressor.settings');
const alarmsParams = require('./Controllers/alarms.params');
const userQuery = require('../Authentication/user.query');
const userInformation = require('../Authentication/userInformation');
const devicesHandler = require('./Controllers/devices.handler');
const truckVoltage = require('./Controllers/truck.voltage');
const powBankSamples = require("./Controllers/pow.bank.handler");
const thermistorsSamples = require("./Controllers/thermistors.samples.handler");
const interfaceDeviceHandler = require("./Controllers/interface.device.handler");
const companies = require("./Controllers/companies.handler");
const userPermissions = require("./Controllers/user.permissions.handler");

const options = task.TASK;

exports.allocate = async (body,userInfo) => {
     
     var status = 204; var data = null;
     if (body.cmd){
         const result = await taskSelector(body.cmd,body,userInfo);
         data = result.data;
         status = result.status;
     }

     return {status : status,data : data}
}

async function taskSelector(cmd,params,userInfo){
     var status= 500; var data = null;var noDataReq = false;let result = {};
     switch (cmd){
          case options.GET_MAIL_ALERTS :
               result = await mailAlerts.get(params.deviceId,userInfo.userId);
          break;
          case options.SET_MAIL_ALERTS :
               result = await mailAlerts.set(params.deviceId,userInfo.userId,params.settings);
               noDataReq = (result.data) ? false : true;//No need to send something back, other than the status
          break;
          case options.GET_COMP_SETUP :
               result = await compSettings.get(params.deviceId);
          break;
          case options.SET_COMP_SETUP :
               result = await compSettings.set(params.deviceId,params.slots);
               result = false;
               noDataReq = false//No need to send something back, other than the status
          break;
          case options.GET_ALARMS_PARAMS :
               result = await alarmsParams.get(params.deviceId,userInfo.userId);
               result.data = (result.data) ? result.data : {"empty":true};
          break;
          case options.SET_ALARMS_PARAMS :
               result = await alarmsParams.set(params.deviceId,userInfo.userId,params.settings);
               noDataReq = false;
          break;
          case options.GET_USER :
               result = await userQuery.getInfo(userInfo.userId);
               result.data = (result.data.length) ? result.data[0] : {"empty":true};
          break;
          case options.GET_DEVICES :
               console.log("userINFO ",userInfo)
               result = await devicesHandler.get(userInfo.userId);
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.GET_TRUCK_V :
               console.log("userINFO ",userInfo)
               result = await truckVoltage.get(params.deviceId,params.range);
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.GET_POW_BANK :
               console.log("userINFO ",userInfo)
               result = await powBankSamples.get(params.deviceId,params.range);
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.GET_TEMP_SAMPLES :
               console.log("userINFO ",params)
               result = await thermistorsSamples.task(params);
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.SET_TEMP_FILTER :
               console.log("userINFO ",params);
               await interfaceDeviceHandler.set(params.deviceId,params.extra);
               result = false;
               noDataReq = false;
          break;
          case options.GET_TEMP_FILTER :
               console.log("userINFO ",params);
               result = await interfaceDeviceHandler.get(params.deviceId);
               result.data = (result.data.length) ? result.data : {"empty":true};;
          break;
          case options.GET_ALL_USERS :
               result = await userQuery.getAll();
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.GET_USERS_BY_COMPANY ://MUST add a controller here for future features
               result = await userQuery.getByCompany(params.targetCompanyId);
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.GET_USER_PERMISSIONS :
               result = await userPermissions.get(params.targetUserId);
               result.data = (result.data.length) ? result.data[0] : {"empty":true};
          break;
          case options.GET_COMPANIES :
               result = await companies.getAll();
               result.data = (result.data.length) ? result.data : {"empty":true};
          break;
          case options.SET_USER_PERMISSIONS :
               result = await userPermissions.set(userInfo,params.targetUsers);
               noDataReq = false;
               console.log("user permissions result ",result)
          break;               
          case options.SET_NEW_USER :
               result = await userInformation.setNewUser(userInfo,params.newUser);
               result.data = (result.data) ? result.data : {"empty":true};
          break;
          case options.GET_ASSIGNED_DEVICES :
               result = await devicesHandler.get(params.targetUserId);
               result.data = (result.data.length) ? result.data : null;
          break;
          case options.SET_ASSIGNED_DEVICES :
                result = await devicesHandler.setList(params.targetUserId,params.newList);
                result = false;
                noDataReq = true;
          break;
          case options.SET_NEW_PASSWORD :
               let operationResult = await userInformation.setNewPass(userInfo,params.targetUserId,params.oldPassword,params.newPassword,params.masterRequest);
               result.data = {success:(operationResult=="success") ? true : false};
               noDataReq = false;
          break;
          case options.SET_NEW_EMAIL :
               let operationRes = await userInformation.setNewEmail(params.targetUserId,params.oldPassword,params.newEmail,params.masterRequest);
               result.data = {success: (operationRes=="success") ? true : false};
               noDataReq = false;
          break;
          case options.SET_USER_TO_COMPANY :
               result = await userInformation.setUserToCompany(userInfo,params.targetUserId,params.targetCompanyId);
               noDataReq = false;
          break;
          case options.DELETE_NEW_DEVICE :
               result = await devicesHandler.deleteNewDevice(params.Device);
               noDataReq = false;
          break;
          case options.CREATE_DEVICE :
               let newDevice = params.newDevice; 
               result = await devicesHandler.createNewDevice(newDevice.alias,newDevice.route,newDevice.bssid,userInfo.userId);
               noDataReq = false;
          break;
          case options.DEVICES_WAITING_LINE :
               result = await devicesHandler.getWaitingLineByOwner(userInfo.userId);
               result.data = (result.data.length) ? result.data : null;
          break;
          default:
               result = {
                    data:false,
                    status:400
               }
     }

     if(result.err==null){
          data = (noDataReq) ? null : result.data; 
          status = (result.data) ? 200 : 204;  
           
     }else{
          logger.setLog("server").fatal(result.err)     
     }

     return {status:status,data:data};
}

