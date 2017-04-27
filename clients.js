//** CLIENT 1 **/

var socket1 = require('socket.io-client')('http://localhost:3000');
var config1 = {
  name : "Gate 1",
  custom_client_id : 1001
}
socket1.on('connect', function(){
  socket1.emit("client-info", config1);
});
socket1.on('event', function(data, fn){
  console.log(data);
  fn();
});
socket1.on('disconnect', function(){});


//** CLIENT 2 **/

var socket2 = require('socket.io-client')('http://localhost:3000');

socket2.on('connect', function(){
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
