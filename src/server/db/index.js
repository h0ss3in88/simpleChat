const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const initDatabase = ({options}) => {
    return new Promise((resolve, reject) => {
        try {
            const createUsersTableSql = 'create table if not exists users(id integer PRIMARY KEY AUTOINCREMENT, username VARCHAR(100) NOT NULL, socketid VARCHAR(60) NOT NULL, joinat TIMESTAMP DEFAULT CURRENT_TIMESTAMP);';
            const createMessageTableSql = 'create table if not exists messages(id integer PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, userid INTEGER NOT NULL REFERENCES users(id), status VARCHAR(100), publishedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP);';
            if(options.inMemory) {
                const db = new sqlite.Database(':memory:');
                db.serialize(() => {
                    db.run(createUsersTableSql);
                    db.run(createMessageTableSql);
                    return resolve(db);
                });
            }else {
                if(fs.existsSync(options.filePath)) {
                    return new sqlite.Database(options.filePath);
                }
                const db = new sqlite.Database(options.filePath,(error) => {
                    if(error) {
                        return reject(new Error(error.message));
                    }
                    console.log("Connection with SQLite has been established");
                    return resolve(db);
                });
            }
        }catch(error) {
            return reject(error);
        }
    });
};
module.exports = Object.assign({}, {initDatabase});