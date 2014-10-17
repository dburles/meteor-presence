Package.describe({
  name: "tmeasday:presence",
  summary: "A package to help track users' presence",
  version: "1.0.0",
  git: "https://github.com/dburles/meteor-presence.git"
});

Package.onUse(function (api) {
  api.add_files('lib/common.js', ['client', 'server']);
  api.add_files('lib/client.js', 'client');
  api.add_files('lib/server.js', 'server');

  api.export('Presences', ['client', 'server']);
  api.export('Presence', ['client', 'server']);
});
