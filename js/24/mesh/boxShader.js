;( function(Core) {
/*
    纯色着色器
*/
function BoxShader( gl ) {
    this.type = 'BoxShader';
    this.shader = new Core.Shader( gl, [
        'attribute vec3 a_Position;',
        'attribute vec4 a_Color;',
        'uniform mat4 u_MvpMatrix;',//透视模型视图矩阵
        'varying vec4 v_Color;',
        'void main( void ){',
        ' gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);',
        ' v_Color = a_Color;',
        '}'
    ].join('\n'), [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        ' precision highp float;',
        '#else',
        ' precision mediump float;',
        '#endif',
        'varying vec4 v_Color;',
        'void main( void ){',
        '  gl_FragColor = v_Color;',
        '}'
    ].join('\n'));
    this.index = {};
    this.buffer = {};
    this._initIndex();
    this._initBuffer();
}

BoxShader.prototype = {
    constructor : BoxShader,
    _initIndex : function() {//初始化各个变量索引值
        var self = this;
        ['a_Position', 'a_Color'].forEach( function( key ) {
            self.index[ key ] = self.shader.attrIndex( key );
        } );
        ['u_MvpMatrix'].forEach( function( key ) {
            self.index[ key ] = self.shader.uniformIndex( key );
        } );
    },
    _initBuffer : function() {//初始化缓冲区
        this.buffer[ 'a_Position' ] = this.shader.getBuffer();//顶点缓冲区
        this.buffer[ 'a_Color' ] = this.shader.getBuffer();//颜色缓冲区
        this.buffer[ 'u_indices' ] = this.shader.getBuffer();//顶点索引缓冲区
    },
    use : function() {
        this.shader.use();
    }
}
Core.createBoxShader = function( gl ) {
    return new BoxShader( gl );
}
} )(Core);