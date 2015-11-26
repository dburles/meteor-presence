Meteor.startup(function() {
  Presences.remove({});
});

Meteor.onConnection(function(connection) {
  console.log('connectionId: ' + connection.id);
  Presences.upsert({ _id: connection.id }, {$set: { _id: connection.id }});

  connection.onClose(function() {
    console.log('connection closed: ' + connection.id);
    Presences.remove(connection.id);
  });
});
