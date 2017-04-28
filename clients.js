//** CLIENT 1 **/

var socket_qos_client = require('./socket_qos_client')({
  server_url : "http://localhost:3000",
  name : "Gate 1",
  custom_client_id : 1001,
  ip_address : "192.168.1.108"
});

socket_qos_client.on('event', function(data, fn){
  console.log("Gate 1 /// " + new Date())
  console.log(data);
  fn();
});


socket_qos_client.on('gate_pass', function(data, fn){
  console.log("Gate 1 PASS birşey yapmadan client aldı /// " + new Date())
  console.log(data);
  fn();
});

setInterval(function(){
  socket_qos_client.emit("gate_pass", {
    name : "Barış Velioğlu"
  })
}, 5000);

var socket_qos_client2 = require('./socket_qos_client')({
  server_url : "http://localhost:3000",
  name : "Gate 2",
  custom_client_id : 1002
});


socket_qos_client2.on('gate_pass', function(data, fn){
  console.log("Gate 2 PASS birşey yapmadan client aldı /// " + new Date())
  console.log(data);
  fn();
});

socket_qos_client2.on('event', function(data, fn){
  console.log("Gate 2 /// " + new Date())
  console.log(data);
  fn();
});

setInterval(function(){
  socket_qos_client2.emit("gate_pass", {
    name : "Sevilay Velioğlu"
  })
}, 5000);


//** CLIENT 2 **/
/*
var socket2 = require('socket.io-client')('http://localhost:3000');

socket2.on('connect', function(){
  console.log("CONNECTED!!!");
  socket2.emit("client-info", {
    name : "Gate 2",
    custom_client_id : 1002
  });
});
socket2.on('event', function(data, fn){
  console.log(data);
  fn();
});
socket2.on('disconnect', function(){});

*/
