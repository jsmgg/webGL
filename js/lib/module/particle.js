;( function( Core, mat4 ) {
/*
    粒子系统
*/
function Particle( gl , shader ){
    Core.BaseModule.call( this, gl, shader );
    this.SPHERE_DIV = 36000;
    this._init();
}
Particle.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( Particle.prototype, {
    constructor : Particle,
    _init : function() {
        this.positions = this.get_points();
        this.points  = new Float32Array( this.positions );
        this.size = this.points.length / 3 ;
        this.a = 1;
        this.g = 0.02;
        this.v = 0;
        this.color =  new Float32Array([ Math.random(), Math.random(), Math.random() , this.a]);
        this.time = 0;
    },
    rander : function( time ) {
        var self = this, gl = self.gl,
            index = self.shader.index, buffer = self.shader.buffer;
        if( self.a<=-0.5 ){
            self._init();
            self.time = time;
        }
        self.update( time );
        self.shader.use();
        gl.uniformMatrix4fv(index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵

        self.initbuffer( index.a_Position, self.points, 3, buffer.a_Position);
        gl.uniform4fv(index.u_Color, self.color);
        //gl.enable(gl.DEPTH_TEST);
        gl.enable (gl.BLEND);
        //gl.frontFace(gl.CW);

        // Set blending function
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
/*
        gl.POINTS
        gl.LINES
        gl.LINE_STRIP
        gl.LINE_LOOP
        gl.TRIANGLES
        gl.TRIANGLE_STRIP
        gl.TRIANGLE_FAN
*/
        gl.drawArrays( gl.POINTS, 0, self.size);
        self.childModules.forEach( function( box ) {
            box !== self && box.rander( time );
        } );
    },
    get_points : function( ) {
        var SPHERE_DIV = this.SPHERE_DIV,
            positions = [];
          for(i=0; i<SPHERE_DIV; i+=3){
            var a,b,l,r,x,y,z;
            //以0.15的半径随机产生爆炸方向和速度，也就是随机产生球体内坐标
            b=Math.random()*Math.PI*2,a=Math.acos(1-2*Math.random()),
            l=Math.sin(a),y=Math.cos(a),x=Math.sin(b)*l,z=Math.cos(b)*l;
            r=Math.random()*0.15;
            positions[i]=x*r, positions[i+1]=y*r, positions[i+2]=z*r;
          };
          return positions;
    },
    update : function( time ) {
        var i, len = this.SPHERE_DIV;
        this.v += this.g;
        for( i = 0 ; i < len; i+=3) {
            this.points[ i ] += this.positions[ i ];
            this.points[ i + 1 ] += (this.positions[ i + 1 ] - this.v);
            this.points[ i + 2 ] += this.positions[ i + 2 ];
        }
        this.a -= 0.02;
        //this.color =  new Float32Array([ Math.random(), Math.random(), Math.random() , this.a]);
        //this.color[3] = this.a;
    }
} );
Core.createParticle = function( gl, shader ) {
    return new Particle( gl, shader );
}
} )( Core, mat4 );