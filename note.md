#Canvas 核心技术

>2016年8月，来仔细研究一下canvas。

##基础知识
Canvas的能力，主要通过它的context对象表现出来。canvas.context：canvas的绘图环境。
因此，要在JS中操作canvas元素的时候，首先可以用`getElementById()`获取canvas对象，再用`.getContext('2d')`获取canvas对象的绘图环境，然后在绘图环境里进行各种编辑。

    //获取指定canvas的绘图环境
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d");

####canvas元素尺寸 vs 绘图表面尺寸
>canvas初始大小为300*150像素。

canvas可以在元素标签里设置初始尺寸，也可以用css设置尺寸。但是这两者有区别。
canvas实际有两套尺寸。一个是元素本身的大小，一个是元素绘图表面（drawing surface）的大小。元素大小是canvas元素的实际显示尺寸，而绘图表面的大小则是画布里展示的单位像素个数。
在元素标签里设置width和height时，是同时修改元素本身大小和绘图表面的像素数；若用css设定canvas元素的大小，则只会改变元素本身的大小，不改变绘图表面的像素数。
当canvas元素的大小不符合绘图表面大小时，浏览器会对绘图表面进行放大或缩小，使其符合元素的大小。

####canvas元素的API
>不多，只有两个属性和三个方法。

两个属性：

    canvas.width
    canvas.height
>设置width和height时，不要加px后缀。取值为非负整数。

三个方法：

    canvas.getContext() //返回相应的绘图环境对象
    canvas.toDataURL(type, quality) //返回一个数据地址
    canvas.toBlob(callback,type,args...) //创建一个用于表示此canvas元素图像文件的Blob（binary large object）

>js代码中，很少会用到canvas元素本身，主要就是获取一下canvas的高宽、或某个数据地址。而canvas的绘图环境对象才是主要的绘图场所，这个对象也提供了强大的API，见下。

###绘图环境
canvas主要功能就是充当绘图环境对象的容器。而环境对象则提供了全部的绘制功能。

####2d绘图环境
CanvasRenderingContext2D对象所含的属性：

    canvas
    fillstyle
    font
    globalAlpha
    globalCompsiteOperation
    lineCap
    lineWidth
    lineJoin
    miterLimit
    shadowBlur
    shadowColor
    shadowOffsetX
    shadowOffsetY
    strokeStyle
    textAlign
    textBaseline

>可以自定义2d绘图对象的功能

>3d绘图环境——WebGL

####Canvas状态的保存与恢复
Canvas的context对象提供了两个名叫`save()`和`restore()`的方法，用于保存及恢复当前canvas绘图环境的所有属性。

    function drawGrid(strokeStyle, fillstyle){
        controlContext.save();  //Save the context on a stack

        controlContext.fillStyle = fillStyle;
        controlContext.strokeStyle = strokeStyle;

        //Draw the grid here...

        controlContext.restore();  //Restore the context from the stack
    }

*save()*

    将当前的canvas状态推送到一个保存canvas状态的堆栈顶部。
    canvas状态包括了当前的坐标变换（transformation）信息、剪辑区域（clipping region）
    以及所有canvas绘图环境对象的属性，包括strokeStyle、fillStyle与globalCompositeOperation等。

    canvas状态并不包括当前的路径或位图。只能通过调用beginPath()来重置路径。
    至于位图，它是canvas本身的一个属性，并不属于绘图环境对象。

    不过，尽管位图是canvas对象本身的属性，也可以通过绘图环境对象来访问：
    在环境对象上调用getImageData()方法。

*restore()*

    在调用save()与restore()方法之间，对canvas状态所进行的修改，其效果只会持续至restore()方法被调用之前。


###事件处理
>html5应用程序是以事件来驱动的。

####鼠标事件
两种触发方式，例：

    canvas.onmousedown = function(e){
        //React to the mouse down event
    };

    canvas.addEventListener("mousedown", function(e){
        //React to the mouse down event
        });

两种方法差不多。不过，如果需要向某个鼠标事件注册多个监听器的话，就得用addEventListener()方法。

**将鼠标坐标转换为canvas坐标**
浏览器通过事件对象传递给监听器的鼠标坐标是窗口坐标，而不是相对于canvas本身的坐标。
大部分情况下，我们需要知道的是发生鼠标事件的点相对于canvas本身的坐标。
转换示例：

    function windowToCanvas(canvas, x, y){
        var bbox = canvas.getBoundingClientRect();
        //获取元素的大小以及相对于视口的位置，注：getBoundingClientRect()获取的高宽包括padding和border,而canvas.width和height不包含padding和border
        //因此这里的代码虽然针对绘图表面做了转换，却依然无法获取canvas内部的实际像素坐标。（只有在border和padding为0时，这段代码才能获取到实际像素坐标）

            return { x:(x-bbox.left)*(canvas.width/bbox.width),
            y:(y-bbox.top)*(canvas.height/bbox.height)};
    }

    canvas.onmousemove = function(e){
        var loc = windowToCanvas(canvas, e.clientX, e.clientY);
    console.log(loc);
    }

>如今，支持HTML5的浏览器都支持clientX和clientY属性了。

####键盘事件
键盘事件触发时，事件发生在当前拥有焦点的HTML元素身上。假如没有元素拥有焦点，那么事件会发生在window和document对象上。








