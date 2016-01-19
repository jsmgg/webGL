;( function( Core ) {

var Main = {
    object3d : null,
    init : function() {
        var self = this;
        Core.util.loadImages([
                'img/22/pano_f.jpg',//x
                'img/22/pano_b.jpg',//x
                'img/22/pano_u.jpg',//y
                'img/22/pano_d.jpg',//y
                'img/22/pano_l.jpg',//z
                'img/22/pano_r.jpg' //z
            ], function( imgs ) {
                var gl = Core.util.getgl( '#js_canvas' ),
                    shader1 = Core.createBoxShader( gl ),
                    shader2 = Core.createTextureShader( gl , imgs),
                    box1 = Core.createCircle( gl, shader2 ),
                    box2 = Core.createCube( gl, shader1 );
                    box3 = Core.createCircle( gl, shader2);
                box1.childModules.push( box2 );
                box1.childModules.push( box3 );
                box1.perspective( self.fov , Core.util.pix, 0.0001, 100);
                //box1.lookAt(0,0,0);
                box2.translate(-0.1, 0, -0.5);
                box2.scale( 0.1, 0.1, 0.1);
                box3.translate(0.1, 0, -1);
                box3.scale( 0.1, 0.1, 0.1);
                self.object3d = box1;
                self.animate( gl );
                self.bindEvent();
        });
    },
    animate : function( gl ) {
        var self = this, phi, theta,
            radius = 0.5,
            eyeX, eyeY, eyeZ;
        Core.util.clear( gl );
        if ( self.mousedown === false ) {
            self.lon += 0.01;
        }

        self.lat = Math.max( -85, Math.min( 85, self.lat ) );
        phi = Core.util.degToRad( 90 - self.lat );
        theta = Core.util.degToRad( self.lon );

        eyeX = Math.sin( phi ) * Math.cos( theta ) * radius;
        eyeY = Math.cos( phi ) * radius;
        eyeZ = Math.sin( phi ) * Math.sin( theta ) * radius;
        self.object3d.lookAt( eyeX, eyeY, eyeZ );
        self.object3d.childModules[0].rotate(0.01);
        self.object3d.childModules[1].rotate(-0.01);
        self.object3d.rander();
        
        Core.util.Req( function() {
            self.animate( gl );
        } );
    },
    mousedown : false,
    lon : 90,
    lat : 0,
    fov : 75,
    bindEvent : function() {
        var self = this,
            oldX, oldY,
            eyeX, eyeY, eyeZ;
        $(document).bind( 'touchstart,mousedown' , function( e ) {
            var type = e.type;
            if( e.touches && e.touches.length != 1 ) return;
            oldX = type == 'touchstart' ? e.touches[0].pageX : e.pageX,
            oldY = type == 'touchstart' ? e.touches[0].pageY : e.pageY;
            self.mousedown = true;
            e.preventDefault();
        }).bind( 'touchmove,mousemove' , function( e ) {
            if( !self.mousedown || ( e.touches && e.touches.length != 1 ))return;
            var type = e.type,
                nowX = type == 'touchmove' ? e.touches[0].pageX : e.pageX,
                nowY = type == 'touchmove' ? e.touches[0].pageY : e.pageY;
            self.lon += ( oldX - nowX ) / Core.util.dev;//反过来
            self.lat += ( oldY - nowY) / Core.util.dev;//反过来
            oldX = nowX, oldY = nowY;
            e.preventDefault();
        } ).bind( 'touchend,mouseup' , function( e ) {
            self.mousedown = false;
        } ).bind( 'mousewheel' , function( e ) {
            var fov = self.fov - event.wheelDeltaY * 0.05;
            fov = Math.max(1, fov);
            fov = Math.min(130, fov);
            self.fov = fov;
            self.object3d.perspective( fov , Core.util.pix, 0.0001, 100);
        } );
    }
}
Main.init();
} )(Core);