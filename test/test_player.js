/**
 * Created by chenyuliang01 on 2015/7/7.
 */

//start ws server
require("../ws.js");
var config = require("../conf.js");
var IOClient = require('socket.io-client');
var util = require('util');


var player     = IOClient.connect(util.format('http://127.0.0.1:%d/', config.ws_port), {
    reconnection : false
});