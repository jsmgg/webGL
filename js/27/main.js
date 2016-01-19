;( function( Core ) {

var Main = {
    object3d : null,
    start : 0,
    init : function() {
        var self = this, gl = Core.util.getgl( '#js_canvas' ),
            shader1 , box ;
        Core.util.loadImages( [ 'img/pano_f.jpg' ] , function( imgs ) {
            shader1 = Core.createTextureShader( gl , imgs ),
            box = Core.createDefine( gl, shader1 , {resources : 'resources/merilin.obj'});
            box.perspective( self.fov , Core.util.pix, self.near, self.far);
            self.object3d = box;
            box.rotate(0,Math.PI/2);
            //box.translate(0, -50);
            self.start = Date.now();
            self.animate( gl );
            self.bindEvent( gl );
        } );
    },
    animate : function( gl ) {
        var self = this, phi, theta,
            radius = 5,
            eyeX, eyeY, eyeZ;
        Core.util.clear( gl );
        if ( self.mousedown === false ) {
            //self.lon += 0.1;
            //self.lat += 0.1;
        }

        self.lat = Math.max( -85, Math.min( 85, self.lat ) );
        phi = Core.util.degToRad( 90 - self.lat );
        theta = Core.util.degToRad( self.lon );
        //self.object3d.rotate(0.01);
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
    near : 1,
    far : 1000,
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
            self.object3d.perspective( fov , Core.util.pix, self.near, self.far);
        } );
        $( window ).bind( 'resize' , function() {
            var width = window.innerWidth,
                height = window.innerHeight;
            Core.util.pix = width / height;
            gl.canvas.width = width;
            gl.canvas.height = height;
            gl.viewport(0,0,width,height);
            self.object3d.perspective( self.fov , Core.util.pix, self.near, self.far);
        } );
    }
}
Main.init();
} )(Core);