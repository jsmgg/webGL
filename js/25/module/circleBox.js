;( function( Core, mat4 ) {
/*
    球体
*/
function CircleBox( gl , shader ){
    Core.BaseModule.call( this, gl, shader );
    var SPHERE_DIV = 64;
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    var positions = [];
    var indices = [];
    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);//x-z平面画圆的半径
        cj = Math.cos(aj);//y坐标
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            positions.push(si * sj);  // X
            positions.push(cj);       // Y
            positions.push(ci * sj);  // Z
        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV+1) + i;//上一圈的点
            p2 = p1 + (SPHERE_DIV+1);//下一圈的点

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);//上一圈第二个点

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);//下一圈第二个点
        }
    }
    this.size = indices.length;
    this.points  = new Float32Array(positions);
    this.indices = new Uint16Array(indices);
    this.colors =  new Float32Array(( function() {
        var colors = [], len = indices.length;
        for( var i = 0; i < len; i++ ) {
            colors.push( 1 );
            colors.push( 1 );
            colors.push( 1 );
            colors.push( 1 );
        }
        return colors;
    } )());
    this.texCoord = new Float32Array(positions);
}
CircleBox.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( CircleBox.prototype, {
    constructor : CircleBox,
    rander : function() {
        var self = this, gl = self.gl,
            index = self.shader.index, buffer = self.shader.buffer;
        self.shader.use();
        gl.uniformMatrix4fv(index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer.u_indices );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, self.indices, gl.STATIC_DRAW);//指定各个面各个顶点索引值
        
        self.initbuffer( index.a_Position, self.points, 3, buffer.a_Position);
        if( self.shader.type === 'BoxShader' ) {
            gl.disable(gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
            if( self.shader.mesh == 'color' ) {
                self.initbuffer( index.a_Color, self.colors, 4, buffer.a_Color);
            }else if( self.shader.mesh == 'light' ) {
                self.initbuffer( index.a_Color, self.colors, 4, buffer.a_Color);
                self.initbuffer( index.a_Normal, self.points, 3, buffer.a_Normal);
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
            gl.enable (gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
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
        gl.frontFace(gl.CW);
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
        gl.drawElements(gl.TRIANGLES, self.size, gl.UNSIGNED_SHORT, 0);
        self.childModules.forEach( function( box ) {
            box !== self && box.rander();
        } );
    }
} );
Core.createCircle = function( gl, shader ) {
    return new CircleBox( gl, shader );
}
} )( Core, mat4 );