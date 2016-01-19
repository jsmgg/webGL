;( function( Core ) {

var Main = {
    object3d : null,
    box : null,
    startTime:0,
    num : 0,
    log : null,
    init : function() {
        var self = this;
        Core.util.loadImages([
                'img/25/pano_f.jpg',//x
                'img/25/pano_b.jpg',//x
                'img/25/pano_u.jpg',//y
                'img/25/pano_d.jpg',//y
                'img/25/pano_l.jpg',//z
                'img/25/pano_r.jpg', //z
                'img/puke/puke1.jpg',
                'img/puke/puke.jpg',
                'img/puke/puke2.jpg'
            ], function( imgs ) {
                var gl = Core.util.getgl( '#js_canvas' ),
                    shader = Core.createTextureShader( gl , imgs),
                    box2 = Core.createCircle( gl, shader ),
                    box1;
                self.box = box2;
                box2.perspective( 75 , Core.util.pix, 0.0001, 100);
                //box2.scale(2,2,2);
                box2.lookAt(0,0.1,0.1,[0,0,1]);
                
                self.shader0 = Core.createTextureShader( gl , [imgs[8]]);
                self.shader1 = Core.createTextureShader( gl , [imgs[7]]);
                self.shader2 = Core.createTextureShader( gl , [imgs[6]]);
                box1 = self.get_puke( gl );
                self.object3d = [box1];
                self.startTime = Date.now();
                self.log = $( '#log' );
                self.animate( gl );
                self.bindEvent( gl );
                window.gl = gl;
        });
    },
    get_puke : function( gl ){
        var box = Core.createPuke( gl, this['shader'+this.num%3] );
        return box;
    },
    animate : function( gl ) {
        var self = this, object3d = [];
        self.box.rander();
        self.object3d.forEach( function( item ){
            if( !item.die ){
                item.rander(Date.now() - self.startTime);
                object3d.push( item );
            }
        });
        self.object3d = object3d;
        self.log.html(self.num);
        Core.util.Req( function() {
            self.animate( gl );
        } );
    },
    bindEvent : function( gl ) {
        var self = this,
            oldX, oldY, timer;
        $('#container').bind( 'touchstart,mousedown' , function( e ) {
            var type = e.type;
            if( e.touches && e.touches.length != 1 ) return;
            oldX = type == 'touchstart' ? e.touches[0].pageX : e.pageX,
            oldY = type == 'touchstart' ? e.touches[0].pageY : e.pageY;
            self.mousedown = true;
            e.preventDefault();
            //self.object3d[0].move();
        }).bind( 'touchmove,mousemove' , function( e ) {
            e.preventDefault();
        } ).bind( 'touchend,mouseup' , function( e ) {
            var nowY = e.type == 'touchend' ? e.changedTouches[0].pageY : e.pageY;
            if( oldY - nowY > 5 ){
                self.num+=1;
                self.object3d[self.object3d.length-1].move();
                self.object3d.push(self.get_puke(gl));
            }
            e.preventDefault();
        } );
        $( window ).bind( 'resize' , function() {
            clearTimeout(timer);
            timer = setTimeout( function() {
                var width = window.innerWidth,
                    height = window.innerHeight;
                Core.util.pix = width / height;
                gl.canvas.width = width;
                gl.canvas.height = height;
                gl.viewport(0,0,width,height);
                self.object3d.forEach( function( item ) {
                    item.perspective( 90 , Core.util.pix, 1, 100);
                });
                self.box.perspective( 75 , Core.util.pix, 0.0001, 100);
            }, 100 )
        } );
    }
}
Main.init();
} )(Core);