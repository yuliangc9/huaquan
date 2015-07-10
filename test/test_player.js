/**
 * Created by chenyuliang01 on 2015/7/7.
 */

//start ws server
require("../ws.js");

var config = require("../conf.js");
var IOClient = require('socket.io-client');
var util = require('util');
var assert = require("assert");

var WIN_LOSE_CODE = {
    BINGO : "bingo",
    TIMEOUT : "timeout",
    LEAVE : "leave"
}

function createPlayer()
{
    var newPlayer = IOClient.connect(
        util.format('http://127.0.0.1:%d/', config.ws_port),
        {
            reconnection : false,
            multiplex : false
        }
    );

    newPlayer.on("connect_error", function(err){
        throw new err;
    });

    return newPlayer;
}

var caseTotalNum = 0;
var caseCompleteNum = 0;

/**
 * a player play with peer choose queue
 * @param player
 * @param peerChooses
 */
function play(player, peerChooses, code_cb)
{
    var chooseSelf = null;
    var choosePeer = null;

    function _getChoose()
    {
        chooseSelf = player.chooses.shift();
        choosePeer = player.chooses.shift();

        if(chooseSelf && choosePeer)
        {
            if(chooseSelf == -1 || choosePeer == -1)
            {
                player.close();
                code_cb && code_cb(WIN_LOSE_CODE.LEAVE);
                return -1;
            }
            else if(chooseSelf == -2 || -2 == choosePeer)
            {
                player.emit("selfFail", WIN_LOSE_CODE.TIMEOUT);
                code_cb && code_cb(WIN_LOSE_CODE.TIMEOUT);
                return -1;
            }
            else
            {
                player.emit("choose", chooseSelf, choosePeer);
                return 1;
            }
        }

        return 0;
    }

    player.on("peerInfo", function(peerConid)
    {
        player.peerConid = peerConid;
        _getChoose();
    });

    player.on("peerChoose", function(ps, pp)
    {
        assert.equal(ps, peerChooses.shift());
        assert.equal(pp, peerChooses.shift());

        _getChoose();
    });

    player.emit("findPeer");
}

/**
 * a test case,
 * if there is a -1 in choose queue, this queue player disconnect as accident
 * @param winChooses winner choose queue
 * @param loseChooses loser choose queue
 */
function testChoose(winChooses, loseChooses)
{
    var expectCode = WIN_LOSE_CODE.BINGO;

    //add case count
    caseTotalNum += 2;

    var winner = createPlayer();
    var loser = createPlayer();

    winner.chooses = winChooses.slice();
    loser.chooses = loseChooses.slice();

    play(winner, loseChooses);
    play(loser, winChooses, function(c)
    {
        expectCode = c;
        caseCompleteNum += 1;
    });

    winner.on("peerLose", function(code)
    {
        assert.equal(code, expectCode, "code error");

        caseCompleteNum += 1;
        console.log("%d/%d test case winner win! %s", caseCompleteNum, caseTotalNum, code);

        winner.close();
    });
    winner.on("peerWin", function(code)
    {
        throw new Error("winner lose...", code);
    });

    loser.on("peerWin", function(code)
    {
        assert.equal(code, expectCode, "code error");

        caseCompleteNum += 1;
        console.log("%d/%d test case loser lose! %s", caseCompleteNum, caseTotalNum, code);

        loser.close();
    });
    loser.on("peerLose", function(code)
    {
        throw new Error("loser win...", code);
    });
}

//cases
testChoose([3,8,3,9,6,6,5,7], [4,4,4,4,4,4,7,7]);
testChoose([3,3], [3,4]);
testChoose([3,8,9,0], [4,4,-1,-1]);
testChoose([3,8,9,1], [4,4,-2,-2]);