/**
 * Created by root on 2015/7/8.
 */
var com = com || {};

com.init = function(stype){
    com.nowStype = stype || com.getCookie("stype") || "stype_normal";
    var stype = com.stypes[com.nowStype];
    com.width = stype.width;
    com.height = stype.height;
    com.spaceX = stype.spaceX;
    com.spaceY = stype.spaceY;
    com.pointStartX = stype.pointStartX;
    com.pointStartY = stype.pointStartY;
    com.countdY = stype.countdY;
    //com.canvas = $('#board');//猜拳主界面
    com.canvas = document.getElementById("board");
    com.timeout = false;
    com.ct = com.canvas.getContext("2d");
    com.canvas.width = com.width;
    com.canvas.height = com.height;
    com.countdownnum = 100;
    com.numberList = com.numberList || [];
    com.loadImages();
}

window.onload = function(){
    com.bg = new com.class.Bg();
    com.numbers = {};
    com.init();
    com.createNumbers(com.initNumber);


    //注册开始寻找玩家按钮点击事件
    com.get("start").addEventListener("click", function(e) {
            com.get("logo").style.display = "none";
            com.get("loading").style.display = "block";
            play.isPlay=true;
            play.init();

    })

}
//样式
com.stypes = {
    stype_small:{
        width:325,
        height:402,
        spaceX:20,
        spaceY:10,
        pointStartX:5,
        pointStartY:19
    },
    stype_normal:{
        width:420,
        height:512,
        countdY:250,
        spaceX:45,
        spaceY:15,
        pointStartX:5,
        pointStartY:430
    },
    stype_large:{
        width:712,
        height:960,
        spaceX:60,
        spaceY:30,
        pointStartX:5,
        pointStartY:19
    }
}

//载入图片
com.loadImages = function () {
    //number
    for(var i in com.args){
        com[i] = {};
        com[i].img = new Image();
        com[i].img.src = "img/" + com.args[i].img + ".png"
    }

    //document.getElementsByTagName("body")[0].style.background = "url(img/bg.jpg)";
}

com.draw = function (timeout) {
    if(!timeout){
        com.countdownnum--;
    }
    cursecond = Math.round(com.countdownnum/10);
    com.ct.lineWidth = 10;
    com.ct.clearRect(0, 0, com.width, com.height);
    com.ct.fillText('倒计时：'+cursecond, 0, 60);
    com.ct.fillText('我选择的数', com.spaceX * 2, com.pointStartY - com.spaceY * 7.5);
    com.ct.fillText('猜对方的数', com.spaceX * 6, com.pointStartY - com.spaceY * 7.5);
    com.ct.fillText('对方选的数', com.spaceX * 2, com.pointStartY - com.spaceY * 20.5);
    com.ct.fillText('对方猜的数', com.spaceX * 6, com.pointStartY - com.spaceY * 20.5);

    com.ct.save();
    com.ct.strokeStyle = '#86e01e';
    com.ct.beginPath();
    com.ct.moveTo(0, 40);
    com.ct.lineTo(com.width, 40);
    com.ct.stroke();
    com.ct.beginPath();
    com.ct.restore();
    com.ct.moveTo(0, 40);
    com.ct.lineTo((com.width / 10)*cursecond, 40);
    com.ct.stroke();
    for (var i=0; i<com.numberList.length ; i++){
        com.numberList[i].show();
    }
}

com.tick = function(){
   if(com.countdownnum == 0) {
       com.timeout = true;
       return;
   }
   com.draw();
   window.setTimeout(com.tick,100);
}


//获取元素距离页面左侧的距离
com.getDomXY = function (dom){
    var left = dom.offsetLeft;
    var top = dom.offsetTop;
    var current = dom.offsetParent;
    while (current !== null){
        left += current.offsetLeft;
        top += current.offsetTop;
        current = current.offsetParent;
    }
    return {x:left,y:top};
}

//获得cookie
com.getCookie = function(name){
    if (document.cookie.length>0){
        start=document.cookie.indexOf(name + "=")
        if (start!=-1){
            start=start + name.length+1
            end=document.cookie.indexOf(";",start)
            if (end==-1) end=document.cookie.length
            return unescape(document.cookie.substring(start,end))
        }
    }
    return false;
}

//获取ID
com.get = function (id){
    return document.getElementById(id)
}


com.createNumbers = function(map){
    for(var i=0;i<map.length;i++){
        switch (map[i])
        {
            case 'lmnb':
                com.numbers[map[i]] = new com.class.Number(map[i], 2, 12);
                break;
            case 'ltnb':
                com.numbers[map[i]] = new com.class.Number(map[i], 6, 12);
                break;
            case 'pmnb':
                com.numbers[map[i]] = new com.class.Number(map[i], 2, 20);
                break;
            case 'ptnb':
                com.numbers[map[i]] = new com.class.Number(map[i], 6, 20);
                break;
            default :
                com.numbers[map[i]] = new com.class.Number(map[i], i, 0);
        }
        com.numberList.push(com.numbers[map[i]]);
    }
}
com.class = com.class || {};

com.class.Bg = function(img, x, y){
    this.x = x || 0;
    this.y = y || 0;
    this.isShow = true;
    this.show = function(){
        if (this.isShow) com.ct.drawImage(com.bgImg, com.spaceX * this.x, com.spaceY * this.y);
    }
}

//显示列表
com.show = function (){
    com.ct.clearRect(0, 0, com.width, com.height);
    for (var i=0; i<com.numberList.length ; i++){
        com.numberList[i].show();
    }
}
com.initNumber = ['1st', '2ed', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', 'lmnb', 'ltnb', 'pmnb', 'ptnb'];

com.args = {
    '1st':{text:"一",img:'i_n_1',my:1,value:1},
    '2ed':{text:"二",img:'i_n_2',my:1,value:2},
    '3rd':{text:"三",img:'i_n_3',my:1,value:3},
    '4th':{text:"四",img:'i_n_4',my:1,value:4},
    '5th':{text:"五",img:'i_n_5',my:1,value:5},
    '6th':{text:"六",img:'i_n_6',my:1,value:6},
    '7th':{text:"七",img:'i_n_7',my:1,value:7},
    '8th':{text:"八",img:'i_n_8',my:1,value:8},
    '9th':{text:"九",img:'i_n_9',my:1,value:9},
    'mnb':{text:"我的数字",img:'mnb',my:1,value:99},
    'tnb':{text:"总和",img:'tnb',my:1,value:99},
    'lmnb':{text:"对手出的数字",img:'w_n',my:0,value:0},
    'ltnb':{text:"对手猜的数字",img:'w_n',my:0,value:0},
    'pmnb':{text:"对手出的数字",img:'w_n',my:0,value:0},
    'ptnb':{text:"对手猜的数字",img:'w_n',my:0,value:0}
};

com.class.result = function (nmb, tnb) {
    this.pmnb = com[nmb] || 0;
    this.ptnb = com[tnb] || 0;
    this.x = com.initNumber.length / 2 + 1;
    this.y = com.height / 3;
    this.iShow = true;

    this.show = function(){
        if(this.iShow){
            com.ct.save();
            com.ct.globalAlpha = this.alpha;
            com.ct.drawImage(this.rmnb.img, com.spaceX * this.x + com.pointStartX,  com.pointStartY - com.spaceY * this.y);
            com.ct.drawImage(this.rtnb.img, com.spaceX * this.x + com.pointStartX,  com.pointStartY - com.spaceY * this.y);
            com.ct.restore();
        }
    }
}

com.class.Number = function(key, x, y){
    this.key = key;
    var o = com.args[key];
    this.x = x || 0;
    this.y = y || 0;
    this.key = key;
    this.my = o.my;
    this.text = o.text;
    this.value = o.value;
    this.alpha = 1;
    this.numbertype = '';
    this.choose = false;
    this.img = com[key].img;
    this.iShow = true;

    this.show = function () {
        if(this.iShow){
            com.ct.save();
            com.ct.globalAlpha = this.alpha;
            com.ct.drawImage(this.img, com.spaceX * this.x + com.pointStartX,  com.pointStartY - com.spaceY * this.y);
            if(this.choose && this.numbertype == 'mnb'){
                com.ct.drawImage(com['mnb'].img, com.spaceX * this.x + com.pointStartX, com.spaceY * this.y + com.pointStartY - 30);
            }
            if(this.choose && this.numbertype == 'tnb'){
                com.ct.drawImage(com['tnb'].img, com.spaceX * this.x + com.pointStartX, com.spaceY * this.y + com.pointStartY + 30);
            }
            com.ct.restore();
        }
    }
}