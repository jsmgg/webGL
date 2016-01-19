;( function(Core) {
/*
    自定义模型
*/
function DefineShader( gl ) {
    this.type = 'DefineShader';
    this.shader = new Core.Shader( gl, [
      'attribute vec4 a_Position;',
      'attribute vec4 a_Color;',
      'attribute vec4 a_Normal;',
      'uniform mat4 u_MvpMatrix;',
      'uniform mat4 u_NormalMatrix;',
      'varying vec4 v_Color;',
      'void main() {',
      '  vec3 lightDirection = vec3(-0.35, 0.35, 0.87);',
      '  vec3 color = vec3(1.0, 1.0, 1.0);',
      '  gl_Position = u_MvpMatrix * a_Position;',
      '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));',
      '  float nDotL = max(dot(normal, lightDirection), 0.0);',
      //'  v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);',
      '  v_Color = vec4(color * nDotL, a_Color.a);',
      '}'
    ].join('\n'), [
        '#ifdef GL_ES',
        'precision mediump float;',
        '#endif',
        'varying vec4 v_Color;',
        'void main() {',
        '  gl_FragColor = v_Color;',
        '}'
    ].join('\n'));
    this.index = {};
    this.buffer = {};
    this._initIndex();
    this._initBuffer();
}

DefineShader.prototype = {
    constructor : DefineShader,
    _initIndex : function() {//初始化各个变量索引值
        var self = this;
        ['a_Position', 'a_Normal', 'a_Color'].forEach( function( key ) {
            self.index[ key ] = self.shader.attrIndex( key );
        } );
        ['u_MvpMatrix','u_NormalMatrix'].forEach( function( key ) {
            self.index[ key ] = self.shader.uniformIndex( key );
        } );
    },
    _initBuffer : function() {//初始化缓冲区
        var self = this;
        ['a_Position', 'u_indices', 'a_Color' , 'a_Normal'].forEach( function( key ) {
            self.buffer[ key ] = self.shader.getBuffer();
        } );
    },
    use : function() {
        this.shader.use();
    }
}
Core.createDefineShader = function( gl ) {
    return new DefineShader( gl );
}
} )(Core);