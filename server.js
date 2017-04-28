var server = require('http').createServer();

server.listen(3000);

var socket_qos_server = require('./socket_qos_server')({
  server : server,
  clients : [ { custom_client_id : 1001, ip_address : "192.168.1.108" } , { custom_client_id : 1002, ip_address : "192.168.1.109" }]
});

socket_qos_server.on('gate_pass', function(data, fn, senderId){
  socket_qos_server.emitAllExceptSender(senderId, 'gate_pass', data);
  console.log(data);
  fn();
});
