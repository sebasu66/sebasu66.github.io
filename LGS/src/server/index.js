import GameCanvas from './GameCanvas.js';

import express from 'express';
import { createServer } from 'http';
//import socket.io server
import { Server as SocketIO } from 'socket.io';
//import socket.io client
import { io as SocketIOClient, connect } from 'socket.io-client';

import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import Game from "./Game.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

let game = null;

const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || "http://144.126.249.254";
const GAME_NAME = process.env.GAME_NAME || "Root Game";
const THIS_SERVER_URL = process.env.THIS_SERVER_URL || "http://localhost:5000";

//sets the base path to find the files to serve
//to one level up from the /server folder
//__dirname is the absolute path to the current file
app.use(express.static(join(__dirname, '../../GAMES/')));


//Socket.io events, communication protocol
//each socket is a client, the server can have many sockets
//a socket can: broadcast, emit, join rooms, leave rooms, etc
//io.sockets.emit sends to all sockets
//socket.broadcast.emit sends to all sockets except the sender
//socket.emit sends to the socket that triggered the event

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    //if 1st player, create a new game
    //wait to receive player id

    socket.on('playerId', (pid) => {
        logMessageReceived('playerId', pid);

    if (game == null) {
        console.log("Game doesnt exist, create new game")
        game = new Game();
    } else {
        console.log("Game already exist")
    }
    if (!game.playerIsInGame(pid)) {
        game.addPlayer(pid);
        console.log("Player is not in game, adding him ")
    }

    //send the full game obj to the player only once
    socket.emit("getFullGame", game,{hasBinary:false});
    logMessageSent("getFullGame", game.name)



    //send the full game state to the new player
    let state = game.loadState();
    socket.emit('getFullState', state);
    logMessageSent('getFullState', JSON.stringify(state, null, 2));

    //send the new player's id to all other players
    socket.broadcast.emit('playerJoined', pid);
    logMessageSent('broadcasting new playerJoined to all players', pid);

    //add listeners for client events:

    //modify: player moved a card, etc, sends only the changes
    socket.on('modify', (data) => {
        onModify(data, socket);
    });

    socket.on('addObject', (data) => {
        onAddObject(data, socket);
    });

    socket.on('removeObject', (data) => {
        onRemoveObject(data, socket);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    });
});


function onModify(data, socket) {

    logMessageReceived('modify', data);
    //update the local game state as needed
    if (game.state[data.id]) {

        /*
        1. `game.state[data.id]`: This is accessing the `state` object of the `game` object using a dynamic key (`data.id`). The `state` object is presumably storing the state of different game entities, each identified by a unique ID.
        2. `{...game.state[data.id], ...data}`: This is creating a new object that merges the properties of `game.state[data.id]` and `data`. The spread operator (`...`) is used to include all properties from each object. If a property exists in both objects, the value from `data` will overwrite the value from `game.state[data.id]`.
        3. `game.state[data.id] = {...game.state[data.id], ...data}`: This is updating the state of the game entity identified by `data.id` with the new, merged object.*/
        game.state[data.id] = { ...game.state[data.id], ...data };

        //broadcast the new state to all other players
        socket.broadcast.emit('getFullState', game.state);
        logMessageSent('getFullState', JSON.stringify(game.state, null, 2));
    } else {
        console.log("onModify: game.state[data.id] not found, resending full state");
        socket.emit('getFullState', game.state);
        logMessageSent('getFullState', JSON.stringify(game.state, null, 2));
    }

}



/**
 * Socket event handler for when a new object 
 * is added to the canvas on the client side.    
 * @param {*} data  
 */
function onAddObject(data, socket) {
    //add the object to the game state
    //client message must include canvas layer
    //find the canvas layer
    //add the object to the canvas layer
    //send the new object to all connected clients
    if (game.state[data.canvas]) {
        game.state[data.canvas].state.push(data);
        io.sockets.emit('addObject', data);
        logMessageSent('addObject', data);
    }
    else {
        console.log("ERROR: onAddObject: game.state[data.canvas] not found, resending full state");
    }
}

function onRemoveObject(data, socket) {

    //find the object in the game state, in the canvas layer
    //remove the object from the canvas layer
    if (game.state[data.canvas]) {
        game.state[data.canvas].state = game.state[data.canvas].state.filter(function (el) {
            return el.id != data.id;
        });
        io.sockets.emit('removeObject', data);
        logMessageSent('removeObject', data);
    } else {
        console.log("ERROR: onRemoveObject: game.state[data.canvas] not found, resending full state");
    }

}

/**
 * Log a message received from a socket client
 * @param {*} message 
 * @param {*} data 
 */
function logMessageReceived(message, data) {
    console.log(message + " received: " + JSON.stringify(data));
}

/**
 * Log a message sent to a socket client
 * @param {*} message 
 * @param {*} data 
 */
function logMessageSent(message, data) {
    console.log(message + " sent: " + data);
}

function sendPlayerId(Socket) {
    Socket.emit('playerId', Socket.id);
    logMessageSent('playerId', Socket.id);
}

const start = "==============================================================================================" +
    "\r\n====== Local Game SERVER START  ====================================  LOCALHOST:5000 =========" +
    "\r\n=============================================================================================="

server.listen(5000, () => {
    console.log(start);
    connectToMainServer();
});


let socketCli = {}
let connectedToMainSRV = false;
//try to connect to the main server until it is up
function connectToMainServer() {
//connect to the main server as a client and call register 
//to register this server as a game server
    while (!connectedToMainSRV) {
        try {
            console.log(">> Trying to connect to main server at: " + MAIN_SERVER_URL + "...");
            socketCli = SocketIOClient(MAIN_SERVER_URL);
            connectedToMainSRV = true;
            socketCli.on('connect', () => {
                console.log(">> Connected to main server,asking to register as a game server");
                socketCli.emit('register', { type: "game", name: GAME_NAME, url: THIS_SERVER_URL });
                //keep the connection alive
                setInterval(() => {
                    socketCli.emit('keepAlive', { url: THIS_SERVER_URL });
                }, 1000);
                //disconnected from main server?
                socketCli.on('disconnect', () => {
                    console.log(">> Disconnected from main server, retrying in 30s");
                    setTimeout(() => {
                        connectedToMainSRV = false;
                    }, 30000);
                });
            });
        } catch (e) {
            console.log("ERROR: Cant connect to main server, retrying in 30s");
            setTimeout(() => {
            }, 30000);
        }
    }
}