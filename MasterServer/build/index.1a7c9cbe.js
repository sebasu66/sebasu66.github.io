let e,t;const n=(e,t)=>{new fabric.Image.fromURL(e.frontImage,n=>{n.set({originX:"center",originY:"center",opacity:"front"==e.sideUp?1:0}),console.log("frontImage: ",n),a(n,e,t)})},a=(e,t,n)=>{new fabric.Image.fromURL(t.backImage,a=>{a.set({originX:"center",originY:"center",opacity:"back"==t.sideUp?1:0}),console.log("backImage: ",a),o(e,a,t,n)})},o=(e,t,n,a)=>{let o=new fabric.Group([e,t],{left:n.left,top:n.top,stroke:"rgb(0,0,10)",strokeWidth:2,selectable:n.selectable,id:n.id,sideUp:n.sideUp,isFlipeable:n.flipeable,isDraggable:!n.draggable||n.draggable,isLocked:!!n.locked&&n.locked,isDragging:!1,shadow:{color:"rgba(0,0,0,1)",blur:1,offsetX:10,offsetY:10},borderOpacityWhenMoving:.5,hasControls:!1});console.log("group: ",o),o.activate=function(){this.active=!0,this.onActivate&&this.onActivate()},o.deactivate=function(){this.active=!1,this.onDeactivate&&this.onDeactivate()},o.canBeDragged=function(){return this.isDraggable&&!this.isLocked},o.dragStart=function(){if(!this.canBeDragged()||this.isDragging)return;console.log("dragStart"),this.shadow.blur;let e=this.shadow.offsetX,t=this.shadow.offsetY;this.animate({scaleX:1.1,scaleY:1.1,shadow:{offsetX:e+25,offsetY:t+25}},{duration:200,onChange:()=>{GAME.canvas.renderAll()},onComplete:function(){},easing:fabric.util.ease.easeInOutQuad}),this.isDragging=!0},o.dragEnd=function(){this.isDragging=!1,this.shadow.blur;let e=this.shadow.offsetX,t=this.shadow.offsetY;this.animate({scaleX:1,scaleY:1,shadow:{blur:.1,offsetX:e-5,offsetY:t-5}},{duration:100,onChange:()=>{GAME.canvas.renderAll()},onComplete:function(){GAME.syncWithServer()},easing:fabric.util.ease.easeInOutQuad})},o.toJson=function(){return{left:this.left,top:this.top,selectable:this.selectable,id:this.id,sideUP:this.sideUP,frontImage:this.frontImage,backImage:this.backImage,flipeable:this.isFlipeable,draggable:this.isDraggable,locked:this.isLocked,canvas:GAME.canvas.name}},o.updateFromJson=function(e){e.sideUP!=this.sideUP&&this.flip(),this.animate({left:e.left,top:e.top},{duration:100,onChange:GAME.canvas.renderAll.bind(GAME.canvas),onComplete:function(){},easing:fabric.util.ease.easeInOutQuad})},a(o)},i=(e,t=()=>{})=>{try{new fabric.Image.fromURL(e.image,function(n){n.set({left:e.left,top:e.top,selectable:!1});let a=new fabric.IText(e.text,{originX:"left",left:e.left+680,top:e.top+15,fontSize:120,fill:"black",height:80,width:1500,selectable:!1}),o=new fabric.Group([n,a],{visible:!1,selectable:!1,scaleX:.1,extend:function(){o.visible=!0,o.animate({scaleX:1,scaleY:1},{duration:200,onChange:GAME.canvas.renderAll.bind(GAME.canvas),onComplete:function(){},easing:fabric.util.ease.easeInOutQuad})},contract:function(){o.animate({scaleX:.1},{duration:200,onChange:GAME.canvas.renderAll.bind(GAME.canvas),onComplete:function(){o.visible=!1},easing:fabric.util.ease.easeInOutQuad})}});return GAME.canvas.add(o),o.on("mousedown",function(){console.log("anim menu item clicked"),e.action()}),t(o),o})}catch(e){console.log(e)}},s={left:50,top:50,trigger:{x0:50,y0:50,x1:250,y1:250},menuItems:[{left:50,top:50,image:"./components/animMenu/ribbon.png",text:"Draw",action:function(){console.log("draw")}},{left:50,top:50,image:"./components/animMenu/ribbon.png",text:"shufle",action:function(){console.log("shuffle")}},{left:50,top:50,image:"./components/animMenu/ribbon.png",text:"action",action:function(){console.log("action")}}]};var c=null;function l(e){c&&(c.style.border=""),e.target.style.border="2px solid red",c=e.target}document.querySelectorAll(".interactive").forEach(e=>{e.addEventListener("click",l)}),console.log("globalInteractionManager.js"),window.GAME={},GAME.activateInteractiveMode=e=>{c&&c.deactivate(),c=e,e.activate()},GAME.deactivateInteractiveMode=()=>{c&&c.deactivate(),c=null},GAME.createInteractiveComponentGrp=function(e,t){console.log("createInteractiveComponentGrp: ",e),n(e,t)},GAME.createAnimMenu=(e=s)=>{let t=new fabric.Rect({left:e.trigger.x0,top:e.trigger.y0,width:e.trigger.x1-e.trigger.x0,height:e.trigger.y1-e.trigger.y0,fill:"transparent",selectable:!1,borderColor:"red",strokeWidth:GAME.debug?1:0,hoverCursor:"pointer"}),n=[];for(let t=0;t<e.menuItems.length;t++){let a=i(e.menuItems[t]);n.push(a)}let a=new InteractiveComponentGrp([t,...n],{left:e.left,top:e.top,selectable:!1,clipTo:null,originX:"left",originY:"top",scaleX:1,scaleY:1,onActivate:function(){console.log("menu activated");for(let e=0;e<n.length;e++)setTimeout(function(){n[e].extend()},100*e);animMenu.extend()},onDeactivate:function(){console.log("menu deactivated");for(let e=0;e<n.length;e++)setTimeout(function(){n[e].contract()},100*e)}});return t.on("mousedown",function(e){console.log("clicked on collision box"),a.active?a.deactivate():a.activate()}),GAME.canvas.add(a),a},GAME.canvas=new fabric.Canvas("mainCanvas",{width:window.innerWidth,height:window.innerHeight,name:"mainCanvas"}),GAME.localObjects=[],GAME.localState={},GAME.canvases=[],GAME.canvases.push(GAME.canvas),GAME.canvas.on("mouse:wheel",function(e){var t=e.e.deltaY,n=GAME.canvas.getZoom();(n*=.999**t)>20&&(n=20),n<.1&&(n=.1),GAME.canvas.zoomToPoint({x:e.e.offsetX,y:e.e.offsetY},n),e.e.preventDefault(),e.e.stopPropagation()});let r=!1;GAME.canvas.on("mouse:down",function(e){r=!0}),GAME.canvas.on("mouse:up",function(e){r=!1}),GAME.canvas.on("mouse:move",function(e){if(!r)return;let t=e.e,n=new fabric.Point(t.movementX,t.movementY);GAME.canvas.relativePan(n)});var f=0;function u(e,t){return Math.sqrt(Math.pow(t.clientX-e.clientX,2)+Math.pow(t.clientY-e.clientY,2))}GAME.canvas.on("touchstart",function(e){var t=e.e;t.touches&&2==t.touches.length&&(f=u(t.touches[0],t.touches[1]))}),GAME.canvas.on("touchmove",function(e){var t=e.e;if(t.touches&&2==t.touches.length){let n=u(t.touches[0],t.touches[1]),a=GAME.canvas.getZoom();(a*=n/f)>20&&(a=20),a<.1&&(a=.1),GAME.canvas.zoomToPoint({x:e.e.touches[0].clientX,y:e.e.touches[0].clientY},a),f=n}}),GAME.canvas.on("touchstart",function(n){var a=n.e;a.touches&&1===a.touches.length&&(e=a.touches[0].clientX,t=a.touches[0].clientY,r=!0)}),GAME.canvas.on("touchend",function(e){r=!1}),GAME.canvas.on("touchmove",function(n){if(r&&a.touches&&1===a.touches.length){var a=n.e,o=a.touches[0].clientX-e,i=a.touches[0].clientY-t;e=a.touches[0].clientX,t=a.touches[0].clientY;var s=new fabric.Point(o,i);GAME.canvas.relativePan(s)}}),GAME.addCardFunction=function(e,t=!0,n=function(e){}){new fabric.Image.fromURL(e.frontImage,function(t){t.set({left:e.left,top:e.top,stroke:e.stroke,strokeWidth:e.strokeWidth,shadow:e.shadow,selectable:e.selectable,id:e.id,sideUP:e.sideUP,frontImage:e.frontImage,backImage:e.backImage,flipeable:e.flipeable,dragStart:dragObj(t),dragEnd:dragObjEnd(t),flip:function(){t.sideUP="back"==t.sideUP?"front":"back",t.animate({scaleX:0,left:"+=100"},{duration:250,onChange:GAME.canvas.renderAll.bind(GAME.canvas),onComplete:function(){t.setSrc("front"==t.sideUP?t.frontImage:t.backImage,function(e){}),t.animate({scaleX:1,left:"-=100"},{duration:250,onChange:GAME.canvas.renderAll.bind(GAME.canvas),onComplete:function(){}})},easing:fabric.util.ease.easeInOutQuad})},toJson:function(){return{left:this.left,top:this.top,stroke:this.stroke,strokeWidth:this.strokeWidth,shadow:this.shadow,selectable:this.selectable,id:this.id,sideUP:this.sideUP,frontImage:this.frontImage,backImage:this.backImage,flipeable:this.flipeable}}});let a=new fabric.Image.filters.Noise({noise:15});t.filters.push(a),t.applyFilters(),objects.push(t),n(t)})};
//# sourceMappingURL=index.1a7c9cbe.js.map