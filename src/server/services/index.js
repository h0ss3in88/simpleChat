const {Authentication} = require('./lib/auth');
const {generateRSAKeys} = require('./lib/generateKeys');
module.exports = Object.assign({}, {Authentication, generateRSAKeys});