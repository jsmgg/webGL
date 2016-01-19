/*
    模型基类
*/
function ModleBase(){
    var attrKeys = [ 'a_Position' , 'a_Color' ],
        uniformKeys = [ 'u_ShadowMode', 'u_MvpMatrix', 'u_Sampler', 'u_ShadowMode'];
    this.gl = arguments[ 0 ];
    this.proMatrix = mat4.identity( mat4.create() );//投影矩阵
    this.viewMatrix = mat4.identity( mat4.create() );//视图矩阵
    this.moduleMatrix = mat4.identity( mat4.create() );//模型矩阵
    this.mvpMatrix = mat4.identity( mat4.create() );//模型视图投影矩阵，默认为单位矩阵
    
    this.vertexShader = [
        'uniform float u_ShadowMode;',//控制模型类型
        'attribute vec3 a_Position;',
        'attribute vec3 a_Color;',
        'uniform mat4 u_MvpMatrix;',//透视模型视图矩阵
        'varying vec3 v_Color;',
        'void main( void ){',
        ' gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);',
        'if( u_ShadowMode <= 1.0) {',//纹理立方体
        ' v_Color = a_Position;',
        '} else if( u_ShadowMode <= 2.0 ) {',//普通颜色立方体
        ' v_Color = a_Color;',
        '}',
        '}'
    ].join('\n');
    this.fragmentShader = [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        ' precision highp float;',
        '#else',
        ' precision mediump float;',
        '#endif',
        'uniform samplerCube u_Sampler;',
        'uniform float u_ShadowMode;',
        'varying vec3 v_Color;',
        'void main( void ){',
        ' if( u_ShadowMode <= 1.0) {',
        '  gl_FragColor = textureCube(u_Sampler,v_Color);',
        ' } else if( u_ShadowMode <= 2.0 ) {',
        '  gl_FragColor = vec4(v_Color, 1.0);',
        '}',
        '}'
    ].join('\n');
    ModleBase.static_init || this._initShader(attrKeys , uniformKeys);
    ModleBase.static_init = true;
}
ModleBase.prototype = {
    constructor : ModleBase,
    program : null,
    index : {},
    _initShader : function(attrKeys , uniformKeys) {
        var self           = this,
            gl             = self.gl,
            vertexShader   = self._createShader(self.vertexShader, "vertex"),
            fragmentShader = self._createShader(self.fragmentShader, "fragment"),
            shaderProgram, shaderVertexPositionAttribute, shaderProjectionMatrixUniform,
            shaderModelViewMatrixUniform;
        // link them together into a new program
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw ( "着色器初始化失败！\n" + gl.getProgramInfoLog(shaderProgram) );
            return null;
        }
        gl.useProgram( shaderProgram );
        self.program = shaderProgram;
        attrKeys.forEach( function( key ) {
            self.index[ key ] = gl.getAttribLocation(self.program, key);
        } );
        uniformKeys.forEach( function( key ) {
            self.index[ key ] = gl.getUniformLocation( self.program, key);
        } );
    },
    _createShader : function(str, type) {//创建着色器
        var gl = this.gl, shader;
        if (type == "fragment") {
            shader = gl.createShader( gl.FRAGMENT_SHADER );
        } else if (type == "vertex") {
            shader = gl.createShader( gl.VERTEX_SHADER );
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw(type + ':' + gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },
    getBuffer : function() {//获取一个缓冲区
        var buffer = this.gl.createBuffer();
        if( !buffer ) {
            throw 'Failed:缓冲区创建失败';
            return null;
        }
        return buffer;
    },
    rotate : function( x, y, z ) {//旋转
        var tmp = mat4.create();
        mat4.rotateX(this.moduleMatrix, x || 0);
        mat4.rotateY(this.moduleMatrix, y || 0);
        mat4.rotateZ(this.moduleMatrix, z || 0);
    },
    scale : function(x, y, z) {//缩放
        var tmp = mat4.create();
        mat4.scale( this.moduleMatrix, [x || 1, y || 1, z || 1]);
    },
    translate : function(x, y, z) {//移动
        mat4.translate( this.moduleMatrix, [x || 0, y || 0, z || 0]);
    },
    update : function(){
        var tmp = mat4.create();
        mat4.multiply( this.proMatrix , this.viewMatrix , tmp);
        mat4.multiply( tmp , this.moduleMatrix , this.mvpMatrix );
    }
}
function ExtendBaseModle(){}
ExtendBaseModle.prototype = ModleBase.prototype;