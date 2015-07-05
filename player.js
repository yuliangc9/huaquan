/**
 * Created by chenyuliang01 on 2015/7/5.
 */

var logger = require("./logger");
var util = require("util");
var EventEmitter     = require("events").EventEmitter;

/*
 class Player
 @param s : io socket from client
 */
function Player(s)
{
    this.socket = s;
    this.conid =null;
    this.peerid = null;
    this.state = Player.STATE.INIT;
    this.selfChoose = null;
    this.peerChoose = null;

    this.log = {
        debug : logRewrite.bind(this, "debug"),
        trace : logRewrite.bind(this, "trace"),
        info : logRewrite.bind(this, "info"),
        warn : logRewrite.bind(this, "warn"),
        error : logRewrite.bind(this, "error"),
        fatal : logRewrite.bind(this, "fatal")
    }
}
util.inherits(Player, EventEmitter);

//const player state
Player.STATE =
{
    INIT : 'init',
    WIN : 'win',
    LOSE : 'lose',
    PLAYING : 'playing'
}

//record player global info
Player.waitingPlayer = [];
Player.allPlayer = {};

function logRewrite(level, targetFormat)
{
    var format = util.format("[type : PLAYER] [id : %s] [conid : %s] [state : %s] [peer : %s] " +
            "[selfChoose : %s] [peerChoose : %s] %s",
        this.socket.id, this.conid, this.state, this.peerid, this.selfChoose, this.peerChoose);
    var args = Array.prototype.slice.call(arguments).slice(1);

    args[0] = util.format(format, targetFormat);

    logger[level].apply(logger, args);
    return;
}

/**
 * get a waiting player
 * @returns {*}
 */
function getWaitingPlayer()
{
    return Player.waitingPlayer.shift();
}

/**
 * add a player to wait
 * @param p
 */
function insertWaitingPlayer(p)
{
    Player.waitingPlayer.push(p);
}

/**
 * looking for a peer to start game
 */
Player.prototype.findPeer = function()
{
    var self = this;

    var p = getWaitingPlayer();
    if (p)
    {
        p.registerPeer(self);
        self.registerPeer(p);
    }
    else
    {
        insertWaitingPlayer(self);
    }

    return;
}

/**
 * get a choose from player
 * @param selfData
 * @param peerData
 */
Player.prototype.getChoose = function(selfData, peerData)
{
    var self = this;

    //format data to str
    selfData += '';
    peerData += '';

    if (self.updateChoose(selfData, peerData))
    {
        self.emit("choose");
    }

    self.log.info("get choose data %s %s", selfData, peerData);
}

/**
 * update choose data
 * @param selfData
 * @param peerData
 * @return if success return true, else return false
 */
Player.prototype.updateChoose = function(selfData, peerData)
{
    var self = this;

    if (self.peerChoose || self.selfChoose)
    {
        return false;
    }
    else
    {
        self.selfChoose = selfData;
        self.peerChoose = peerData;
        return true;
    }

    return;
}

/**
 * clear choose data
 */
Player.prototype.clearChoose = function()
{
    this.selfChoose = null;
    this.peerChoose = null;
}

/**
 * judge whether player has get choose
 * @returns {null|*}
 */
Player.prototype.isReady = function()
{
    return this.selfChoose && this.peerChoose;
}

/**
 * send peer choose to player
 * @param peerSelfData
 * @param peerPeerData
 */
Player.prototype.sendPeerChoose = function(peerSelfData, peerPeerData)
{
    var self = this;

    self.socket.emit("peerChoose", peerSelfData, peerPeerData);

    return;
}

/**
 * tell player the peer fail
 * @param msg
 */
Player.prototype.sendPeerFail = function(msg)
{
    var self = this;

    self.socket.emit("peerFail", msg);

    return;
}

/**
 * tell player the peer info
 * @param p
 */
Player.prototype.sendPeerInfo = function(p)
{
    self.socket.emit("peerInfo", p.conid);
}

/**
 * bind a player to start game
 * @param p : peer player
 */
Player.prototype.registerPeer = function(p)
{
    var self = this;

    self.state = Player.STATE.PLAYING;

    p.on("choose", function()
    {
        //two player is both ready, start exchange data
        if (self.isReady() && p.isReady())
        {
            self.log.info("exchange choose data");

            //1. send choose data to each player
            self.sendPeerChoose(p.selfChoose, p.peerChoose);
            p.sendPeerChoose(self.selfChoose, self.peerChoose);

            //2. judge who win who lose
            if(self.selfChoose == p.peerChoose && self.peerChoose != p.selfChoose)
            {
                self.state = Player.STATE.LOSE;
                p.state = Player.STATE.WIN;
            }
            else if(self.selfChoose != p.peerChoose && self.peerChoose == p.selfChoose)
            {
                self.state = Player.STATE.WIN;
                p.state = Player.STATE.LOSE;
            }

            self.log.debug("win or lose");
            p.log.debug("win or lose");

            //3.. clear choose data
            self.clearChoose();
            p.clearChoose();
        }
    });

    p.on("fail", function(msg)
    {
        self.log.info("get peer fail %s", msg);
        self.sendPeerFail(msg);
    });

    self.sendPeerInfo(p);

    return;
}

/**
 * process player leave event
 */
Player.prototype.leave = function()
{
    var self = this;

    self.log.info("player leave");

    //1. judge whether is fail
    if(self.state == Player.STATE.PLAYING)
    {
        self.emit("fail", "runAway");
    }

    //2. delete from global info
    delete Player.allPlayer[self.conid];

    //3. delege from waiting queue
    //assert there is only one waiting player
    if(Player.waitingPlayer[0] == self)
    {
        self.log.info("delete from waiting player");
        Player.waitingPlayer.shift();
    }

    return;
}

/**
 * process play fail
 * @param msg
 */
Player.prototype.getFail = function(msg)
{
    var self = this;

    self.log.info("get fail msg %s", msg);
    self.emit("fail", msg);
}

/**
 * initialize a new player info
 */
Player.prototype.init = function()
{
    var self = this;

    //1. generate global unique con id
    self.conid = new Date().getTime() + "" + parseInt(Math.random() * 100000000, 10);

    //2. register event listener
    self.socket.on("disconnect", self.leave.bind(self));
    self.socket.on("findPeer", self.findPeer.bind(self));
    self.socket.on("choose", self.getChoose.bind(self));
    self.socket.on("selfFail", self.getFail.bind(self));

    //3. record in global info
    Player.allPlayer[self.conid] = self;

    self.log.debug("complete init");

    return;
}

module.exports = Player;