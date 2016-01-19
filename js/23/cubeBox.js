;( function( Core, mat4 ) {
/*
    正方体
*/
function CubeBox( gl , shader ){
    Core.BaseModule.call( this, gl, shader );
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
    /*this.colors = new Float32Array([//每个顶点颜色
      0.5, 0.5, 1.0, 0.4,  0.5, 0.5, 1.0, 0.4,  0.5, 0.5, 1.0, 0.4,  0.5, 0.5, 1.0, 0.4,  // v0-v1-v2-v3 front(blue)
      0.5, 1.0, 0.5, 0.4,  0.5, 1.0, 0.5, 0.4,  0.5, 1.0, 0.5, 0.4,  0.5, 1.0, 0.5, 0.4,  // v0-v3-v4-v5 right(green)
      1.0, 0.5, 0.5, 0.4,  1.0, 0.5, 0.5, 0.4,  1.0, 0.5, 0.5, 0.4,  1.0, 0.5, 0.5, 0.4,  // v0-v5-v6-v1 up(red)
      1.0, 1.0, 0.5, 0.4,  1.0, 1.0, 0.5, 0.4,  1.0, 1.0, 0.5, 0.4,  1.0, 1.0, 0.5, 0.4,  // v1-v6-v7-v2 left
      1.0, 1.0, 1.0, 0.4,  1.0, 1.0, 1.0, 0.4,  1.0, 1.0, 1.0, 0.4,  1.0, 1.0, 1.0, 0.4,  // v7-v4-v3-v2 down
      0.5, 1.0, 1.0, 0.4,  0.5, 1.0, 1.0, 0.4,  0.5, 1.0, 1.0, 0.4,  0.5, 1.0, 1.0, 0.4   // v4-v7-v6-v5 back
    ]);*/
    this.colors = new Float32Array(( function() {
        var colors = [];
        for( var i = 0; i < 36; i++ ) {
            colors = colors.concat( [0.5, 0.5, 1.0, 0.4] );
        }
        return colors;
    } )());
    this.init( gl );
}
CubeBox.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( CubeBox.prototype, {
    constructor : CubeBox,
    init : function( gl ) {
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer() );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);//指定各个面各个顶点索引值
    },
    rander : function() {
        var self = this, gl = self.gl;
        self.shader.use();
        gl.uniformMatrix4fv(self.shader.index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵
        
        gl.bindBuffer( gl.ARRAY_BUFFER, self.shader.buffer.a_Position );
        gl.bufferData( gl.ARRAY_BUFFER, self.points, gl.STATIC_DRAW);
        gl.vertexAttribPointer( self.shader.index.a_Position, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( self.shader.index.a_Position );
        if( self.shader.type === 'BoxShader' ) {
            gl.bindBuffer( gl.ARRAY_BUFFER, self.shader.buffer.a_Color );
            gl.bufferData( gl.ARRAY_BUFFER, self.colors, gl.STATIC_DRAW);
            gl.vertexAttribPointer( self.shader.index.a_Color, 4, gl.FLOAT, false,  0, 0);
            gl.enableVertexAttribArray( self.shader.index.a_Color );
        } else if( self.shader.type === 'TextureShader' ) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, self.shader.buffer.u_Sampler);
            gl.uniform1i( self.shader.index.u_Sampler , 0);
        }
        gl.enable(gl.DEPTH_TEST);
        //gl.frontFace(gl.CW);
        gl.enable (gl.BLEND);
        // Set blending function
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    }
} );
Core.CubeBox = CubeBox;
} )( Core, mat4 );