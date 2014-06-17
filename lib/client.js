Presence = {};
Presence.state = function () {
  return {
    online: true,
    lastSessionId: Meteor.default_connection._lastSessionId
  };
};

// For backwards compatibilty
Meteor.Presence = Presence;

Meteor.startup(function () {
  Deps.autorun(function () {
    if (Meteor.status().status === 'connected') {
      if (typeof Meteor.userId !== 'undefined' && Meteor.userId())
        Meteor.call('updatePresence', Presence.state());
      else
        Meteor.call('updatePresence', Presence.state());
    }
  });
  Meteor.setInterval(function () {
    Meteor.call('presenceTick');
  }, 5000);
});
