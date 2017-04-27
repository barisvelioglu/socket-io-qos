var server = require('http').createServer();
var io = require('socket.io')(server);
var _ = require('lodash');

var clients = [ { custom_client_id : 1001 } , { custom_client_id : 1002 }, { custom_client_id : 1003 }];

io.on('connection', function(socketClient){

  socketClient.on('client-info', function(data, fn){

    var client = _.find(clients, (x) => x.custom_client_id == data.custom_client_id);

    if(client){
      client.socket_id = socketClient.id;
      client.name = data.name;
    }
  });

  socketClient.on('disconnect', function(){
    var client = _.find(clients, (x) => x.socket_id == socketClient.id);

    if(client){
      client.socket_id = null;
    }
  });

});


/*
  name : ___,
  custom_client_id : ___,
  socket_id : ___
*/

var messages = [];

function emitMessageAll(topic, message){
  for (var i = 0; i < clients.length; i++) {
    var custom_client_id = clients[i].custom_client_id;
    emitMessage(custom_client_id, topic, message);
  }
}

function emitMessage(custom_client_id, topic, message){
  messages.push({
    id : Math.random().toString(16).substring(2),
    custom_client_id : custom_client_id,
    topic : topic,
    message : message,
    tryCount : 10
  });
}

/* MESSAGE MANAGER */

(function processMessages(){

  setInterval(function(){

    _.forEach(messages, (msg) => {

      var client = _.find(clients, (x) => x.custom_client_id == msg.custom_client_id);

      if(client && client.socket_id){

        io.sockets.connected[client.socket_id].emit(msg.topic, msg.message, function(){
          _.remove(messages, function (x) {
            return x.id === msg.id
          });
        })
      }

    });

    console.log(messages);

  }, 2000);

}());

//*** TEEEEST ***/

setInterval(() => {
  emitMessageAll("event", { hello : "world"});
}, 5000);
