/**
 * Created by chenyuliang01 on 2015/7/4.
 */

var config = require("./conf");
var logger = require("./logger");
var ioServer = require("socket.io")(config.ws_port);
var Player = require("./player");

//IO server 游戏逻辑
logger.info("huaquan ws server start!");
ioServer.on("connection", function(player)
{
    logger.debug("get new player %s", player.id);
    var p = new Player(player);
    p.init();
});