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

Meteor.methods({
  updatePresence: function(state) {
    if (this.connection.id) {
      // console.log('updatePresence: ' + this.connection.id);
      var update = {};
      update['state'] = state;
      if (this.userId)
        update['userId'] = this.userId;
      Presences.update(this.connection.id, { $set: update });
    }
  }
});
