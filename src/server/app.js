const express = require('express');
const http = require('http');
let app = express();
app.set('PORT', 3300);
app.get('/', (req,res) => {
    return res.status(200).json({ 'hello': 'world'});
});

let server = http.createServer(app);
server.listen(app.get('PORT'), () => {
    console.log(`application running at ${server.address().address}:${server.address().port}`);
});