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
    this.colors = this.shader.type === 'BoxShader' ? new Float32Array(( function() {
        var colors = [], len = indices.length;
        for( var i = 0; i < len; i++ ) {
            colors.push( 0.5 );
            colors.push( 0.5 );
            colors.push( 0.5 );
            colors.push( 1 );
        }
        return colors;
    } )()) : null;
}
CircleBox.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( CircleBox.prototype, {
    constructor : CircleBox,
    rander : function() {
        var self = this, gl = self.gl;
        self.shader.use();
        gl.uniformMatrix4fv(self.shader.index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.shader.buffer.u_indices );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);//指定各个面各个顶点索引值
        
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
        gl.frontFace(gl.CW);
        gl.enable (gl.BLEND);
        // Set blending function
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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