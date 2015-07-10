/**
 * Created by root on 2015/7/8.
 */
var com = com || {};

com.init = function(stype){
    com.nowStype = stype || com.getCookie("stype") || "stype_normal";
    var stype = com.stype[com.nowStype];
    com.width = stype.width;
    com.height = stype.height;
    com.spaceX = stype.spaceX;
    com.spaceY = stype.spaceY;
    com.pointStartX = stype.pointStartX;
    com.pointStartY = stype.pointStartY;
    //com.canvas = $('#board');//猜拳主界面
    com.canvas = document.getElementById("board");
    com.ct = com.canvas.getContext("2d");
    com.canvas.width = com.width;
    com.canvas.height = com.height;
    com.numberList = com.numberList || [];
    com.loadImages();
}

window.onload = function(){
    com.bg = new com.class.Bg();
    com.numbers = {};
    com.init();
    com.createNumbers(com.initNumber);

    com.get("start").addEventListener("click", function(e) {
        if (confirm("确认开始猜拳？")){
            com.get("loadinfo").style.display = "none";
            play.isPlay=true ;
            play.init();
        }
    })

}
//样式
com.stype = {
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
        spaceX:45,
        spaceY:15,
        pointStartX:5,
        pointStartY:450
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
        com.numbers[map[i]] = new com.class.Number(map[i]);
        com.numbers[map[i]].x = i;
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
com.initNumber = ['1st', '2ed', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

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
    'tnb':{text:"总和",img:'tnb',my:1,value:99}
};

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
    this.iShow = true;

    this.show = function () {
        if(this.iShow){
            com.ct.save();
            com.ct.globalAlpha = this.alpha;
            com.ct.drawImage(com[key].img, com.spaceX * this.x + com.pointStartX, com.spaceY * this.y + com.pointStartY);
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