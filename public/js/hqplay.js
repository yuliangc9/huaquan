/**
 * Created by root on 2015/7/9.
 */
var play = play || {};
play.init = function(){
    play.my = 1;
    play.mnb = null;
    play.tnb = null;
    play.pmnb = null;
    play.ptnb = null;
    play.isPlay = true;
    play.numberMap = com.initNumber;
    play.show = com.show;
    play.choosecount = 0;
    play.choosetype = '';
    play.confirm = false;
    play.client = new PlayerClient();
    play.peerid = false;
    for(var i=0;i<play.numberMap.length;i++){
        var key = play.numberMap[i];
        com.numbers[key].x = i;
        com.numbers[key].isShow = true;
    }
    com.numbers['1st'].numbertype = 'mnb';
    com.numbers['9th'].numbertype = 'tnb';
    com.canvas.addEventListener("click", play.clickCanvas);
    com.get("confirm").addEventListener("click", function() {
            play.choose();
            play.confirm=true ;
    });
    //连接服务器
    play.client.connect(function(err)
    {
        play.findpeer();
        play.initsockevent();
    });
}

play.findpeer = function(){
    play.client.findPeer(function (f,peerid) {
        console.log('find one peer'+peerid);
        play.peerid = peerid;
        if(play.peerid){
            com.get("loading").style.display = "none";
            com.get("corearea").style.display = "block";
            com.tick();
           // play.show();
        }
    })
};

//获得点击的着点
//点击棋盘事件
play.clickCanvas = function (e){
    if (!play.isPlay) return false;
    var key = play.getClickNumber(e);
    var point = play.getClickPoint(e);

    var x = point.x;
    var y = point.y;

    if (key){
        for(var num in com.numbers){
            if(key == num){
                if(play.choosecount == 2){
                    if(com.numbers[key].choose){
                        play.choosecount = play.choosecount - 1;
                        com.numbers[key].choose = !com.numbers[key].choose;
                        play.choosetype = com.numbers[key].numbertype;
                        com.numbers[key].numbertype = '';
                        play.show();
                        return;
                    }
                    else {
                        play.show();
                        return;
                    }
                }
                if(play.choosecount == 1){
                    if(com.numbers[key].choose){
                        play.choosecount = play.choosecount - 1;
                        com.numbers[key].choose = !com.numbers[key].choose;
                        play.choosetype = com.numbers[key].numbertype;
                        com.numbers[key].numbertype = '';
                        play.show();
                        return;
                    }
                    else {
                        play.choosecount = play.choosecount + 1;
                        com.numbers[key].choose = !com.numbers[key].choose;
                        com.numbers[key].numbertype = play.choosetype;
                        play.show();
                        return;
                    };
                }
                if(play.choosecount == 0){
                    play.choosecount = play.choosecount + 1;
                    com.numbers[key].choose = !com.numbers[key].choose;
                    com.numbers[key].numbertype = 'mnb';
                    play.choosetype = 'tnb';
                    play.show();
                    return;
                }
            }
        }

    }
    else{

    }

}

play.initsockevent = function(){
    play.client.registerLeave(function()
    {
        alert(" 网络异常断开!");
    });
    play.client.registerWin(function(code)
    {
        alert("u win! reason is " + code);
        player.leave();
    });
    play.client.registerLose(function(code)
    {
        alert("u lose! reason is " + code);
        player.leave();
    });
    play.client.registerPeerChoose(function(peerSelf, peerPeer)
    {
        console.log("get peer data ", peerSelf, peerPeer);
    });
}

play.choose = function () {
    for(var nb in com.numbers){
        curnb = com.numbers[nb];
        if(curnb.choose){
            play.mnb = curnb.numbertype == 'mnb' ? curnb : play.mnb;
            play.tnb = curnb.numbertype == 'tnb' ? curnb : play.tnb;
        }
    }
    if(play.mnb && play.tnb){
        play.client.choose(play.mnb.value,play.tnb.value);
    }
    else console.log('参数不足');
}

//获得棋子
play.getClickNumber = function (e){
    var clickXY=play.getClickPoint(e);
    var x=clickXY.x;
    var y=clickXY.y;
    if (x < 0 || x>9 || y < 0) return false;
    return play.numberMap[x];
}

play.getClickPoint = function (e){
    var domXY = com.getDomXY(com.canvas);
    var x=Math.round((e.pageX-domXY.x-com.pointStartX-20)/com.spaceX);
    var y=Math.round((e.pageY-domXY.y-com.pointStartY-20)/com.spaceY);
    return {"x":x,"y":y}
}
