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

    clients.push(res);

    res.write('data: Initialized Connection:\n\n');

    // clients.forEach(async (client) => {
    //     for(let numEvents = 1; numEvents <= 10; numEvents++) {
    //         client.write(`data: ${numEvents}`);
    //         await delay(1000, numEvents);
    //     }
    // });

    req.on("close", () => {
        if(clients.indexOf(res) < 0) { return; }
        clients.splice(clients.indexOf(res), 1);
    });

    // res.json({"message": `Events Sent.`});
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
    // if(!number) { res.sendStatus(400); }
    clients.forEach(async (client) => {
        console.log("CLIENT", number);
        for(let numEvents = 1; numEvents <= number; numEvents++) {
            client.write(`data: ${numEvents}\n\n`);
            console.log("Writing to client:", `data: ${numEvents}`);
            await delay(1000, numEvents);
        }
    });
    res.json({"message": `${number} Events Sent.`});
});

app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
});