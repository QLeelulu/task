var url = require('url'),
    db = require('./db'),
    mongo = require('mongodb'),
    SkinServer = db.SkinServer,
    SkinDb = db.SkinDb,
    Db = mongo.Db,
    Server = mongo.Server,
    ServerCluster = mongo.ServerCluster,
    ServerPair = mongo.ServerPair,
    BSONNative = mongo.BSONNative,
    DEFAULT_PORT = 27017;

var parseUrl = function(serverUrl) {
  var serverUrl = /\w+:\/\//.test(serverUrl) ? serverUrl : 'db://' + serverUrl,
      uri = url.parse(serverUrl, true),
      config = {},
      serverOptions = uri.query,
      reconnect = serverOptions['auto_reconnect'];

  config.host = uri.hostname;
  config.port = uri.port || DEFAULT_PORT;
  config.database = uri.pathname.replace(/\//g, '');
  config.options = {};
  config.options['auto_reconnect'] = reconnect !== undefined &&
    reconnect != 'false' && reconnect != 'no' && reconnect != 'off';
  if (uri && uri.auth) {
    var auth = uri.auth.split(':');
    config.username = auth[0];
    config.password = auth[1];
  }
  return config;
};

var parseServer = function(serverUrl) {
  var config = parseUrl(serverUrl);
  return new Server(config.host, config.port, config.options);
};

function MongoSkin() {
  this._preBindArgs = [];
}

MongoSkin.prototype.bind = function() {
  var args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
  return this._preBindArgs.push(args);
};

MongoSkin.prototype.pair = function(left, right) {
  return new SkinServer(new ServerPair(parseServer(left), parseServer(right)));
};

MongoSkin.prototype.cluster = function() {
  var servers = [];
  for (i = 0, len = arguments.length; i < len; i++) {
    servers.push(parseServer(arguments[i]));
  }
  return new SkinServer(new ServerCluster(servers));
};

MongoSkin.prototype.db = function(serverUrl) {
  var config = parseUrl(serverUrl);
  if (!config.database) {
    throw new Error('Please provide a database to connect to.');
  }
  var server = new Server(config.host, config.port, config.options);
  var db = new Db(config.database, server, {
    native_parser: BSONNative !== undefined
  });
  skindb = new SkinDb(db, config.username, config.password);
  for (i = 0, len = this._preBindArgs.length; i < len; i++) {
    skindb.bind.apply(skindb, this._preBindArgs[i]);
  }
  return skindb;
};

mongoskin = new MongoSkin();

['db', 'collection', 'cursor', 'admin'].forEach(function(path) {
  var foo, module, name;
  module = require('./' + path);
  for (name in module) {
    foo = module[name];
    mongoskin[name] = foo;
  }
});

module.exports = mongoskin;
