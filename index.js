const http = require('http');
const {Server} = require('socket.io');
const {config} = require('dotenv');
const {createApp} = require('./src/server/app');
const start = () => {
    config();
    createApp().then(app => {
        let server = http.createServer(app);
        return server;
    }).then(server => {
        let io = new Server(server);
        server.listen(process.env.PORT || 6666, () => {
            console.log(`Simple Chat is ready and running at : ${server.address().address} : ${server.address().port}`);
        });
    }).catch(err => {
        console.log(err);
    });
}

start();