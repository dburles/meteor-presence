Presence = {};
Presence.state = function() {
  return 'online';
};

// For backwards compatibilty
Meteor.Presence = Presence;

Meteor.startup(function() {
  Deps.autorun(function() {
    Meteor.call('updatePresence', Presence.state());
  });
});
