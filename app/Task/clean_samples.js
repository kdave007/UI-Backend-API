/**
 * WARNING, DONT USE THIS SCRIPT IF YOU DONT KNOW WHAT YOU ARE DOING !!!!!!!!!!!!!!!!!!!!!!!!!!
 */
const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

 exports.checkClones = async (device,dateRange) => {
     console.log("checking samples, clones found:")
     await findClones(device,dateRange);
 } 

 exports.deleteClones = async (device,dateRange) => {
     let result = await findClones(device,dateRange);
     if(result.err==null){
          await removeClonesFound(result);
     }
} 

async function removeClonesFound(sorted){
     let totalDeletedCount = 0;
     console.log("waiting to complete process...")
     for(let i = 0; i<sorted.toDelete.length; i++){
          //console.log("deleting",sorted.toDelete[i])
         let result = await deleteSample(sorted.toDelete[i].tDataId);
         totalDeletedCount += (result.affectedRows) ? 1 : 0;
         //console.log(totalDeletedCount);
     }
     console.log("counting deleted rows",totalDeletedCount);
     console.log("finish cleaning samples!... genuine samples:")
     console.table(sorted.genuine);
}


 async function findClones(device,dateRange){ 
     let sorted = undefined;    
     let result = await querySamples(device,dateRange);
     if(result.err==null){
          //console.log(result.data)
          sorted = sortClones(result.data);
          
     }
     return sorted!=undefined ? {err:null,genuine:sorted.genuine,toDelete:sorted.toDelete} : {err:true};
 }

 function sortClones(rows){
      let pastElement = null;
      let toDelete = [];
      let genuine = []
      rows.forEach((element,index) => {
          if(genuineSample(pastElement,element)){
               //console.log("different",element)
               genuine = [...genuine,element];
          }else{
               toDelete = [...toDelete,element];
          }    

           pastElement = element;
      });

      return {toDelete,genuine};
 }

 function genuineSample(past,current){
     if(past!=null){
          let pastD = new Date(past.timestamp);
          let currentD = new Date(current.timestamp);
          //console.log("current id",current.tDataId,"compare past",past.timestamp," vs current",current.timestamp)
          if(pastD.getTime() === currentD.getTime()){
               return false;
          }
     }
     return true;
 }

 async function querySamples(device,dateRange){
     const mainQuery = `SELECT *
          FROM device_data_temp_volt
          WHERE deviceId=${device} AND (timestamp BETWEEN '${dateRange.start}' AND '${dateRange.end}')
          ORDER BY timestamp DESC LIMIT 2000;`;

     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {// await this promise
      
          if (rows.length) {
               result = {err:null,data:rows};
               //console.table(rows);
          }else{
               result = {err:null,data:false};
          }    
          con.end();
     })
     .catch((error)=>{//handle error
          logger.setLog("query").fatal(error);
          result = {err:error,data:null};
     });

     return result;
 }

 async function deleteSample(rowId){
     const mainQuery = `DELETE FROM device_data_temp_volt WHERE tDataId=${rowId}`;
     let con = await sql.connect();
     await con.query(mainQuery).then(([rows, fields]) => {
          if (rows.affectedRows) {
               //console.log("delete, rows affected",rows.affectedRows)
              result = {
                  err: null,
                  affectedRows: rows.affectedRows
              };
          } else {
              result = {
                  err: null,
                  data: false
              };
          }
          con.end();
      })
          .catch((error) => {
              result = {
                  err: error,
                  data: null
              };
          });
      
      return result;
 }