/**
 * Created by chenyuliang01 on 2015/7/4.
 */
var path = require("path");

module.exports =
{
    //端口配置
    http_port : 8080,
    ws_port : 3030,
    ws_ip : "127.0.0.1",

    //日志配置
    http_log : {
        file_name : path.join(__dirname + '/log/http.log-%DATE%'),
        pattern : "YYYY-MM-DD-HH",
        frequency : "1h"
    },
    ws_log : [
        {
            type : 'console'
        },
        {
            filename : path.join(__dirname + '/log/hq.log'),
            type : "dateFile",
            pattern : "-yyyy-MM-dd-hh",
            alwaysIncludePattern : false,
            category: 'huaquan',
            ws_level : "DEBUG" //TRACE/DEBUG/INFO/WARN/ERROR/FATAL
        }
    ],

    //http server 调试模式
    http_debug : true
};