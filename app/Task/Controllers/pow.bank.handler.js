const logger = require('../../Auxiliary_Classes/logger');
const Powerbank_samples = require('../../Query_Classes/pow.bank.samples');
const dateTime = require('../../Auxiliary_Classes/date.time');


exports.get = async(deviceId,range) => { // COMMENT TESTING LINES
     if(deviceId=='' || deviceId==null || deviceId==undefined){
          return {err:true,data:false};
     }

     let result = await getSamples(deviceId,range);
     //console.table(result.data)
     
     return result;
}

async function getSamples(deviceId,range){
    let result = await Powerbank_samples.getRaw(deviceId,range);
   
    if(result.err==null){
        result.data = parseToStringDate(result.data);
        return {error:false,data:result.data};
    }
    return {error:true,data:null};
}

function parseToStringDate(rows){
    for(let i = 0; i < rows.length; i++){
         rows[i].timestamp = dateTime.sortDateFormat(rows[i].timestamp,true);
    }
    return rows;
}