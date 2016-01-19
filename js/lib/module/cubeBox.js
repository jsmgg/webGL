;( function( Core, mat4 ) {
/*
    正方体
*/
function CubeBox( gl , shader ){
    Core.BaseModule.call( this, gl, shader );
    this.points  = new Float32Array([//顶点坐标
         1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
         1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
         1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
         1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);
    this.indices = new Uint8Array([//每个面的顶点
         0, 1, 2,   0, 2, 3,    // front
         4, 5, 6,   4, 6, 7,    // right
         8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);
    this.size = this.indices.length;
    /*this.colors = new Float32Array([//每个顶点颜色
      0.5, 0.5, 1.0, 0.4,  0.5, 0.5, 1.0, 0.4,  0.5, 0.5, 1.0, 0.4,  0.5, 0.5, 1.0, 0.4,  // v0-v1-v2-v3 front(blue)
      0.5, 1.0, 0.5, 0.4,  0.5, 1.0, 0.5, 0.4,  0.5, 1.0, 0.5, 0.4,  0.5, 1.0, 0.5, 0.4,  // v0-v3-v4-v5 right(green)
      1.0, 0.5, 0.5, 0.4,  1.0, 0.5, 0.5, 0.4,  1.0, 0.5, 0.5, 0.4,  1.0, 0.5, 0.5, 0.4,  // v0-v5-v6-v1 up(red)
      1.0, 1.0, 0.5, 0.4,  1.0, 1.0, 0.5, 0.4,  1.0, 1.0, 0.5, 0.4,  1.0, 1.0, 0.5, 0.4,  // v1-v6-v7-v2 left
      1.0, 1.0, 1.0, 0.4,  1.0, 1.0, 1.0, 0.4,  1.0, 1.0, 1.0, 0.4,  1.0, 1.0, 1.0, 0.4,  // v7-v4-v3-v2 down
      0.5, 1.0, 1.0, 0.4,  0.5, 1.0, 1.0, 0.4,  0.5, 1.0, 1.0, 0.4,  0.5, 1.0, 1.0, 0.4   // v4-v7-v6-v5 back
    ]);*/
    this.colors =  new Float32Array(( function( self ) {
        var colors = [];
        for( var i = 0; i < self.size; i++ ) {
            colors.push( 1 );
            colors.push( 1 );
            colors.push( 1 );
            colors.push( 1 );
        }
        return colors;
    } )( this ));
    this.normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
    this.texCoord = this.points;
}
CubeBox.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( CubeBox.prototype, {
    constructor : CubeBox,
    rander : function( time ) {
        var self = this, gl = self.gl,
            buffer = self.shader.buffer,
            index = self.shader.index;
        self.shader.use();
        gl.uniformMatrix4fv(index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵

        /*
            gl.STATIC_DRAW  //写入一次，绘制多次
            gl.STREAM_DRAW  //写入一次，绘制若干次
            gl.DYNAMIC_DRAW //写入多次，绘制多次
        */
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer.u_indices );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, self.indices, gl.STATIC_DRAW);//指定各个面各个顶点索引值

        self.initbuffer( index.a_Position, self.points, 3, buffer.a_Position);
        if( self.shader.type === 'BoxShader' ) {
            gl.disable(gl.CULL_FACE);//纯色的不需要
            //gl.enable(gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
            if( self.shader.mesh == 'color' ) {
                self.initbuffer( index.a_Color, self.colors, 4, buffer.a_Color);
            }else if( self.shader.mesh == 'light' ) {
                self.initbuffer( index.a_Color, self.colors, 4, buffer.a_Color);
                self.initbuffer( index.a_Normal, self.normals, 3, buffer.a_Normal);
                // Set the light color (white)
                gl.uniform3f(index.u_LightColor, 0.8, 0.8, 0.8);
                // Set the light direction (in the world coordinate)
                gl.uniform3f(index.u_LightPosition, 5.0, 8.0, 7.0);
                // Set the ambient light
                gl.uniform3f(index.u_AmbientLight, 0.2, 0.2, 0.2);
                gl.uniformMatrix4fv(index.u_modelMatrix, false, self.moduleMatrix);
                gl.uniformMatrix4fv(index.u_NormalMatrix, false, self.normalMatrix);
            }
        } else if( self.shader.type === 'TextureShader' ) {
            gl.enable(gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
            gl.activeTexture(gl.TEXTURE0);
            if( self.shader.textureType == 'box' ) {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, buffer.u_Sampler);
            } else {
                gl.bindTexture(gl.TEXTURE_2D, buffer.u_Sampler);
                self.initbuffer( index.a_TexCoord, self.texCoord, 3, buffer.a_TexCoord);
            }
            gl.uniform1i( index.u_Sampler , 0);
        }
        gl.enable(gl.DEPTH_TEST);
        //gl.frontFace(gl.CW);
        gl.enable (gl.BLEND);
        // Set blending function
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
/*
        gl.POINTS
        gl.LINES
        gl.LINE_STRIP
        gl.LINE_LOOP
        gl.TRIANGLES
        gl.TRIANGLE_STRIP
        gl.TRIANGLE_FAN
*/
        gl.drawElements(gl.TRIANGLES, self.size, gl.UNSIGNED_BYTE, 0);
        self.childModules.forEach( function( box ) {
            box !== self && box.rander( time );
        } );
    }
} );
Core.createCube = function( gl, shader ) {
    return new CubeBox( gl, shader );
}
} )( Core, mat4 );