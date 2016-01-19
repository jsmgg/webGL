;( function(Core) {
/*
    粒子着色器
*/
function ParticleShader( gl ) {
    this.type = 'ParticleShader';
    this.shader = new Core.Shader(gl, [
        'attribute vec4 a_Position;',
        'uniform mat4 u_MvpMatrix;',
        'void main( void ){',
        ' gl_Position = u_MvpMatrix * a_Position;',
        ' gl_PointSize = 2.0;',
        '}'
    ].join( '\n' ),[
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        ' precision highp float;',
        '#else',
        ' precision mediump float;',
        '#endif',
        'uniform vec4 u_Color;',
        'void main(){',
        //' float d = distance(gl_PointCoord, vec2(0.5, 0.5));',
        //' if( d < 0.5 ){',
        '  gl_FragColor = u_Color;',
        //'  } else { discard; }',
        '}'
    ].join( '\n' ));
    this.index = {};
    this.buffer = {};
    this._initIndex();
    this._initBuffer();
}

ParticleShader.prototype = {
    constructor : ParticleShader,
    _initIndex : function() {//初始化各个变量索引值
        var self = this;
        ['a_Position'].forEach( function( key ) {
            self.index[ key ] = self.shader.attrIndex( key );
        } );
        ['u_MvpMatrix', 'u_Color'].forEach( function( key ) {
            self.index[ key ] = self.shader.uniformIndex( key );
        } );
    },
    _initBuffer : function() {//初始化缓冲区
        var self = this;
        ['a_Position'].forEach( function( key ) {
            self.buffer[ key ] = self.shader.getBuffer();
        } );
    },
    use : function() {
        this.shader.use();
    }
}
Core.createParticleShader = function( gl ) {
    return new ParticleShader( gl );
}
} )(Core);