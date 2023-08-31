const {pingRouter} = require('./lib/ping');

const setupApi = ({app}) => {
    app.use('/api', pingRouter);
}
module.exports = Object.assign({}, {setupApi});