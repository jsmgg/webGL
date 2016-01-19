;( function( Core ) {
/*
    专门负责初始化着色器
*/
function Shader(gl, vertexShader, fragmentShader) {
    //console.log(vertexShader +'\n'+ fragmentShader);
    this.program = gl.createProgram();//程序对象
    this.gl = gl;
    this._initShader(vertexShader, fragmentShader);
}
Shader.prototype = {
    constructor : Shader,
    _initShader : function(vertexShader, fragmentShader) {
        var gl             = this.gl,
            program        = this.program,
            vertexShader   = this._createShader(vertexShader, gl.VERTEX_SHADER),//创建顶点着色器
            fragmentShader = this._createShader(fragmentShader, gl.FRAGMENT_SHADER);//创建片源着色器
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
    },
    _createShader : function(str, type) {//创建着色器
        var gl = this.gl, shader;
        shader = gl.createShader( type );
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw(type + ':' + gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    use : function() {//使用当前程序对象
        this.gl.useProgram( this.program );
    },
    attrIndex : function( key ) {//获取attribute类型变量索引值
        var index = this.gl.getAttribLocation(this.program, key);
        if( index < 0 ) {
            throw 'attribute:' + key + ' is not found!';
            index = -1;
        }
        return index;
    },
    uniformIndex : function( key ) {//获取uniform类型变量索引值
        var index = this.gl.getUniformLocation( this.program, key);
        if( index < 0 ) {
            throw 'uniform:' + key + ' is not found!';
            index = -1;
        }
        return index;
    },
    getBuffer : function() {//获取一个缓冲区
        var buffer = this.gl.createBuffer();
        if( !buffer ) {
            throw 'Failed:缓冲区创建失败';
            return null;
        }
        return buffer;
    }
}
Core.Shader = Shader;
} )( Core );