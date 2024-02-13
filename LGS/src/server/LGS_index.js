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
import { config } from 'dotenv';
import e from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//load the .env file into process.env
config({
    path: join(__dirname, '../../.env')
});


const app = express();
const server = createServer(app);
const io = new SocketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let game = null;

const MAIN_SERVER_URL = process.env.MASTER_SERVER_URL || "http://localhost:3000";
const MAIN_SERVER_PORT = process.env.MASTER_SERVER_PORT || "3000";
const MAIN_SERVER_HOST = process.env.MASTER_SERVER_HOST || "localhost";
const GAME_NAME = process.env.GAME_NAME || "Root Game";
const THIS_SERVER_URL = process.env.THIS_SERVER_URL || "http://loCalhost:5000";
const THIS_SERVER_PORT = process.env.THIS_SERVER_PORT || "5000";
const THIS_SERVER_HOST = process.env.THIS_SERVER_HOST || "localhost";
const THIS_SERVER_EXTERNAL_URL = process.env.THIS_SERVER_EXTERNAL_URL || "http://localhost:5000";

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

        //send the full game object list to the player only once
        socket.emit("getFullGame", game, { hasBinary: false });
        logMessageSent("getFullGame", game)



        //send the full game state to the new player
        let state = game.state
        socket.emit('serverUpdate', state);
        logMessageSent('serverUpdate', JSON.stringify(state, null, 2));

        
        //send the new player's id to all other players
        socket.broadcast.emit('playerJoined', pid);
        logMessageSent('broadcasting new playerJoined to all players', pid);

        //modify: player moved a card, etc, sends only the changes
        socket.on('clientUpdate', (data) => {
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

    logMessageReceived('clientUpdate', data);
    //update the local game state as needed, if cant find the object add it
    let state = game.state;

    //received state is a partial state, update the full state
    //format is:
    /*{"state":
    {"CARDS":
    [{"left":206.99798677020416,
    "top":272.9334871203383,
    "type":"CARD",
    "id":"CARD_MAIN_f17.png",
    "sideUP":"front"}]}}*/

    //if current state is empty, set it to the received state
    if (Object.keys(state).length === 0) {
        state = data.state;
        game.state = state;
    } else {
        //update the current state with the received state
        for (let key in data.state) {
            let comp = data.state[key];//CARDS/DICE/...
            //loop through the elements and update the properties
            if (state[key]){
                let elementList = state[key];
                //find the element in the current state with the same id
                let found=false;
                for (let i = 0; i < elementList.length; i++) {
                    if (elementList[i].id == comp[0].id) {
                        found=true;
                        //update the element
                        elementList[i] = comp[0];
                        game.state[key] = elementList;
                    }
                }
                //if the element is not found, add it
                if (!found){
                    elementList.push(comp[0]);
                    game.state[key] = elementList;
                }
            }
        }
    }




    //game.saveState(state);
    //broadcast the new state to all other players
    socket.broadcast.emit('serverUpdate', state);
    logMessageSent('serverUpdate', JSON.stringify(state, null, 2));

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
    "\r\n====== Local Game SERVER START  ====================================  [replace] =========" +
    "\r\n=============================================================================================="

server.listen(THIS_SERVER_PORT, THIS_SERVER_HOST, () => {
    console.log(start.replace("[replace]", "" + THIS_SERVER_URL));
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
                console.log(">> Connected to main server,asking to register as a game server on " + THIS_SERVER_EXTERNAL_URL + "...) ");
                socketCli.emit('register', { type: "game", name: GAME_NAME, url: THIS_SERVER_EXTERNAL_URL });
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