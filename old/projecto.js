var gl;

var r; 
var g;
var b;
var a;

var vertColors;
var program;
var bufferId;

var posX;
var posY;

var index = 0;
var autoOn = false;
var autoInterval;
var timeLoc;
var time;

var check = false;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }  
    
    r = document.getElementById("redRange").value;
    g = document.getElementById("greenRange").value;
    b = document.getElementById("blueRange").value;
    a = document.getElementById("alfaRange").value;
    
    r /= 255.0;
    g /= 255.0;
    b /= 255.0;
    a /= 255.0;
    
    vertColors = vec4(r,g,b,a);
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 65526, gl.STATIC_DRAW);
    
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA,
                         gl.ONE_MINUS_SRC_ALPHA,
                         gl.ONE, 
                         gl.ONE_MINUS_SRC_ALPHA);
    
    //
    //Menu Scripts
    //
    
    //Automatic Button
    var autoButton = document.getElementById("automaticButton");
    autoButton.addEventListener("click", function() {
        
        if( autoOn == true){
            autoOn = false;
            clearInterval(autoInterval);
            autoButton.style = "background-color:red";
            console.log("stoping auto!");
        }else{
            autoOn = true;
            autoInterval = setInterval(autoShape,100);
            autoButton.style = "background-color:green";
            console.log("starting auto!");
        }
    });   

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 9*4, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 9*4, 4*2);
    gl.enableVertexAttribArray(vColor);
    
    var vShape = gl.getAttribLocation(program, "vShape");
    gl.vertexAttribPointer(vShape, 1, gl.FLOAT, false, 9*4, 4*6);
    gl.enableVertexAttribArray(vShape);
    
    var vSize = gl.getAttribLocation(program, "vSize");
    gl.vertexAttribPointer(vSize, 1, gl.FLOAT, false, 9*4, 4*7);
    gl.enableVertexAttribArray(vSize);
    
    var vTheta = gl.getAttribLocation(program, "vTheta");
    gl.vertexAttribPointer(vTheta, 1, gl.FLOAT, false, 9*4, 4*8);
    gl.enableVertexAttribArray(vTheta);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //setInterval(render, 200);
    
    timeLoc = gl.getUniformLocation(program, "time");
    time = 0.0;
    
    render();
}



function render() {
    time += 0.1;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(timeLoc, time);
    //console.log(time);
    
    gl.drawArrays(gl.POINTS, 0, index);
    setTimeout(
        function (){requestAnimFrame(render);}, 0.2
    );
}

function updateRed(){
    r = document.getElementById("redRange").value;
    r /= 255.0;
    updateColors()
    //render();
}

function updateGreen(){
    g = document.getElementById("greenRange").value;
    g /= 255.0;
    updateColors();
    //render();
}

function updateBlue(){
    b = document.getElementById("blueRange").value;
    b /= 255.0;
    updateColors();
    //render();
}

function updateAlfa(){
    a = document.getElementById("alfaRange").value;
    a /= 255.0;
    updateColors();
    //render();
}

function updateColors(){
    vertColors = vec4(r,g,b,a);
    document.getElementById("optionMenu").style = 
        "border-color:rgba("+r*255+","+g*255+","+b*255+","+parseFloat(a)+")";
};


function createShape(evt){
    // Buffer, ordem dos itens (9)
    // posx posy r g b a shape size theta
    
    
    // Getting click coords
    posX = evt.clientX;
    posY = evt.clientY;
    
    if (posX > 256) {
        posX -= 256.0;
        posX /= 256.0;
    } else if (posX < 256) {
        posX -= 256.0;
        posX *= -1.0;
        posX /= -256.0;
    }
    if (posY > 256) {
        posY -= 256.0;
        posY /= -256.0;
    } else if (posY < 256) {
        posY -= 256.0;
        posY *= -1.0;
        posY /= 256.0;
    }
    console.log(posX);
    console.log(posY);
    
    var vertices = vec2(posX, posY);
    
    console.log(vertColors);
    
    // Getting shape
    var shapeC = document.getElementById("shapeSelector").value;
    var shape = 0.0;
    switch (shapeC){
        case "Circle":
            shape = 1.0;
            break;
        case "Star":
            shape = 2.0;
            break;
        case "Cruz":
            shape = 3.0;
            break;
        case "Xadrez":
            shape = 4.0;
            break;
    }
    console.log("Shape: " + shape);
    
    // Random number between 10 and 50
    var size = Math.floor(Math.random()*(50.0-10.0+1.0)+10.0);
    console.log("Size: " + size);
    
    // Random number between -1.5 and 1.5
    var theta = (Math.floor(Math.random()*(15.0-(-15.0)+1.0)+(-15.0)))/10.0;
    while (theta == 0.0){
        theta = (Math.floor(Math.random()*(15.0-(-15.0)+1.0)+(-15.0)))/10.0;
    }
    console.log("Theta: " + theta);
    
    // Position
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4), flatten(vertices));
    // Colors
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4,flatten(vertColors));
    // Shape
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4,new Float32Array([shape]));
    // Size
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4+4,new Float32Array([size]));
    // Theta
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4+4+4,new Float32Array([theta]));
    
 
    index++;
    //render();
}

function autoShape(){
    var vertices = vec2((Math.floor(Math.random()*(10.0-(-10.0)+1.0)+(-10.0)))/10.0,
                            (Math.floor(Math.random()*(10.0-(-10.0)+1.0)+(-10.0)))/10.0);
    console.log(vertices);
    
    console.log("check: " + check);
    
    if( check == true){
        // Getting Colors
        
        var colors = vec4((Math.floor(Math.random()*(10.0+1.0)))/10.0,
                          (Math.floor(Math.random()*(10.0+1.0)))/10.0,
                          (Math.floor(Math.random()*(10.0+1.0)))/10.0,
                          (Math.floor(Math.random()*(10.0+1.0)))/10.0)
        
        console.log(colors);
        
        // Getting shape
        var shape = Math.floor(Math.random()*(4.0)+1.0);
        
        console.log("Shape: " + shape);

        // Random number between 10 and 50
        var size = Math.floor(Math.random()*(50.0-10.0+1.0)+10.0);
        console.log("Size: " + size);

        // Random number between -1.5 and 1.5
        var theta = (Math.floor(Math.random()*(15.0-(-15.0)+1.0)+(-15.0)))/10.0;
        while (theta == 0.0){
            theta = (Math.floor(Math.random()*(15.0-(-15.0)+1.0)+(-15.0)))/10.0;
        }
        console.log("Theta: " + theta);

        // Position
        gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4), flatten(vertices));
        // Colors
        gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4,flatten(colors));
        // Shape
        gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4,new Float32Array([shape]));
        // Size
        gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4+4,new Float32Array([size]));
        // Theta
        gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4+4+4,new Float32Array([theta]));
        
    }else {
        
    // Getting shape
    var shapeC = document.getElementById("shapeSelector").value;
    var shape = 0.0;
    switch (shapeC){
        case "Circle":
            shape = 1.0;
            break;
        case "Star":
            shape = 2.0;
            break;
        case "Cruz":
            shape = 3.0;
            break;
        case "Xadrez":
            shape = 4.0;
            break;
    }
    console.log("Shape: " + shape);
    
    // Random number between 10 and 50
    var size = Math.floor(Math.random()*(50.0-10.0+1.0)+10.0);
    console.log("Size: " + size);

    // Random number between -1.5 and 1.5
    var theta = (Math.floor(Math.random()*(15.0-(-15.0)+1.0)+(-15.0)))/10.0;
    while (theta == 0.0){
        theta = (Math.floor(Math.random()*(15.0-(-15.0)+1.0)+(-15.0)))/10.0;
    }
    console.log("Theta: " + theta);

    // Position
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4), flatten(vertices));
    // Colors
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4,flatten(vertColors));
    // Shape
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4,new Float32Array([shape]));
    // Size
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4+4,new Float32Array([size]));
    // Theta
    gl.bufferSubData(gl.ARRAY_BUFFER,index*(9*4)+2*4+4*4+4+4,new Float32Array([theta]));
        
    }
    
    index++;
    // render();
}

function checkUpdate(){
    if(check == true){
        check = false;
    }else{
        check = true;
    }
}
