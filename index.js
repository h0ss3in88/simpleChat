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
        io.on("connection", (socket) => {
            console.log(`new socket #${socket.id} connected successfully `);
            socket.on('message', (data) => {
                console.log(`#${socket.id} says : ${data}`);
            });
            socket.on('disconnect', () => {
                console.log(`socket #${socket.id} disconnected`);
            });
        });
        server.listen(process.env.PORT || 6666, () => {
            console.log(`Simple Chat is ready and running at : ${server.address().address} : ${server.address().port}`);
        });
    }).catch(err => {
        console.log(err);
    });
}

start();