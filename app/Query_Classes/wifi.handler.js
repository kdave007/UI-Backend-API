const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

const Wifi={};

Wifi.getProfiles = async (device) => {
     let mainQuery = `SELECT apId,priority,enable,ssid,psw as 'key',pending,deleteReq,bssid FROM device_ap `+ 
     `WHERE deviceId=${device}`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
              // console.table(rows);
          }else{
               result = {err:null,data:false};
          }    
         
          con.end()
        })
        .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:null};
        });

      return result;
}

Wifi.setProfiles = async (device,newProfiles) => {
     let firstInsert = await Wifi.checkFirstInsert(device);
     if(validProfiles(newProfiles)){
          for(let i = 0; i<newProfiles.length; i++){
               console.log("CURRENT PROFILE ",newProfiles[i])
               newProfiles[i] = findToDelete(newProfiles[i],firstInsert);
               console.log("inserting profiles",i)
               await setNewProfile(device,newProfiles[i],i);
              
          }
     }else{
          console.log("cannot insert invalid profiles ");
     }
}

async function setNewProfile(device,newProfile,index){
     index+=1;
     var mainQuery = `INSERT INTO device_ap `+
     `SET deviceId=${device},apId=${index},ssid="${newProfile.ssid}",bssid="${newProfile.bssid}",psw="${newProfile.key}",pending=1,`+
     `deleteReq=0,enable=1 `+
     `ON DUPLICATE KEY UPDATE  ssid="${newProfile.ssid}",psw="${newProfile.key}",pending=1,enable=1 `;

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise

     if (rows.affectedRows) {
          result = {err:null,data:rows.affectedRows};
     }else{
          result = {err:null,data:0};
     }
     
     con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:0};
     });

     return result; 
}

Wifi.checkFirstInsert = async (device) => {
     let result = await Wifi.getProfiles(device); 
     if(result.err==null && result.data){
          return false; 
     }
     return true; 
}

function findToDelete(newProfile,firstInsert){
     console.log("newProfile ",newProfile)
     if(newProfile.ssid==null && newProfile.key==null && !firstInsert){
          newProfile["deleteReq"]=1;
     }
     return newProfile;
}

function validProfiles(profiles){
     for(let i = 0; i < profiles.length; i++){
          if(profiles[i].ssid!=null && profiles[i].key!=null && profiles[i].ssid!="" && profiles[i].key!=""){
               return true;
          }
     }
     return false;
}

module.exports = Wifi;


