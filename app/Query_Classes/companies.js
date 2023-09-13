const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.getAll = async () => {
     const mainQuery = `SELECT * FROM companies`;

     let con = await sql.connect();
      await con.query( mainQuery).then( ([rows,fields]) => {// await this promise
         
          if (rows.length) {
               result = {err:null,data:rows};
          console.table(rows);
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

exports.set = async (isNewCompany,companyName,companyId) => {

     if(isNewCompany){
          var mainQuery = `INSERT INTO companies SET companyName=${companyName} `;
     }else{
          var mainQuery = `UPDATE companies SET companyName=${companyName} WHERE id=${companyId}`;
     }
    
     console.log(mainQuery);

     let con = await sql.connect();
     await con.query( mainQuery).then( ([rows,fields]) => {

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