;( function() {
/*
    基础模型类
*/
function BaseModule( gl , shader ) {
    this.gl = gl;
    this.childModules = [];//所有与之关联的子模型
    this.proMatrix =  mat4.create();//投影矩阵
    this.viewMatrix = mat4.create();//视图矩阵
    this.normalMatrix = mat4.identity( mat4.create() );// 用来变化法向量的矩阵，通过模型矩阵转换而来
    this.moduleMatrix = mat4.identity( mat4.create() );//模型矩阵
    this.mvpMatrix = mat4.identity( mat4.create() );//模型视图投影矩阵，默认为单位矩阵
    this.shader = shader;
    this.module_index = BaseModule.i++;//记录模型索引值
    this.click = false;//当前模型是否被点击
}
BaseModule.i = 1;
BaseModule.prototype = {
    constructor : BaseModule,
    perspective : function(fovy, aspect, near, far) {//透视投影
        var self = this;
        self.proMatrix = mat4.create();
        mat4.perspective(fovy, aspect, near, far, self.proMatrix);
        self.childModules.forEach( function( item ) {
            item !== self && item.perspective(fovy, aspect, near, far);
        } );
        self._updateMatrix();
    },
    ortho : function(left, right, bottom, top, near, far) {//正视投影
        var self = this;
        self.proMatrix = mat4.create();
        mat4.ortho(left, right, bottom, top, near, far, self.proMatrix);
        self.childModules.forEach( function( item ) {
            item !== self && item.ortho(left, right, bottom, top, near, far);
        } );
    },
    lookAt : function( eyeX, eyeY, eyeZ , looked) {
        var self = this;
        self.viewMatrix = mat4.create();
        mat4.lookAt([eyeX, eyeY, eyeZ],looked || [0,0,0],[0,1,0], self.viewMatrix);
        self.childModules.forEach( function( item ) {
            item !== self && item.lookAt( eyeX, eyeY, eyeZ );
        } );
        self._updateMatrix();
    },
    rotate : function( x, y, z ) {//旋转
        var self = this;
        mat4.rotateX(self.moduleMatrix, x || 0);
        mat4.rotateY(self.moduleMatrix, y || 0);
        mat4.rotateZ(self.moduleMatrix, z || 0);
        self.childModules.forEach( function( item ) {
            item !== self && item.rotate( x, y, z );
        } );
        self._updateMatrix();
    },
    setRotate : function( x, y, z ){
        var self = this;
        self.moduleMatrix = mat4.identity( mat4.create() );
        self.rotate(x, y, z);
    },
    scale : function(x, y, z) {//缩放
        var self = this;
        mat4.scale( self.moduleMatrix, [x || 1, y || 1, z || 1]);
        self.childModules.forEach( function( item ) {
            item !== self && item.scale( x, y, z );
        } );
        self._updateMatrix();
    },
    translate : function(x, y, z) {//移动
        var self = this;
        mat4.translate( self.moduleMatrix, [x || 0, y || 0, z || 0]);
        self.childModules.forEach( function( item ) {
            item !== self && item.translate( x, y, z );
        } );
        self._updateMatrix();
    },
    setTranslate: function(x, y, z){
        var self = this;
        self.moduleMatrix = mat4.identity( mat4.create() );
        self.translate(x, y, z);
    },
    _updateMatrix : function() {
        var tmp = mat4.identity( mat4.create() );
        mat4.multiply( this.proMatrix, this.viewMatrix, tmp);
        mat4.multiply( tmp, this.moduleMatrix, this.mvpMatrix);
        mat4.inverse(this.moduleMatrix, tmp);
        this.normalMatrix = mat4.transpose( tmp );
    },
    initbuffer : function( index, data, n, buffer, type) {
        var gl = this.gl;
        gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
        gl.bufferData( gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer( index, n, type || gl.FLOAT, false,  0, 0);
        gl.enableVertexAttribArray( index );
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
    },
    update_click : function( module_index ) {
        this.click = this.module_index == module_index;
    },
    remove : function(){
        var key, buffer = this.shader.buffer,
            gl = this.gl;
        for( key in buffer){
            buffer[key] instanceof WebGLBuffer ? gl.deleteBuffer( buffer[key] ) : gl.deleteTexture( buffer[key] );
        }
        gl.deleteProgram(this.shader.shader.program);
    }
}
Core.BaseModule = BaseModule;
} )( Core );