const sql = require("../../Data_Base/db.connection");
const logger = require('../../Auxiliary_Classes/logger');
const voltageProvider = require('../../Query_Classes/truck.voltage.query');
const dateTime = require('../../Auxiliary_Classes/date.time');


exports.get = async(deviceId,range) => { // COMMENT TESTING LINES
     console.log("asking for voltages 1")
     if(deviceId=='' || deviceId==null || deviceId==undefined){
          return {err:true,data:false};
     }
     console.log("asking for voltages 2")
     let result = await getVoltageSamples(deviceId,range);

     return result;
}

async function getVoltageSamples(device,range){
     let r = {start: range.start,end: range.end}; 
     try{
           let result = await voltageProvider.getRaw(device,r);
           console.log("asking for voltages",result)
           if(result.err==null){
                result.data = parseToStringDate(result.data);// parse the dateformat to string in order to avoid timezone issues
                return {error:null,data:result.data};
           }
     }catch(e){
          console.error(e);    
     }   
     return {error:true,data:false};       
}

function parseToStringDate(rows){
     for(let i = 0; i < rows.length; i++){
          rows[i].timestamp = dateTime.sortDateFormat(rows[i].timestamp,true);
     }
     return rows;
}