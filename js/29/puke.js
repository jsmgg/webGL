;( function( Core, mat4 ) {
/*
    平面
*/
function Puke( gl , shader ){
    Core.BaseModule.call( this, gl, shader );
    this.texCoord = new Float32Array([//纹理坐标
        /*0.141, 1.0, 0,
        0.141, 0.0, 0,
        0.859, 1.0, 0,
        0.859, 0.0,0*/
        0, 1.0, 0,
        0, 0.0, 0,
        1, 1.0, 0,
        1, 0.0,0
    ]);//
    this.points = new Float32Array([
        -1, 0, 1,
        -1, 0, -1,
        1, 0, 1,
        1, 0, -1
    ]);
    this.moveing = false;
    this.z = 4.9;
    this.perspective( 90 , Core.util.pix, 1, 100);
    this.lookAt(0,2,5, [0,-1,0]);
    this.translate(0,0,this.z);
    this.up = false;
    this.startTime = 0;
    this.die = false;
    this.degY = Math.random()*90 * ( parseInt(Math.random()*100) %2 ? 1 : -1);
    this.endX = ( parseInt(Math.random()*100) %2 ? 1 : -1) * Math.random();
    this.endY = ( parseInt(Math.random()*100) %2 ? 1 : -1) * Math.random();
}
Puke.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( Puke.prototype, {
    constructor : Puke,
    rander : function( time ) {
        var self = this, gl = self.gl,
            index = self.shader.index, buffer = self.shader.buffer;
        if( self.die ) return;
        self.animate( time );
        self.shader.use();
        gl.uniformMatrix4fv(index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵
        
        self.initbuffer( index.a_Position, self.points, 3, buffer.a_Position);
        gl.enable (gl.CULL_FACE);//消隐功能，不再绘制反面，默认绘制两面
        gl.activeTexture(gl.TEXTURE0);
        if( self.shader.textureType == 'box' ) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, buffer.u_Sampler);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, buffer.u_Sampler);
            self.initbuffer( index.a_TexCoord, self.texCoord, 3, buffer.a_TexCoord);
        }
        gl.uniform1i( index.u_Sampler , 0);
        gl.enable(gl.DEPTH_TEST);
        /*
            gl.CCW:多边形投影到窗口坐标系下顶点逆时针方向的面为正面[默认值]
            gl.CW:多边形投影到窗口坐标系下顶点顺时针方向的面为正面
        */
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
        //gl.drawElements(gl.TRIANGLES, self.size, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        self.childModules.forEach( function( box ) {
            box !== self && box.rander( time );
        } );
    },
    animate : function( time ) {
        var self = this, maxz = 4.9, minz = 4.8,
            time1 = 1000, time2 = 1500, movetime = 1000;
        if( self.moveing && self.startTime ){
            var t = Math.min(time - self.startTime,movetime),
                x = self.endX > 0 ? Core.tween.Quad.easeIn(t, 0, self.endX*1000, movetime)/100 : -Core.tween.Quad.easeIn(t, 0, -self.endX*1000, movetime)/100,
                
                y = self.endY > 0 ? Core.tween.Quad.easeIn(t, 0, self.endX*1000, movetime)/100 : -Core.tween.Quad.easeIn(t, 0, -self.endY*1000, movetime)/100,
                
                z = (self.z*1000 - Core.tween.Quad.easeIn(t, 0, 50*1000, movetime)) / 1000,
                
                degY = self.degY > 0 ? Core.tween.Quad.easeIn(t, 0, self.degY*1000, movetime)/1000 : -Core.tween.Quad.easeIn(t, 0, -self.degY*1000, movetime)/1000;
            self.setTranslate(x,y,z);
            self.rotate(0,Core.util.degToRad(degY*10),0);
            if( t >= movetime){
                self.die = true;
            }
        }else if( self.startTime ){
            /*
                t: current time（当前时间）；
                b: beginning value（初始值）；
                c: change in value（变化总量）；
                d: duration（持续总时间）。            
            */
            if( self.up ){
                self.z = (maxz*1000 + Core.tween.Sine.easeIn(time - self.startTime, 0, 1000*(maxz - minz), time1)) / 1000;
                if( self.z >= maxz ) {
                    self.z = maxz;
                    self.up = false;
                    self.startTime = time;
                }
            } else {
                self.z = (maxz*1000 - Core.tween.Sine.easeOut(time - self.startTime, 0, 1000*(maxz - minz), time2)) / 1000;
                if( self.z <= minz ){
                    self.z = minz;
                    self.up = true;
                    self.startTime = time;
                }
            }
            self.setTranslate(0,0,self.z);
        }
        self.startTime = self.startTime || time;
        //self.rotate(0,Core.util.degToRad(5),0);
    },
    move : function(){
        this.startTime = 0;
        this.moveing = true;
    }
} );
Core.createPuke = function( gl, shader ) {
    return new Puke( gl, shader );
}
} )( Core, mat4 );