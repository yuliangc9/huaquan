/**
 * Created by root on 2015/7/9.
 */
var play = play || {};
play.init = function(){
    play.my = 1;
    play.choosenumber1 = {};
    play.choosenumber2 = {};
    play.isPlay = true;
    play.numberMap = com.initNumber;
    play.show = com.show;
    play.choosecount = 0;
    play.choosetype = '';
    play.confirm = false;

    for(var i=0;i<play.numberMap.length;i++){
        var key = play.numberMap[i];
        com.numbers[key].x = i;
        com.numbers[key].isShow = true;
    }
    com.numbers['1st'].numbertype = 'mnb';
    com.numbers['9th'].numbertype = 'tnb';

    play.show();
    com.canvas.addEventListener("click", play.clickCanvas);
    com.get("confirm").addEventListener("click", function(e) {
        if (confirm("确定答案？")){
            e.style.display = "display";
            play.confirm=true ;
        }
    })

}
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
