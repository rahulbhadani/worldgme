'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
// config.server.port = 8080;
// config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_my_app';

config.authentication.enable = true;
config.authentication.jwt.privateKey = __dirname + '/../../token_keys/private_key';
config.authentication.jwt.publicKey = __dirname + '/../../token_keys/public_key';
config.authentication.allowGuests = true;
config.authentication.guestAccount = 'guest';
config.authentication.allowUserRegistration = true;
config.authentication.logInUrl = '/profile/login';
config.authentication.logOutUrl = '/profile/login';

validateConfig(config);
module.exports = config;
