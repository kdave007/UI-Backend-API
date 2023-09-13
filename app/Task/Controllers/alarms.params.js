const sql = require("../../Data_Base/db.connection");
const logger = require('../../Auxiliary_Classes/logger');
const alarmsSubs = require('../../Query_Classes/alarms.subs');
const monitor = require('../../Query_Classes/monitor.settings');
const liveEvents = require('../../Query_Classes/live.events');
const userQuery = require('../../Authentication/user.query');

const SHARED_EVENT_ID = {
     'CONFIG_ID_1':1,'CONFIG_ID_2':2,'CONFIG_ID_3':3,'CONFIG_ID_4':4,'CONFIG_ID_5':5,
     'CONFIG_ID_6':6,'CONFIG_ID_7':7,'CONFIG_ID_8':8,'CONFIG_ID_9':9,'CONFIG_ID_10':10,
     'CONFIG_ID_11':11,'CONFIG_ID_12':12,'CONFIG_ID_13':13,'CONFIG_ID_14':14,'CONFIG_ID_15':15,
     'CONFIG_ID_16':16,'CONFIG_ID_17':17,'CONFIG_ID_18':18,'CONFIG_ID_19':19,'CONFIG_ID_20':20,
     'CONFIG_ID_21':21,'CONFIG_ID_22':22,'CONFIG_ID_23':23,'CONFIG_ID_24':24,'CONFIG_ID_25':25,
     'CONFIG_ID_26':26,'CONFIG_ID_27':27,'CONFIG_ID_28':28,'CONFIG_ID_29':29,'CONFIG_ID_30':30,
     'CONFIG_ID_31':31,'CONFIG_ID_32':32,'CONFIG_ID_33':33,'CONFIG_ID_34':34
}

exports.get = async(deviceId,userId) =>{// COMMENT TESTING LINES
     if(deviceId=='' || deviceId==null || deviceId==undefined){
          return {err:true,data:false};
     }
     let userLevel = await getLevel(userId);
     
     if(userLevel){
          let settings = await getSettings(deviceId);
          if(settings){
               let liveEventsFlags = await getFlagsByUser(userLevel,userId,deviceId);
               if(liveEventsFlags){
                    return {err:null,data:parseData(liveEventsFlags,settings)};
               }
          }
     }

     return {err:null,data:false};
}

async function getLevel(userId){
     let userInfo = await userQuery.getInfo(userId);
     if(userInfo.err==null){
          if(userInfo.data[0]){
               return userInfo.data[0].level;
          }
     }
     return false;
}

async function getSettings(deviceId){
     let settings = await monitor.getSettings(deviceId);
     if(settings.err==null){
          if(settings.data){
               return settings.data;
          }
     }
     return false;
}

async function getFlagsByUser(userLevel,userId,deviceId){
     let bigBoss = (userLevel==1) ? true : false;
     let mainFlags = await liveEvents.getFlags(deviceId);
     if(mainFlags.err==null && mainFlags.data){
          let subsflags = {err:true};
          if(!bigBoss){
               subsflags = await alarmsSubs.getSubscriptions(userId,deviceId);
          }
          return {main:mainFlags.data, bigBoss ,subs:(subsflags.err==null && subsflags.data ) ? subsflags.data : null}
     }
     return false;
}

function parseData(liveEventsFlags,settings){
     let parsed = [];
     let settingsValues = [...settings];
     console.log(settingsValues)
     for(let index=0; index<liveEventsFlags.main.length; index++){
          let active ={};
          let params = {};
          let enabled={};
          let eventAlias = liveEventsFlags.main[index].alias;
          let eventId = liveEventsFlags.main[index].configId;
      
          let result = getBySort(eventId,settingsValues);
          settingsValues = result.updatedSettings;

          active = liveEventsFlags.main[index].value;
          if(liveEventsFlags.bigBoss){
               enabled = true;
               editable = true;
          }else{
               active = getSubscriptionActive(liveEventsFlags.subs,eventId);
               //check this
               enabled = liveEventsFlags.main[index].value;
               editable = false;
          }
          params = result.relatives;
          parsed.push({eventId,eventAlias,active,enabled,params,editable});
     }
     return (parsed.length) ? parsed : false;;
}

function getBySort(eventId,settingsValues){
     let group = [];
     let relatives = {};
     settingsValues.forEach((element) =>{
          if(element.sortId == eventId){
               group.push(element);
          }
     });
     group.forEach((element)=>{
          let foundIndex = settingsValues.indexOf(element)
          //console.log("remove sortId ",settingsValues[foundIndex])
          settingsValues.splice(foundIndex,1);
          relatives['CONFIG_ID_'+element.configId]=element.value;
     });
     return {updatedSettings:settingsValues,relatives};
}

function getSubscriptionActive(subscriptions,eventId){
     let status = false;
     if(subscriptions==null) return false;
     console.log(subscriptions);
     for(let index = 0; index < subscriptions.length; index++){
          if(subscriptions[index].liveEventId==eventId){
               status = true;
               break;
          } 
     }
     return status;
}

exports.set = async(deviceId,userId,settings) =>{
     if(deviceId=='' || deviceId==null || deviceId==undefined){
          return {err:true,data:false};
     }
     let defaultInsert = await veryFirstInsert(deviceId);
     console.log(" checkpoint |")
     if(defaultInsert.error == null){
          let userLevel = await getLevel(userId);
          console.log(" checkpoint 2 userlevel:",userLevel)
          if(userLevel){
               console.log(" checkpoint 3")
               let bigBoss = superUser(userLevel);
               await parseAndInsert(deviceId,userId,settings,bigBoss,defaultInsert.firstInsert);
          }
     }
     
     
     return {err:null,data:false};
};

function superUser(level){
     return (level==1) ? true : false;
}

async function parseAndInsert(deviceId,userId,settings,bigBoss,firstInsert){
     for(let i = 0; i < settings.length; i++){
          if(firstInsert){
               console.log("first device settings insertion ",settings[i])
               //first time, must insert main values
               await setMain(deviceId,settings[i],firstInsert);
               if(!bigBoss){
                    //this isnt a super user ?, update subscription then
                    await setSubscribers(deviceId,userId,settings[i]);
               }
          }else{
               console.log("pre insert setup //////////////////////  ",settings[i])
               let updateFound = shouldUpdate(settings[i]);
               if(updateFound){
                    if(bigBoss){
                         console.log("big boss insert setup ",settings[i])
                         await setMain(deviceId,settings[i],firstInsert);
                         await setSubscribers(deviceId,userId,settings[i]);
                    }else{
                         console.log("sub user insert setup  ",settings[i])
                         await setSubscribers(deviceId,userId,settings[i]);
                    }
               }
          }

     }

}

async function veryFirstInsert(deviceId){
     
     let result = await monitor.getSettings(deviceId);
     
     if(result.err==null){
          if(result.data){
               return {error:null,firstInsert:false}
          }else{
               return {error:null,firstInsert:true}
          }
     }
     return {error:true}
}

function shouldUpdate(setup){
     return (setup.update!=undefined) ? (setup.update) ? true : false : false;
}

async function setSubscribers(deviceId,userId,setup){
     //update subscription only
     if(setup.active){
          //insert or update
          await alarmsSubs.setSubscription(userId,deviceId,setup.eventId);
     }else{
          //delete 
          await alarmsSubs.deleteSubscription(userId,deviceId,setup.eventId);
     }
     
}

async function setMain(deviceId,setup,firstInsert){
     //update flags events
     await liveEvents.activate(deviceId,setup.eventId,setup.active)
     if(firstInsert){
          //udpate all settings values only if it is the first time
          await setConfigValues(deviceId,setup);
     }else{
          if(setup.active){
               //udpate settings values when this setup is active
               await setConfigValues(deviceId,setup);
          }
     }
}

async function setConfigValues(deviceId,setup){
     let floatAllowed = {"CONFIG_ID_24":true,"CONFIG_ID_27":true,"CONFIG_ID_30":true,"CONFIG_ID_33":true}
     let keys = Object.keys(setup.params);
     for(let i = 0; i < keys.length; i++){
          let value = (floatAllowed[keys[i]]) ? setup.params[keys[i]] : parseInt(setup.params[keys[i]]);
          await monitor.setSettings(deviceId,SHARED_EVENT_ID[keys[i]],value);
          //console.log(SHARED_EVENT_ID[keys[i]],value);
     }
}