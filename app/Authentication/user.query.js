const sql = require("../Data_Base/db.connection");
const logger = require('../Auxiliary_Classes/logger');

exports.getInfo = async(userId) => {
     let mainQuery = `SELECT userId as id,name,level,email,companyId FROM user WHERE userId=${userId}`;
     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {
      
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

exports.getAll = async() => {
     let mainQuery = `SELECT userId as id,name,level,email,companyId,companyName FROM user`
     mainQuery+=` LEFT JOIN companies ON user.companyId = companies.id` ;
     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {
      
          if (rows.length) {
               result = {err:null,data:rows};
               console.table(rows);
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

exports.getByCompany = async(companyId) => {
     let mainQuery = `SELECT userId as id ,name,level,email,companyId FROM user WHERE companyId=${companyId}`;
     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {
      
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

exports.getSubByCompany = async(companyId,minLevel) => {
     let mainQuery = `SELECT userId as id,name,level,email,companyId FROM user WHERE companyId=${companyId} AND level >=${minLevel} `;
     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {
      
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

exports.updateUserEmail = async (userId,email) => {
     let mainQuery = `UPDATE user SET email='${email}' `
     mainQuery +=`WHERE userId=${userId}`;
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

exports.updatePass = async (userId,password) => {
     let mainQuery = `UPDATE user SET password='${password}' `
     mainQuery +=`WHERE userId=${userId}`;
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

exports.create = async (name,password,level,email,companyId) => {
     let mainQuery = `INSERT INTO user SET name='${name}',password='${password}',level=${level},email='${email}',companyId=${companyId}`;
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

exports.delete = async (userId) => {
     let mainQuery = `DELETE FROM user WHERE userId=${userId}`;

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

exports.updateCompany = async (userId,companyId) => {
     let mainQuery = `UPDATE user SET companyId=${companyId} `
     mainQuery +=`WHERE userId=${userId}`;
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

 exports.getByLevel = async (level) => {
     let mainQuery = `SELECT userId as id,name,level,email,companyId FROM user WHERE level=${level} `;
     let con = await sql.connect();
     await con.query(mainQuery).then( ([rows,fields]) => {
      
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