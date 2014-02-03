var connections = {};

var expire = function(id) {
  Presences.remove(id);
  delete connections[id];
};

var tick = function(id) {
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function() {
  Presences.remove({});
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id + ' userId: ' + this.userId);
  Presences.upsert(connection.id, { $set: {}});
  connections[connection.id] = {};
  tick(connection.id);

  connection.onClose(function() {
    // console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });
});

Meteor.methods({
  updatePresence: function(state) {
    if (this.connection.id) {
      // console.log('updatePresence: ' + this.connection.id);
      var update = {};
      update.state = state;
      if (this.userId)
        update.userId = this.userId;
      Presences.update(this.connection.id, { $set: update });
    }
  },
  presenceTick: function() {
    if (this.connection && connections[this.connection.id])
      tick(this.connection.id);
  }
});

Meteor.setInterval(function() {
  _.each(connections, function(connection, id) {
    if (connection.lastSeen < (Date.now() - 10000))
      expire(id);
  });
}, 5000);
