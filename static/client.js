//Front End Client

console.log('client script is loaded');
const socket = io();
//HTML ELEMENTS: loads html elements for displaying the game data on screen
//through document.appendChild()

//Display Elements
const chat = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatDump = document.querySelector('.chat-dump');
const scrolltips = document.querySelector('#scrolltips');
const actionPanel = document.querySelector('#interactions');
//Login Form Elements
const login = document.querySelector('.login-form');
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');

//GLOBAL VARIABLES for client to hold character and game world
let character = {};
let NPCBox =[];
let MapBox = [];
let LegendBox = [];

//GAME DISPLAY FUNCTIONS
//Character Stats Display
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
    action = document.createElement('p');
    action.innerHTML = `Currently doing: ${character.player.doing}.`;
    display.appendChild(action);
    invButton = document.createElement('p');
    invButton.innerHTML = '<a href="javascript:displayInv();">Display Inventory</a>';
    display.appendChild(invButton);
}
//Inventory display function
function displayInv(){
    display.innerHTML = "";
    for(i in character.player.backpack){
        let item = character.player.backpack[i];
        let itemDisplay = document.createElement('p');
        itemDisplay.innerHTML = `* ${item.name} weighing ${item.weight} kgs.`;
        display.appendChild(itemDisplay);
    }
    let characterButton = document.createElement('p');
    characterButton.innerHTML = '<a href="javascript:displayCharacter();">Display Character</a>';
    display.appendChild(characterButton);
}
//Chest display function, and moving items between
function showChest(){
    actionPanel.innerHTML = "";
    for(let i = 0;i<character.player.chest.length;i++){
        let item = character.player.chest[i];
        let itemDisplay = document.createElement('p');
        itemDisplay.innerHTML = `* ${item.name} weighing ${item.weight} kgs. <a href="javascript:takeChest(${i});"> Take </a>`;
        actionPanel.appendChild(itemDisplay);
    }
    let doneButt = document.createElement('p');
    doneButt.innerHTML =`<a href="javascript:doneChest();"> Done </a>`;
    actionPanel.appendChild(doneButt);
    display.innerHTML = "";
    for(let i = 0;i < character.player.backpack.length;i++){
        let item = character.player.backpack[i];
        let itemDisplay = document.createElement('p');
        itemDisplay.innerHTML = `* ${item.name} weighing ${item.weight} kgs. <a href="javascript:putChest(${i});"> Put </a>`;
        display.appendChild(itemDisplay);
    }
}
function doneChest(){
    actionPanel.innerHTML = "";
    displayCharacter();
}
function takeChest(item){
    let thing = character.player.chest[item];
    if (thing.weight+character.player.weightLoad<=character.player.weightLimit){
        character.player.chest.pop(thing);
        socket.emit('chest change',character.player.chest);
        character.player.backpack.push(thing);
        socket.emit('backpack change',character.player.backpack);
        showChest();
    } else {
        alert("That item would be too heavy for you with what you're already carrying. Try depositing items into your chest, or leveling up your strength through combat.");
    }
}
function putChest(item){
    let thing = character.player.backpack[item];
    character.player.backpack.pop(thing);
    socket.emit('backpack change',character.player.backpack);
    character.player.backpack.push(thing);
    socket.emit('chest change',character.player.chest);
    showChest();
}
//Map Screen draw function
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

//CHAT CAPABILITIES
//Event Listener for chat form submitting
chat.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat', chatInput.value);
    chatInput.value = '';
});
//Chat render of messages to page
function chatRender(message, id) {
    const output = document.createElement('p');
    if (id === socket.id) {
        output.classList.add('chat-message-user');
    }
    output.innerText = message;
    chatDump.appendChild(output);
};
//Socket.io event handler - recieves message data from server
socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    chatRender(data.message,data.id);
});

//LOGGING IN
//Event listener for login form submit
login.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});
//Socket.io handler for handshake upon connection
socket.on('handshaking', (data,maps,legends) => {
    character.id = data.id;
    MapBox = maps;
    LegendBox = legends;
    console.log('handed up id: ', character.id);
});
//Socket.io handler for a player being created and displaying to the page
socket.on('player created', data => {
    character.player = data;
    console.log('player object:',character.player);
    displayCharacter();
});

//GAME RUNTIME ENGINES FOR INPUT OUTPUT
//Keypress Event Handling
document.onkeydown = function(event){
    if(event.keyCode === 68){  //d
        character.player.doing = "Walking";
        socket.emit('key press',{inputDir:'right', state:true, id:character.id});
    }if (event.keyCode === 83){ //s
        character.player.doing = "Walking";
        socket.emit('key press', {inputDir:'down', state:true, id:character.id});
    } if (event.keyCode === 65) { //a
        character.player.doing = "Walking";
        socket.emit('key press', {inputDir:'left',state:true, id:character.id});
    } if (event.keyCode === 87){ //w
        character.player.doing = "Walking";
        socket.emit('key press', {inputDir:'up',state:true, id:character.id});
    }
}
//Drawing Screen
socket.on('draw player', data => {
    draw();
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    let tile =12;
    for(var i=0; i < data.pack.length; i++){
        console.log(data.pack);
        ctx.font = "12pt Monospace";
        if (!(data.id===character.id)){
            ctx.fillStyle = "white";
        } else {
            character.player = data.pack[i];
            ctx.fillStyle = "yellow";
            character.player.xpos = data.pack[i].xpos;
            character.player.ypos = data.pack[i].ypos;
            character.player.stats = data.pack[i].stats;
            character.player.message = data.pack[i].message;
            character.player.action = data.pack[i].action;
        }
        ctx.fillText('P',data.pack[i].xpos*tile,data.pack[i].ypos*tile);
    }
});
//Conversations
let conversationOp = 0;
function opChange(choice){
    conversationOp = choice;
    converse(conversationOp);
}
function converse(option) {
    let NPC = NPCBox[0];
    actionPanel.innerHTML = "";
    let NPCname = document.createElement('p');
    NPCname.innerHTML = `Speaking to ${NPC.name}`;
    actionPanel.appendChild(NPCname);
    let message = document.createElement('p');
    message.innerHTML = NPC.conversations[option].message;    
    actionPanel.appendChild(message);
        if(NPC.conversations[option].end===true){
            NPCBox.pop();
            conversationOp = 0;
        }
    for (i in NPC.conversations[option].choice){
            const choice = NPC.conversations[option].answerI[i];
            let optionA = document.createElement('p');
            optionA.innerHTML= `<a href="javascript:opChange(${choice});">${NPC.conversations[option].choice[i]}</a>`;
            actionPanel.appendChild(optionA);
    }
    console.log('conversing:',NPC);
}
//Point of Interest
function showPoi(POI) {
    console.log(POI);
    actionPanel.innerHTML = "";
    message = document.createElement('p');
    message.innerHTML = POI.message[0];
    actionPanel.appendChild(message);
}
//Player Map Interaction and Actions
socket.on('action', data => {
    console.log('triggered an action:',data[0].action);
    character.player.doing = data[0].message;
    if (data[0].action==="talking"){
        NPCBox.push(data[0].npc);
        converse(conversationOp);
    }
    if (data[0].action==="poi"){
        showPoi(data[0].poi);
    }
    if (data[0].action==="chest"){
        showChest();
    }
});