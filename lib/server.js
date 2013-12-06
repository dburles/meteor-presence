Meteor.startup(function() {
  Presences.remove({});
});

Meteor.publish(null, function() {
  if (! this._session.socket._meteorSession && this._session.userId)
    return;

  var session = this._session;
  session.sessionData.sessionId = session.id;

  // console.log('sessionId: ' + session.id + ' userId: ' + session.userId);

  Presences.upsert(session.id, { $set: {}});

  if (session.userId)
    Presences.update(session.id, { $set: { userId: session.userId }});

  if (! session.userId && session.sessionData.userId)
    Presences.update({ userId: session.sessionData.userId }, { $unset: { userId: '' }}, { multi: true });

  session.sessionData.userId = session.userId;

  session.socket.on('close', Meteor.bindEnvironment(function() {
    // console.log('userId:        ' + session.userId);
    // console.log('socket closed: ' + session.id);
    Presences.remove(session.id);
  }, function(error) {
    return Meteor._debug('Exception from connection close callback: ', error);
  }));
});

Meteor.methods({
  updatePresence: function(state) {
    var sessionId = this._sessionData.sessionId;
    if (sessionId) {
      // console.log('updatePresence: ' + sessionId);
      Presences.update(sessionId, { $set: { state: state }});
    }
  }
});
