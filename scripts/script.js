var num = [0,26,3,35,12,28,7,29,18,22,9,31,14,20,1,33,16,24,5,10,23,8,30,11,36,13,27,6,34,17,25,2,21,4,19,15,32];
var jetonCursor = false;
var bet = [];
var deleting = false;
var spinning = false;

var pBet = 0;
var pWon = 0;
var pLost = 0;
var pSum = 0;
var totBet = 0;
var totWon = 0;
var totLost = 0;
var totSum = 1000;

function resize(){
  var h = document.querySelector("#wheel img").getBoundingClientRect().height;
  var td = document.querySelectorAll("#numbers td");
  for(var i = 0; i < td.length; i++){
    td[i].style.height = h/6 + "px";
    var div = td[i].querySelector("div");
    if(div){
      div.style.fontSize = h*4/50 + "px";
      if(i==0)
        div.style.paddingTop = h*1.2/50 + h/6 + "px";
      else
        div.style.paddingTop = h*1.2/50 + "px";
    }
  }
  var tdRect = td[0].getBoundingClientRect();
  var hNew = tdRect.height > tdRect.width ? tdRect.width*6/7 : tdRect.height*6/7;
  document.querySelector("#jetons").style.height = hNew+"px";
  var jeton = document.querySelectorAll(".jeton, .jetonCursor, .jetonPlaced");
  for(var i = 0; i < jeton.length; i++){
    jeton[i].style.width = hNew + "px";
    jeton[i].style.height = hNew + "px";
    jeton[i].style.backgroundSize = hNew + "px " + hNew + "px";
    jeton[i].querySelector("p").style.fontSize = hNew*15/50 + "px";
    jeton[i].querySelector("p").style.marginTop = hNew*13/50 + "px";
  }

  var button = document.querySelectorAll("#buttons button");
  var jRect = jeton[0].getBoundingClientRect();
  for(var i = 0; i < button.length; i++){
    button[i].style.height = jRect.width*4/6 + "px";
    button[i].style.fontSize = jRect.height*2/6 + "px";
  }

  fixJetonsPositions();
}

function fixJetonsPositions(){
  var j = document.querySelectorAll(".jetonPlaced");
  for(var i = j.length-1; i>=0; i--){
    document.querySelector("#numbers").removeChild(j[i]);
  }
  var jPos;
  for(var i = 0; i < bet.length; i++){
    jPos = jetonPosition(bet[i].n);
    document.querySelector("#numbers").appendChild(jetonPlaced(jPos,j[i]));
  }
}

function spin(){
  var n = Math.floor(Math.random()*37);
  if(deleting) deleteJ();
  wheelAnimation(n);
  calcResult(n);
}

function beforeSpinning(){
  var button = document.querySelectorAll("#buttons button");
  for(var i = 0; i < button.length; i++){
    button[i].disabled = true;
  }
  spinning = true;
}

function afterSpinning(){
  var button = document.querySelectorAll("#buttons button");
  for(var i = 0; i < button.length; i++){
    button[i].disabled = false;
  }
  spinning = false;
  var round = Number(document.querySelector("#round h2").innerHTML)+1;
  if(jetonCursor)deleteJetonCursor();
  jetonCursor = false;
  document.querySelector("#round h2").innerHTML = round;
  displayResult();
}

function wheelAnimation(n){
  var img = document.querySelector("#wheel img");
  var id = setInterval(frame, 5);
  img.style.transform = "rotate(0deg)";
  var degFin = 1440 + num.indexOf(n)*360/37;
  var deg = 0;
  var off = 0;
  beforeSpinning();
  function frame() {
    if(deg >= degFin){
      afterSpinning();
      clearInterval(id);
    }
    else{
      off = (degFin-deg)/300 < 0.05 ? 0.05 : (degFin-deg)/300;
      deg += off;
      img.style.transform = "rotate(" + deg + "deg)";
    }
  }
}

function highlightJeton(n){
  var jetons = document.querySelectorAll(".jeton");
  for(var i = 0; i < jetons.length; i++){
    jetons[i].style.opacity = 0.5;
  }
  jetons[n].style.opacity = 1.0;
}

function selectedJeton(){
  var jetons = document.querySelectorAll(".jeton");
  for(var i = 0; i < jetons.length; i++){
    if(window.getComputedStyle(jetons[i]).getPropertyValue("opacity") == 1){
      return jetons[i];
    }
  }
}

function mouseCoordinates(){
  var e = window.event;
  if (e.pageX || e.pageY){
   return {
     x: e.pageX,
     y: e.pageY
   };
  }
  else if (e.clientX || e.clientY){
    return {
      x: e.clientX,
      y: e.clientY
    };
 }
}

function deHighlight(){
  for(var i=0; i<37; i++){
    document.querySelector("#n" + i).style.fontWeight = 700;
    document.querySelector("#n" + i).style.color = "white";
  }
}
function cursor(){
  if(!deleting){
    var r = document.querySelector("#numbers").getBoundingClientRect();
    var mCoord = mouseCoordinates();
    var x = mCoord.x, y = mCoord.y;
    if(x>=r.left && x<=r.right && y>=r.top && y<=r.bottom){
      if(!jetonCursor){
        createJetonCursor();
        jetonCursor = true;
      }
      var n = selectedNum(x,y);
      if(!spinning){
        deHighlight();
        if(n){
          for(var i=0; i < n.length; i++){
            document.querySelector("#n" + n[i]).style.fontWeight = 900;
            document.querySelector("#n" + n[i]).style.color = "#FABB22";
          }
        }
      }

      var j = document.querySelector("#numbers .jetonCursor");
      var jRect = j.getBoundingClientRect();
      x -= (jRect.width/2);
      y -= (jRect.height/2);
      j.style.left = x + "px";
      j.style.top = y + "px";
    }
    else if(jetonCursor){
      deleteJetonCursor();
      if(!spinning) deHighlight();
      jetonCursor = false;
    }
  }
}

function selectedNum(x, y){
  var r = document.querySelector("#numbers").getBoundingClientRect();
  var cellH = r.height/5;
  var offH = cellH/2;
  var cellW = r.width/14;
  var offW = cellW/2;
  var left, top;
  var n = [];

  if(x >= r.left && x < r.left + offW + offW/2 && y <= r.top + cellH*3)
    return [0];

  if(x >= r.left + cellW*13){
    for(var j=0; j<3; j++){
      top = r.top + j*cellH;
      if(y >= top && y< top + cellH){
        for(var i = 1; i < 37; i+=3)
          n.push(i+2-j);
        return n;
      }
    }
  }

  if(y >= r.top + cellH*3 && y < r.top + cellH*4){
    for(var i=0; i<3; i++){
      left = r.left + cellW +cellW*4*i;
      if(x >= left && x < left + 4*cellW){
        for(var j = 1; j < 13; j++)
          n.push(j+12*i);
        return n;
      }
    }
  }

  if(y >= r.top + cellH*4){
    for(var i=0; i<6; i++){
      left = r.left + cellW +cellW*2*i;
      if(x >= left && x < left + 2*cellW){
        if(i==0){
          for(var j = 1; j < 36; j+=2)
            n.push(j);
        }
        else if(i==5){
          for(var j = 2; j < 37; j+=2)
            n.push(j);
        }
        else if(i==1){
          for(var j = 1; j < 19; j++)
            n.push(j);
        }
        else if(i==4){
          for(var j = 19; j < 37; j++)
            n.push(j);
        }
        else if(i==2){
          for(var j = 2; j < 37; j+=2)
            n.push(num[j]);
          n.sort(function(a, b){return a-b;});
        }
        else if(i==3){
          for(var j = 1; j < 36; j+=2)
            n.push(num[j]);
          n.sort(function(a, b){return a-b;});
        }
        return n;
      }
    }
  }

  for(var i=0; i<12; i++){
    for(var j=0; j<3; j++){
      left = r.left + cellW*(i+1);
      top = r.top + cellH*(2-j);
      if(x >= left - offW/2 && x < left + offW/2){
        if((j==2 && y >= top && y < top + offH/2) || (y >= top + offH/2 && y < top + offH + offH/2)){
          if(i==0)
            return[0,i*3+j+1];
          else
            return [(i-1)*3+j+1,i*3+j+1];
        }
        else if(y >= top + offH + offH/2 && y < top + 2*offH + offH/2){
          if(i==0){
            if(j==0)
              return [0,1,2,3];
            else
              return [0,i*3+j,i*3+j+1];
          }
          else{
            if(j==0)
              return [(i-1)*3+j+1,(i-1)*3+j+2,i*3+j,i*3+j+1,i*3+j+2,i*3+j+3];
            else
              return [(i-1)*3+j,(i-1)*3+j+1,i*3+j,i*3+j+1];
          }

        }
      }
      else if((i==11 && x >= left + offW + offW/2 && x < left + 2*offW) || (x >= left + offW/2 && x < left + offW + offW/2)){
        if((j==2 && y >= top && y < top + offH/2) || (y >= top + offH/2 && y < top + offH + offH/2))
          return [i*3+j+1];
        else if(y >= top + offH + offH/2 && y < top + 2*offH + offH/2){
          if(j==0)
            return [i*3+j+1,i*3+j+2,i*3+j+3];
          else
            return [i*3+j,i*3+j+1];
        }
      }
    }
  }
  return undefined;
}

function jetonPosition(n){
  var xJ=0, yJ=0, c;
  if(n.length <= 6){
    for(var i=0; i < n.length; i++){
      c = document.querySelector("#n"+n[i]).getBoundingClientRect();
      xJ += (c.left-1.5);
      yJ += (c.top-1.5);
    }
    xJ /= n.length;
    yJ /= n.length;
    if(n.length == 3 || n.length == 6)
      yJ = document.querySelector("#n1").getBoundingClientRect().top-1.5+(c.height+1.5)/2;
  }
  if(n.length == 12){
    if(n[3] == 4 || n[3] == 16 || n[3] == 28){
      c = document.querySelector("#s"+n[0]+"-" +n[11]).getBoundingClientRect();
      xJ = (c.left-1.5);
    }
    else {
      c = document.querySelector("#row" + n[0]).getBoundingClientRect();
      xJ = (c.left-1.5);
    }
    yJ = (c.top-1.5);
  }
  if(n.length == 18){
    if(n[0] == 1 && n[5] == 12)
      c=document.querySelector("#red").getBoundingClientRect();
    else if(n[0] == 2 && n[5] == 12)
      c=document.querySelector("#even").getBoundingClientRect();
    else if(n[0] == 2 && n[5] == 11)
      c=document.querySelector("#black").getBoundingClientRect();
    else if(n[0] == 1 && n[5] == 11)
      c=document.querySelector("#odd").getBoundingClientRect();
    else if(n[5] == 6)
      c=document.querySelector("#s1-18").getBoundingClientRect();
    else if(n[5] == 24)
      c=document.querySelector("#s19-36").getBoundingClientRect();
    xJ = (c.left-1.5);
    yJ = (c.top-1.5);
  }
  var jRect = document.querySelector("#jetons .jeton").getBoundingClientRect();
  xJ = xJ - jRect.width/2 + (c.width)/2;
  yJ = yJ - jRect.height/2 + (c.height)/2;
  return{
    x: xJ,
    y: yJ
  };
}

function arrayEquals(a, b){
  if(a.length != b.length)
    return false;
  for(var i=0; i < a.length; i++){
    if(a[i] != b[i])
      return false;
  }
  return true;
}

function indexBet(n){
  for(var i=0; i<bet.length; i++){
    if(arrayEquals(bet[i].n,n))
      return i;
  }
  return -1;
}

function jetonPlaced(jPos, jCloned){
  jCloned.className = "jetonPlaced";
  jCloned.style.top = jPos.y + "px";
  jCloned.style.left = jPos.x + "px";
  jCloned.onclick = function(){
    var j = document.querySelectorAll("#numbers .jetonPlaced");
    for(var i=0; i<j.length; i++){
      if(this == j[i]){
        document.querySelector("#numbers").removeChild(this);
        bet.splice(i,1);
        return;
      }
    }
  };
  return jCloned;
}

function addJeton(){
  var mCoord = mouseCoordinates();
  var num = selectedNum(mCoord.x, mCoord.y);
  var indexB = indexBet(num);
  var jCloned = selectedJeton().cloneNode(true);
  if(indexB == -1){
    var jPos = jetonPosition(num);
    document.querySelector("#numbers").appendChild(jetonPlaced(jPos,jCloned));
    var newBet = {
      amount: Number(jCloned.querySelector("p").innerHTML),
      n: num
    };
    bet.push(newBet);
  }else{
    var newAmount = bet[indexB].amount + Number(jCloned.querySelector("p").innerHTML);
    bet[indexB].amount = newAmount;
    document.querySelectorAll("#numbers .jetonPlaced p")[indexB].innerHTML = newAmount;
  }

}

function createJetonCursor(){
  var jeton = selectedJeton().cloneNode(true);
  jeton.className = "jetonCursor";
  if(spinning){
    jeton.onclick = function(){};
    jeton.style.backgroundImage = "url('./images/disabled.png')";
    jeton.querySelector("p").innerHTML = "";
  }
  else {
    jeton.onclick = addJeton;
  }
  document.querySelector("#numbers").appendChild(jeton);
}

function deleteJetonCursor(){
  var jeton = document.querySelector("#numbers .jetonCursor");
  document.querySelector("#numbers").removeChild(jeton);
}

function reset(){
  bet.splice(0,bet.length);
  var j = document.querySelectorAll(".jetonPlaced");
  for(var i = j.length-1; i>=0; i--){
    document.querySelector("#numbers").removeChild(j[i]);
  }
}

function deleteJ(){
  if(deleting){
    document.querySelector("#buttons .selectedBtn").className = "";
    document.querySelector("#play #table #numbers").onmouseover = function() {
      this.style.cursor = "none";
    }
  }else{
    document.querySelectorAll("#buttons button")[1].className = "selectedBtn";
    document.querySelector("#play #table #numbers").onmouseover = function() {
      this.style.cursor = "auto";
    }
  }
  deleting = !deleting;
}

function calcResult(num){
  pBet = 0; pWon = 0; pLost = 0; pSum = 0;
  for(var i = 0; i < bet.length; i++){
    pBet += bet[i].amount;
    if(bet[i].n.indexOf(num) == -1)
      pLost += bet[i].amount;
    else{
      pWon += 36*bet[i].amount/bet[i].n.length;
    }
  }
  pSum = pWon - pLost;
  totBet += pBet;
  totWon += pWon;
  totLost += pLost;
  totSum += pSum;
}

function displayResult(){
  var td = document.querySelectorAll("#lastScore td");
  td[0].innerHTML = pBet;
  td[1].innerHTML = pLost;
  td[2].innerHTML = pWon;
  td[3].innerHTML = pSum;
  td = document.querySelectorAll("#totalScore td");
  td[0].innerHTML = totBet;
  td[1].innerHTML = totLost;
  td[2].innerHTML = totWon;
  td[3].innerHTML = totSum;
  if(totSum<=0){
    blurAnimation();
  }

}

function blurAnimation(){
  var id = setInterval(frame, 10);
  var i = 0;
  function frame(){
    if(i >= 5){
      clearInterval(id);
      var div = document.createElement("DIV");
      var body = document.querySelector("body");
      div.innerHTML = "Hai finito i soldi!";
      div.id = "outPopUp";
      body.appendChild(div);
      body.onmousemove = function(){};
      document.querySelector("#play #table #numbers").onmouseover = function() {
        this.style.cursor = "auto";
      }
      var button = document.querySelectorAll("#buttons button");
      for(var j = 0; j < button.length; j++){
        button[j].disabled = true;
      }
      var butt = document.createElement("BUTTON");
      butt.innerHTML = "Rinizia";
      butt.style.display = "block";
      butt.onclick = function(){
        window.location.reload();
      }
      butt.style.marginTop = "10px";
      butt.style.fontSize = "20px";
      butt.style.height = "40px";
      butt.style.width = "120px";
      div.appendChild(butt);
    }
    else{
      i+=0.05;
      document.querySelector("header").style.filter = "blur(" + i + "px)";
      document.querySelector("#statistics").style.filter = "blur(" + i + "px)";
      document.querySelector("#play").style.filter = "blur(" + i + "px)";
      document.querySelector("footer").style.filter = "blur(" + i + "px)";
    }
  }
}
