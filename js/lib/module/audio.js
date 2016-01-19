;( function( Core, mat4 ) {
 window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
/*
    音频
*/
function Audio( gl , shader ){
    Core.BaseModule.call( this, gl, shader );
    var self = this;
    this.audioContext  = new AudioContext ();
    this.analyser = null;
    this.size = 0 ;
    this.points = null;
    this.color =  new Float32Array([ Math.random(), Math.random(), Math.random() , 1]);
    this.loadSound("resources/test2.mp3", function( dt ) {
        self.audioContext.decodeAudioData(dt, function( buffer ) {
            var audioBufferSouceNode = self.audioContext.createBufferSource(),
                    analyser = self.audioContext.createAnalyser();
            //将source与分析器连接
            audioBufferSouceNode.connect(analyser);
            //将分析器与destination连接，这样才能形成到达扬声器的通路
            analyser.connect(self.audioContext.destination);
            //将上一步解码得到的buffer数据赋值给source
            audioBufferSouceNode.buffer = buffer;
            if (!audioBufferSouceNode.start) {
                audioBufferSouceNode.start = audioBufferSouceNode.noteOn //in old browsers use noteOn method
                audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //in old browsers use noteOn method
            };
            audioBufferSouceNode.start(0);
            audioBufferSouceNode.onended = function(){
                alert(1);
            }
            /*var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);*/
            self.analyser = analyser;
        }, function(e){
            alert(e);
        } );
    }); //调用
    
}
Audio.prototype = Object.create( Core.BaseModule.prototype );
Core.util.extend( Audio.prototype, {
    constructor : Audio,
    rander : function( time ) {
        var self = this, gl = self.gl,
            index = self.shader.index, buffer = self.shader.buffer;
        if( !self.analyser ){
            return;
        }
        self.update();
        self.shader.use();
        gl.uniformMatrix4fv(index.u_MvpMatrix, false, self.mvpMatrix);//设置模型视图投影矩阵

        self.initbuffer( index.a_Position, self.points, 3, buffer.a_Position);
        gl.uniform4fv(index.u_Color, self.color);
        //gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        //gl.frontFace(gl.CW);

        // Set blending function
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
/*
        gl.POINTS
        gl.LINES
        gl.LINE_STRIP
        gl.LINE_LOOP
        gl.TRIANGLES
        gl.TRIANGLE_STRIP
        gl.TRIANGLE_FAN
*/
        gl.drawArrays( gl.POINTS, 0, self.size);
        self.childModules.forEach( function( box ) {
            box !== self && box.rander( time );
        } );
    },
    update : function() {
        var array = new Uint8Array(this.analyser.frequencyBinCount), positions =[], i =0, j=0,k=0;
        this.analyser.getByteFrequencyData(array);
        var len = array.length
        for(; i < len; i++){
            for(;j < len; j++){
                positions[k] =  j*3/len - 1;
                positions[k + 1] = array[j]/300-0.3;
                positions[k + 2] = array[i]/len-2;
                k+=3;
            }
        }
        this.points = new Float32Array( positions );
        //console.log( this.points );
        this.size = this.points.length / 3;
        this.color =  new Float32Array([ Math.random(), Math.random(), Math.random() , 1]);
    },
    loadSound : function(url, fn) {
        var request = new XMLHttpRequest(); //建立一个请求
        request.open('GET', url, true); //配置好请求类型，文件路径等
        request.responseType = 'arraybuffer'; //配置数据返回类型
        // 一旦获取完成，对音频进行进一步操作，比如解码
        request.onload = function() {
            fn( request.response );
        }
        request.send();
    }
} );
Core.createAudio = function( gl, shader ) {
    return new Audio( gl, shader );
}
} )( Core, mat4 );