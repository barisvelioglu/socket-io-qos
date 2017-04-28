var _ = require('lodash');
var low = require('lowdb');
var uuid = require('uuid');

module.exports = function(config){
  if(!config.server || !config.clients || !config.clients.length){
    throw new Error("Server or Clients info missing");
  }

  const db = low('socket_qos_server_messages.json');
  db._.mixin(require('lodash-id'))

  if(!db.has('messages').value()){
    db.defaults({ messages: [] })
      .write()
  }

  var io = require('socket.io')(config.server);
  var subscribes = [];

  io.on('connection', function(socketClient){

    socketClient.on('client-info', function(data, fn){

      var client = _.find(config.clients, (x) => x.custom_client_id == data.custom_client_id);

      if(client){
        client.socket_id = socketClient.id;
        client.name = data.name;
      }

      _.forEach(subscribes, (x) => {
        socketClient.on(x.topic, function(data, fn){
          x.callback(data, fn, data.custom_client_id);
        });
      });

      db.get('messages')
        .updateWhere({ custom_client_id: data.custom_client_id }, { socket_id: socketClient.id})
        .write();

    });

    socketClient.on('disconnect', function(){

      var client = _.find(config.clients, (x) => x.socket_id == socketClient.id);

      if(client){
        client.socket_id = null;
      }

      db.get('messages')
        .updateWhere({ socket_id: socketClient.id }, { socket_id : null})
        .write();

    });



  });

  function emitAll(topic, message){
    for (var i = 0; i < config.clients.length; i++) {
      var custom_client_id = config.clients[i].custom_client_id;
      emit(custom_client_id, topic, message);
    }
  }

  function emitAllExceptSender(senderId, topic, message){
    for (var i = 0; i < config.clients.length; i++) {
      var custom_client_id = config.clients[i].custom_client_id;
      if(custom_client_id != senderId){
        emit(custom_client_id, topic, message);
      }else{
        //skip
      }
    }
  }

  function emit(custom_client_id, topic, message){
    var msg = {
      id : uuid(),
      custom_client_id : custom_client_id,
      topic : topic,
      message : message,
      tryCount : 10
    };

    db.get('messages').push(msg).write();

  }

  function on(topic, callback){
    subscribes.push({
      topic : topic,
      callback : callback
    });
  }

  (function processMessages(){

    setInterval(function(){

      _.forEach(config.clients, (c) => {

        _.forEach(db.get('messages').filter({custom_client_id : c.custom_client_id }).take(1000).value(), (msg) => {

          if(c.socket_id){

            io.sockets.connected[c.socket_id].emit(msg.topic, msg.message, function(){

              db.get('messages')
                .remove({ id: msg.id })
                .write();

            })
          }

        });

      });

    }, 2000);

  }());

  return {
    emitAll : emitAll,
    emitAllExceptSender : emitAllExceptSender,
    emit : emit,
    on : on
  }
}
