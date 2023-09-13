const compSettings = require('../../Query_Classes/query.compressor');
const logger = require('../../Auxiliary_Classes/logger');
const utils = require('./controllers.utils');
const time = require('../../Auxiliary_Classes/date.time');

exports.get = async (deviceId) => {
     const getAll = false;
     try {
          let PreMain = await compSettings.getMain(deviceId,getAll);
          let PrePcheck = await compSettings.getPcheck(deviceId);
          let response = parse(PreMain,PrePcheck);
          return response;
     } catch (error) {
          logger.setLog("server").fatal(error)       
     }
}

function queryGotSomething(result){
     if(result.err==null){
          if(result.data){
               return true;
          }
     }
     return false;
}

function parse(PreMain,PrePcheck){
     let settings = false;
     let setupA = false;
     let setupB = false;
     let error = PreMain.err;
     if(queryGotSomething(PreMain)){
          setupA = PreMain.data;
          
          if(queryGotSomething(PrePcheck)){
               setupB = PrePcheck.data;
               //console.table(setupB);
          }

          settings = sortData(setupA,setupB);
     }
     //console.log(settings)
     return {err: error, data :settings};
}

function sortData(data,advancedData){
     let settings = [];

     for(let i=0;i<data.length;i++){
          
          let startingDay = data[i].daysArray.split(",");

          switch (data[i].controlID){
               case 2:
                    settings[i]={
                         slot: data[i].slot,
                         title: data[i].eventTitle,
                         typeID: data[i].controlID,
                         allTimeActive: true,
                         start: {H:data[i].startHour, M:data[i].startMin},
                         end: {H:data[i].endHour, M:data[i].endMin},
                         startingDay,
                         powerCheck: (data[i].powerCheck) ? true : false,
                         ev: (data[i].ev) ? true : false
                    }
               break;
               case 3:
                    settings[i]={
                         slot:data[i].slot,
                         title:data[i].eventTitle,
                         typeID:data[i].controlID,
                         allTimeActive: false,
                         start: {H:data[i].startHour, M:data[i].startMin},
                         end: {H:data[i].endHour, M:data[i].endMin},
                         startingDay,
                         powerCheck: null,
                         ev: (data[i].ev) ? true : false
                    }
                    if(data[i].powerCheck!=null){
                         settings[i].powerCheck = formatPowerCheck(advancedData,data[i].slot);
                    }
               break;
          }
     }
     return settings;
}

function formatPowerCheck(advancedData,slot){
     let pCheck = null;
     for(let i=0; i<advancedData.length; i++){
          if(advancedData[i].slot == slot){
               pCheck = {
                    ON_n: advancedData[i].ON_N,
                    ON_e: advancedData[i].ON_E,
                    timeout: advancedData[i].timeout,
                    incremental: (advancedData[i].incremental) ? true : false  
               }
               break;
          } 
     }
     return pCheck;
}

exports.set = async (deviceId,newData) => {
     try {
          console.log("INDEX 0,1",newData.set[0],newData.set[1]);
          await deleteSettings(deviceId,newData.delete);
        
          let parsed = inverseParser(newData.set,deviceId);
          if(parsed){
               
               let readyToSave = await freeSlotsAssignment(parsed,deviceId);
               if(readyToSave){
                    //console.log("save as ",readyToSave);
                    sendToMotherBase(readyToSave,deviceId);
               }
          }
     } catch (error) {
          logger.setLog("server").fatal(error)   
     }    
}

async function deleteSettings(deviceId,toDelete){
     toDelete.forEach(async (element,)=>{
          await compSettings.deletePcheck(deviceId,element);
          await compSettings.deleteSetup(deviceId,element);
          await compSettings.resetSlot(deviceId,element);
     });
     //console.log("deleted ",toDelete);
}

function inverseParser(rows,deviceId){
     let newFormat = [];
     for(let i=0;i<rows.length;i++){
          
         if(rows[i].isParsed){
               console.log("Parsed :",rows[i])
               newFormat.push({
                    slot:rows[i].slot,
                    deviceId,
                    powerCheck: inversePcheck(rows[i].powerCheck),
                    days: sortDays(rows[i].startingDay),
                    controlID:rows[i].typeID,
                    ev:1,//TO DO: MUST ASSING THIS VALUE LATER <-------------------
                    startH: Number(rows[i].start.H),
                    startM: Number(rows[i].start.M),
                    endH: Number(rows[i].end.H),
                    endM: Number(rows[i].end.M),
                    title: rows[i].title
               });
          }
     }
     return (!newFormat.length) ? false : newFormat;
}

function inversePcheck(powerCheck){
     let newFormat = {};
     if(powerCheck.status && powerCheck.status!=null){
         
          let timeout = convertToSecs(powerCheck.timeout);

          newFormat = {
               ON_N:(powerCheck.ON_n==0) ? null : powerCheck.ON_n,
               ON_E:convertToSecs(powerCheck.ON_e),
               timeout: (timeout==0) ? null : timeout,
               incremental: (powerCheck.incremental) ? 1 : 0
          }
     }else{
       
          return powerCheck.status;
     }
    
     return newFormat;
}

function convertToSecs(toConvert){
     return time.convertToSeconds(toConvert.H,toConvert.M,toConvert.S);
}

function sortDays(days){
     let string = null;
     for(let i=0;i<days.length;i++){
          if(i==0) string = `${days[i]}`;
          if(i>0) string += `,${days[i]}`;
     }
   
     return string;
}

async function freeSlotsAssignment(settings,deviceId){
     let allSlots = await compSettings.getSlots(deviceId);
     
     if(allSlots.err==null){
          let available = freeSlots(allSlots.data);
          let latestFound = latestSlotFound(allSlots.data);
         
          let settingsReady = assignSlots(settings,available,latestFound);
         
         
          return settingsReady;   
     }

     return false;
}

function latestSlotFound(slots){
     let latestSlotID = 0;
     for(let i = 0; i<slots.length; i++){
          const slotID = Number(slots[i].slot);
          if(slotID > latestSlotID){
               latestSlotID = slotID;
          }
          
     }
     return latestSlotID;
}

function freeSlots(slots){
     let freeSlots = [];
     for(let i = 0; i<slots.length; i++){
          const slot = Number(slots[i].slot);
          if(slots[i].available){
               freeSlots.push(slot);
          }
     }
     return (freeSlots.length) ? freeSlots : false;
}

function assignSlots(settings,available,latestFound){
     const maxSlots = 50;
     let newSlot = latestFound;
     let orphanSettings = settings.filter((element) => !element.slot );// find settings received without slot assigned
   
     for(let i=0; i<orphanSettings.length;i++){//HERE SEPARATE THE SLOT:FALSE FROM THE SLOT WITH ASSIGNED VALUE ALREADY..
          if(available[i]!=undefined){
               //console.log("free slot ",available[i]," for ",orphanSettings[i]);
               orphanSettings[i].slot = available[i];
          }else{
               if(newSlot==maxSlots){
                    logger.setLog('server').info("max slot's number reached, no more room for a new save",);
                    break;
               }

               newSlot = newSlot+1;
               //console.log("new slot must be set");
               orphanSettings[i]["newInsertion"]= true;
               orphanSettings[i].slot = newSlot;
          }
          
     }

     if(orphanSettings.length){
          settings = [...settings,orphanSettings];
          settings = settings.filter((element) => element.slot );
     }

     return settings;
}

async function sendToMotherBase(rows,deviceId){
     //insert or update depending on each case...
     //first affect SLOT table
     //then affect main table
     //then affect pcheck table
     for(let i = 0; i<rows.length; i++){
          await saveInSlot(rows[i])
     }
}

async function saveInSlot(setup){
     //just update actual slot
     let powerCheckSetup = setup.powerCheck;
     setup.powerCheck = (powerCheckSetup) ? 1 : 0;
     
     let firstTask = await compSettings.setSlot(setup.deviceId,setup.slot);
     if(firstTask.err==null){
         
          let secondTask = await compSettings.setSetup(setup);
          if(secondTask.err==null){
           
               await compSettings.setPcheck(powerCheckSetup,setup.deviceId,setup.slot);
               return true;
          }
     }
     return false;
}

