const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const clients = [];

app.get("/sse", (req, res) => {
    res.writeHead(200, {
        "Content-type": "text/event-stream",
        "Cache-control": "no-cache",
        "Connection": "keep-alive"
    });

    clients.push(res);

    res.write('data: Initialized Connection:\n');

    

});