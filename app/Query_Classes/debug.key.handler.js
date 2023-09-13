const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

/**
 * @brief
 *  CLASS
 *  Query 
 *  devices list 
 *
 */

exports.getMatch = async (key) => {
     var mainQuery = `SELECT * FROM debug_interface_server `+
     `WHERE codeId=1 and value='${key}' LIMIT 1`;

     let con = await sql.connect();

     await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
          if (rows.length) {
               result = {err:null,data:rows[0]};
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