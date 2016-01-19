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
                /*
                alpha 默认真。如真绘图缓存带有alpha信道用于OpenGL 
                目标alpha操作和页面的复合。如假aplha信道不存在。

                depth 默认真。如真绘图缓存带有最少16位的深度缓存。如
                假深度缓存不存在。

                stencil 默认假。如真绘图缓存带有最少8位的模板缓存。如
                假模板缓存不存在。

                antialias 默认真。如真支持抗锯齿绘图缓存的实现使用其选
                择的技术多采样/超采样和质量执行抗锯齿操作。如假或实
                现不支持抗锯齿操作不做抗锯齿操作。

                premultipliedAlpha 默认真。如真页面复合器假定绘图缓存的
                颜色带有预乘的alpha值。如假页面复合器假定绘图缓存的颜色
                没有预乘。如果alpha设置为假此设置忽略。见 Premultiplied 
                Alpha 关于 premultipliedAlpha 效果的更多资料。

                preserveDrawingBuffer 默认假。如假当绘图缓存如 Drawing 
                Buffer 一节所示时绘图缓存的内容清为默认值。所有绘图缓存
                的元素颜色深度和模板被清空。如真缓存不清空保持
                其值直到被作者清除或覆盖。 某些硬件设置 
                preserveDrawingBuffer 为真会有严重的性能影响。
                */
                alpha: false,//是否可以设置透明
                depth: true,//深度缓存
                stencil: true,//模板缓存
                antialias: true,//去锯齿
                premultipliedAlpha: true,
                preserveDrawingBuffer: false //是否清除图片缓冲区
            };
        ele.width = this.width,ele.height = this.height;
        gl = ele.getContext( 'webgl' , attributes ) || ele.getContext( 'experimental-webgl' , attributes );
        gl.canvas = ele;
        //gl.viewport(0,0,this.width * this.dev ,this.height * this.dev);
        gl.viewport(0,0,this.width,this.height);
        return gl;
    },
    extend : function( old, obj ) {//一层复制
        for( var k in obj) {
            old[ k ] = obj[ k ];
        }
    },
    clear : function( gl, color ) {
        color ? gl.clearColor( color[0] || 0, color[1] || 0, color[2] || 0, color[3] || 1) : gl.clearColor(.0, .0, .0, 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BYTE);
    },
    loadImages : function( srcs, fn, fig) {
        var len = srcs.length, objs = [];
        srcs.forEach( function( src, i) {
            load( src, i);
        } );
        function load( src , i){
            var img = new Image();
            img.onload = function() {
                if(fig){
                    objs[ i ] = img;
                }else{
                    var canvas = document.createElement( 'canvas' ),
                        h = img.height, w= img.width, ctx,
                        l = Math.max(h,w);
                    canvas.width = canvas.height = l;
                    //document.body.appendChild(canvas);
                    ctx = canvas.getContext( '2d' );
                    ctx.clearRect(0,0,l,l);
                    ctx.drawImage(img, (h > w ? (h-w) / 2 : (w-h) / 2) | 0 , 0);
                    objs[ i ] = canvas;
                }
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
    },
    ajax : function(url, fn) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            fn(request.responseText);
        }
        }
        request.open('GET', url, true);
        request.send();  
    }
};
window.Core = {
    util : util
}
} )( window )