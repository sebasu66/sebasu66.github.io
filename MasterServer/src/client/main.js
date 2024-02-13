//import  {addCard } from './card.js';
import { drawUI, addLog, createButton, initUI } from './ui.js';
import { socketClient } from './serverComunication.js';
import { processGameComponents, updateGameComponents } from './client_game.js';
import { eventNames } from './internalCommEvent.js';

initUI();
//listen and print all events
document.addEventListener("*", function (e) {
  console.log("event: " + e.type + " data: " + JSON.stringify(e.detail));
});
socketClient.connectToMainServer();

//listen to the "pending_redraw" event
document.addEventListener("pending_redraw", (e) => {
  console.log("pending_redraw");
  draw();
});

//message received from the server listener
document.addEventListener("message_received", (e) => {
  addLog(e.detail);
}
);

//received full game event listener linked to client_game.processGameComponents
document.addEventListener(eventNames.received_full_game, (e) => {
  console.log(eventNames.received_full_game + JSON.stringify(e.detail));
  //draw the game components
  addToMethodCallQueue(() => {
    processGameComponents(e.detail);
  });
});

document.addEventListener(eventNames.serverUpdate, (e) => {
  console.log(eventNames.serverUpdate + JSON.stringify(e.detail));
  //this is a partial update
  addToMethodCallQueue(() => {
    updateGameComponents(e.detail);
  });
});


//method call queue to avoid loosing method calls when receiving too many events

let methodCallQueue = [];
function runMethodCallQueue() {
  if(GAME.methodRunning ){
    console.log("method running, waiting...");
    setTimeout(runMethodCallQueue, 100);
    return;
  }
  if (methodCallQueue.length > 0) {
    methodCallQueue.shift()();
    if (methodCallQueue.length > 0) {
      setTimeout(runMethodCallQueue, 100);
    }
  } 
}

//add a method to the queue
function addToMethodCallQueue(method) {
  methodCallQueue.push(method);
  runMethodCallQueue();
  }



//RESIZE CANVAS if window is resized
window.addEventListener('resize', function () {
  GAME.canvas.setWidth(window.innerWidth);
  GAME.canvas.setHeight(window.innerHeight);
  GAME.canvas.renderAll();
});

drawUI(socketClient.playerId);

function draw() {
  GAME.canvas.renderAll();
}
//game table


fabric.Image.fromURL('/resources/seamless/carbon.png', (img) => {
  // Extract texture pattern data
  const patternData = GAME.canvas.getContext('2d').createPattern(img.getElement(), 'repeat');

  // Create large rectangle object
  const rect = new fabric.Rect({
    width: 200000 / img.width,
    height: 200000 / img.height,
    fill: patternData,
    selectable: false,
    hasBorders: false,
    hasControls: false,
    lockMovementX: true,
    lockMovementY: true,
    //blur filter
    filters: [new fabric.Image.filters.Blur({ blur: 0.5 })],
    //apply filters
    applyFilters: function () {
      this.filters.forEach(function (filter) {
        filter.applyTo(this);
      }, this);
    }

  });

  // Add the rectangle to your canvas
  GAME.canvas.add(rect);
  draw();
});

GAME.canvas.on("object:moving", function (options) { });

GAME.canvas.on("object:modified", function (options) {
  addLog(
    "dragged " +
    options.target.id +
    " to " +
    options.target.left +
    "," +
    options.target.top,
    GAME.canvas
  );
  if (!GAME.ignoreNextObjectModifiedEvent) {
    //obtain the object that has been moved from the GAME.localObjects array
    const obj = GAME.localObjects.find((o) => o.id === options.target.id);
    const state = obj.toJson();
    socketClient.gameServerSocket.emit(eventNames.clientUpdate, {
      state
    }); // Send the new position to the server
  }
});


