/*
http://vazee.newbalance.com.cn/h5/gallery/game.php?level=2&music=on&prevscore=444.394999999999&name=%E9%A3%8E%E8%BF%87%E6%97%A0%E7%97%95
*/
(function(Core, mat4){
var canvas = $('#js_canvas')[0],
    width = canvas.width,
    height = canvas.height,
    ctx = canvas.getContext('2d');
Core.util.loadImages([
    'img/30/ani.png',
    'img/30/bg.jpg'
],function(imgs){
    //ctx.clear
    var left=0,n=0,
        hmap={
            0 : {h:307,top:0},
            1 : {h:312,top:307},
            2 : {h:310,top:619},
            3 : {h:305,top:929},
            4 : {h:309,top:1234},
            5 : {h:310,top:1543},
            6 : {h:195,top:1853}
        };
    function bgAni(bg){
        left+=(bg.width/100);
        left %= bg.width;
        ctx.drawImage(bg,0,0,bg.width,bg.height,-left,0,bg.width,bg.height);
        ctx.drawImage(bg,0,0,bg.width,bg.height,bg.width-left,0,bg.width,bg.height);
    }
    function manAni(img){
        n%=6;
        //ctx.drawImage(img,0,n*img.height/7,284,img.height/7|0,width/2-284/2,height-300,img.width,img.height);
        ctx.drawImage(img,0,hmap[5-n].top,260,hmap[5-n].h,400,350,260,hmap[5-n].h);
    }
    setInterval(function(){
        n+=1;
    },200);
    function draw(){
        ctx.clearRect(0,0,width,height);
        bgAni(imgs[1]);
        manAni(imgs[0])
        Core.util.Req(draw);
    }
    Core.util.Req(draw);
}, true)

})(Core, mat4);