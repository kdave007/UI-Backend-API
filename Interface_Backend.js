const express = require('express');
const time = require('./app/Auxiliary_Classes/date.time');
const logger = require('./app/Auxiliary_Classes/logger');
const bodyParser = require('body-parser');
const app = express();
const postAllocator = require('./app/Task/post.allocator');

const session = require('express-session');
const userAuth = require('./app/Authentication/userAuth');
const userInfo = require('./app/Authentication/userInformation');
const sessionMod = require('./app/Authentication/sessionMod');
const storageSession = require('./app/Authentication/sql.session.storage');
const debugAuthHandler = require('./app/Auxiliary_Classes/debug.auth.handler');

const http = require('http');
const pythonClient = require('./app/Auxiliary_Classes/python.client');
const allowedOrigins = ["http://coolchain.com.mx"];

const DEBUG_ON = true;// SET FALSE WHEN DEBUG IS FINISHED <<---

//server settings
const port = 94;
app.set('port',port);
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log("IP REQUEST :",origin)
    allowedOrigins.push("http://localhost:4200");//ONLY FOR TESTING
    allowedOrigins.push("http://192.168.0.8");//ONLY FOR TESTING
    allowedOrigins.push("http://192.168.10.11");//ONLY FOR TESTING
    allowedOrigins.push("http://192.168.10.1");//ONLY FOR TESTING

    if(allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    //res.header('Access-Control-Allow-Origin', 'http://coolchain.com.mx')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Allow-Origin-With-Credentials', true)
    res.header('Access-Control-Allow-Headers','Content-Type');
     next();
});

app.use(session({
     key: "coolchain_cloud_1",
     secret: "pending_secret",
     store: storageSession,
     resave: false,
     saveUninitialized: false,
     cookie: {
          secure: false,
          maxAge: 1000 * 60 * 60 * 24,
          domain:"coolchain.com.mx",
          //domain:"localhost",
          sameSite:false
     }
}));

app.post('/login',async(req,res) => {
     console.log(req.body)
     try {
          const { email, password } = req.body;
          const usrAuth = await userAuth.Auth(email, password);
          if(DEBUG_ON && req.body.debug){//cause is a login we need to fetch de id from the DB
               console.log("main :: debug request",req.body.debug);
               if(debugAuthHandler.validatePass(req.body.keyPass,usrAuth.userId)){
                    res.status(200).send({
                         token:"exitoso",
                         name:usrAuth.name,
                         userId:""+usrAuth.userId,
                         sessid:req.session.id
                    }).end();
                    return;
               }
          }
          if (usrAuth.status) {
               console.log("main :: normal request",req.body.debug);
               if (req.session.authUsr && (usrAuth.email == req.session.email)) {
                    console.log("case session occupied by the same user");
                    req.session.authUsr = true;
                         req.session.email = usrAuth.email;
                         req.session.usId= usrAuth.userId;
                         const timestamp = Date.now();
                         await sessionMod.setSession(timestamp, req.session.id, req.session.usId);
                         res.status(200).send({
                              token:"exitoso",
                              name:usrAuth.name,
                              userId:""+usrAuth.userId,
                              sessid:req.session.id
                         }).end();
               } else {
                    if (req.session.authUsr &&!(usrAuth.email == req.session.email)) {
                         console.log("case session used by different user");
                         res.status(401).send({ msg: `Hay un usuario activo, cierre session; Si el problema continua elimine las cookies de su navegador` }).end();
                    } else {
                         req.session.authUsr = true;
                         req.session.email = usrAuth.email;
                         req.session.usId= usrAuth.userId;
                         const timestamp = Date.now();
                         await sessionMod.setSession(timestamp, req.session.id, req.session.usId);
                         res.status(200).send({
                              token:"exitoso",
                              name:usrAuth.name,
                              userId:""+usrAuth.userId,
                              sessid:req.session.id
                         }).end();
                    }
               }
          } else {
               console.log("wrong credentials");
               res.status(401).send({ msg: `Usuario y/o contraseña incorrectos` }).end();
          }
     } catch (error) {
          res.status(401).send({ msg: `${error}` }).end();
     }
});

app.post('/logout', async (req, res) => {
     if (req.session.authUsr) {
          console.log("logout id ",req.session.id);
          req.session.destroy(req.session.id);
          await sessionMod.delNotExistSessions();
          res.clearCookie('coolchain_cloud_1', { path: '/' }).status(200).send({ msg: `Se terminó ha terminado la session` });
     } else {
          res.status(401).send({ msg: `Inicie Session` });
     }
});

/***
 * INTERFACE DATA AND PARAMS
 */
app.post('/mother_base',async(req,res) => {
     console.log("/////////// got a post",req.body);
     // console.log("session cookie",req.header)
     console.log("session params ",req.headers);

     let authStatus = await authorizedClient(req);

     if (authStatus.keepGoing) {
          console.log("sesion vigente",user);
          let result = await postAllocator.allocate(req.body,authStatus.user.UserInfo);
          console.log("final result ",result);
          res.status(result.status);
          res.send(result.data).end();
     }else{
          console.log("sesion expirada");
          res.status(401);
          res.send({msg:"restart_session"}).end();
     }
});


/***
 * DEVICE CONFIG PARAMS
 */
app.post('/config',async(req,res) => {
     console.log("//////////  got a post",req.body);
     // console.log("session cookie",req)
     console.log("session params ",req.sessionID);

     let authStatus = await authorizedClient(req);

     if (authStatus.keepGoing) {
          let response = await require('./app/Task/Controllers/device.settings.params').settingsHandler(req.body);
          console.log("response:",response)
          if(response.data){
               res.send(response.data);
          }

          res.status(response.status).end();
     }else{
          console.log("sesion expirada");
          res.status(401);
          res.send({msg:"restart_session"}).end();
     }
});


/**
 * ///////////////////////////////////
 * /// PYTHON THERMISTOR POST   /////
 * /////////////////////////////////
 */
app.post('/thermistor',async(req,res) => {
     console.log("/////////// got a post",req.body);
     console.log("session params ",req.headers)

     var buf = Buffer.from(JSON.stringify(req.body));

     let authStatus = await authorizedClient(req);

     if (authStatus.keepGoing) {
          let user = await userInfo.userInformation(req.session.id);
          console.log("sesion vigente",user);

          let result = await pythonClient.post("/thermistor",buf, (result) => {
               pythonClient.resolveResult(result,res);
          });
          

          // res.status(result.status);
          // res.send(result.data).end();
     }else{
          console.log("sesion expirada");
          res.status(401);
          res.send({msg:"restart_session"}).end();
     }
});

/**
 * ///////////////////////////////////
 * /// PYTHON COMPRESSOR POST   /////
 * /////////////////////////////////
 */
app.post('/comp',async(req,res) => {
     console.log("/////////// got a post",req.body);
     console.log("session params ",req.headers)

     var buf = Buffer.from(JSON.stringify(req.body));
     let authStatus = await authorizedClient(req);

     if (authStatus.keepGoing) {
          let user = await userInfo.userInformation(req.session.id);
          console.log("sesion vigente",user);

          let result = await pythonClient.post("/comp",buf, (result) => {
               pythonClient.resolveResult(result,res);
          });

     }else{
          console.log("sesion expirada");
          res.status(401);
          res.send({msg:"restart_session"}).end();
     }

});

/**
 * ///////////////////////////////////
 * /// PYTHON MISC POST   /////
 * /////////////////////////////////
 */
app.post('/misc',async(req,res) => {
     console.log("/////////// got a post",req.body);
     console.log("session params ",req.headers)

     var buf = Buffer.from(JSON.stringify(req.body));
     let authStatus = await authorizedClient(req);

     if (authStatus.keepGoing) {
          let user = await userInfo.userInformation(req.session.id);
          console.log("sesion vigente",user);

          let result = await pythonClient.post("/misc",buf, (result) => {
               pythonClient.resolveResult(result,res);
          });
          
     }else{
          console.log("sesion expirada");
          res.status(401);
          res.send({msg:"restart_session"}).end();
     }
});

async function authorizedClient(req){
     if(DEBUG_ON && req.body.debug){
          console.log("case 1")
          user = { UserInfo : {
               userId : req.body.userId,
               name : req.body.name,
               password : req.body.password,
               email : req.body.email,
               level : req.body.level,
               companyId : req.body.companyId
          }}
          let keepGoing = await debugAuthHandler.validatePass(req.body.keyPass,req.body.userId);
          return {user,keepGoing}

     }
     if(req.session.authUsr) {
          console.log("case 2")
          user = await userInfo.userInformation(req.session.id);
          return {user,keepGoing: (result.data) ? true : false };
     }
     console.log("case 3")
     return {keepGoing:false};
}


app.listen(app.get('port'),async () => {
     try{
          logger.setLog("server").info("---------- MEXICO: "+time.sortDateFormat(false,true));
          logger.setLog("server").info("---------- starting Interface server on port "+app.get('port'));
     }catch(exception){
          logger.setLog("server").error(exception);
     }
    
});
