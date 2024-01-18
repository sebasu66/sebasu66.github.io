import { socket, objects, syncWithServer } from './serverComunication.js';
import { addLog } from "./ui.js";






function addCard(options, propagate = true, callback = function (card) { }) {
  let card = new fabric.Image.fromURL(options.frontImage, function (card) {
    card.set({
      left: options.left,
      top: options.top,
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      shadow: options.shadow,
      selectable: options.selectable,
      id: options.id,
      sideUP: options.sideUP,
      frontImage: options.frontImage,
      backImage: options.backImage,
      flipeable: options.flipeable,
      dragStart: dragObj(card),
      dragEnd: dragObjEnd(card),
      flip: function () {
        //swith the image to cardGenBkg
        card.sideUP = card.sideUP == "back" ? "front" : "back";
        //animate the flip
        card.animate(
          { scaleX: 0, left: "+=100" },
          {
            duration: 250,
            onChange: GAME.canvas.renderAll.bind(GAME.canvas),
            onComplete: function () {
              card.setSrc(
                card.sideUP == "front"
                  ? card.frontImage
                  : card.backImage,
                function (card) { }
              );
              card.animate(
                { scaleX: 1, left: "-=100" },
                {
                  duration: 250,
                  onChange: GAME.canvas.renderAll.bind(GAME.canvas),
                  onComplete: function () { },
                }
              );
            },
            easing: fabric.util.ease.easeInOutQuad,
          }
        );
      },
      toJson: function () {
        const options = {
          left: this.left,
          top: this.top,
          stroke: this.stroke,
          strokeWidth: this.strokeWidth,
          shadow: this.shadow,
          selectable: this.selectable,
          id: this.id,
          sideUP: this.sideUP,
          frontImage: this.frontImage,
          backImage: this.backImage,
          flipeable: this.flipeable,
        };
        return options;
      }
    }

    );
    const filter = new fabric.Image.filters.Noise({
      noise: 15,
    });
    card.filters.push(filter);
    card.applyFilters();

    //listen for clicks on the card, and flip it
    //let isDragging = false;
    //card.canBeDragged = () => {return true};
    
    //GAME.canvas.add(card);
    objects.push(card);
    if (propagate) {
      //only when the card is added locally
      //send the new state to the server to be propagated
      //to the other players
      syncWithServer();
    }
    callback(card)
  }

  );
}




//card deck
//visually it is srepresented by a picture of a card inside a frame
///the frame has a banner with the deck name and a number of cards
//the deck is a group of the image, label and number
//functionally the deck contyains an arary of cards jsons
//and a function to draw a card from the deck
//when a card is drawn, it is created locally based on a json popped from the deck

const createDeck = (options) => {

  //image
  let image = new fabric.Image.fromURL(options.image, function (image) {
    image.set({
      left: options.left,
      //height: 300,
      top: options.top,
      selectable: false,
    });
    // //label
    let label = new fabric.IText(options.label, {
      left: options.left + options.labelLeft,
      top: options.top + options.labelTop,
      fontSize: options.labelFontSize ? options.labelFontSize : 20,
      fill: options.labelFontColor ? options.labelFontColor : "black",
      selectable: false,
    });
    //number
    let number = new fabric.IText(options.number, {
      left: options.left + options.numberLeft,
      top: options.top + options.numberTop,
      fontSize: options.numberFontSize ? options.numberFontSize : 20,
      fill: options.numberFontColor ? options.numberFontColor : "black",
      selectable: false,

    });

    const animMenuOptions = {
      left: options.left + 150,
      top: options.top + 180,
      image: "./components/animMenu/ribbon.png",
      text: "Draw",
      action: function () {
        cardDeck.draw();
      },
    };
    

    //animated button to draw a card
  GAME.createAnimMenuItem(animMenuOptions, function (animMenu) {


      //group
      let group = new fabric.Group([image, label, number], {
        left: options.left,
        top: options.top,
        selectable: false,
        //on hover show the draw button
        hoverCursor: "pointer",
        //allow content to extend outside the group
        clipTo: null,
        //set the anchor point to the top left corner
        originX: "left",
        originY: "top",
        //increase the size of the group to allow the content to extend outside
        //but don't change the position




      });
      //when the group is hovered, show the draw button
      group.on("mouseover", function (options) {
        console.log("hover on deck");
        animMenu.extend();
      });
      group.on("mouseout", function (options) {
        console.log("hover out deck");
        
        animMenu.contract();
      });
      //GAME.canvas.add(animMenu);
      GAME.canvas.add(group);
    });
  });

}



/*
let cardGenBkg = new fabric.Image.fromURL("/resources/b.png", function (
  cardGenBkg
) {
  cardGenBkg.set({
    left: 80,
    top: 80,
    width: 200,
    height: 350,
    selectable: false,
    visible: false,
  });
  GAME.canvas.add(cardGenBkg);
});
*/





export { addCard };
