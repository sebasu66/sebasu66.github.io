
//import card from './card.js';
import { addCard } from './card.js';

export function processGameComponents(game) {
    GAME.methodRunning = true;
    // Check if the game has components and a CARD component
    if (game.components && game.components.components && game.components.components.CARD) {
        // Get the properties of the CARD component
        let cardProperties = game.components.components.CARD.properties;
        let files = game.components.components.CARD.files;

        // Store the properties in an array
        //compose the card name basaed on the pattetrn of the file names
        let pattern = "default_CARD"
        let card_name = cardProperties.name_suffix || pattern;
        let pathSufix = GAME.gameServerUrl + cardProperties.filepath_suffix || "";
        let backImage = GAME.gameServerUrl + cardProperties.filepath_suffix + cardProperties.backImage || "defaultBack.png";
        let cardsArray = Object.keys(files).map(key => {
            return { file: pathSufix + files[key], name: card_name + "_" + files[key], backImagePath: backImage, ...cardProperties };
        });

        //cards object
        let cards = { "component": "CARDS", "list": [] }
        //store the properties of each card
        let position = { left: 100, top: 100 };
        for (let i = 0; i < cardsArray.length; i++) {
            let currentCard = cardsArray[i];
            currentCard.left = position.left;
            currentCard.top = position.top;
            cards.list.push(cardsArray[i]);
            position.left += 10;
        }

        //GAME.localObjects.push(cards);
        //add the cards to the canvas
        for (let i = 0; i < cardsArray.length; i++) {

            addCard(cardsArray[i]);
            GAME.canvas.renderAll();
        }

        console.log("processGameComponents() cards:", JSON.stringify(cards, null, 2));
        //wait for the cards to be added to the canvas
        setTimeout(() => { GAME.methodRunning = false; }, 10*cardsArray.length);

    }
}

export function updateGameComponents(status) {
    console.log("updateGameComponents() status:", JSON.stringify(status, null, 2));
    GAME.localState = status;

    //game status format is:
    /*{
      "state": {
        "CARDS": [{  
          "left": 441,
          "top": 590,
          "type": "CARD",
          "id": "CARD_MAIN_f9.png",
          "sideUP": "front"
        }]
      },
*/
    //update the canvas elements with status.canvases[0].state
    GAME.methodRunning = true;
    GAME.ignoreNextObjectModifiedEvent = true;
    for (let key in status) {
        let element = status[key];//CARDS/DICE/...
        //loop through the elements and update the canvas
        for (let i = 0; i < element.length; i++) {
            let canvasElement = GAME.canvas.getObjects().find(obj => obj.id === element[i].id);
            if (canvasElement) {
                //update the element position by a tween
                canvasElement.animate("left", element[i].left, {
                    duration: 500,
                    onChange: GAME.canvas.renderAll.bind(GAME.canvas),
                    onComplete: function () { }
                });
                canvasElement.animate("top", element[i].top, {
                    duration: 500,
                    onChange: GAME.canvas.renderAll.bind(GAME.canvas),
                    onComplete: function () {
                        canvasElement.bringToFront();
                        GAME.methodRunning = false;
                        GAME.canvas.renderAll();
                        GAME.ignoreNextObjectModifiedEvent = false;
                    }
                });

            }
        }
    }

}

