document.body.innerHTML='';
var canvas = document.createElement( 'canvas' );
canvas.width = canvas.height = 256;
document.body.appendChild( canvas );


gl = canvas.getContext( 'webgl' , {}) || canvas.getContext( 'experimental-webgl', {} );
gl.clearColor(0,0,0,1)
gl.clear(gl.COLOR_BUFFER_BIT);



var v_str = [
    'attribute vec4 a_Position;',
    'void main(){',
        'gl_Position = a_Position;',
        ' gl_PointSize = 10.0;',
    '}'
].join( '\n' );
var f_str = [
    'precision mediump float;',
    'void main(){',
        'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
    '}'
].join( '\n' );

var v_shader = gl.createShader(gl.VERTEX_SHADER);//顶点着色器
gl.shaderSource(v_shader, v_str);//绑定代码
gl.compileShader(v_shader);//编译

var f_shader = gl.createShader(gl.FRAGMENT_SHADER);//片源着色器
gl.shaderSource(f_shader, f_str);//绑定代码
gl.compileShader(f_shader);//编译

if (!gl.getShaderParameter(v_shader, gl.COMPILE_STATUS)) {//获取错误信息
    alert(gl.getShaderInfoLog(v_shader));
}
if (!gl.getShaderParameter(f_shader, gl.COMPILE_STATUS)) {//获取错误信息
    alert(gl.getShaderInfoLog(f_shader));
}

var program = gl.createProgram();//创建程序对象
gl.attachShader(program, v_shader);
gl.attachShader(program, f_shader);
gl.linkProgram(program);

gl.useProgram( program );//指定程序对象

var vertexBuffer = gl.createBuffer(),
    varindex,
    vertices = new Float32Array([
        0,0,
        0,0.5,
        0.5,0,
        0.5,0.5
    ]);
gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );//绑定缓冲区
gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);//绑定数据 vertices 顶点坐标数据

varindex = gl.getAttribLocation(program, 'a_Position');//获取顶点变量索引值
gl.vertexAttribPointer( varindex, 2, gl.FLOAT, false,  0, 0);//设置顶点缓冲区  0：步长，0：起始位置
gl.enableVertexAttribArray( varindex );//开启变量

//gl.viewport(0,0,canvas.width,canvas.height);
/*
        gl.POINTS
        gl.LINES
        gl.LINE_STRIP
        gl.LINE_LOOP
        gl.TRIANGLES
        gl.TRIANGLE_STRIP
        gl.TRIANGLE_FAN
*/
gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );//渲染,从第0个点开始，3顶点总数
//gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_BYTE, 0);