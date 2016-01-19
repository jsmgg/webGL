;( function(Core) {
/*
    纯色着色器
*/
function BoxShader( gl , option ) {
    option = option || {};
    this.type = 'BoxShader';
    this.mesh = option.light ? 'light' : 'color';//纹理类型：color 纯色、light 带光照效果
    var shaderSocure = {
        vshader_common : {
            color : '',
            light : [
                'attribute vec4 a_Normal;',
                'uniform mat4 u_ModelMatrix;',    // 模型矩阵
                'uniform mat4 u_NormalMatrix;',   // 用来变化法向量的矩阵，通过模型矩阵转换而来
                'varying vec3 v_Normal;',
                'varying vec3 v_Position;'
            ].join( '\n' )
        },
        vshader_main : {
            color : '',
            light : [
                //'  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);', 
                // Calculate the vertex position in the world coordinate
                'v_Position = vec3(u_ModelMatrix * a_Position);',
                'v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));'
            ].join( '\n' )
        },
        fshader_common : {
            color : '',
            light : [
                'uniform vec3 u_LightColor;',     // Light color
                'uniform vec3 u_LightPosition;',  // Position of the light source
                'uniform vec3 u_AmbientLight;',   // Ambient light color
                'varying vec3 v_Normal;',
                'varying vec3 v_Position;'
            ].join( '\n' )
        },
        fshader_main : {
            color :  ' gl_FragColor = v_Color;',
            light : [
                // Normalize the normal because it is interpolated and not 1.0 in length any more
                '  vec3 normal = normalize(v_Normal);',
                // Calculate the light direction and make it 1.0 in length
                '  vec3 lightDirection = normalize(u_LightPosition - v_Position);',
                // The dot product of the light direction and the normal
                '  float nDotL = max(dot(lightDirection, normal), 0.0);',
                // Calculate the final color from diffuse reflection and ambient reflection
                '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;',
                '  vec3 ambient = u_AmbientLight * v_Color.rgb;',
                '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);'
            ].join( '\n' )
        }
    }
    this.shader = new Core.Shader( gl, [
        'attribute vec4 a_Position;',
        'attribute vec4 a_Color;',
        shaderSocure.vshader_common[ this.mesh ],
        'uniform mat4 u_MvpMatrix;',//透视模型视图矩阵
        'varying vec4 v_Color;',
        'void main( void ){',
        ' gl_Position = u_MvpMatrix * a_Position;',
        shaderSocure.vshader_main[ this.mesh ],
        ' v_Color = a_Color;',
        '}'
    ].join('\n'), [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        ' precision highp float;',
        '#else',
        ' precision mediump float;',
        '#endif',
        shaderSocure.fshader_common[ this.mesh ],
        'varying vec4 v_Color;',
        'void main( void ){',
        shaderSocure.fshader_main[ this.mesh ],
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
        var self = this,
            attrKeys = {
                color : ['a_Position', 'a_Color'],
                light : ['a_Position', 'a_Normal', 'a_Color']
            }[ self.mesh ],
            uniformKeys = {
                color : ['u_MvpMatrix'],
                light : [
                        'u_MvpMatrix', 'u_ModelMatrix',
                        'u_NormalMatrix', 'u_LightColor',
                        'u_LightPosition', 'u_AmbientLight'
                        ]
            }[ self.mesh ];
        attrKeys.forEach( function( key ) {
            self.index[ key ] = self.shader.attrIndex( key );
        } );
        uniformKeys.forEach( function( key ) {
            self.index[ key ] = self.shader.uniformIndex( key );
        } );
    },
    _initBuffer : function() {//初始化缓冲区
        var self = this, bufferKey = {
            color : ['a_Position', 'a_Color', 'u_indices'],
            light : ['a_Position', 'u_indices', 'a_Color' , 'a_Normal']
        }[ self.mesh ];
        bufferKey.forEach( function( key ) {
            self.buffer[ key ] = self.shader.getBuffer();
        } );
    },
    use : function() {
        this.shader.use();
    }
}
Core.createBoxShader = function( gl , option ) {
    return new BoxShader( gl , option);
}
} )(Core);