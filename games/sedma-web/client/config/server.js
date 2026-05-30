const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const {
    PORT
} = require("./src/config/constants");

const {
    registerSocketHandlers
} = require("./src/sockets/socketHandlers");

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(
    httpServer,
    {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }
);

registerSocketHandlers(io);

app.get(
    "/api/games",
    (req, res) => {
        res.json({
            ok: true,
            status: "running"
        });
    }
);

app.get(
    "/api/health",
    (req, res) => {
        res.json({
            ok: true,
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    }
);

httpServer.listen(
    PORT,
    () => {
        console.log(
            `Sedma server běží na portu ${PORT}`
        );
    }
);