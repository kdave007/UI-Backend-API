const userQuery = require('./user');
const userQuery2 = require('./user.query');
const sessionQuery = require('./session');

exports.userInformation = async (sessionIdentifier) => {
  console.log(sessionIdentifier)
  preresult = await sessionQuery.getSessionbySId(sessionIdentifier);
  if (preresult.data) {
    const { sessionDATE, sessionDATA, userId } = preresult.data[0];
    result = await userQuery.getuserInformation(userId);
    if (result.data) {
      const { userId, name, password, level, email, locked, companyId } = result.data[0];

      return {
        SessionInfo: {
          userId,
          created: createdExpriresDateCheck(sessionDATE).createdDate,
          expires: createdExpriresDateCheck(sessionDATE).expiresDate,
          sessionDATA,
          status: createdExpriresDateCheck(sessionDATE).status
        },
        UserInfo: {
          userId,
          name,
          password,
          email,
          level,
          companyId
        }

      };
    } else if (result.err) {
      return result.err;
    } else {
      return result;
    }
  } else if (preresult.err) {
    return preresult.err;
  } else {
    return preresult;
  }
}

function createdExpriresDateCheck(sessionDATE) {
  const dateC = parseInt(sessionDATE);
  const createdDate = new Date(dateC).toLocaleString();
  const dateE = dateC + (1000 * 60 * 60 * 24);
  const expiresDate = new Date(dateE).toLocaleString();//Milisegundos selecionados en la cookie
  const timestamp = Date.now();
  const status = (dateE >= timestamp) ? "Valid" : "Invalid";
  return {
    status,
    createdDate,
    expiresDate

  };
}

exports.setNewEmail = async (userId,requestPassword,email,masterRequest) => {
  try{
    let success = false;
    if(masterRequest){
      success = true;
    }else{
      success = await passValidation(userId,requestPassword);
    }
    if(success && validData(email)){
      let updateResult = await userQuery2.updateUserEmail(userId,email);
      if(updateResult.data){
        return "success"
      }
    }
    return "fail"; 
  }catch(e){
    console.error(e);
    return "fail";
  }
} 

exports.setNewPass = async (requestUser,targetUserId,requestPassword,newPassword,masterRequest) => {
  try{
    let success = false;
    if(masterRequest){
      success = true;
    }else{
      success = await passValidation(requestUser,targetUserId,requestPassword);
    }
    console.log("pass validation status ",success)
    if(success && validData(newPassword)){
      let updateResult = await userQuery2.updatePass(targetUserId,newPassword);
      if(updateResult.data){
        return "success"
      }
    }
    return "fail";
  }catch(e){
    console.error(e);
    return "fail";
  }
} 

async function passValidation(requestUser,targetUserId,pass){
  let result = await userQuery.getuserInformation(targetUserId);
  console.log("//****** query pass result",result)
  if(result.err==null){
    let targetUser = result.data[0];
    if(comparePass(pass,targetUser.password)){
      return compareLevels(requestUser.level,targetUser.level)
    }
  }
  return false;
}

function comparePass(requestPass,genuinePass){
  return (requestPass==genuinePass) ? true : false;
}

function compareLevels(requestUserLevel,targetUserLevel){
  switch (requestUserLevel){// request user is a super, so its allowed to change the password of the target user
    case 1 :
      return true;

    case 2 :
      if(targetUserLevel>2){//request user is admin, so only can edit secondary users passwords
        return true;
      }
      return false;

    case 3 :
      return false;

    default:
      return false;

  }

}

function validData(data){
  return (data!=undefined && data!=null && data!="" && data!=0) ? true : false; 
}

exports.setNewUser = async (user,newUser) => {
  try{
    if(validLevel(user.level,newUser.level)){
      const newPass = _genericPass();
      await userQuery2.create(newUser.name,newPass,newUser.level,newUser.email,newUser.companyId);
      return {err:null,data:true}
    }
    return {err:true,data:false}
  }catch(e){
    return {err:true,data:false}
  }
}

function validLevel(currentUserLevel,newUserLevel){
  return (currentUserLevel < newUserLevel) ? true : false;
}

function _genericPass(){
  return "automatische_22";
}

exports.setUserToCompany = async (userInfo,targetUserId,companyId) => {
  try{
    if(userInfo.level==1){
      let result = await userQuery.getuserInformation(targetUserId);
   
      if(result.err==null && result.data){
        let targetUser = result.data[0];
        if(targetUser.level!=1){
          await userQuery2.updateCompany(targetUser.userId,companyId);
          return {err:null,data:true}
        }
      }
    }
    return {err:true,data:false}
  }catch(e){
    console.error(e);
    return {err:true,data:false}
  }
}