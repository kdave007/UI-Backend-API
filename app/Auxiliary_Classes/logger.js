const log4js = require("log4js");
const time = require('./date.time');

var loggerObj ={};
var Log ={};
var logOptions={};

//Static files configurations
log4js.configure({
     appenders: { 
          server: { type: "file", filename: "./logs/server_Main.log"},
          query: { type: "file", filename: "./logs/query.log"},
          pendings: { type: "file", filename: "./logs/pendings.log"}
},
     categories: { 
          default: { appenders: ['server'], level: 'all' },
          query: { appenders: ['query'], level: 'all' },
          pendings: { appenders: ['pendings'], level: 'all' },
     }
});

//Log selector *public Method
Log.setLog = (appender) => {
      loggerObj = log4js.getLogger(appender);
      return logOptions;
}



//*Public Logging Methods
logOptions.info = (info) => {
     loggerObj.info(info);
     console.log(info);
}

logOptions.infoNC = (info) => {
     loggerObj.info(info);
}

logOptions.error = (info) => {
     loggerObj.error("MX Time Zone : [",time.sortDateFormat(false,true),"]");
     loggerObj.error(info);
     console.log(info);
}

logOptions.errorNC = (info) => {
     loggerObj.error("MX Time Zone : [",time.sortDateFormat(false,true),"]");
     loggerObj.error(info);
}

logOptions.fatal = (info) => {
     loggerObj.fatal("MX Time Zone : [",time.sortDateFormat(false,true),"]");
     loggerObj.fatal(info);
     console.log(info);
}

logOptions.fatalNC = (info) => {
     loggerObj.fatal("MX Time Zone : [",time.sortDateFormat(false,true),"]");
     loggerObj.fatal(info);
}

logOptions.debug = (info) => {
     loggerObj.debug(info);
     console.log(info);
}

logOptions.debugNC = (info) => {
     loggerObj.debug(info);
}

module.exports = Log;


