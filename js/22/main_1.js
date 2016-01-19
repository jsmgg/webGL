(function($, mat4) {
window.onerror = function(msg, url, n) {
    alert(msg+'\n'+url+'\n error line:'+n);
}
var Main = {
    textureBox : null,
    cubeBox : null,
    init : function() {
        var self = this, time = Date.now();
        util.loadImages([
                'img/22/pano_f.jpg',//x
                'img/22/pano_b.jpg',//x
                'img/22/pano_u.jpg',//y
                'img/22/pano_d.jpg',//y
                'img/22/pano_l.jpg',//z
                'img/22/pano_r.jpg' //z
            ], function( imgs ) {
                var gl = util.getgl( '#js_canvas' );
                self.textureBox = new TextureBox( gl , {images : imgs} );
                self.cubeBox = new CubeBox( gl );
                self.bindEvent( gl );
        });
    },
    bindEvent : function( gl ) {
        var self = this, textureBox = self.textureBox, eyeZ = 0,
            cubeBox = self.cubeBox,
            canmove = 0, ox, oy;
        cubeBox.translate(-0.2, -0.2, -1);
        cubeBox.scale( 0.1, 0.1, 0.1);
        $( window ).bind( 'keydown', function( e ){
            var cut = 0.0314;
            if(e.keyCode == 37) {//左
                textureBox.rotate(0, cut, 0);
            } else if( e.keyCode == 39 ) {//右
                textureBox.rotate(0, -cut, 0);
            } else if( e.keyCode == 38) {//上
                textureBox.rotate(-cut, 0, 0);
            } else if( e.keyCode == 40 ) {//下
                textureBox.rotate(+cut, 0, 0);
            }
        } ).bind( 'mousewheel', function( e ) {
            var wheelDelta = e.wheelDelta;
            eyeZ += wheelDelta/5000;
            eyeZ = Math.max(eyeZ, - 0.95);
            eyeZ = Math.min(eyeZ, 0.95);
            textureBox.lookAt( eyeZ );
        } ).bind( 'mousedown,touchstart', function( e ) {
            canmove = true;
            ox = e.type == 'touchstart' ? e.touches[0].pageX : e.pageX, oy = e.type == 'touchstart' ? e.touches[0].pageY : e.pageY;
            e.preventDefault();
        } ).bind( 'mousemove,touchmove', function( e ) {
            if( canmove ) {
                var nx = e.type == 'touchmove' ? e.touches[0].pageX : e.pageX, ny = e.type == 'touchmove' ? e.touches[0].pageY : e.pageY,
                    fit = 250 * window.devicePixelRatio, u = nx - ox,
                    rotateX , rotateY;
                rotateY = - u / fit ;
                u = ny - oy;
                rotateX = - u / fit;
                textureBox.rotate(rotateX,rotateY,0);
                ox = nx, oy = ny;
                $( '#log' ).html('nx:'+nx+';ny:'+ny);
                e.preventDefault();
            }
        }).bind( 'mouseout,mouseup,touchend' , function( e ) {
            canmove = false;
            e.preventDefault();
        } );
        
        function animate() {
            util.clear( gl );
            textureBox.rotate(0,0.001,0);
            //cubeBox.rotate(Math.random() * 0.01, Math.random() * 0.01, Math.random() * 0.01);
            cubeBox.rotate( 0.01 , 0.01 , 0);
            //cubeBox.translate(0, 0, -0.001);
            cubeBox.update();
            textureBox.update();
            util.Req( animate );
        }
        util.Req( animate );
        
    }
}

Main.init();

})($, mat4);