const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const clients = [];

// Live Server Extension Port:
// app.use(cors({origin: "http://localhost:5500", credentials: true}));
app.use(cors({origin: "http://127.0.0.1:5500", credentials: true}));
// app.use(cors({origin: "https://8d39-163-123-41-74.ngrok-free.app", credentials: true}));

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
            const random = parseFloat((Math.random() * 0.5 + 0.5).toFixed(1));
            await delay(random * 1000, numEvents);
        }
    });
    res.json({"message": `${number} Events Sent.`});
});

app.post("/message", async (req, res) => {
    const message = req.body?.message;
    const wordSegmentor = new Intl.Segmenter([], {granularity: "word"});
    let words = Array.from(wordSegmentor.segment(message));
    let lastWord = "";
    for(let i = 0; i < words.length; i++) {
        let segment = words[i];
        if(segment.isWordLike) {
            lastWord = segment.segment;
        } else if(!segment.isWordLike && segment.segment.trim().length) {
            words.splice(i - 1, 1);
            segment.segment = (lastWord + segment.segment).trim();
            lastWord = "";
        }
    }
    words = words.map(word => word.segment);
    clients.forEach(async (client) => {
        for(let i = 0; i < words.length; i++) {
            client.res.write(`event: eventWord\ndata: ${words[i]}\n\n`);
            // console.log("Writing to client:", `\nevent: eventWord\ndata: ${words[i]}`);
            // const ms = parseFloat((Math.random() * 0.5).toFixed(1));
            ms = words[i].length * 75;
            await delay(ms, words[i]);
        }
    });
    res.json({"message": `Events Sent.`});
});

app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
});