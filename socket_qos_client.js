var _ = require('lodash');
var low = require('lowdb');
var uuid = require('uuid');
var lodash_id = require('lodash-id');

module.exports = function(config){
  if(!config.server_url || !config.name || !config.custom_client_id){
    throw new Error("server_url || name || custom_client_id is missing");
  }

  const db = low(encodeURIComponent(config.name) + '.json');
  var subscribes = [];

  db._.mixin(lodash_id);

  if(!db.has('messages').value()){
    db.defaults({ messages: [] })
      .write()
  }

  var socket = require('socket.io-client')(config.server_url);

  socket.on('connect', function(){

    console.log(config.name + " is connected!!!");

    socket.emit("client-info", config);

    _.forEach(subscribes, (x) => {
      socket.on(x.topic, x.callback);
    });

  });

  socket.on('disconnect', function(){
    console.log(config.name + " is disconnected!!!");
  });



  function emit(topic, message){

    var msg = {
      id : uuid(),
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

      if(socket.connected){
        _.forEach(db.get('messages').take(250).value(), (msg) => {

          socket.emit(msg.topic, msg.message, function(){

            db.get('messages')
              .remove({ id: msg.id })
              .write();

          })

        });
      }

      //console.log("Queue Message Size("+ config.name +") : " + db.get("messages").size());

    }, 500);

  }());


  return {
    emit : emit,
    on : on
  }

}
