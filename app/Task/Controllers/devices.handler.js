const sql = require("../../Data_Base/db.connection");
const logger = require('../../Auxiliary_Classes/logger');
const devicesProvider = require('../../Query_Classes/devices.list');
const users = require('../../Authentication/user.query');


exports.get = async(userId) => { // COMMENT TESTING LINES
     console.log("cmd",userId)
     if(userId=='' || userId==null || userId==undefined){
          return {err:true,data:false};
     }
     
     let result = await getUserDevices(userId);
     console.log("devices list found",result)

     return result;
}

async function getUserDevices(id){
     try{
          let result = await devicesProvider.getLinked(id)

          if(result.err==null){
               result.data = parseData(result.data);
               return result;
          }
          return result;

     }catch(e){
          
     }
}

function parseData(rows){
     for(let i = 0; i < rows.length; i++){
          rows[i].macflag = hasMac(rows[i].macflag);
          rows[i].id = ""+rows[i].id;
          rows[i].gen = ""+rows[i].gen;
     }
     return rows;
}

function hasMac(mac){
     if(mac=="" || mac==null || mac=="null" || mac==undefined || mac==false){
          return false;
     }
     return true;
}

exports.setList = async (userId,devicesList) => {
     try{
          if(validUser(userId)){
               await devicesProvider.deleteAllLinks(userId);
               await insertLinkedDevicesList(userId,devicesList);
          }
     }catch(e){
          console.error(e);
     }
}

function validUser(userId){
     return (userId!=undefined && userId!=null && userId!=0) ? true : false;     
}

async function insertLinkedDevicesList(userId,devicesList){
     for (let index = 0; index < devicesList.length; index++) {
          const element = devicesList[index];
          if(element.id>0 && element.id!=null){
               await devicesProvider.setNewLink(userId,element.id);
          }
     }
}

exports.createNewDevice = async (alias,route,bssid,ownerId) => {
     try{
          let result = await devicesProvider.create(alias,route,bssid,ownerId);
          if(result.err==null && result.data){
               await linkToSupers(ownerId,result.insertId);
          }
          return {err:null,data:true}
     }catch (e){
          console.error(e);
          return {err:true}
     }
}

async function linkToSupers(ownerId,deviceId){
     let masters = await users.getByLevel(1);
     if(masters.err==null && masters.data){
          let mastersToLink = matchOwnerId(masters.data,ownerId);
          await linkMasters(mastersToLink,deviceId);
     }
}

function matchOwnerId(mastersList,ownerId){
     target = Number(ownerId);
     let match = mastersList.filter( (element,index) => element.id == ownerId );
     console.log("MATCH RESULT",match);
     if(!match.length){
          mastersList.push({id:ownerId})
     }
     return mastersList;
}

async function linkMasters(mastersToLink,deviceId){
     console.log("MASTERS LIST",mastersToLink)
     for(let i = 0; i < mastersToLink.length; i++){
          console.log("linking new device ",deviceId," to ",mastersToLink[i].id)
         await devicesProvider.setNewLink(mastersToLink[i].id,deviceId);
     }
}

exports.deleteNewDevice = async (deviceId) => {
     try{
          let result = await devicesProvider.deleteWaitingDevice(deviceId);
          if(result.err == null && result.data){
               await devicesProvider.deleteLinkByDevice(deviceId);
          }
          return {err:null,data:true}
     }catch (e){
          console.error(e);
          return {err:true}
     }     
}

exports.getWaitingLineByOwner = async (userId) => {
     try{
          let result = await devicesProvider.getWaitingLine(userId);
          if(result.err==null){
               return {err:null,data:result.data}
          }
          return result;
     }catch (e){
          console.error(e);
          return {err:true,data:false}
     }          
}