(function(window, mat4) {

function TextureBox(gl, option){//带纹理的立方体
    option = option || {};
    ModleBase.call( this, gl);
    this.textureObject = null;//纹理缓冲区
    this.pointBuffer = null;//顶点缓冲区
    this.images = option.images || [];//纹理图片
    this.points  = new Float32Array([//顶点坐标
         1,  1,  1,
        -1,  1,  1,
        -1, -1,  1,
         1, -1,  1,
         1, -1, -1,
         1,  1, -1,
        -1,  1, -1,
        -1, -1, -1
    ]);
    this.indices = new Uint8Array([//每个面的顶点
        0, 1, 2, 0, 2, 3,//前
        0, 3, 4, 0, 4, 5,//右
        0, 5, 6, 0, 6, 1,//上
        1, 6, 7, 1, 7, 2,//左
        7, 4, 3, 7, 3, 2,//下
        4, 7, 6, 4, 6, 5 //后
    ]);
    this.init();
}
TextureBox.prototype = new ExtendBaseModle();
util.extend( TextureBox.prototype , {
    constructor : TextureBox,
    init : function() {
        var gl = this.gl;
        //this.initShader();
        this.pointBuffer = gl.createBuffer();//顶点缓冲区
        gl.bindBuffer( gl.ARRAY_BUFFER, this.pointBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
        gl.vertexAttribPointer( this.index.a_Position, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( this.index.a_Position );
       
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer() );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);//制定各个面各个顶点索引值
        
        
        this.initTextures();//创建纹理，并绑定纹理数据
        this.lookAt();//设置模型视图投影矩阵
        this.update();
    },
    initTextures : function() {//初始化各个面纹理
        var gl            = this.gl,
            images        = this.images,
            textureObject = gl.createTexture();
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP,textureObject);
        // 指定纹理放大及缩小方式
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.NEAREST);
        // 制定纹理包裹方式
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[0]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[1]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[2]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[3]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[4]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,images[5]);
        this.textureObject = textureObject;
    },
    lookAt : function( eyeZ ) {
        var deg = 75, tmp = mat4.create();
        this.mvpMatrix = mat4.identity( mat4.create() );
        eyeZ = eyeZ || 0;
        eyeZ = -eyeZ;
        eyeZ = Math.max(eyeZ, - 0.95);
        eyeZ = Math.min(eyeZ, 0.95);
        mat4.lookAt([0, 0, eyeZ],[0,0,-3],[0,1,0], this.viewMatrix);
        deg = deg + ( eyeZ * deg );
        mat4.perspective(deg, util.pix, 0.01, 10, this.proMatrix);
        mat4.multiply( this.proMatrix, this.viewMatrix, tmp);
        mat4.multiply( tmp, this.moduleMatrix, this.mvpMatrix);
    },
    update : function() {
        var self = this, gl = self.gl, tmp = mat4.create();
        mat4.multiply( self.proMatrix , self.viewMatrix , tmp);
        mat4.multiply( tmp , self.moduleMatrix , self.mvpMatrix );
        gl.bindBuffer( gl.ARRAY_BUFFER, self.pointBuffer );
        gl.vertexAttribPointer( self.index.a_Position, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( self.index.a_Position );


        // 激活纹理
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, self.textureObject);
        gl.uniform1i( self.index.u_Sampler , 0);
        
        
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CW);

        gl.uniformMatrix4fv(self.index.u_MvpMatrix, false, self.mvpMatrix);
        gl.uniform1f( self.index.u_ShadowMode , 1.0 );
        //util.clear( gl );
        // 绘制三角形
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
        //卸载纹理
        //gl.activeTexture(gl.TEXTURE0));
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
});

window.TextureBox = TextureBox;
})(window, mat4);