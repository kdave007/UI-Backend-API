const basicSetupHandler = require('../../Query_Classes/basic.settings.handler');
const wifiHandler = require('../../Query_Classes/wifi.handler');
const lightModulesHandler = require('../../Query_Classes/light_sensor.settings');
const advancedSetupHandler = require('../../Query_Classes/advanced.settings');

const dataTypes = {
     ap:"Ap",
     sampling:"Sampling",
     report:"Report",
     sensors:"Sensors",
     thermistor:"Thermistor",
     lmod:"Lmod",
     advanced:"advancedSettings"
}

const CONFIG_ID = {
     REPORT:[2,3,4,27,28],
     THERMISTORS:[7,8,9,10],
     SAMPLING:[5,6],
     SENSORS:[11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]
}

exports.settingsHandler = async (requestReference) => {
     if(requestReference.Write!=undefined){
          let result = await actionRequested(requestReference.Write,requestReference);
          if(result!=null && result.err==null){
               if(result.data!=false){
                    //success
                    return {status:200,data:result.data,dataType:result.dataType};
               }else{
                    //non existal data
                    return {status:204};
               }
          }
     }
     return {status:500};
}

async function actionRequested(action,references){
    
     let result = null;
     if(action){//write = true
          //SAVE DATA
          result = await setParams(references.Device,references.dataType,references.Data)
     }else if(!action){//write = false
          //READ DATA 
          result = await getParams(references.Device,references.dataType);
     }
     return result;
}


/**
 * @brief
 *  methods to GET different settings
 * 
 */
async function getParams(deviceId,dataType){
     return await getHandleQuery(deviceId,dataType);
}

async function getHandleQuery(deviceId,type){
     let result = {};
     switch (type){
          case dataTypes.ap :
               result = await wifiHandler.getProfiles(deviceId);
               result["dataType"] = dataTypes.ap;
               return result;

          case dataTypes.report :
               
               result = await basicSetupHandler.getReport(deviceId);
               if(result.err==null && result.data){
                   result.data = basicSetupHandler.parseReport(result);
               }
               result["dataType"] = dataTypes.report;
               return result;

          case dataTypes.sampling :
               
               result = await basicSetupHandler.getSampling(deviceId);
               result["dataType"] = dataTypes.sampling;
               if(result.err==null && result.data){
                    result.data = basicSetupHandler.parseSampling(result);
               }
               return result; 

          case dataTypes.sensors :
               
               result = await basicSetupHandler.getSensors(deviceId);
               if(result.err==null && result.data){
                    result.data = basicSetupHandler.parseSensors(result);
               }
               result["dataType"] = dataTypes.sensors;
               return result; 
               
          case dataTypes.thermistor :
              
               result = await basicSetupHandler.getThermistors(deviceId);
               if(result.err==null && result.data){
                    result.data = basicSetupHandler.parseThermistors(result);
               }
               result["dataType"] = dataTypes.thermistor;
               return result; 

          case dataTypes.lmod :
          
               result = await lightModulesHandler.get(deviceId);
               if(result.err==null && result.data){
                    result.data = lightModulesHandler.parseModules(result);
                    console.log("rr",result)
               }
               result["dataType"] = dataTypes.lmod;
               return result;

          case dataTypes.advanced :
          
               result = await advancedSetupHandler.get(deviceId);
               if(result.err==null && result.data){
                    result.data = advancedSetupHandler.parse(result.data);
               }
               result["dataType"] = dataTypes.advanced;
               return result;       
     }
     return {status:500};
}

/**
 * @brief
 *  methods to INSERT/UPDATE different settings
 * 
 */

async function setParams(deviceId,dataType,values){
     return await setHandleQuery(deviceId,dataType,values);
}

async function setHandleQuery(device,type,values){
     let firstInsert = await wifiHandler.checkFirstInsert(device);
     switch (type){
          case dataTypes.ap :
               wifiHandler.setProfiles(device,values);
          break;     

          case dataTypes.report :
               if(!firstInsert){//only save changes if it is not the first time inserting data
                    await setReport(device,values)
               }
          break;     

          case dataTypes.sampling :
               if(!firstInsert){
                    await setSampling(device,values);
               }
          break;      

          case dataTypes.sensors :
               if(!firstInsert){
                    await setSensors(device,values);
               }
          break;    
               
          case dataTypes.thermistor :
               if(!firstInsert){
                    await setThermistors(device,values);
               }
          break;  
          case dataTypes.lmod :
               if(!firstInsert){
                    await lightModulesHandler.update(device,values);
               }
          break;    
               
          case dataTypes.advanced :
               if(!firstInsert){
                    await advancedSetupHandler.update(device,values);
               }
          break;   
     }
     return {status:500};
}

//TO DO : UNCOMMENT THE UPDATE DATA BASE METHODS...

async function setThermistors(device,values){
     for(let i = 0; i < values.length; i++){
          values[i] = (values[i]==null || values[i]=="") ? 0 : values[i];
          console.log("save ",values[i]," config id:",CONFIG_ID.THERMISTORS[i])
          await basicSetupHandler.update(device,CONFIG_ID.THERMISTORS[i],values[i]);
     }
}

async function setSensors(device,values){
     for(let i = 0; i < values.length; i++){
          values[i] = (values[i]==null || values[i]=="") ? 0 : values[i];
          console.log("save ",values[i]," config id:",CONFIG_ID.SENSORS[i])
          await basicSetupHandler.update(device,CONFIG_ID.SENSORS[i],values[i]);
     }
}

async function setSampling(device,values){
     const INTERVAL = 0;
     const SAMPLES = 1;
     console.log("save ",values.interval," config id:",CONFIG_ID.SAMPLING[INTERVAL]);
     console.log("save ",values.samples," config id:",CONFIG_ID.SAMPLING[SAMPLES]);
     await basicSetupHandler.update(device,CONFIG_ID.SAMPLING[INTERVAL],values.interval);
     await basicSetupHandler.update(device,CONFIG_ID.SAMPLING[SAMPLES],values.samples);
}

async function setReport(device,values){
     const MODE = 0;
     const SCHEDULED = 1;
     const INTERVAL = 2;
     const LTE = 3;
     const GPS = 4;

     console.log("report mode received",values.mode)
     let mode = (values.mode==0) ? "'INT'" : "'HOUR'" ;
     // console.log("save ",mode," config id:",CONFIG_ID.REPORT[MODE]);
     // console.log("save ",values.interval," config id:",CONFIG_ID.REPORT[INTERVAL]);
     // console.log("save ",values.scheduled," config id:",CONFIG_ID.REPORT[SCHEDULED]);
     await basicSetupHandler.update(device,CONFIG_ID.REPORT[MODE],mode);
     await basicSetupHandler.update(device,CONFIG_ID.REPORT[INTERVAL],values.interval);
     await basicSetupHandler.update(device,CONFIG_ID.REPORT[SCHEDULED],values.scheduled);
     await basicSetupHandler.update(device,CONFIG_ID.REPORT[LTE],values.lte_en);
     await basicSetupHandler.update(device,CONFIG_ID.REPORT[GPS],values.gps_en);
}
