;( function() {
/*
    基础模型类
*/
function BaseModule( gl , shader ) {
    this.gl = gl;
    this.childModules = [];//所有与之关联的子模型
    this.proMatrix = mat4.identity( mat4.create() );//投影矩阵
    this.viewMatrix = mat4.identity( mat4.create() );//视图矩阵
    this.moduleMatrix = mat4.identity( mat4.create() );//模型矩阵
    this.mvpMatrix = mat4.identity( mat4.create() );//模型视图投影矩阵，默认为单位矩阵
    this.shader = shader;
}
BaseModule.prototype = {
    constructor : BaseModule,
    perspective : function(fovy, aspect, near, far) {//透视投影
        this.proMatrix = mat4.identity( mat4.create() );
        mat4.perspective(fovy, aspect, near, far, this.proMatrix);
        this.childModules.forEach( function( item ) {
            item.perspective(fovy, aspect, near, far);
        } );
        this._updateMatrix();
    },
    ortho : function(left, right, bottom, top, near, far) {//正视投影
        this.proMatrix = mat4.identity( mat4.create() );
        mat4.ortho(left, right, bottom, top, near, far, this.proMatrix);
        this.childModules.forEach( function( item ) {
            item.ortho(left, right, bottom, top, near, far);
        } );
    },
    lookAt : function( eyeX, eyeY, eyeZ ) {
        mat4.lookAt([eyeX, eyeY, eyeZ],[0,0,-100],[0,1,0], this.viewMatrix);
        this.childModules.forEach( function( item ) {
            item.lookAt( eyeX, eyeY, eyeZ );
        } );
        this._updateMatrix();
    },
    rotate : function( x, y, z ) {//旋转
        mat4.rotateX(this.moduleMatrix, x || 0);
        mat4.rotateY(this.moduleMatrix, y || 0);
        mat4.rotateZ(this.moduleMatrix, z || 0);
        this.childModules.forEach( function( item ) {
            item.rotate( x, y, z );
        } );
        this._updateMatrix();
    },
    scale : function(x, y, z) {//缩放
        mat4.scale( this.moduleMatrix, [x || 1, y || 1, z || 1]);
        this.childModules.forEach( function( item ) {
            item.scale( x, y, z );
        } );
        this._updateMatrix();
    },
    translate : function(x, y, z) {//移动
        mat4.translate( this.moduleMatrix, [x || 0, y || 0, z || 0]);
        this.childModules.forEach( function( item ) {
            item.translate( x, y, z );
        } );
        this._updateMatrix();
    },
    _updateMatrix : function() {
        var tmp = mat4.identity( mat4.create() );
        mat4.multiply( this.proMatrix, this.viewMatrix, tmp);
        mat4.multiply( tmp, this.moduleMatrix, this.mvpMatrix);
    }
}
Core.BaseModule = BaseModule;
} )( Core );