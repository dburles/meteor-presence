Meteor.startup(function() {
  Presences.remove({});
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id + ' userId: ' + this.userId);
  Presences.upsert(connection.id, { $set: {}});

  connection.onClose(function() {
    // console.log('connection closed: ' + connection.id);
    Presences.remove(connection.id);
  });
});

