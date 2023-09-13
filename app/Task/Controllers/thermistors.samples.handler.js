const sql = require("../../Data_Base/db.connection");
const logger = require('../../Auxiliary_Classes/logger');
const therm_samples = require('../../Query_Classes/thermistors.samples');

exports.task = async (params) => {
    switch (params.taskCmd){
        case "last_four" :
            let limit = 4;
            return await getByLimit(params.deviceId,limit);
        default :
            return {error:true,data:[]};
    }   
}

async function getByLimit(deviceId,limit){ // COMMENT TESTING LINES
    if(deviceId=='' || deviceId==null || deviceId==undefined){
         return {err:true,data:[]};
    }

    let result = await getLatestByLimit(deviceId,limit);
    console.table(result.data)
    
    return result;
}

async function getSamples(deviceId,range){
    let result = await therm_samples.getRaw(deviceId,range);
   
    if(result.err==null){
        return {error:false,data:result.data};
    }
    return {error:true,data:[]};
}

async function getLatestByLimit(deviceId,limit){
    let result = await therm_samples.getLatest(deviceId,limit);
   
    if(result.err==null){
        return {error:false,data:result.data};
    }
    return {error:true,data:null};
}