Presence = {};
Presence.state = function() {
  return 'online';
};

// For backwards compatibilty
Meteor.Presence = Presence;

Meteor.startup(function() {
  Deps.autorun(function() {
    // console.log(Meteor.status());
    if (Meteor.status().status === 'connected')
      Meteor.call('updatePresence', Presence.state());
  });
});
