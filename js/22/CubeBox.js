(function(window, mat4) {

function CubeBox(gl) {//普通颜色正方体
    ModleBase.call( this, gl);
    this.pointBuffer = null;
    this.colorBuffer = null;
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
    this.colors = new Float32Array( this._getColor() );//各个顶点颜色
    this.init();
}
CubeBox.prototype = new ExtendBaseModle();
util.extend( CubeBox.prototype , {
    constructor : CubeBox,
    init : function() {
        var gl = this.gl;
        //this.initShader();
        this.lookAt();
        this.pointBuffer = gl.createBuffer();//顶点缓冲区
        gl.bindBuffer( gl.ARRAY_BUFFER, this.pointBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
        gl.vertexAttribPointer( this.index.a_Position, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( this.index.a_Position );
        
        this.colorBuffer = gl.createBuffer();//颜色缓冲区
        gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer( this.index.a_Color, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( this.index.a_Color );

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer() );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);//制定各个面各个顶点索引值
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
    _getColor : function() {
        var tmp, colors = [];
        for(var i = 0; i < 6; i++) {
            tmp = [ Math.random().toFixed( 2 ), Math.random().toFixed( 2 ), Math.random().toFixed( 2 ) ];
            for(var y =0; y < 6; y++) {
                colors = colors.concat( tmp );
            }
        }
        console.log( colors.length );
        return colors;
    },
    update : function() {
        var self = this, gl = self.gl, tmp = mat4.create();
        mat4.multiply( self.proMatrix , self.viewMatrix , tmp);
        mat4.multiply( tmp , self.moduleMatrix , self.mvpMatrix );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, self.pointBuffer );
        gl.vertexAttribPointer( self.index.a_Position, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( self.index.a_Position );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, self.colorBuffer );
        gl.vertexAttribPointer( self.index.a_Color, 3, gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( self.index.a_Color );
        
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CW);

        gl.uniformMatrix4fv(self.index.u_MvpMatrix, false, self.mvpMatrix);
        gl.uniform1f( self.index.u_ShadowModeIndex , 2.0 );
        //util.clear( gl );
        // 绘制三角形
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    }
});
window.CubeBox = CubeBox;
})(window, mat4);