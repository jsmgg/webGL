;( function( Core ) {

var Main = {
    object3d : null,
    start : 0,
    init : function() {
        var self = this,
            gl = Core.util.getgl( '#js_canvas' ),
            shader3 = Core.createParticleShader( gl ),
            box1 = Core.createParticle(gl, shader3),
            box2 = Core.createParticle(gl, shader3),
            box5 = Core.createParticle(gl, shader3);
        box1.translate(5, 5, 0);
        box2.translate(-5, -5, 0);
        box1.perspective( self.fov , Core.util.pix, 1, 100);
        box2.perspective( self.fov , Core.util.pix, 1, 100);
        box5.perspective( self.fov , Core.util.pix, 1, 100);
        //box5.ortho(-1, 1, -1, 1, 1, 100);
        self.object3d = box5;
        self.start = Date.now();
        self.animate( gl );
        self.bindEvent( gl );
        setTimeout( function() {
             box5.childModules.push( box1 );
            setTimeout( function() {
                 box5.childModules.push( box2 );
            }, 700);
        }, 700);
    },
    animate : function( gl ) {
        var self = this, phi, theta,
            radius = 20,
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
        /*self.object3d.childModules[0].rotate(0.01,0.01);
        self.object3d.childModules[1].rotate(-0.01);
        self.object3d.childModules[2].rotate(-0.01, 0.01);*/
        self.object3d.rander( Date.now() - self.start );
        Core.util.Req( function() {
            self.animate( gl );
        } );
    },
    mousedown : false,
    lon : 90,
    lat : 0,
    fov : 45,
    bindEvent : function( gl ) {
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
        $( window ).bind( 'resize' , function() {
            var width = window.innerWidth,
                height = window.innerHeight;
            Core.util.pix = width / height;
            gl.canvas.width = width;
            gl.canvas.height = height;
            gl.viewport(0,0,width,height);
            self.object3d.perspective( self.fov , Core.util.pix, 0.0001, 100);
        } );
    }
}
Main.init();
} )(Core);