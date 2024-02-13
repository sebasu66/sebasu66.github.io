

export function addCard(options, propagate = true, callback = function (card) { }) {
  let gameObj;
  let card = new fabric.Image.fromURL(options.file, function (card) {
    card.set({
      left: options.left ? options.left : 100,
      top: options.top? options.top : 100,
      stroke: options.stroke? options.stroke : "rgb(222,210,200)",
      strokeWidth: options.strokeWidth ? options.strokeWidth : 10,
      shadow: options.shadow  ? options.shadow : "rgba(0,0,0,0.9) 10px 10px 10px",
      selectable: options.selectable  ? options.selectable : true,
      id: options.name ? options.name : "card" + GAME.objects.length ,
      sideUP: options.sideUP? options.sideUP : "front",
      //increase contrast and saturation
      filters: [new fabric.Image.filters.Contrast({contrast: 80}), 
        new fabric.Image.filters.Saturation({saturation: 100}),
        new fabric.Image.filters.Noise({noise: 15}),
        new fabric.Image.filters.Brightness({brightness: 0.5})],

      //width : options.width ? options.width : 60,
      //height: options.height ? options.height : 80,
      frontImage: options.file,
      backImage: options.backImagePath,//should have a default image to use
      flipeable: options.flipeable ? options.flipeable : true,
      //hide controls
      hasControls: false,
      //dragStart: dragObj(card),
      //dragEnd: dragObjEnd(card),
      //TODO: move to compsonent actions
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
        const json = {"CARDS":
        [{  
        left: this.left,
          top: this.top,
          type:"CARD",
          //stroke: this.stroke,
          //strokeWidth: this.strokeWidth,
          //shadow: this.shadow,
          //selectable: this.selectable,
          id: this.id,
          sideUP: this.sideUP,
          //frontImage: this.frontImage,
          //backImage: this.backImage,
          ///flipeable: this.flipeable,
        }
        ]
      };
        return json;
      }
    }

    );
    /*const filter = new fabric.Image.filters.Noise({
      noise: 15,
    });
    card.filters.push(filter);
    card.applyFilters();
*/
    //listen for clicks on the card, and flip it
    //let isDragging = false;
    //card.canBeDragged = () => {return true};
    
    GAME.canvas.add(card);
    GAME.localObjects.push(card);
    if (propagate) {
      //only when the card is added locally
      //send the new state to the server to be propagated
      //to the other players
      //syncWithServer();
    }
    callback(card)
  }
  );
}
