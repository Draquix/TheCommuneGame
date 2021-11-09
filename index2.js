//Server Engine - The Commune RPG: a multiplayer grindgame in which you run
//a small community of players working together to harvest and gather materials
//to craft gear or saleable materials and feed the group.  Also to gain combat
//levels for the characters while avoiding permadeath.
//Written by Daniel Rogahn (Draquix) beginning in 10/22

//SERVER DEPENDENCIES - This portion loads what's needed to host a server
//using express for html and socket.io for client/server communication and
//event handling

require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/static')));

//GLOBAL VARIABLES - these are mostly arrays or objects to serve as containers
//so objects can be taken 'out of the box' at a local level and manipulated
//by functions and put back 'in the box' to exist globally.

let SOCKET_LIST = {};
let PLAYER_LIST = [];
let MapBox = [];
let LegendBox = [];
let NPCBox = [];
let POIBox = [];

//SOCKET.IO CONNECTION - This portion handles incoming and outgoing
//server to client connections using socket.io to tell the server what
//the player is doing on their client as far as actions such as chopping wood
//at a tree or smelting ores into bars or battling a monster.
io.on('connection', socket => {
    //on connection it assigns a random id to the socket and performs a handshake
    //to sync up player data.
    console.log('Some client connected...');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking', {id: socket.id},MapBox,LegendBox);
    //when a user logs into the client, a character is created on the server and
    //the object is sent to the client for display.
    socket.on('login', user => {
        console.log("Player created by name of: ", user.name);
        let name = user.name;
        let pass = user.passphrase;
        player = new Player(name, pass, socket.id);
        PLAYER_LIST[socket.id] = player;
        socket.emit('player created', player);
    });
    //this receives input data from a client's form and sends the message
    //to all connected for a live chat system.
    socket.on('chat', message => {
        console.log('message from client: ', message);
        io.emit('chat', {message, id: socket.id});
    });
    //below receives the keypress for w,a,s,d movement.
    socket.on('key press', data => {
        player = PLAYER_LIST[socket.id];
        if(data.inputDir==='left'){
            let stepTile = MapBox[player.map][player.ypos-1][player.xpos-1];
            if(stepTile==='.'||stepTile===","){
                player.xpos--;
            } else {
                player.message = collisionMessage(stepTile);
                player.data.push(collisionData(stepTile,player.map,player.xypos,player.ypos,player.id));
            }
        }
        if(data.inputDir==='right'){
            let stepTile = MapBox[player.map][player.ypos-1][player.xpos+1];
            if(stepTile==='.'||stepTile===","){
                player.xpos++;
            } else {
                player.message = collisionMessage(stepTile);
                player.data.push(collisionData(stepTile,player.map,player.xypos,player.ypos,player.id));
            }
        }
        if(data.inputDir==='up'){
            let stepTile = MapBox[player.map][player.ypos-2][player.xpos];
            if(stepTile==="."||stepTile===","){
                player.ypos--;
            } else {
                player.message = collisionMessage(stepTile);
                player.data.push(collisionData(stepTile,player.map,player.xypos,player.ypos,player.id));
            }
        }
        if(data.inputDir==='down'){
            let stepTile = MapBox[player.map][player.ypos][player.xpos];
            if(stepTile==="."||stepTile===","){
                player.ypos++;
            } else {
                player.message = collisionMessage(stepTile);
                player.data.push(collisionData(stepTile,player.map,player.xypos,player.ypos,player.id));
            }
        }
        console.log(player.message);
    });
});

//RUNTIME ENGINE - This uses a setInterval to perform actions on 'ticks'. One interval
//is the crafting and action tick, for performing actions. The other is to update the player
//position and see other player characters move around on the map.
let timer = 0;
//this is the craft and action ticker
setInterval(function() {
    let pack = [];
    for (var i in PLAYER_LIST){
        let player = PLAYER_LIST[i];
        if(player.action===""){
            pack.push({
                action:false,
                pc:player,
                id:player.id
            });
            let socket = SOCKET_LIST[i];
            socket.emit('action',{pack:pack});
        }
        if(player.action==="Speaking to an NPC."){
            pack.push({
                action:true,
                pc:player,
                id:player.id
            });
            let socket = SOCKET_LIST[i];
            socket.emit('action',{pack:pack});
        }
    }
},1200)
//this is the drawscreen tick
setInterval(function() {
    let pack = [];
    for (var i in PLAYER_LIST){
        let player = PLAYER_LIST[i];
        pack.push({
            name:player.name,
            stats:player.stats,
            xpos:player.xpos,
            ypos:player.ypos,
            message:player.message
        });
        let socket = SOCKET_LIST[i];
        socket.emit('draw player',{pack, id: socket.id});
    }
    timer++;
    if ((timer%50)===0){
        console.log(timer," ticks elapsed.");
    }
},200);

//OPERATIONAL FUNCTIONS - These are the functions that handle things happening in the game.
//Collision Handling
function collisionMessage(tile){
    if(tile==="#"){
        return "Running into a wall...";
    }
    if(tile==="P"){
        return "Speaking to an NPC.";
    }
    if(tile==="%"){
        return "Banking with chest storage.";
    }
    if(tile==="="){
        return "Blacksmithing at forge.";
    }
    if(tile==="-"){
        return "Blacksmithing at anvil.";
    }
    if(tile==="*"){
        return "Investigating Point of Interest.";
    }
    if(tile==="&"){
        return "Cooking at a fire.";
    }
}
function collisionData(tile,map,x,y,id){
    if(tile==="P"){
        for(var i = 0; i < LegendBox[map].coordNPC.length; i++){
            if((LegendBox[map].coordNPC[i][0]===x-1||LegendBox[map].coordNPC[i][0]===x||LegendBox[map].coordNPC[i][0]===x+2||LegendBox[map].coordNPC[i]===x+1)&&(LegendBox[map].coordNPC[i][1]===y-1||LegendBox[map].coordNPC[i][1]===y||LegendBox[map].coordNPC[i][1]===y+1||LegendBox[map].coordNPC[i][1][y+2])){
                return NPCBox[i];
            }
        }
    }
    if(tile==="*"){
        for(var i = 0; i < LegendBox[map].coordPOI.length; i++){
            if((LegendBox[map].coordPOI[i][0]===x-1||LegendBox[map].coordPOI[i][0]===x||LegendBox[map].coordPOI[i][0]==x+2||LegendBox[map].coordPOI[i][0]===x+1)&&(LegendBox[map].coordPOI[i][1]===y-1||LegendBox[map].coordPOI[i][1]===y||LegendBox[map].coordPOI[i][1]===y+1||LegendBox[map].coordPOI[i][1][y+2])){
                return POIBox[i];
            }
        }
    }
}

//OBJECT CONSTRUCTOR FUNCTIONS - Templates for in game items and people
//Player Object
function Player (name, passphrase, id){
    this.name = name;
    this.passphrase = passphrase;
    this.id = id;
    this.xpos = 2;
    this.ypos = 2;
    this.stats = {
        str:1,dex:1,def:1,hp:10,mHp:10,coin:100,
        mine:1,forge:1,gather:1,fish:1,cook:1,chop:1
    };
    this.chest = [];
    this.backpack = [];
    this.rightHand = [];
    this.leftHand = [];
    this.weightLimit = 20 + 10*this.stats.str;
    this.weightLoad = 0;
    this.map = 0;
    this.pressRight = false;
    this.pressLeft = false;
    this.pressUp = false;
    this.pressDown = false;
    this.action = 'none';
    this.message = 'new character created';
    this.data = [];
    console.log("Player created by name of: ", this.name);
}

// GAME CONTENT DATA - Here is stored the maps and NPCs and other such static data.
// MAPS: an array of characters that represent people and items.
const map0 = [
    ['#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ['#','.',',','#','=','#','-','#',',','.','.',',','#'],
    ['#','.',',','.','.','*','.','.',',','.','.',',','#'],
    ['#','.','.','.','.','.','.','.','.','.','.','.','#'],
    ['#','.','.','P','.','.','.','.','.','#','1','#','#'],
    ['#',',','.','.',',','.','.',',','.','#'],
    ['#',',','.','.',',','.','.',',','.','#'],
    ['#',',','.','.',',','.','P',',','.','#','#'],
    ['#',',','.','.',',','.','%',',','.','&','#'],
    ['#',',','.','.',',','.','.',',','.','*','#'],
    ['#','#','#','#','#','#','#','#','#','#','#']
];
//LEGENDS: each map has a corresponding legend to work out unique interactions, so as to differentiate
// between the P that is one NPC and the P that is another, as well as monster data, and the reference
// of what map a door goes to.  There is also some color differentiation being used for flavor.
const legend0 ={
    NPC: ['red','green'],
    coordNPC: [[4,5],[7,8]],
    indexNPC:[0,1],
    coordPOI: [[6,3],[10,10]],
    indexPOI:[0,1],
    Wall: 'grey',
    floorDots: 'gray',
    floorSpots: 'blue',
};

//NPCs: NPC characters are represented as having a name, and a conversation tree, potentially quests and
//items for trade or sale.
const NPC0 = {
    name: "Balaster",
    conversations: [
        {message:"Ahh, welcome newcomer to DraqRogue!",choice:["Where am I?","What should I do?"],answerI:[1,2],end:false},
        {message:"These are the starting barracks... people begin here to feed the machine.",choice:["...the machine?"],answerI:[3],end:false},
        {message:"In this room is a furnace and an anvil. If you had the materials, you could smelt and forge things.",choice:["Where do I get materials?","Is there anything else to do?"],answer:[4,5],end:false},
        {message:"Draq wages constant war on other realms, so he needs to train people to work and fight to grind them down!",choice:["Who's the wizard in green?","What should I do?"],answerI:[6,2],end:false},
        {message:"Go out the door to the work yard and train on menial tasks so you become a good cog.",end:true},
        {message:"Aside from gathering and crafting, we do need good soldiers... you could train at combat. Also head out the door for that",end:true},
        {message:"Oh, that's wizard Gillar. He can teach you about the inventory storage system.",end:true}
    ],
    questBool:false
}
const NPC1 = {
    name: "Gillar",
    conversations:[
        {message:"Confound it! I can never understand how this singularity point allows you to take and leave things at will with such capacity!",end:true}
    ],
    questBool:true
}
//POIs:  Points of Interest are like signposts, when the character runs into them it displays a message
// about the contents of the nearby game world.
const POI0 = {message:['Here is the barracks forge and anvil.  The red "=" forge can be used to refine metal ores into ingots to be made into gear.  The "-" anvil along with a hammer can process those ingots into items']};
const POI1 = {message:['The red "&" fire is where you can cook basic meats into edible food to heal with.']};

//Game data is pushed to Global Variables that were established as containers to keep the game world
//static as the players interact with it and change their own unique experience.
MapBox.push(map0);
LegendBox.push(legend0);
NPCBox.push(NPC0);
NPCBox.push(NPC1);
POIBox.push(POI0);
POIBox.push(POI1);

//With all the files loaded, the below statement causes the server to boot up and listen for client connections.
server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
