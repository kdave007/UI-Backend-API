const companies = require('../../Query_Classes/companies');

exports.getAll = async () => {
     var response = await companies.getAll();
     return response;
}

exports.set = async (requestUserInfo,companyName,companyId) => {
     if(!approveUserLevel(requestUserInfo))return;
     let createNew = (companyId==null || companyId==undefined || companyId=="" || companyId==0 || isNaN(companyId)) ? false : true;
     try{
          await companies.set(createNew,companyName,companyId);
     }catch(e){
          logger.setLog("query").fatal(e);
     }
}

function approveUserLevel(requestUserInfo){
     return (requestUserInfo.level==1) ? true : false;
}