( function() {
/*
    渲染器
*/
function Randerer(){
    var canvas = document.createElement( 'canvas' );
    this.domElement = canvas;
}
Randerer.prototype = {
    setSize : function( width, height ) {
        this.domElement.width = width || 0;
        this.domElement.height = height || 0;
    }
}


} )();