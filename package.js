Package.describe({
  summary: "A package to help track users' presence"
});

Package.on_use(function (api) {
  api.add_files('lib/common.js', ['client', 'server']);
  api.add_files('lib/client.js', 'client');
  api.add_files('lib/server.js', 'server');

  if (typeof api.export !== 'undefined') {
    api.export('Presences', ['client', 'server']);
    api.export('Presence', ['client', 'server']);
  }
});
