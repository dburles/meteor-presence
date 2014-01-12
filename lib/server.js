var presences = {};
var Presence = function(id) {
  this.id = id;
  this.tick();
  Presences.upsert(this.id, { $set: {}});
};

Presence.prototype.expire = function() {
  Presences.remove(this.id);
  delete presences[this.id];
};

Presence.prototype.tick = function() {
  this.lastSeen = Date.now();
};

Meteor.startup(function() {
  Presences.remove({});
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id + ' userId: ' + this.userId);
  connection._presence = new Presence(connection.id);
  presences[connection.id] = connection._presence;

  connection.onClose(function() {
    // console.log('connection closed: ' + connection.id);
    connection._presence.expire();
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
    if (this.connection)
      this.connection._presence.tick();
  }
});

Meteor.setInterval(function() {
  _.each(presences, function(presence, id) {
    if (presence.lastSeen < (Date.now() - 10000))
      presence.expire();
  });
}, 5000);
