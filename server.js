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

    req.on("close", () => {
        if(clients.indexOf(res) < 0) { return; }
        clients.splice(clients.indexOf(res), 1);
    });
});

function delay(ms, value) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}

app.post("/events", async (req, res) => {
    const { number } = req.body;
    if(!number) { res.sendStatus(400); }
    clients.forEach(async (client) => {
        for(let numEvents = 1; numEvents <= number; numEvents++) {
            client.write(`data: ${numEvents}`);
            await delay(2000, numEvents);
        }
    });
    res.json({"message": `${number} Events Sent.`});
});

app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
});