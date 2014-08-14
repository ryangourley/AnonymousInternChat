var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var onlinecount = 0;
var connectedIPs = [];
var numberoftabs = {};
var anonymousNames = {};
var chats = [];

var adjectivetokens = ['Grumpy', 'Sleepy', 'Angry', 'Blue', 'Green', 'Funky', 'Red', 'Yellow', 'Fiesty', 'Discombobulated'];
var tokens = ['Dragon', 'Monkey', 'Dolphin', 'Walrus', 'Unicorn', 'Intern'];
var namesTaken = [];

function newName(){
	var text = '';
	for (var i=0; i<1; i++) {
	    text += adjectivetokens[Math.floor(Math.random()*adjectivetokens.length)];
	}
	for (var i=0; i<1; i++) {
	    text += tokens[Math.floor(Math.random()*tokens.length)];
	}
	return text;
}


io.on('connection', function(socket){

	//console.log(io.sockets.connected);
	id = socket.id;
	for (q in chats){
		socket.emit('chat message', chats[q]);
	}


	var address = socket.request.connection.remoteAddress;


	if (connectedIPs.indexOf(address) > -1){
		//we are already connected
		numberoftabs[address] +=1;
		console.log('tabs open for '+address+' is now'+String(numberoftabs[address]));

	}
	else{
		//we need a new name
		var ipalias = newName();
		while (namesTaken.indexOf(ipalias) > -1){
			//generate a new name until we get one that isn't taken
			ipalias = newName();
		}

		onlinecount++;
		connectedIPs.push(address);
		numberoftabs[address] = 1;
		anonymousNames[address] = ipalias;
		console.log('tabs open for '+anonymousNames[address]+' is now'+String(numberoftabs[address]));
	}
	
	io.emit('onlinecount', onlinecount);
  socket.on('chat message', function(msg){
    io.emit('chat message', String(anonymousNames[address])+': '+msg);
    chats.push(String(anonymousNames[address])+': '+msg);

  });

  socket.on('disconnect', function(){

  	if (numberoftabs[address] == 1){

  		onlinecount--;
  		connectedIPs.splice(connectedIPs.indexOf(address), 1);
  		io.emit('onlinecount', onlinecount);
  		console.log('Complete disconnect for '+anonymousNames[address]);
  		namesTaken.splice(namesTaken.indexOf(anonymousNames[address]), 1);
  	}
  	else {
  		numberoftabs[address] -=1;
  		console.log('tabs open for '+address+' is now'+String(numberoftabs[address]));
  	}
    
    
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
