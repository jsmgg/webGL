;( function( Core ) {
/*
    带纹理的着色器
*/
function TextureShader( gl , images) {
    this.type = 'TextureShader';
    this.shader = new Core.Shader( gl, [
        'attribute vec3 a_Position;',
        'uniform mat4 u_MvpMatrix;',//透视模型视图矩阵
        'varying vec3 v_Color;',
        'void main( void ){',
        ' gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);',
        ' v_Color = a_Position;',
        '}'
    ].join('\n'), [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        ' precision highp float;',
        '#else',
        ' precision mediump float;',
        '#endif',
        'uniform samplerCube u_Sampler;',
        'varying vec3 v_Color;',
        'void main( void ){',
        '  gl_FragColor = textureCube(u_Sampler,v_Color);',
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
        var self = this;
        ['a_Position'].forEach( function( key ) {
            self.index[ key ] = self.shader.attrIndex( key );
        } );
        ['u_MvpMatrix', 'u_Sampler'].forEach( function( key ) {
            self.index[ key ] = self.shader.uniformIndex( key );
        } );
    },
    _initBuffer : function( gl ) {//初始化缓冲区
        this.buffer[ 'a_Position' ] = this.shader.getBuffer();//顶点缓冲区
        this.buffer[ 'u_Sampler' ] = gl.createTexture();//纹理缓冲区
        this.buffer[ 'u_indices' ] = this.shader.getBuffer();//顶点索引缓冲区
    },
    _initTextures : function( gl , images) {//初始化各个面纹理
        var textureObject = this.buffer.u_Sampler;
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP,textureObject);
        ///////////////  具体参数设置参考书上168行 ////////////////////
        // 指定纹理放大及缩小方式
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.NEAREST);
        //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        
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
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[0]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[1]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[2]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[3]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[4]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[5]);
    },
    use : function() {
        this.shader.use();
    }
}

Core.createTextureShader = function( gl , images ) {
    return new TextureShader( gl , images );
}
} )( Core );