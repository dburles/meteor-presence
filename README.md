# Meteor Presence

A very simple presence package, to track who's online, etc.

## Installation

The Presence package can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add presence
```

## Usage

The user's online state can be tracked via the `Presences` collection, referenced by `userId`

NOTE: The package doesn't publish the presences by default, you'll need to do something like:
```js
Meteor.publish('userPresence', function() {
  // Setup some filter to find the users your user
  // cares about. It's unlikely that you want to publish the 
  // presences of _all_ the users in the system.
  var filter = {}; 
  
  return Presences.find(filter, {fields: {state: true, userId: true}});
});
```

To use that presence, you can inspect the `Presences` collection in the client.

## Advanced Usage

### State functions

If you want to track more than just users' online state, you can set a custom state function. (The default state function return just `'online'`):

```js
Presence.state = function() {
  return {
    online: true,
    currentRoomId: Session.get('currentRoomId');
  };
}
```

Of course presence will call your function reactively, so everyone will know as soon as things change.

## Contributing

Please! The biggest thing right now is figuring how to write tests.