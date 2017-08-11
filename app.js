const WebSocket = require('ws');

// 引用Server类:
const WebSocketServer = WebSocket.Server;

// 实例化:
const wss = new WebSocketServer({
    port: 4000
});

var CLIENTS = [];
var KEYS = {};

wss.on('connection', function (ws) {
    /*console.log(`[SERVER] connection()`);
    CLIENTS.push(ws);
    if( !ws._key ) {
      ws._key = 'rand'+Date.now();
    }
    console.log(ws._key);
    ws.on('message', function (message) {
      console.log(`消息: ${message}`);
      //console.log(wss);
      try{
        message = JSON.parse( message );
      }catch(e){
        console.log(wss.clients);
        wss.clients.forEach(( client )=>{
          client.send(`ECHO: ${message}`, (err) => {
            if (err) {
              console.log(`[SERVER] error: ${err}`);
            }
          });
        })
      }
    })*/
    initWs(ws);
});


function initWs( ws ) {

  CLIENTS.push(ws);

  ws.on('message', function (message) {
    //console.log(`消息: ${message}`);
    //console.log(wss);
    try{
      message = JSON.parse( message );
      if( ws.prevTime && Date.now()-ws.prevTime<1000) {
        message = {
          action:'to',
          userName:message.userName,
          toUserName:message.userName,
          value:'我是猪八戒，我手贱，喜欢狂发消息，嘎嘎'
        }
      }
      ws.prevTime = Date.now();
      if( message.action && MSG[message.action]) {
        MSG[message.action]( message, ws );
      }else {
        //console.log('为定义的消息：'+message);
        MSG.to({
          action:'to',
          userName:ws.key,
          toUserName:ws.key,
          value:'八戒，别闹了，下来吧'
        },ws)
      }
    }catch(e){
      //console.log('消息错误：'+message);
      MSG.to({
        action:'to',
        userName:ws.key,
        toUserName:ws.key,
        value:'八戒，别闹了，下来吧'
      },ws)
      /*wss.clients.forEach(( client )=>{
        client.send(`ECHO: ${message}`, (err) => {
          if (err) {
            console.log(`[SERVER] error: ${err}`);
          }
        });
      })*/
    }
  });

  ws.on('close', function(){
    ws._closeed = true;
    MSG.all({
      userName:ws.key,
      value:'我下线啦'
    },ws);
  });
}
/*
msg:{
  userName : '',发消息名字
  action:'',//对应方法名，动作
  value:'',//消息内容
  toUserName:''给谁发的
}

*/
var MSG = {
  all( msg, ws ) {
    CLIENTS.forEach(( item )=>{
      if( !item._closeed ) {
        item.send( JSON.stringify({
          action:'all',
          value:msg.value,
          userName:ws.key
        }) );
      }
    })
  },
  to( msg, ws ){
    var to = KEYS[msg.toUserName];
    to && !to._closeed && to.send(JSON.stringify({
      action:'to',
      userName:msg.userName,
      toUserName:msg.toUserName,
      value:msg.value
    }));
    ws.send(JSON.stringify({
      action:'to',
      userName:msg.userName,
      toUserName:msg.toUserName,
      value:msg.value
    }));
  },
  telme( msg , ws ){
    var userName = msg.userName;
    if(userName.indexOf('胡志明')>=0||userName.indexOf('胡塞塞')>=0) {
      userName = '胡志明是我大哥'+CLIENTS.length;
    }else if( KEYS[msg.userName] && !KEYS[msg.userName]._closeed ) {
      userName+=CLIENTS.length;
    }
    KEYS[userName] = ws;
    ws.key = userName;
    ws.send(JSON.stringify({
      action:'telme',
      value:userName
    }));
    this.all({
      action:'all',
      userName:userName,
      value:'我上线啦'
    },ws);
  }
}

var express = require('express');
var app = express();

app.use(express.static('webGL'));

app.listen(3000, function () {

  console.log('start');
});


