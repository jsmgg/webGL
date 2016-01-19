;( function( Core, mat4 ) {
/*
    自定义模型
*/
function DefineBox( gl , shader , options ){
    Core.BaseModule.call( this, gl, shader );
    this.size = 0;
    this.objDoc = null;
    this.init( options.resources );
}
DefineBox.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( DefineBox.prototype, {
    constructor : DefineBox,
    init : function( fileName ) {
        var self = this;
        Core.util.ajax(fileName, function( dt ) {
            self.objDoc = Core.createOBJDoc( fileName );
            var result = self.objDoc.parse(dt, 1, true); // Parse the file
            if (!result) {
                self.objDoc = null;
                throw("OBJ file parsing error.");
                return;
            }
        } );
    },
    rander : function( time ) {
        var self = this, gl = self.gl, drawingInfo,
            index = self.shader.index,
            buffer = self.shader.buffer;
        if( self.objDoc && self.objDoc.isMTLComplete()) {
            drawingInfo = self.objDoc.getDrawingInfo();
            self.initbuffer( index.a_Position, drawingInfo.vertices, 3, buffer.a_Position);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.u_indices);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
            self.size = drawingInfo.indices.length;
            if( self.shader.type === 'DefineShader' ) {
                self.initbuffer( index.a_Color, drawingInfo.colors, 4, buffer.a_Color);
                self.initbuffer( index.a_Normal, drawingInfo.normals, 3, buffer.a_Normal);
            } else if( self.shader.type === 'TextureShader' ) {
                gl.enable (gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
                gl.activeTexture(gl.TEXTURE0);
                if( self.shader.textureType == 'box' ) {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, buffer.u_Sampler);
                } else {
                    gl.bindTexture(gl.TEXTURE_2D, buffer.u_Sampler);
                    self.initbuffer( index.a_TexCoord, drawingInfo.textures, 3, buffer.a_TexCoord);
                }
                gl.uniform1i( index.u_Sampler , 0);
            } else if( self.shader.type === 'BoxShader' ) {
                gl.disable(gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
                if( self.shader.mesh == 'color' ) {
                    self.initbuffer( index.a_Color, drawingInfo.colors, 4, buffer.a_Color);
                }else if( self.shader.mesh == 'light' ) {
                    self.initbuffer( index.a_Color, drawingInfo.colors, 4, buffer.a_Color);
                    self.initbuffer( index.a_Normal, drawingInfo.normals, 3, buffer.a_Normal);
                    // Set the light color (white)
                    gl.uniform3f(index.u_LightColor, 0.8, 0.8, 0.8);
                    // Set the light direction (in the world coordinate)
                    gl.uniform3f(index.u_LightPosition, 5.0, 8.0, 7.0);
                    // Set the ambient light
                    gl.uniform3f(index.u_AmbientLight, 0.2, 0.2, 0.2);
                    gl.uniformMatrix4fv(index.u_modelMatrix, false, self.moduleMatrix);
                    gl.uniformMatrix4fv(index.u_NormalMatrix, false, self.normalMatrix);
                }
            }
            self.objDoc = null;
        }
        self.shader.use();
        gl.uniformMatrix4fv(index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵
        gl.uniformMatrix4fv(index.u_NormalMatrix, false, self.normalMatrix);//设置法向量变换矩阵
        
        gl.disable(gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
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
        gl.drawElements(gl.TRIANGLES, self.size, gl.UNSIGNED_SHORT, 0);
        self.childModules.forEach( function( box ) {
            box !== self && box.rander( time );
        } );
    }
} );
Core.createDefine = function( gl, shader , options ) {
    return new DefineBox( gl, shader , options );
}
} )( Core, mat4 );