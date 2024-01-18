GAME.canvas.on("mouse:wheel", function (opt) {
    var delta = opt.e.deltaY;
    var zoom = GAME.canvas.getZoom();
    console.log("zoom", zoom);
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.1) zoom = 0.1;
    GAME.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });