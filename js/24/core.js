( function( window ) {
var util = {
    width : window.innerWidth,
    height : window.innerHeight,
    pix: window.innerWidth / window.innerHeight,
    dev : window.devicePixelRatio,
    getgl : function( selector ) {
        var ele = document.querySelector( selector ),
            gl,
            attributes = {
                antialias : true
            };
        ele.width = this.width,ele.height = this.height;
        gl = ele.getContext( 'webgl' , attributes ) || ele.getContext( 'experimental-webgl' , attributes );
        //gl.viewport(0,0,this.width * this.dev ,this.height * this.dev);
        gl.viewport(0,0,this.width,this.height);
        return gl;
    },
    extend : function( old, obj ) {//一层复制
        for( var k in obj) {
            old[ k ] = obj[ k ];
        }
    },
    clear : function( gl , fig ) {
        !fig && gl.clearColor(.0, .0, .0, 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BYTE);
    },
    loadImages : function( srcs, fn) {
        var len = srcs.length, objs = [];
        srcs.forEach( function( src, i) {
            load( src, i);
        } );
        function load( src , i){
            var img = new Image();
            img.onload = function() {
                objs[ i ] = img;
                len-=1;
                if( len == 0) {
                    fn( objs );
                }
            }
            img.src = src;
        }
    },
    Req : (function( win ) {
        var req = win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.oRequestAnimationFrame ||
            win.msRequestAnimationFrame ||
            function(b){setTimeout(b, 1000/60)};
        return function( fn ){
            req( fn );
        }
    })( window ),
    degToRad : function( deg ) {
        return deg * Math.PI / 180;
    }
};
window.Core = {
    util : util
}
} )( window )