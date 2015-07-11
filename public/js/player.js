/**
 * Created by chenyuliang01 on 2015/7/10.
 */

/**
 * 表示一个玩家实例
 * @constructor
 */
function PlayerClient()
{
    this.winCb = null;
    this.loseCb = null;
    this.peerChooseCb = null;
    this.leaveCb = null;

    this.socket = null;
}

/**
 * 注册胜利的回调事件，当服务器通知客户端玩家胜利时调用
 * @param cb(code)
 *      code : 字符串 表示赢的原因
 */
PlayerClient.prototype.registerWin = function(cb)
{
    this.winCb = cb;
}

/**
 * 注册失败的回调事件，当服务器通知客户端玩家失败时调用
 * @param cb(code)
 *      code : 字符串 表示输的原因
 */
PlayerClient.prototype.registerLose = function(cb)
{
    this.loseCb = cb;
}

/**
 * 注册对方玩家选择的事件，通过回调告诉客户端对方玩家选择的数字
 * @param cb(peerSelf, peerPeer)
 *      peerSelf : number 对方自己选择的数字
 *      peerPeer : number 对方猜的本方玩家的数字
 */
PlayerClient.prototype.registerPeerChoose = function(cb)
{
    this.peerChooseCb = cb;
}

/**
 * 注册连接断开的事件
 * @param cb()
 */
PlayerClient.prototype.registerLeave = function(cb)
{
    this.leaveCb = cb;
}

/**
 * 寻找对战玩家
 * @param cb(err, peerid)
 *      err : 表示是否有错误，如果为true，则寻找失败，如果为false，表示成功
 *      peerid : 表示对战玩家的id
 */
PlayerClient.prototype.findPeer = function(cb)
{
    var self = this;

    if(!self.socket)
    {
        cb(true);
        return;
    }

    self.socket.emit("findPeer");
    self.socket.on("peerInfo", function(peerid)
    {
        cb(false, peerid);
    });
}

/**
 * 连接web socket服务器，是连接的第一步
 * @param cb(err)
 *      err : 表示是否有错误，如果为true，表示连接失败；如果为false，表示连接成功
 * @param _retry_count 不需要设置
 */
PlayerClient.prototype.connect = function(cb, _retry_count)
{
    var self = this;
    var max_retry_num = 3;
    var retry_count = _retry_count ? _retry_count : 0;

    //1. 判断是否超过重试次数
    if(retry_count > max_retry_num)
    {
        cb(true);
        return;
    }
    retry_count ++;

    //2. 获取ws的地址
    $.ajax({
        url : "get_socket",
        dataType : "json",
        error : function(err, code)
        {
            setTimeout(function(){
                self.connect(cb, retry_count);
            }, 1000);
        },
        success : function(data)
        {
            _connect_ws(data.url);
            return;
        }
    });

    //3. 连接WS服务器
    function _connect_ws(io_url)
    {
        var socket = io.connect(io_url, {
            reconnection:false,
            multiplex : false
        });

        socket.on("connect_error", function(){
            cb(true);
        });
        socket.on("connect", function(){
            cb(false);
        });

        self._registerAll(socket);
    }
}

/**
 * 告诉服务器本方玩家选择的数字
 * @param selfChoose number 本方玩家选择的自己的数字
 * @param peerChoose number 本方玩家选择的对方玩家的数字
 */
PlayerClient.prototype.choose = function(selfChoose, peerChoose)
{
    var self = this;

    self.socket && self.socket.emit("choose", selfChoose, peerChoose);
}

/**
 * 告诉服务器本方玩家失败，在玩家选择超时等情况下调用
 * @param code 失败的原因
 */
PlayerClient.prototype.sendFail = function(code)
{
    var self = this;

    self.socket && self.socket.emit("selfFail", code);
}

/**
 * 离开服务器，结束游戏
 */
PlayerClient.prototype.leave = function()
{
    this.socket && this.socket.close();
}

PlayerClient.prototype._registerAll = function(s)
{
    var self = this;

    self.socket = s;

    self.socket.on("disconnect", function(){
        self.leaveCb && self.leaveCb();
        self.socket = null;
    });
    self.socket.on("peerChoose", function(peerSelf, peerPeer)
    {
        self.peerChooseCb && self.peerChooseCb(Number(peerSelf), Number(peerPeer));
    });
    self.socket.on("peerWin", function(code)
    {
        self.loseCb && self.loseCb(code);
    });
    self.socket.on("peerLose", function(code)
    {
        self.winCb && self.winCb(code);
    });
}