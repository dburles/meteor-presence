# Meteor Presence

A very simple presence package, to track who's online, etc.

## Important

This version of presence has been re-written from the ground up to make use of the new Meteor connection API.
If you're using a version of Meteor prior to 0.7.0, you should use the 0.3.0 version. Add to your `smart.json`:

```json
"packages": {
  "presence": "0.3.0"
}
```

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

  // If for example we wanted to publish only logged in users we could apply:
  // filter = { userId: { $exists: true }};
  var filter = {};

  return Presences.find(filter, {fields: {state: true, userId: true}});
});
```

To use that presence, you can inspect the `Presences` collection in the client.

## Advanced Usage

### Notification of connection and disconnection

There are two attachment points for being made aware of a connection to the server and a disconnection from the server.
The handler you assign to Presence.onConnect is called when a new connection is added. Similarly Presence.onDisconnect is called when the user disconnects.
The are wired up as below:

```js
// configure presence to call connectionAdded and connectionRemoved
Meteor.startup(function() {
	Presence.onConnect = tracking.connectionAdded;
	Presence.onDisconnect = tracking.connectionRemoved;
});
```
The object pasted to the functions contains two properties, connectionId and userId property, if it's associated with logged in user.

### State functions

If you want to track more than just users' online state, you can set a custom state function. (The default state function returns just `'online'`):

```js
// Setup the state function on the client
Presence.state = function() {
  return {
    online: true,
    currentRoomId: Session.get('currentRoomId')
  };
}
```

Now we can simply query the collection to find all other users that share the same currentRoomId

```js
Presences.find({ state: { online: true, currentRoomId: Session.get('currentRoomId') } })
```

Of course presence will call your function reactively, so everyone will know as soon as things change.

## Contributing

Please! The biggest thing right now is figuring how to write tests.

## License

MIT
