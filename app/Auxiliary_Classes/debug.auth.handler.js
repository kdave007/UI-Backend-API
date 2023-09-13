const debugKeyHandler = require('../Query_Classes/debug.key.handler');

const coyote = {}

coyote.validatePass = async (key,userId) => {
     console.log("validating debug pass");
     if(validParams(key,userId)){
          let clientStatus = await keyMatch(key);
          console.log("keymatch result",clientStatus);
          if(!clientStatus.error){
               if(clientStatus.approved){
                    return true;
               }
          }
     }
     return false;
}

function validParams(key,userId){
     if(key!=undefined && key!=null && key!='' && userId!=undefined && userId!=null && userId!=''){
          return true;
     }
     return false;
}

async function keyMatch(key){
     let result = await debugKeyHandler.getMatch(key);
     console.log("key match query result",result);
     if(result.err==null){
          if(result.data){
               if(result.data.value === key){
                    return {error:false, approved:true}
               }
               return {error:false, approved:false}
          }
     }
     return {error:true};
}

module.exports = coyote;

