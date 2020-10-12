const crypto = require('crypto');
console.log('SESSION_SECRET= ' + crypto.randomBytes(62).toString('hex'));
console.log('ACCESS_TOKEN_SECRET= ' + crypto.randomBytes(62).toString('hex'));
console.log('REFRESH_TOKEN_SECRET= ' + crypto.randomBytes(62).toString('hex'));
