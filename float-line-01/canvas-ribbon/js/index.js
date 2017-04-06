(function(w) {

    var canvas, ctx;
    
    var mouse = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        down: false
    };

    var playing = true;

    var xx;
    var yy;

    var vx;
    var vy;

    var ac;
    var de;

    var px0 = [];
    var py0 = [];
    var px1 = [];
    var py1 = [];
        
    var t = 0
        
    var shapes = [];

    var canvas_width = 500;
    var canvas_height = 500;

    var first = true;
    var t_t = 0;
  
    function init() {
        
        canvas = document.getElementById("c");
        ctx = canvas.getContext("2d");

        handle_resize();

        canvas.addEventListener("mousemove", mouse_move_handler);
        canvas.addEventListener("touchmove", touch_move_handler);

        canvas.addEventListener("click", click_handler);

        var resize = debounce(handle_resize, 20);
        w.addEventListener("resize", resize);

        vx = vy = 0.0;
        xx = mouse.x;
        yy = mouse.y;
        ac = 0.06;
        de = 0.9;
        px0 = [xx, xx, xx, xx];
        py0 = [yy, yy, yy, yy];
        px1 = [xx, xx, xx, xx];
        py1 = [yy, yy, yy, yy];
                    
        shapes = [];

        w.onload = draw;

    }

    function click_handler() {
        playing = !playing;
        if (playing) draw();
    }

    function draw() {
        xx += vx += ( mouse.x - xx ) * ac;
        yy += vy += ( mouse.y - yy ) * ac;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#00FFFF";

        var len = Math.sqrt(vx * vx + vy * vy);

        var x0 = xx + 1 + len * 0.1;
        var y0 = yy - 1 - len * 0.1;
        var x1 = xx - 1 - len * 0.1;
        var y1 = yy + 1 + len * 0.1;
        
        px0.shift(); px0.push( x0 );
        py0.shift(); py0.push( y0 );
        px1.shift(); px1.push( x1 );
        py1.shift(); py1.push( y1 );
        
        var _px0 = [px0[0], px0[1], px0[2], px0[3]];
        var _py0 = [py0[0], py0[1], py0[2], py0[3]];
        var _px1 = [px1[0], px1[1], px1[2], px1[3]];
        var _py1 = [py1[0], py1[1], py1[2], py1[3]];
        
        shapes.push({px0:_px0, py0:_py0, px1:_px1, py1:_py1});
        if (shapes.length >= 50) shapes.shift();
        
        var shapesLength = shapes.length;
        for (i = shapesLength - 1; i >= 0; i--){
            var sh = shapes[i];
            
            if (t > 1) t -= 1;
            ctx.fillStyle = rot_color(t);

            ctx.beginPath();
            ctx.moveTo(sh.px0[0],sh.py0[0]);
            ctx.bezierCurveTo(sh.px0[1], sh.py0[1], sh.px0[2], sh.py0[2], sh.px0[3], sh.py0[3]);
            ctx.lineTo(sh.px1[3], sh.py1[3]);
            ctx.bezierCurveTo(sh.px1[2], sh.py1[2], sh.px1[1], sh.py1[1], sh.px1[0], sh.py1[0]);
            ctx.lineTo(sh.px0[0], sh.py0[0]);
            ctx.fill();

        }

        t += 0.015;

        vx *= de;
        vy *= de;

        if (first) {
          t_t += 0.1;
          if (t_t > 1) {
            first = false;
          }else{
            mouse.x = canvas_width * Math.sin(t_t);
            mouse.y = canvas_height * Math.cos(t_t);
          }
        }
      
        if (playing) requestAnimationFrame(draw);
    }

    function rot_color(time) {
        var r, g, b;

        if (time > 5 / 6) {
            r = 255;
            g = 0;
            b = parseInt(255 - (255 * ((time - 5 / 6) * 6)));
        }else if (time > 2 / 3) {        
            r = parseInt(255 * ((time - 2 / 3) * 6));
            g = 0;
            b = 255; 
        }else if (time > 1 / 2) {
            r = 0;
            g = parseInt(255 - (255 * ((time - 1 / 2) * 6)));
            b = 255;
        }else if (time > 1 / 3) {
            r = 0;
            g = 255;
            b = parseInt(255 * ((time - 1 / 3) * 6));
        }else if (time > 1 / 6) {
            r = parseInt(255 - (255 * ((time - 1 / 6) * 6)));
            g = 255;
            b = 0; 
        }else{
            r = 255;
            g = parseInt(255 * (time * 6));
            b = 0; 
        }

        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    function debounce(func, wait, immediate) {
        var timeout;

        return function() {
            var context = this, 
                args = arguments;

            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };

            var callNow = immediate && !timeout;
            clearTimeout(timeout);

            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function handle_resize() {
        canvas.width = canvas_width = window.innerWidth;
        canvas.height = canvas_height = window.innerHeight;
    }

    function mouse_move_handler(e) {
        e.preventDefault();
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = e.offsetX || e.layerX;
        mouse.y = e.offsetY || e.layerY;
    }

    function touch_move_handler(e) {
        e.preventDefault();
        mouse.px = mouse.x;
        mouse.py = mouse.y;

        var rect = canvas.getBoundingClientRect();

        mouse.x = e.touches[0].pageX - rect.left;
        mouse.y = e.touches[0].pageY - rect.top;
    }

    w.Ribbon = {
        initialize: init
    }

}(window));

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

Ribbon.initialize();