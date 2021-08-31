const express = require('express');
const http = require('http');
const path = require('path');
let app = express();
app.set('PORT', 3300);
app.get('/', (req,res) => {
    return res.status(200).sendFile(path.resolve(__dirname,'../','client','index.html'));
});

let server = http.createServer(app);
server.listen(app.get('PORT'), () => {
    console.log(`application running at ${server.address().address}:${server.address().port}`);
});