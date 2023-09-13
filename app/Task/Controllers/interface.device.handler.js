const logger = require('../../Auxiliary_Classes/logger');
const filterValues = require('../../Query_Classes/interface.device.settings');

exports.get = async (deviceId) => {
     var response = await filterValues.get(deviceId);
     return response;
}

exports.set = async (deviceId,values) => {
     console.log("SET")
     for(let i = 0; i < values.length; i++){
          console.log("index ",i,values[i])
          let nextValue = (values[i]!=null && values[i]!=undefined && values[i]!="") ? values[i] : 0;
          await filterValues.set(deviceId,i+1,nextValue);
     }
}