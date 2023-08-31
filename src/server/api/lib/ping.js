const {Router} = require('express');
const httpStatus = require('http-status');

const pingRouter = Router();

pingRouter.get('/ping', (req,res,next) => {
    return res.status(httpStatus.OK).json({ "ping" : "pong" });
});

module.exports = Object.assign({}, {pingRouter});