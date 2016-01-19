;( function( Core ) {
/*
    带立方体纹理的着色器
*/
function TextureShader( gl , images) {
    this.type = 'TextureShader';
    this.textureType = images.length > 1 ? 'box' : 'face';
    this.shader = new Core.Shader( gl, [
        'attribute vec3 a_Position;',
        'uniform mat4 u_MvpMatrix;',
        this.textureType == 'box' ? 'varying vec3 v_Color;' : ('varying vec3 v_TexCoord;\n' + 'attribute vec3 a_TexCoord;'),
        'void main( void ){',
        ' gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);',
        this.textureType == 'box' ? ' v_Color = a_Position;' : ' v_TexCoord = a_TexCoord;',
        '}'
    ].join('\n'), [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        ' precision highp float;',
        '#else',
        ' precision mediump float;',
        '#endif',
        this.textureType == 'box' ? 'uniform samplerCube u_Sampler;' :('uniform sampler2D u_Sampler;\n' + 'varying vec3 v_TexCoord;'),
        'varying vec3 v_Color;',
        'void main( void ){',
        this.textureType == 'box' ? '  gl_FragColor = textureCube(u_Sampler,v_Color);' : ' gl_FragColor = texture2D(u_Sampler,vec2( v_TexCoord ));',
        '}'
    ].join('\n'));
    this.index = {};
    this.buffer = {};
    this._initIndex();
    this._initBuffer( gl );
    this._initTextures( gl , images);
}

TextureShader.prototype = {
    constructor : TextureShader,
    _initIndex : function() {//初始化各个变量索引值
        var self = this,
            attrIndex = {
                box : ['a_Position'],
                face : ['a_Position', 'a_TexCoord']
            }[self.textureType],
            unfiormIndex = {
                box : ['u_MvpMatrix', 'u_Sampler'],
                face :['u_MvpMatrix', 'u_Sampler']
            }[self.textureType];
        attrIndex.forEach( function( key ) {
            self.index[ key ] = self.shader.attrIndex( key );
        } );
        unfiormIndex.forEach( function( key ) {
            self.index[ key ] = self.shader.uniformIndex( key );
        } );
    },
    _initBuffer : function( gl ) {//初始化缓冲区
        var self = this,
            bufferkey = {
                box : ['a_Position', 'u_Sampler', 'u_indices'],
                face : ['a_Position', 'u_Sampler', 'u_indices', 'a_TexCoord']
            }[self.textureType];
        bufferkey.forEach( function( key ) {
            self.buffer[ key ] = key == 'u_Sampler' ? gl.createTexture() : self.shader.getBuffer();
        } );
        
    },
    _initTextures : function( gl , images) {//初始化各个面纹理
        var textureObject = this.buffer.u_Sampler;
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        if( this.textureType == 'box' ){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP,textureObject);
            ///////////////  具体参数设置参考书上168行 ////////////////////
            // 指定纹理放大及缩小方式
            //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.NEAREST);
            //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            
            // 制定纹理包裹方式
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
            //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
            //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            
            /*
                gl.RGB: 图像内部格式
                gl.RGB：纹理数据格式，必须与图像内部格式相同
                gl.UNSIGNED_BYTE:纹理数据类型，还有其他类型：
                    gl.UNSIGNED_BYTE：无符号整型，每个颜色分量占用一个字节
                    gl.UNSIGNED_SHORT_5_6_5: RGB每个分量分别占用5,6，5比特
                    gl.UNSIGNED_SHORT_4_4_4_4: RGBA每个分量分别占用4,4,4,4比特
                    gl.UNSIGNED_SHORT_5_5_5_1:RGBA每个分量分别占用5,5,5,1比特
                    
            */
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[0]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[1]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[2]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[3]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[4]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[5]);
        } else {
            //gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.bindTexture(gl.TEXTURE_2D,textureObject);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);
            /*gl.bindTexture( gl.TEXTURE_2D, textureObject);
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);*/
        }
    },
    use : function() {
        this.shader.use();
    }
}

Core.createTextureShader = function( gl , images ) {
    return new TextureShader( gl , images );
}
} )( Core );