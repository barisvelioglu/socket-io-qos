var server = require('http').createServer();

server.listen(3000);

var socket_qos_server = require('./socket_qos_server')({
  server : server,
  clients : [ { custom_client_id : 1001 } , { custom_client_id : 1002 }]
});

socket_qos_server.on('gate_pass', function(data, fn){
  console.log(data);
  fn();
});

setInterval(() => {
  socket_qos_server.emitAll("event", { hello : "world"});
}, 10000);
