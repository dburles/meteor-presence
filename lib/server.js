// make an attachment point so that package users can connect functions
Presence = {
  onConnect: undefined,
  onDisconnect: undefined,
};

var presenceThreshold = 5000
var cleanupThreshold = presenceThreshold * 2;

// watch the collection to see if the userId has been added
Presences.after.update(function (userId, doc, fieldNames, modifier, options) {
  // call the onConnect if there is a state change
  if (fieldNames.indexOf('state') > -1) {
    // emit that a specific user has logged in
    var userInfo = buildUserInfo(doc.userId, doc._id);
    //console.log("Presences updated with " + EJSON.stringify(fieldNames));
    Presence.onConnect(userInfo); // call the user specified methods
  }
});

var expire = function (connectionId) {
  // if the user specified a method then find the connection data an call it
  if (Presence.onDisconnect) {
    var presRecord = Presences.findOne({
      _id: connectionId
    });

    if (presRecord) {
      var userInfo = buildUserInfo(presRecord.userId, connectionId);
      //console.log('Disconnected connectionId ' + connectionId + ", userId " + presRecord.userId)
      Presence.onDisconnect(userInfo); // call the user specified methods
    }
  }
  // remove the entry after reporting it
  Presences.remove(connectionId);
};

// on (re)start of the system clear out old data.
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
  // create a new presence document
  var userPresence = {
    httpHeaders: connection.httpHeaders,
    clientAddress: connection.clientAddress,
    createdAt: new Date()
  }

  Presences.upsert(connection.id, {
    $set: userPresence
  });

  connection.onClose(function () {
    //console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });

});

Meteor.methods({
  presenceTick: function () {
    check(arguments, [Match.Any]);
    if (this.connection && this.connection.id)
      Presences.update({
        _id: this.connection.id
      }, {
        $set: {
          updatedAt: new Date()
        }
      }, {
        multi: false
      })
  }
});

var cleanupNonActive = function () {
  // find presences that state that they are online, but haven't talked to the server in a bit
  var presenceCursor = Presences.find({
    $and: [{
      status: 'online'
    }, {
      updatedAt: {
        $lt: Date.now() - cleanupThreshold
      }
    }]
  }, {
    fields: {
      userId: 1,
      connectionId: 1
    }
  });

  // loop through and expire them
  presenceCursor.forEach(function (connection) {
    expire(id);
  });
};

Meteor.setInterval(cleanupNonActive, presenceThreshold);
