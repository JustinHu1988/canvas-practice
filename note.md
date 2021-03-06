#Canvas 核心技术

>2016年8月，来仔细研究一下canvas。

##第1章 基础知识
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

###1.2 绘图环境
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
>save()和restore()

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

canvas是一个不可获取焦点的元素，因此无法再canvas元素上新增键盘事件监听器。

如果想检测键盘事件，应该在document或window对象上新增键盘事件监听器。

一共三种键盘事件：

    keydown
    keypress
    keyup

如果激发keydown事件的那个按键会打印出某个字符，则浏览器会在触发keyup事件之前先产生keypress事件。如果在一段时间内持续按住某个可以打印出字符的键，浏览器就会在keydown和keyup事件之间产生一系列的keypress事件。

####触摸事件

···


###绘制表面的保存与恢复

...



##第2章 绘制

###2.1 坐标系统
Canvas坐标系以左上角为原点，X轴向左，Y轴向下。
Canvas坐标系并不是固定的，可以对坐标系统进行平移及旋转。变换方式如下：

    平移（translate）
    旋转（rotate）
    缩放（scale）
    创建自定义的变换方式，如切变

###2.2 Canvas的绘制模型
......

###2.3 矩形的绘制
>fillRect()、strokeRect()、clearRect()

Canvas的API提供了如下三个方法，分别用于矩形的清除、描边及填充：

    clearRect(double x, double y, double w, double h)
    //默认情况下，剪辑区域是整个canvas
    strokeRect(double x, double y, double w, double h)
    //如果宽度和高度有一个为零，会绘制一条线。两者都为零，则不绘制
    fillRect(double x, double y, double w, double h)
    //如果宽度或高度为零，不会进行绘制


###2.4 颜色与透明度
>从这里到图案填充，均使用storkeStyle()和fillStyle()完成样式设定

如果只设置颜色和透明度的填充样式，可以直接将颜色信息传入storkeStyle()、fillStyle()方法中。
若想填充渐变色或者图案，则需要先用相应方法设置渐变色和图案信息，再将设置好的实例传入storkeStyle()、fillStyle()方法中。

###2.5 渐变色与图案
####渐变色：
支持线性（linear）渐变与放射（radial）渐变。

#####线性渐变
>context.createLinearGradient();

createLinearGradient()，传入两个点的x、y坐标，两点之间的连线就是canvas建立颜色渐变效果的依据。
>该方法返回一个CanvasGradient实例。可以通过addColorStop()方法向该渐变色增加颜色停止点。

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        gradient = context.createLinearGradient(0,0,canvas.width,0);

    gradient.addColorStop(0,"blue");
    gradient.addColorStop(0.25,"white");
    gradient.addColorStop(0.5,"purple");
    gradient.addColorStop(0.75,"red");
    gradient.addColorStop(1,"yellow");

    context.fillStyle = gradient;
    context.fillRect(0,0,canvas.width,canvas.height);

#####放射渐变
>createRadialGradient()，返回一个CanvasGradient实例，可以通过addColorStop()方法向该渐变色增加颜色停止点。

createRadialGradient()方法，要创建放射渐变，需要指定两个圆形（圆心坐标和半径）。

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        gradient = context.createRadialGradient(
                            canvas.width/2, canvas.height, 10,
                            canvas.width/2, 0, 100);

    gradient.addColorStop(0, "blue");
    gradient.addColorStop(0.25, "white");
    gradient.addColorStop(0.5, "purple");
    gradient.addColorStop(0.75, "red");
    gradient.addColorStop(1, "yellow");

    context.fillStyle = gradient;
    context.fillRect(0,0,canvas.width,canvas.height);

####图案
>createPattern()

除了颜色和渐变色，canvas元素也允许使用图案来对图形和文本进行描边和填充。
图案可以是以下三种之一：

    image元素
    canvas元素
    video元素

createPattern()方法创建图案。接受两个参数：图案本身、一个字符串（告知浏览器如何重复图案）。

    第一个参数指定了图案所用的图像元素
    第二个参数取值：repeat、repeat-x、repeat-y、no-repeat。

>具体实例请见test02
注意，每次用户点击单选按钮时，应用程序代码都会调用createPattern()来创建一个新的对象。
为什么要这么写？因为CanvasPattern对象是JavaScript语言中的所谓“不透明对象”（opaque object），没有提供用于操作其内容的属性及方法。




###2.6 阴影
在canvas中进行绘制时，不论要画的是图形、文本还是图像，都可以通过修改绘图环境的下述四个属性来指定阴影效果：

    shadowColor：CSS3格式的颜色
    shadowOffsetX：从图形或文本到阴影的水平像素偏移
    shadowOffsetY：从图形或文本到阴影的垂直像素偏移
    shadowBlur：该值被用于高斯模糊方程，以便对阴影进行模糊化处理。

    若想出现阴影效果：
        指定的shadowColor值不是全透明的。
        其余阴影属性中存在非0值。

设置完阴影效果后，绘制时会自动附带阴影。可以考虑用save()和restore()来灵活使用不同阴影效果。

>内嵌阴影：若给shadowOffsetX()与shadowOffsetY()设置负值，可以制作内嵌阴影。

>注：阴影效果的绘制可能很耗时
>>为了绘制阴影，浏览器需要将阴影先渲染到一个辅助的位图之中，最后这个辅助位图中的内容会与屏幕上的canvas之中的内容进行图像合成。因此相对耗时。
>>绘制简单图形时，这种影响不太明显；但如果对动画对象运用阴影效果的话，性能肯定比不用阴影效果时要差一些。详见5.11


###2.7 路径、描边与填充
>大多数绘制系统，都是基于路径的。
>>前面讲述的strokeRect()和fillRect()，是canvas绘图环境中唯二可以用来立即绘制图形的方法（还有fillText()和strokeText()是用来立即绘制文字）。

路径分为封闭路径（closed path）和开放路径（open path）。

>不论路径是开放或封闭，都可以进行填充。当填充某个开放路径，浏览器会把它当成封闭路径来填充。

绘制路径基本过程

    //开始一段新路径
    context.beginPath();

    //绘制矩形路径或弧形路径（可画多条）
    context.rect(80,150,100,100);
    context.arc(150,550,60,0,Math.PI*3/2);

    //给路径描边或填充
    context.fill();
    context.stroke();

>给同一路径进行填充和描边不冲突，可先后调用。

**CanvasRenderingContext2D中与路径有关的方法**

    beginPath()
    closePath()
    arc()
    rect()
    fill()
    stroke()

####2.7.1 路径和子路径

在某一时刻，canvas之中只能有一条路径存在，称为当前路径（current path）。这条路径可以包含多条子路径（subpath）。
当使用beginPath()方法时，我们将会清除原来的所有子路径，开始一段新路径。

>注：如果没有再次调用`beginPath()`，那么上次调用`beginPath()`后绘制的子路径全部存在，继续绘制时会在此基础上增加子路径，调用`storke()`或者`fill()`将会应用在所有子路径上（此前已经应用过storke()和fill()的子路径会进行重绘）。实例详见《canvas核心技术》P63

**填充路径规则：非零环绕规则**
如果当前路径是循环的，或是包含多个相交的子路径，Canvas的绘图环境变量就需要判断，调用`fill()`方法时，应当如何对路径进行填充。

Canvas中使用的是“非零环绕规则”（nonzero winding rule）。

对于路径中任意给定区域，从该区域内部画一条射线至路径外部。将计数器初始化为0，然后每当这个射线与路径上的直线或曲线相交时，改变计数器的值（按照交叉时路径相对于射线的方向，设定一个正向，然后正向交叉时计数器+1，反向交叉时-1），如果计数器的最终值不是0，那么此区域就在路径内部，反之在外部。


####2.7.2 剪纸效果

运用前面学到的路径、阴影以及非零环绕规则，我们可以实现“剪纸效果”（cutout）。

    例见：test03-剪纸效果

>根据Canvas规范，当使用arc()方法向当前路径中增加子路径时，该方法必须将上一条子路径的终点与所画圆弧的起点相连。

arc()方法可以让调用者控制圆弧的绘制方向，不过rect()方法总是按照顺时针方向来创建路径，如果我们需要一条逆时针的矩形路径，需要自己创建一个rect()方法：

    function rect(x,y,w,h,direction){
        if(direction){
            context.moveTo(x,y);
            context.lineTo(x,y+h);
            context.lineTo(x+w,y+h);
            context.lineTo(x,y+h);
        } else {
            context.moveTo(x,y);
            context.lineTo(x+w,y);
            context.lineTo(x+w,y+h);
            context.lineTo(x,y+h);
        }
        context.closePath();
    }

>


###2.8 线段
Canvas绘图环境提供了两个可以用来创建线性路径的方法：moveTo()与lineTo()。

>moveTo()：向当前路径中增加一个子路径，该子路径只包含一个点。
>lineTo()：如果当前路径没有子路径，执行和moveTo()一样的功能；如果有子路径，则将指定的点加入子路径。

例：

    var context=document.getElementById("canvas").getContext("2d");

    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(50,10);
    context.lineTo(450,10);
    context.stroke();
    context.beginPath();
    context.moveTo(50.5,50.5);
    context.lineTo(450.5,50.5);
    context.stroke();
    //注意：第一条线宽度是两像素宽，原因见2.8.1。

####2.8.1 线段与像素边界
如果你在某2个像素的边界处绘制一条1像素宽的线段，那么该线段实际会占据两个像素的宽度。

####2.8.2 网格的绘制
绘制网格示例：
>例：见test04网格绘制

    var context = document.getElementById("canvas").getContext("2d");

    //Functions......
    function drawGrid(context,color,stepx,stepy){
        context.strokeStyle = color;
        context.lineWidth = 0.5;

        for(var i=stepx+0.5; i<context.canvas.width; i+=stepx){
            context.beginPath();
            context.moveTo(i,0);
            context.lineTo(i, context.canvas.height);
            context.stroke();
        }
        for(var i=stepy+0.5; i<context.canvas.height; i+=stepy){
            context.beginPath();
            context.moveTo(0,i);
            context.lineTo(context.canvas.width, i);
            context.stroke();
        }
    }
    //Initialization......
    drawGrid(context, 'lightgray', 10, 10);


这段JavaScript代码将线段绘制在了某一个像素的中线上，并且绘制的只有0.5像素宽。（所有浏览器的Canvas实现都使用了“抗锯齿”技术，可以创建出“亚像素”线段的绘制效果）

####2.8.3 坐标轴的绘制
绘制坐标轴示例：
>例：见test05坐标轴绘制

>接下来，学习一下如何让用户以互动的方式画线。

####2.8.4 橡皮筋式的线条绘制

>例：见test06-橡皮筋式线条绘制

针对用户在拖拽鼠标过程中所发生的每一个鼠标事件，应用程序都要做如下三件事：

1. 恢复绘制表面
2. 更新rubberbandRect
3. 从按下鼠标的位置向鼠标当前位置画一条线。

>例中程序，在用户拖拽鼠标时维护了一个代表橡皮筋式矩形选取框的变量及其属性。因此我们可以修改相应方法，使其支持所有能够容纳在矩形范围内的形状，例如圆形或任意多边形。

####2.8.5 虚线的绘制
自制绘制虚线（dashed line）或点划线（dotted line）的方法：

>计算虚线的总长度，然后根据其中每条短划线的长度，算出整个虚线中应该包含多少短划线，通过反复绘制多条很短的线段来画出整个虚线。
>例：test07-虚线绘制

####2.8.6 通过扩展CanvasRenderingContext2D来绘制虚线

在Canvas绘图环境对象中增加一个类似lineTo()的dashedLineTo()方法：

主要难点在于：无法取到上次调用moveTo()时所传入的位置参数。 由于该参数是线段的起点，是必须参数。

解决方案：尽管Canvas的绘图环境对象没有提供直接办法获取上次调用moveTo()时所用的位置参数，不过可以按照下述方法获取：

1. 获取指向绘图环境对象中moveTo()方法的引用。
2. 向Canvas绘图环境对象中新增一个名为lastMoveToLocation的属性。
3. 重新定义绘图环境对象的moveTo()方法，将传给该方法的点保存到lastMoveToLocation属性中。

一旦获得了上次传入moveTo()方法中的位置参数，那么要实现新加入CanvasRenderingContext2D原型对象中的dashedLineTo()方法，就容易了。

>test08-扩展CanvasRenderingContext2D对象

>注意关注新版本规范里是否有新的特性。

####2.8.7 线段端点与连接点的绘制

>lineCap：Canvas绘图环境对象中控制"线段端点"绘制的属性。

属性值：

    butt：原样绘制；
    round：给端点处多画一个半圆，半径等于线段宽度的一半；
    square则是想端点处多画一个矩形，长度与线宽一致，宽度等于线宽的一半。

>lineJoin：控制连接点样式的属性。

属性值：

    miter：默认值；
    bevel：
    round：

>miterLimit：斜线长度与二分之一线宽的比值。如果斜接线的长度超过了该值，浏览器就会以bevel方式来绘制线段的连接点

###2.9 圆弧与圆形的绘制
>arc()与arcTo()

    arc(x, y, radius, startAngle, endAngle, counterClockwise)
        圆心坐标、半径、起始角度、终结角度、圆弧方向（默认值false,顺时针）

arc()方法所绘制的可能不止是圆弧，如果此前存在子路径，浏览器会把前面子路径的终点与圆弧的起点连接起来。

####2.9.2 用橡皮筋式辅助线 辅助画圆

让用户以拖动鼠标的方式画圆：
>例2-19 橡皮筋辅助线辅助画圆

###2.10 贝塞尔曲线
####2.10.1 二次方贝塞尔曲线
>quadraticCurveTo(double cpx, double cpx, double x, double y);

####2.10.2 三次方贝塞尔曲线
>bezierCurveTo(double cpx, double cpy, double cp2x, double cp2x, double x, double y);


###2.11 多边形的绘制
多边形绘制示例： example02-25

**多边形对象**
立即模式绘图系统会立即将绘制的内容体现在canvas上，然后立刻忘掉刚才所画的东西。
如果想实现让用户创建并操作绘图对象的画图应用程序，立即模式绘图有些不足。
我们需要将可以编辑并绘制的那些图形对象保存到一份列表当中。

>example02-26




#图像与视频

>Canvas绘图环境对象提供了4个绘制及操作图像的方法：

    drawImage()
    getImageData()
    putImageData()
    createImageData()

##4.1 图像绘制

`drawImage()`方法的使用很灵活：可以将图像、canvas对象或视频帧的整体或某一部分会知道canvas中，可任意指定其绘制位置及缩放比例。
三种传递参数的方式：
    
    drawImageData(image, dx, dy) //获取整张图像，指定绘制位置，不缩放
    drawImageData(image, dx, dy, dw, dh)    //获取整张图像，指定绘制位置，按dw和dh对图像进行缩放
    drawImageData(image, sx, sy, sw, sh, dx, dy, dw, dh)    //获取局部图像，指定绘制位置，按dw和dh对获取的局部图像进行缩放
    //  image：源图像对象
        sx,sy：从源图像中获取图像信息的起始坐标（默认为0,0）
        sw,sh：从源图像中获取的图像信息宽与高
        dx,dy：在canvas上填充图像的起始位置
        dw,dh：填充在canvas的图像实际大小（源图像会根据高宽缩放）

绘制图像实例：example04-01

>注：图像未加载完之前不能进行绘制，否则会失败。

>注：drawImage()方法在绘制图像时不会考虑当前路径，但它会将globalAlpha设置、阴影效果、剪辑区域以及全集图像合成操作符等属性运用到图像绘制中。

>关于指示加载进度的滚动条，详见9.1.2

##4.2 图像缩放

实例：example04-05

>可以在canvas范围外绘制图像，这个在需要背景图片滚动效果时很有用。

>进行页面渲染时，不应首先考虑Canvas元素。
>>如上例中，既然output元素比使用canvas元素更适合表示放大比例的数值，就应该用output元素，而不是用canvas渲染。

##4.3 Drawing a Canvas into a Canvas

`drawImage()` can draw a canvas back into itself:

    var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    scaleWidth = ..., //Calculate scales for width and height
    scaleHeight = ...;
    ...
    context.drawImage(canvas, 0, 0, scaleWidth, scaleHeight);
    ...

In this code, it draws a canvas into itself, scaling the canvas along the way. When the user changes the scale, the application clears the canvas and draws the image, scaled to canvas width and height, into the canvas. Then it draws the watermark on the top of the image.

However, the user never sees the canvas in that state, because the application immediately draws the canvas back into itself, scaled at the scale specified by the users. That has the effect of scaling not only the image, but also the watermark along with it.

Although it's convenient in this case to draw the canvas back into itself, it's not very efficient. Every time the user modifies the scale, the application draws the image and the watermark, and then subsequently redraws the entire canvas, scaled. That means the application ends up drawing everything twice every time the scale changes: See Example 04.06

>TIP: You can draw a canvas into itself, but beware that it's not very efficient, because the browser creates an intermediate offscreen canvas to scale the canvas.

##4.4 Offscreen Canvases
offscreen canvases, which are often used as temporary holding places for images, are useful in many different scenarios.

Using an offscreen canvas typically involves four steps:
1. Create the offscreen canvas element.
2. Set the offscreen canvas's width and height.
3. Draw into the offscreen canvas.
4. Copy all, or part of, the offscreen canvas onscreen.

A recipe for offscreen canvases:

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        offscreenCanvas = document.createElement("canvas"),
        offscreenContext = offscreenCanvas.getContext("2d"),
        ...
        //Set the offscreen canvas's size to match the onscreen canvas
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        ...
        //Draw into the offscreen context
        offscreenContext.drawImage(anImage, 0, 0);
        ...
        //Draw the offscreen context into the onscreen canvas
        context.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

Code like `var offscreenCanvas = document.createElement("canvas");` create a new canvas that is not attached to any DOM element and therefore will not be visible; thus the term offscreen.

By default, the offscreen canvas's size will be the default size for canvases. Usually, those dimensions will not suffice for your particular use case, so you will need to resize the canvas.

After you have created an offscreen canvas and set its size, you typically draw into the offscreen canvas and subsequently draw some, or all, of the offscreen canvas onscreen.

>Example 4.8 Using an offscreen canvas

>TIP: Increase performance with offscreen canvases
>>Notice how much more efficient the drawScaled() method is in Example 4.8 than in Example 4.6. The example listed in Example 4.8 draws from the offscreen canvas. The application listed in Example 4.6, on the other hand, had to clear the canvas, draw the image, draw the watermark, and finally, copy the canvas into itself.

##4.5 Manipulating Images
The `getImageData()` and `putImageData()` methods let you access the pixels of an image and insert pixels into an image, respectively. In the meantime, if you wish, you can modify those pixels, so those two methods let you perform just about any image manipulation you can imagine.

###4.5.1 Accessing Image Data
Let's start with a common use case, selecting a region of a canvas with a rubber band:

>Example 4.9 Rubber bands implemented with **getImageData()** and **putImageData()**


####4.5.1.1 ImageData Objects

ImageData objects returned from `getImageData()` have the following three properties:
1. width: the width of the image data, in device pixels
2. height: the height of the image data, also in device pixels
3. data: an array of values representing device pixels

The width and height properties are both read-only unsigned longs. The data attribute is an array of 8-bit integer values representing color components for each device pixel in the image data.

>NOTE: Device pixels vs. CSS pixels
>>For higher image fidelity, browsers may use multiple device pixels for each CSS pixel.  You can find out how many device pixels you have with the ImageData object's width and height properties.

####4.5.1.2 Image Data Partial Rendering: putImageData's Dirty Rectangle