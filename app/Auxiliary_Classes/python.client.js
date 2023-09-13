const http = require('http');

const PythonClient = {};

PythonClient.post = async (path,buf,afterMath) => {
     var options = {
          host: 'localhost',
          port: 9000,
          path,
          method:"POST",
          headers: {
               'Content-Type': 'application/json',
               'Content-Length': buf.length,
               'Access-Control-Allow-Headers':'Content-Type',
               'Access-Control-Allow-Methods':'PUT, GET, POST, DELETE, OPTIONS',
               'Accept': 'application/json'
           }
     };

     var innerReq = await http.request(options,async (response) =>{
          var bodyChunks = [];
          await response.on('data', function(chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
          }).on('end', function() {
            var body = Buffer.concat(bodyChunks);
           // console.log('BODY: ' + body);
               return afterMath({error: errorStatus(response.statusCode), status:response.statusCode, body});
          });

     }).on('error', (error) => {
          console.log("there was an exception",error);
          return afterMath({error:true, status:500});
     });
  
     innerReq.write(buf);
     innerReq.end();
}

errorStatus = (status) => {
     if(status == 204 || status == 400 || status == 500){
          return true;
     } 
     return false;
}

PythonClient.resolveResult = (result,requestResponse) => {
     //console.log("result //////// ", result)
     if(result.error){
          console.log("ERROR");
          requestResponse.status(result.status).end();
     }else{
          requestResponse.status(result.status);
          requestResponse.send(result.body).end();
     }
}

module.exports = PythonClient;