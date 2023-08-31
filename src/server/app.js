const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const responseTime = require('response-time');
const httpStatus = require('http-status');

const createApp = () => {
    return new Promise((resolve, reject) => {
try {
            let app = express();
            app.use(compression());
            app.use(logger('dev'));
            app.use(responseTime());
            app.get('/', (req,res,next) => {
                return res.status(httpStatus.OK).json({'PING' : 'PONG'});
            });
            app.use((req,res,next) => {
                let error = new Error('Not Found');
                error.status = httpStatus.NOT_FOUND;
                return next(error);
            });
            app.use((err,req,res,next) => {
                if(err.status === 404) {
                    return res.status(httpStatus.NOT_FOUND).json({ 'message' : 'not found'});
                }else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 'error' : err.message });
                }
            });
            return resolve(app);
} catch (error) {
    return reject(error);
}
    });
}
module.exports = Object.assign({}, {createApp});
