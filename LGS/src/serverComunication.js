import { addCard } from "./card.js";

class SocketClient {
    constructor(_url = "http://localhost:3000") {
        this.url = _url;
        this.socket = null;  // Instantiate the socket to null, it should not be declared until connect
        this.connected = false;
        this.playerId = null;
    }

    //update local view
    askForRedraw(_detail) {
        let event = new CustomEvent("pending_redraw", { detail: _detail });
        document.dispatchEvent(event);
    }
    //emit a local event with the message received for the ui layer to display
    broadcastMessage(_message, _data) {
        let event = new CustomEvent("message_received", { detail: _message + " received: " + JSON.stringify(_data) });
        document.dispatchEvent(event);
    }

    connect() {
        this.socket = io(this.url);
        this.socket.on('connect', () => {
            this.connected = true;
            console.log("connected");
            this.broadcastMessage("connected", this.url);
        });
        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log("disconnected");
            this.broadcastMessage("disconnected", this.url);
        });
        this.socket.on('getFullState', (s) => {
            updateState(s);
            this.askForRedraw("objects");

        });

        this.socket.on('playerId', (playerId) => {
            this.playerId = playerId;
            console.log("playerId received: " + this.playerId);
            this.broadcastMessage("playerId", this.playerId);
        });
    }

    sendMessage(_message, _data) {
        //allowed messages: create, modify, remove
        if (this.connected) {
            if (_message == "create" || _message == "modify" || _message == "remove" || _message == "postFullState") {
                this.socket.emit(_message, _data);
            } else {
                console.log("ERROR: sendMessage: message not allowed: ", _message);
            }
        } else {
            console.log("ERROR: sendMessage: not connected");
        }
    }
}


//generate state object by getting each object's json
//and store it in the state object
function generateLocalState() {
    for (let i = 0; i < GAME.localObjects.length; i++) {
        GAME.localState[GAME.localObjects[i].id] = GAME.localObjects[i].toJson();
    }
}

//create the local objects from the state object received from the server
function createLocalObjects(gameJson) {
    //get game.components
    //for each json obj component check the key is either: CARD, DECK, DICE, BOARD, TABLE,MONEY
    //create the object and add it to the localObjects array
    gameJson.components.forEach(function (component) {
        if (component.type == "CARD") {

            addCard(component, false);
        }
    }
    )
}




//update the state object received from the server
function updateState(_s) {


    console.log("updateState: " + JSON.stringify(_s))

    /*this method will receibe a json with structure:
    
    {"canvases":[
        {"name":"mainBoard","width":5000,"height":5000,"state":
        {"cards":[
            {"id":"card1",
            "sideUp":"front",
            "frontImage":"/resources/games/Root_ES/cards/f1.png",
            "left":80,"top":80}]}},
        {"name":"player1","width":5000,"height":5000,"state":
        {"cards":[
            {"id":"card2",
            "sideUp":"front",
            "frontImage":"/resources/games/Root_ES/cards/f2.png",
            "left":80,"top":80}]}}]

    */

    //1.find the canvas layer

    GAME.canvases.forEach(function (canvas) {
        if (canvas.name == _s.canvas) {
            //2. update the canvas state
            canvas.state = _s;
        }
    });

    for (let id in _s) {
        let found = false;
        for (let i = 0; i < GAME.localObjects.length; i++) {
            if (GAME.localObjects[i].id == id) {
                found = true;
                GAME.localObjects[i].updateFromJson(_s[id]);
            }
        }
        if (!found) {
            //add the object
            addCard(_s[id], false);
        }
    }


}


//post the state object to the server
const syncWithServer = () => {
    if (socket && socket.connected) {
        generateLocalState();
        socket.sendMessage("postFullState", state);
    }
}


//global variable to store the socket client
let socket = new SocketClient("http://localhost:3000", GAME.localObjects);

export { socket, SocketClient, syncWithServer };
