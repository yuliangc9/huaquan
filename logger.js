/**
 * Created by chenyuliang01 on 2015/7/5.
 */

var config = require("./conf");
var log4js = require("log4js");

//初始化日志模块配置
log4js.configure({
    appenders : config.ws_log
});
var logger = log4js.getLogger(config.ws_log.category);
logger.setLevel(config.ws_log.level);

module.exports = logger;