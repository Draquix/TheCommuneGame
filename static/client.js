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

function render(message, id) {
    const output = document.createElement('p');
    if (id === socket.id) {
        output.classList.add('chat-message-user');
    }
    output.innerText = message;
    chatDump.appendChild(output);
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
}

socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    render(data.message,data.id);
});
socket.on('handshaking', data => {
    character.id = data.id;
    console.log('handed up id: ', character.id);
});
socket.on('player created', data => {
    character.player = data;
    console.log(character.player);
    displayCharacter();
});