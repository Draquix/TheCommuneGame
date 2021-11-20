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
let skillcheck = 0;
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
//Inventory display function and equip item
function equip(num){
    let item = character.player.backpack[num];
    console.log("attempting to equip: ",item);
    if (item.type==='tool' && character.player.gear.right.length===0){
        character.player.gear.right.push(item);
        character.player.backpack.splice(num,1);
        socket.emit('backpack change',character.player.backpack);
        socket.emit('gear change',character.player.gear);
        displayEquipment();
    } else if (item.type==='tool' && character.player.gear.right.length>0 &&character.player.gear.left.length===0){
        character.player.gear.left.push(item);
        character.player.backpack.splice(num,1);
        socket.emit('backpack change',character.player.backpack);
        socket.emit('gear change',character.player.gear);
        displayEquipment();
    } else if (item.type==='tool' && character.player.gear.left.length>0 && character.player.gear.left.length>0){
        alert("You don't have any free hands...");
    }
    if (item.type==='gear'){
        if (item.location==='head'){
            if (character.player.gear.head.length>0){
            alert("You're already wearing something on your head.");
            } else {
            character.player.gear.head.push(item);
            character.player.backpack.splice(num,1);
            socket.emit('backpack change',character.player.backpack);
            socket.emit('gear change',character.player.gear);
            character.player.stats.def += character.player.gear.head[0].mods;
            socket.emit('stat change',character.player.stats)
            displayEquipment();
            }
        }
    }
    displayInv();
}
function displayInv(){
    display.innerHTML = "";
    for(i in character.player.backpack){
        let itemDisplay = document.createElement('p');
        itemDisplay.innerHTML = `* ${character.player.backpack[i].name} weighing ${character.player.backpack[i].weight} kgs.`;
        if (character.player.backpack[i].type==='tool'){
            itemDisplay.innerHTML += `<a href="javascript:equip(${i});"> Hold Tool </a>`;
        }
        if (character.player.backpack[i].type==='gear'){
            itemDisplay.innerHTML += `<a href="javascript:equip(${i});"> Wear Gear </a>`;
        }
        if (character.player.backpack[i].type==='raw' && character.player.doing==="Cooking at a fire."){
            itemDisplay.innerHTML += `<a href="javascript:cook(${i});"> Cook </a>`;
        }
        if (character.player.backpack[i].type==='edible'){
            itemDisplay.innerHTML += `<a href="javascript:eat(${i});"> Eat </a>`;
        }
        display.appendChild(itemDisplay);
    }
    let characterButton = document.createElement('p');
    characterButton.innerHTML = '<a href="javascript:displayCharacter();">Display Character</a>';
    display.appendChild(characterButton);
    let equipmentButton = document.createElement('p');
    equipmentButton.innerHTML = '<a href="javascript:displayEquipment();">Display Equipment</a>';
    display.appendChild(equipmentButton);
}
//Equipment Display and unequip
function displayEquipment(){
    actionPanel.innerHTML = "";
    let right = document.createElement('p');
    if(character.player.gear.right.length>0){
        right.innerHTML = `Held in Right Hand: ${character.player.gear.right[0].name} weighing ${character.player.gear.right[0].weight} kgs <a href="javascript:removeRight();"> Remove </a>`;
    } else {
        right.innerHTML = "Held in Right Hand: nothing.";
    }
    actionPanel.appendChild(right);
    let head = document.createElement('p');
    if(character.player.gear.head.length>0){
        head.innerHTML = `On Head: ${character.player.gear.head[0].name} weighing ${character.player.gear.head[0].weight} kgs <a href="javascript:removeHead();"> Remove </a>`;
    } else {
        head.innerHTML = "On Head: nothing.";
    }
    actionPanel.appendChild(head);
    let left = document.createElement('p');
    if(character.player.gear.left.length>0){
        left.innerHTML = `Held in Left Hand: ${character.player.gear.left[0].name} weighing ${character.player.gear.left[0].weight} kgs <a href="javascript:removeLeft();"> Remove </a>`;
    } else {
        left.innerHTML = "Held in Left Hand: nothing.";
    }
    actionPanel.appendChild(left);
    let torso = document.createElement('p');
    if (character.player.gear.torso.length>0){
        torso.innerHTML = `On Torso: ${character.player.gear.torso[0].name} weighing ${character.player.gear.torso[0].weight} kgs <a href="javascript:removeTorso();"> Remove </a>`;
    } else {
        torso.innerHTML = "On Torso: nothing.";
    }
    actionPanel.appendChild(torso);
    let legs = document.createElement('p');
    if (character.player.gear.legs.length>0){
        legs.innerHTML = `On Legs: ${character.player.gear.legs[0].name} weighing ${character.player.gear.legs[0].weight} kgs <a href="javascript:removeLegs();"> Remove </a>`;
    } else {
        legs.innerHTML = "On Legs: nothing.";
    }
    actionPanel.appendChild(legs);
    let hands = document.createElement('p');
    if (character.player.gear.hands.length>0){
        hands.innerHTML = `On Hands: ${character.player.gear.hands[0].name} weighing ${character.player.gear.hands[0].weight} kgs <a href="javascript:removeHands();"> Remove </a>`;
    } else { 
        hands.innerHTML = "On Hands: nothing.";
    }
    actionPanel.appendChild(hands);
    let back = document.createElement('p');
    if (character.player.gear.back.length>0){
        back.innerHTML = `On Back: ${character.player.gear.back[0].name} weighing ${character.player.gear.back[0].weight} kgs <a href="javascript:removeBack();"> Remove </a>`;
    } else {
        back.innerHTML = "On Back: nothing.";
    }
    actionPanel.appendChild(left);
    let neck = document.createElement('p');
    if (character.player.gear.neck.length>0){
        neck.innerHTML = `Around Neck: ${character.player.gear.neck[0].name} weighing ${character.player.gear.neck[0].weight} kgs <a href="javascript:removeNeck();"> Remove </a>`;
    } else {
        neck.innerHTML = "Around Neck: nothing."
    }
    actionPanel.appendChild(left);
    let doneButt = document.createElement('p');
    doneButt.innerHTML = `<a href="javascript:clearAction();"> Done with Equipment </a>`;
    actionPanel.appendChild(doneButt);
}
function clearAction (){
    actionPanel.innerHTML = "";
}  //below unequips stuff
function removeRight(){
    let item = character.player.gear.right[0];
    character.player.backpack.push(item);
    character.player.gear.right.pop();
    socket.emit('backpack change',character.player.backpack);
    socket.emit('gear change',character.player.gear);
    displayEquipment();
    displayInv();
}
function removeLeft(){
    let item = character.player.gear.left[0];
    character.player.backpack.push(item);
    character.player.gear.left.pop();
    socket.emit('backpack change',character.player.backpack);
    socket.emit('gear change',character.player.gear);
    displayEquipment();
    displayInv();
}
function removeHead(){
    let item = character.player.gear.head[0];
    character.player.backpack.push(item);
    character.player.gear.head.pop();
    socket.emit('backpack change',character.player.backpack);
    socket.emit('gear change',character.player.gear);
    character.player.stats.def -= item.mods;
    socket.emit('stat change',character.player.stats);
    displayEquipment();
    displayInv();
}

//Chest display function, and moving items between
function showChest(){
    actionPanel.innerHTML = "";
    for(let i = 0;i<character.player.chest.length;i++){
        let itemDisplay = document.createElement('p');
        itemDisplay.innerHTML = `* ${character.player.chest[i].name} weighing ${character.player.chest[i].weight} kgs. <a href="javascript:takeChest(${i});"> Take </a>`;
        actionPanel.appendChild(itemDisplay);
    }
    let doneButt = document.createElement('p');
    doneButt.innerHTML =`<a href="javascript:doneChest();"> Done </a>`;
    actionPanel.appendChild(doneButt);
    display.innerHTML = "";
    for(let i = 0;i < character.player.backpack.length;i++){
        let itemDisplay = document.createElement('p');
        itemDisplay.innerHTML = `* ${character.player.backpack[i].name} weighing ${character.player.backpack[i].weight} kgs. <a href="javascript:putChest(${i});"> Put </a>`;
        display.appendChild(itemDisplay);
    }
}
function doneChest(){
    actionPanel.innerHTML = "";
    displayCharacter();
}
function takeChest(item){
    if (character.player.chest[item].weight+character.player.weightLoad<=character.player.weightLimit){
        character.player.backpack.push(character.player.chest[item]);
        character.player.chest.splice(item,1);
        socket.emit('chest change',character.player.chest);
        socket.emit('backpack change',character.player.backpack);
        showChest();
    } else {
        alert("That item would be too heavy for you with what you're already carrying. Try depositing items into your chest, or leveling up your strength through combat.");
    }
}
function putChest(item){
    character.player.chest.push(character.player.backpack[item]);
    character.player.backpack.splice(item,1)
    socket.emit('backpack change',character.player.backpack);
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
            if (map[i][j]==="1"||map[i][j]==="2"||map[i][j]==="0"){
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
    NPCBox.pop();
    character.player.doing = 'Nothing';
    if(event.keyCode === 68){  //d
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
        ctx.font = "12pt Monospace";
        if (!(data.id===character.id)){
            ctx.fillStyle = "white";
        } else {
            character.player = data.pack[i].player;
            ctx.fillStyle = "yellow";
        }
        ctx.fillText('P',data.pack[i].player.xpos*tile,data.pack[i].player.ypos*tile);
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
//Cooking at Campfire and Eating Food
function showFire(){
    console.log('cooking rn');
    displayInv();
}
function cook(inv){
    console.log('cooking a: ',character.player.backpack[inv]);
    socket.emit('RNG');
    if (skillcheck>character.player.backpack[inv].diff){
        let msg = document.createElement('p');
        character.player.backpack[inv].type = 'edible';
        let name = 'A cooked ' + character.player.backpack[inv].name;
        console.log(character.player.backpack);
        character.player.backpack[inv].name = name;
        msg.innerHTML = `You successfully cooked the ${character.player.backpack[inv].name}!`;
        scrolltips.appendChild(msg);
        socket.emit('backpack change',character.player.backpack);
    } else {
        let msg = document.createElement('p');
        msg.innerHTML = `You burnt the ${character.player.backpack[inv].name}, so throw it out.`;
        character.player.backpack.splice(inv,1);
        socket.emit('backpack change',character.player.backpack);
        scrolltips.appendChild(msg);
    }
    displayInv();
}
function eat(inv){
    console.log('eating a: ',character.player.backpack[inv]);
}
//Player Map Interaction and Actions
socket.on('action', data => {
    console.log('triggered an action:',data[0]);
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
    if (data[0].action==='fire'){
        showFire();
    }
});
//RANDOM NUMBER GENERATOR from server
socket.on('rng', data =>{
    console.log('random num:',data.num);
    skillcheck = data.num;
});
//end
