const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const clients = [];

// Live Server Extension Port:
// app.use(cors({origin: "http://localhost:5500", credentials: true}));
app.use(cors({origin: "http://127.0.0.1:5500", credentials: true}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/sse", (req, res) => {
    res.writeHead(200, {
        "Content-type": "text/event-stream",
        "Cache-control": "no-cache",
        "Connection": "keep-alive"
    });

    const host = req.headers.host;
    const client = { host, res };
    clients.push(client);
    console.log("Connecting Client:", host);
    console.log("Clients:", clients.map(client => client?.host));

    res.write('data: Initialized Connection:\n\n');

    req.on("close", () => {
        if(clients.findIndex(client => client.host === host) < 0) { return; }
        clients.splice(clients.findIndex(client => client.host === host), 1);
        console.log(`Disconnecting Client: ${host}`);
        console.log("Clients:", clients.map(client => client?.host));
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
    const number = req.body?.number;
    clients.forEach(async (client) => {
        for(let numEvents = 1; numEvents <= number; numEvents++) {
            client.res.write(`event: eventNumber\ndata: ${numEvents}\n\n`);
            console.log("Writing to client:", `\nevent: eventNumber\ndata: ${numEvents}`);
            await delay(1000, numEvents);
        }
    });
    res.json({"message": `${number} Events Sent.`});
});

app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
});