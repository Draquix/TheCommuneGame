//Front End Client

console.log('client script is loaded');
const socket = io();

const chat = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatDump = document.querySelector('.chat-dump');
const scrolltips = document.querySelector('#scrolltips');

chat.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat', chatInput.value);
    chatInput.value = '';
});

const login = document.querySelector('.login-form');
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');

login.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});
let character = {};
let MapBox = [];
let LegendBox = [];

function render(message, id) {
    const output = document.createElement('p');
    if (id === socket.id) {
        output.classList.add('chat-message-user');
    }
    output.innerText = message;
    chatDump.appendChild(output);
}

function draw(){
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,360,360)
    let tile = 12;
    let xpos = 1, ypos = 1;
    let countP = 0, countC = 0;
    let map = MapBox[character.player.map];
    let legend = LegendBox[character.player.map];
    ctx.font = '12px Helvetica';
    for (let i = 0; i < map.length; i++){
        for (let j = 0; j < map[i].length; j++){
            if (map[i][j]==="#"){
                ctx.fillStyle = legend.Wall;
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="."){
                ctx.fillStyle = legend.floorDots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="*"){
                ctx.fillStyle = "yellow";
                ctx.fillText('*',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]===","){
                ctx.fillStyle = legend.floorSpots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="P"){
                ctx.fillStyle = legend.NPC[countP];
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
                countP++;
            }
            if (map[i][j]==="="){
                ctx.fillStyle = "red";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="-"){
                ctx.fillStyle = "white";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="1"||map[i][j]==="2"){
                ctx.fillStyle = "brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="&"){
                ctx.fillStyle = "red";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="T"){
                ctx.fillStyle = "green";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="$"){
                ctx.fillStyle = "yellow";
                ctx.fillText('$', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="%"){
                ctx.fillStyle = "brown";
                ctx.fillText('%', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="Q"){
                ctx.fillStyle = "dark grey";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
        }
    }   
}

function displayCharacter(){
    display = document.querySelector('#char-display');
    display.innerHTML = " ";
    charname = document.createElement('p');
    charname.innerHTML = character.player.name;
    display.appendChild(charname);
    hitpoint = document.createElement('p');
    hitpoint.innerHTML = `HP: ${character.player.stats.hp} / ${character.player.stats.mHp}`;
    display.appendChild(hitpoint);
    statline = document.createElement('p');
    statline.innerHTML = `Strength: ${character.player.stats.str} || Dexterity: ${character.player.stats.dex} || Defense: ${character.player.stats.def}`;
    display.appendChild(statline);
    statline2 = document.createElement('p');
    statline2.innerHTML = `Mining: ${character.player.stats.mine} || Forging: ${character.player.stats.forge} || Gathering: ${character.player.stats.gather}`;
    display.appendChild(statline2);
    statline3 = document.createElement('p');
    statline3.innerHTML = `Fishing: ${character.player.stats.fish} || Cooking: ${character.player.stats.cook} || Woodchopping: ${character.player.stats.chop}`;
    display.appendChild(statline3);
    weightcoin = document.createElement('p');
    weightcoin.innerHTML = `Carrying ${character.player.weightLoad} of possible ${character.player.weightLimit}kgs, and have ${character.player.stats.coin} coins.`;
    display.appendChild(weightcoin);
    xypos = document.createElement('p');
    xypos.innerHTML = `Player at ${character.player.xpos}x,${character.player.ypos}y.`;
    display.appendChild(xypos);
    message = document.createElement('p');
    message.innerHTML = character.player.message;
    display.appendChild(message);
}

socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    render(data.message,data.id);
});
socket.on('handshaking', (data,maps,legends) => {
    character.id = data.id;
    MapBox = maps;
    LegendBox = legends;
    console.log('handed up id: ', character.id);
});
socket.on('player created', data => {
    character.player = data;
    console.log(character.player);
    displayCharacter();
});
socket.on('draw player', data => {
    draw();
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    let tile =12;
    for(var i=0; i < data.pack.length; i++){
        ctx.font = "12pt Monospace";
        if (!(data.id===character.id)){
            ctx.fillStyle = "white";
        } else {
            ctx.fillStyle = "yellow";
            character.player.xpos = data.pack[i].xpos;
            character.player.ypos = data.pack[i].ypos;
            character.player.stats = data.pack[i].stats;
            character.player.message = data.pack[i].message;
        }
        ctx.fillText('P',data.pack[i].xpos*tile,data.pack[i].ypos*tile);
    }
    displayCharacter();
});
document.onkeydown = function(event){
    if(event.keyCode === 68)  //d
        socket.emit('key press',{inputDir:'right', state:true, id:character.id});
    else if(event.keyCode === 83) //s
        socket.emit('key press', {inputDir:'down', state:true, id:character.id});
    else if(event.keyCode === 65)  //a
        socket.emit('key press', {inputDir:'left',state:true, id:character.id});
    else if(event.keyCode === 87) //w
        socket.emit('key press', {inputDir:'up',state:true, id:character.id});
}
