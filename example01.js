var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d");

	context.lineJoin = "round";
	context.lineWidth = 30;

	context.font = "24px Helvetica";
	context.fillText("Click anywhere to erase", 100, 140); //fill text on canvas

	context.strokeStyle = "goldenrod";
	context.fillStyle = "rgba(0,0,255,0.5)";

	context.strokeRect(0, 0, 200,200); //矩形描边
	context.fillRect(0,0,400,400); //矩形填充

	context.canvas.onmousedown = function(e){
		context.clearRect(0,0,canvas.width,canvas.height);
	}

    function windowToCanvas(canvas, x, y){
        var bbox = canvas.getBoundingClientRect(); //获取元素的大小以及相对于视口的位置，注：getBoundingClientRect()获取的高宽包括padding和border

        return { x:(x-bbox.left)*(canvas.width/bbox.width),
        	y:(y-bbox.top)*(canvas.height/bbox.height)};
    }

    canvas.onmousemove = function(e){
    	var loc = windowToCanvas(canvas, e.clientX, e.clientY);
console.log(loc);
    }


