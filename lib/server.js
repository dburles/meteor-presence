// make an attachment point so that package users can connect functions
Presence = {
  onConnect: undefined,
  onDisconnect: undefined
};

var connections = {};

// watch the collection to see if the userId has been added
Presences.after.update(function (userId, doc, fieldNames, modifier, options) {
  // emit that a specific user has logged in
  var userInfo = buildUserInfo(doc.userId, doc._id);
  Presence.onConnect(userInfo); // call the user specified methods
});

var expire = function (id) {
  // if the user specified a method then find the connection data an call it
  if (Presence.onDisconnect) {
    var presRecord = Presences.findOne({
      _id: id
    });
    if (presRecord) {
      var userInfo = buildUserInfo(presRecord.userId, id);
      Presence.onDisconnect(userInfo); // call the user specified methods
    }
  }

  Presences.remove(id);
  delete connections[id];
};

var tick = function (id) {
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function () {
  Presences.remove({});
});

// build a object with either a userId or connectionId
var buildUserInfo = function (uId, connectionId) {
  var userInfo;

  if (uId) {
    userInfo = {
      userId: uId
    };
  } else {
    userInfo = {
      connectionId: connectionId
    };
  }

  return userInfo;
};


Meteor.onConnection(function (connection) {
  Presences.upsert(connection.id, {
    $set: {}
  });
  connections[connection.id] = {};
  tick(connection.id);

  connection.onClose(function () {
    console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });
});

Meteor.methods({
  presenceTick: function () {
    check(arguments, [Match.Any]);
    if (this.connection && connections[this.connection.id])
      tick(this.connection.id);
  }
});

Meteor.setInterval(function () {
  _.each(connections, function (connection, id) {
    if (connection.lastSeen < (Date.now() - 10000))
      expire(id);
  });
}, 5000);
