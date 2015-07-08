# huaquan
game for fun

# client/server交互流程
客户端主要逻辑基于socket-io开发，实时与服务器交互数据：
- 1 `connect`到服务器`ip:port`;
- 2 connect成功后，触发`findPeer`事件；
- 3 服务器返回触发`peerInfo`事件，表示成功匹配玩家；
- 4.1 玩家完成选择后，客户端触发`choose`事件，通知服务器玩家的选择；
- 4.2 如果客户端判断玩家失败，则向服务端触发`selfFail`事件；
- 5 如果客户端收到`peerLose`事件，表示对方玩家输，本方胜利；如果客户端收到`peerWin`事件，表示对方玩家胜利，本方失败；
- 6 游戏状态结束后，`close`断开连接；

# client接口
##findPeer::emit ()
客户端向服务器触发该事件，表示开始寻找对战玩家
```js
var newPlayer = IOClient.connect(
    util.format('http://127.0.0.1:%d/', config.ws_port),
    {
        reconnection : false,
        multiplex : false
    }
);
newPlayer.emit("findPeer");
```

##peerInfo::listen (peerid:str)
服务器触发的事件，通知客户端对方玩家已经就绪
 - `peerid` 对战玩家的id

##choose::emit (selfChoose:num, peerChoose:num)
向服务器发送玩家选择的一对数字，如果选择的自己数字被对方选中，则输；如果选择的对方数字正好是对方的自己数字，则赢；
输赢的判断在服务端进行，服务端会通过`peerLose`和`peerWin`事件通知客户端，客户端不需要判断数字的逻辑处理；
 - `selfChoose` 表示玩家选择的自己的数字
 - `peerChose` 表示玩家选择的对方的数字

##selfFail::emit (code:str)
当客户端判断本方玩家输时（例如玩家选择数字超时），向服务器触发这个事件，通知具体的失败信息；
 - `code` 表示失败的原因，可取如下值：
    - `timeout` 表示超时

##peerLose/peerWin::listen (code:str) 
服务端通知客户端对方玩家输/赢，如果客户端收到这个消息，则表示本方玩家赢/输；
 - `code` 表示失败的原因，可取如下值：
    - `bingo` 本方玩家猜中对方数字
    - `timeout` 对方玩家选择超时
    - `leave` 对方玩家退出
