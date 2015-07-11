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
```js
player.on("peerInfo", function(peerid)
{
    console.log("peer is %s", peerid);
    
    player.emit("choose", 3, 9);
});
```

##selfFail::emit (code:str)
当客户端判断本方玩家输时（例如玩家选择数字超时），向服务器触发这个事件，通知具体的失败信息；
 - `code` 表示失败的原因，可取如下值：
    - `timeout` 表示超时
```js
if (timeout)
    player.emit("selfFail", "timeout");
```

##peerLose/peerWin::listen (code:str) 
服务端通知客户端对方玩家输/赢，如果客户端收到这个消息，则表示本方玩家赢/输；
 - `code` 表示失败的原因，可取如下值：
    - `bingo` 本方玩家猜中对方数字
    - `timeout` 对方玩家选择超时
    - `leave` 对方玩家退出
```js
player.on("peerLose", function(code)
{
    console.log("I win! reason is %s", code);
});
player.on("peerWin", function(code)
{
    console.log("I lose! reason is %s", code);
});
```

#PlayerClient接口
在客户端封装了一个PlayerClient接口，用于处理内部的client与server交互的逻辑，提供更加抽象的接口。
文件位置：`public/js/player.js`
demo位置：`views/test.html`

打开`conf.js`的`http_debug`选项，访问`http://127.0.0.1:8080/test`可看到效果

##connect(cb(err))
 - `cb` 连接成功或者失败的回调函数
    - `err` 是否有错误，如果为false表示连接成功，如果为true表示连接失败

与服务器建立连接

##findPeer(cb(peerid))
 - `cb` 找到对战玩家的回调

寻找对战玩家，当服务器匹配到玩家后，通过`cb`回调返回对方玩家的`peerid`

##choose(selfChoose, peerChoose)
 - `selfChoose` 玩家选择的本方数字
 - `peerChoose` 玩家猜测的对方数字

玩家选择数字后，将数字发送给服务端

```js
var winner = new PlayerClient();

winner.connect(function(err)
{
    console.log("winner connect ", err);

    winner.findPeer(function(err, peerid)
    {
        console.log("winner find peer ", peerid);
        winner.choose(3,4);
    });
});
```

##leave()
与服务端断开连接，当一次对战结束后，都要断开连接

##sendFail(code)
 - `code` 输赢的错误码，表示原因：
     - `timeout` 玩家选择超时

当客户端判断本方玩家失败（例如选择超时后），通知服务器，然后需要客户端自己调用`leave`接口与服务端断开连接。

##registerWin/registerLose(cb(code))
 - `cb` 胜负的回调函数
     - `code` 输赢的错误码，表示输赢的原因：
        - `bingo` 本方玩家猜中对方数字
        - `timeout` 对方玩家选择超时
        - `leave` 对方玩家退出

注册胜利和失败的回调函数

```js
var player = new PlayerClient();

player.registerWin(function(code)
{
    alert(type + " win! reason is " + code);
    player.leave();
});
player.registerLose(function(code)
{
    alert(type + "lose! reason is " + code);
    player.leave();
});
```

##registerPeerChoose(cb(peerSelf, peerPeer))
 - `cb` 收到对方数字的回调函数
     - `peerSelf` 对方玩家选择的数字
     - `peerPeer` 对方玩家猜的本方玩家的数字

注册回调，处理对方选择的数字情况

```js
player.registerPeerChoose(function(peerSelf, peerPeer)
{
    console.log("get peer data ", peerSelf, peerPeer);
});
```

##registerLeave(cb())
注册连接断开的回调事件
