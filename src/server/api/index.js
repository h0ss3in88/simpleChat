const {pingRouter} = require('./lib/ping');
const {accountsRouter} = require('./lib/accounts');

const setupApi = ({app}) => {
    app.use('/api', pingRouter);
    app.use('/api', accountsRouter);
}
module.exports = Object.assign({}, {setupApi});