const http = require('http');
const {Server} = require('socket.io');
const {config} = require('dotenv');
const {createApp} = require('./src/server/app');
const {initDatabase} = require('./src/server/db');
const start = async () => {
    config();
    const options = { inMemory : process.env.SQL_LITE_IN_MEMORY};
    const db = await initDatabase({options});
    createApp({db}).then(app => {
        let server = http.createServer(app);
        return server;
    }).then(server => {
        let io = new Server(server);
        io.on("connection", async (socket) => {
            console.log(`new socket #${socket.id} connected successfully `);
            const user = {
                username : socket.handshake.query.username,
                socketId : socket.id
            }
            console.log(user);
            db.run(`insert into users(username,socketid) values(?,?);`, [user.username,user.socketId]);
            socket.broadcast.emit('sockets:connected', JSON.stringify({ 'socketId' : socket.id}));
            let sockets = await io.sockets.fetchSockets();
            sockets = sockets.map(s => s.id);
            socket.emit('connected:sockets', JSON.stringify({sockets}));
            socket.on('message', (data) => {
                console.log(`#${socket.id} says : ${data}`);
                const sqlStmt = `select username from users where socketid = ? ;`;
                db.get(sqlStmt, [socket.id], (err, row) => {
                    if(err) {
                        console.log(err);
                    }else {
                        socket.broadcast.emit('chat-message', JSON.stringify({ username : row.username , socketId : socket.id , message : data }));
                   }
                });
            });
            socket.on('is:typing', () => {
                const sqlStmt = `select username from users where socketid = ? ;`;
                db.get(sqlStmt, [socket.id], (err, row) => {
                    if(err) {
                        console.log(err);
                    }else {
                        socket.broadcast.emit('typing', JSON.stringify({'socketId' : socket.id , username : row.username }));
                    }
                });
            });
            socket.on('end:typing', () => {
                const sqlStmt = `select username from users where socketid = ? ;`;
                db.get(sqlStmt, [socket.id], (err, row) => {
                    if(err) {
                        console.log(err);
                    }else { 
                        socket.broadcast.emit('typing:ended', JSON.stringify({ 'username' : row.username, 'socketId' : socket.id}));
                    }
                });
            });
            socket.on('disconnect', () => {
                const delStmt = `delete from users where socketid = ? returning *;`
                db.get(delStmt, [socket.id], (err, row) => {
                    if(err) {
                        throw new Error(err.message);
                    }
                    console.log(`socket #${socket.id} disconnected`);
                    console.log(`${row.username} deleted from database`);
                    socket.emit('user:leave', { 'socketid' : row.socketid , 'username' : row.username });
                });
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