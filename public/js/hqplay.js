/**
 * Created by root on 2015/7/9.
 */
var play = play || {};
play.init = function(){
    play.my = 1;
    play.mnb = null;
    play.tnb = null;
    play.pmnb = com.numbers['pmnb'];
    play.ptnb = com.numbers['ptnb'];
    play.isPlay = true;
    play.numberMap = com.initNumber;
    play.show = com.show;
    play.choosecount = 0;
    play.choosetype = '';
    play.confirm = false;
    play.client = new PlayerClient();
    play.peerid = false;
    com.numbers['1st'].numbertype = 'mnb';
    com.numbers['9th'].numbertype = 'tnb';
    com.canvas.addEventListener("click", play.clickCanvas);
    com.get("confirm").addEventListener("click", function() {
            play.choose();
            play.confirm=true ;
    });
    //���ӷ�����
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

//��õ�����ŵ�
//��������¼�
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
                        com.numbers['l'+play.choosetype].img = com['l'+play.choosetype].img;
                        return;
                    }
                    else {
                        return;
                    }
                }
                if(play.choosecount == 1){
                    if(com.numbers[key].choose){
                        play.choosecount = play.choosecount - 1;
                        com.numbers[key].choose = !com.numbers[key].choose;
                        play.choosetype = com.numbers[key].numbertype;
                        com.numbers['l'+play.choosetype].img = com['l'+play.choosetype].img;
                        com.numbers[key].numbertype = '';
                        return;
                    }
                    else {
                        play.choosecount = play.choosecount + 1;
                        com.numbers[key].choose = !com.numbers[key].choose;
                        com.numbers[key].numbertype = play.choosetype;
                        com.numbers['l'+play.choosetype].img = com.numbers[key].img;
                        return;
                    };
                }
                if(play.choosecount == 0){
                    play.choosecount = play.choosecount + 1;
                    com.numbers[key].choose = !com.numbers[key].choose;
                    com.numbers[key].numbertype = 'mnb';
                    com.numbers['lmnb'].img = com.numbers[key].img;
                    play.choosetype = 'tnb';
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
        alert(" �����쳣�Ͽ�!");
    });
    play.client.registerWin(function(code)
    {
        //alert("u win! reason is " + code);
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
        var pmnbk = play.numberMap[peerSelf-1];
        var ptnbk = play.numberMap[peerPeer-1];
        com.numbers['pmnb'].img = com.numbers[pmnbk].img;
        com.numbers['ptnb'].img = com.numbers[ptnbk].img;
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
    else console.log('��������');
}

//�������
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
