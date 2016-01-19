;( function( Core ) {

var Main = {
    object3d : [],
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
                    boxShader = new Core.BoxShader( gl ),
                    textureShader1 = new Core.TextureShader( gl , imgs ),
                    textureShader2 = new Core.TextureShader( gl , [imgs[0],imgs[0],imgs[0],imgs[0],imgs[0],imgs[0]] ),
                    box1 = new Core.CubeBox( gl, textureShader1),
                    box2 = new Core.CubeBox( gl, textureShader2),
                    box3 = new Core.CubeBox( gl, boxShader);
                box1.childModules.push( box2 );
                box2.childModules.push( box3 );
                box1.perspective(75, Core.util.pix, 0.01, 100);
                box1.lookAt(0,0,0);
                
                box2.translate(0,0.2,-0.7);
                box2.scale( 0.1, 0.1, 0.1);
                
                box3.translate(-2,-3,0);
                //box3.scale( 0.1, 0.1, 0.1);
                //box3.perspective(75, Core.util.pix, 1, 10);
                //box3.lookAt(0,0,1);
                
                
                self.object3d = [box1,box2, box3];
                self.animate( gl );
        });
    },
    animate : function( gl ) {
        var self = this;
        Core.util.clear( gl );
        self.object3d.forEach( function( box , i) {
            i == 1 && box.rotate(0.005, 0.005);
            //i == 2 && box.rotate(0, 0.05);
            i == 0 && box.rotate(0,0.002);
            box.rander();
        } );
        Core.util.Req( function() {
            self.animate( gl );
        } );
    }
}
Main.init();
/*
var gl = Core.util.getgl( '#js_canvas' ),
    eyeZ = 3,
    boxShader = new Core.BoxShader( gl );
    box1 = new Core.CubeBox( gl , boxShader),
    box2 = new Core.CubeBox( gl , boxShader);
box1.perspective( 75, Core.util.pix, 1, 100);
box1.lookAt( 0 , 0, 3 );
box1.translate(-0.5,-0.5,0);
box1.rotate( 45/180*Math.PI, 45/180*Math.PI , 0);

//box2.perspective( 75, Core.util.pix, 1, 100);
box2.ortho(-1,1,-1,1,1,100);
box2.lookAt( 0 , 0, 3 );
box2.translate(0.5,0.5,0);
box2.scale( 0.2, 0.2, 0.2);
function animate() {
    eyeZ += 0.02;
    Core.util.clear( gl );
    
    box1.lookAt( 0 , 0, eyeZ );
    box1.rander();

    box2.rotate( 0.01, 0.01 , 0);
    box2.rander();
    Core.util.Req( animate );
}
Core.util.Req( animate );
*/

} )(Core);