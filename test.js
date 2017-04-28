var low = require('lowdb');
var uuid = require('uuid');

const db = low('socket_qos_server_messages.json');
db._.mixin(require('lodash-id'))

db.get('messages')
  .updateWhere({}, { socket_id: "21312321321321111111111111111111"})
  .write()

console.log(db.get('messages').value());
