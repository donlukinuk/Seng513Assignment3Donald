var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var chatHistory = [];

let num = 1;
let users = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use('/', express.static(__dirname + '/'));

io.on('connection', function(socket){
	//What happens when a new user connects
	//create username
	name = 'User' + num;
	num += 1;
	var obj = {id: socket.id, userName: name, color: '000000'};
	users.push(obj);
	socket.emit('changed username', name);
	//Sends all chat messages when a user joins
	socket.emit('all messages', chatHistory);
	userNames = [];
	for (i = 0; i < users.length; i++){
		userNames.push(users[i].userName);
	}
	io.emit('user list', userNames);
	txt = "The following user entered the chatroom: " + name;
	io.emit('general', txt);
	
	//Happens when a new message is received
	socket.on('chat message', function(msg){
		//find username for message
		var userIndex = users.findIndex(x => x.id === socket.id);
		var user = users.find(x => x.id === socket.id);
		//check if user is changing userName
		//TODO only make first word
		if (msg.substring(0, 6) === '/nick '){
			//Check Nickname
			unique = 1;
			for (i = 0; i < users.length; i++){
				if (msg.substring(6) === users[i].userName){
					unique = 0;
				}
			}
			if (unique){
				txt = 'User "' + user.userName + '" changed nickname to: "' +msg.substring(6) +'"';
				var newObj = {id: socket.id, userName: msg.substring(6), color: user.color};
				users[userIndex] = newObj;
				//update user name on chat
				socket.emit('changed username', msg.substring(6));
				//resend userlist to all users
				userNames = [];
				for (i = 0; i < users.length; i++){
					userNames.push(users[i].userName);
				}
				io.emit('user list', userNames);
				//Send update message to users
				io.emit('general', txt);
			}
			else{
				txt = 'Username: "' + msg.substring(6)+'" already exsists, please try another name';
				socket.emit('general', txt);
			}
		}
		//TODO make sure color substring is valid
		else if (msg.substring(0,11) === '/nickcolor ') {
			if (msg.length === 17){
				txt = msg.substring(11);
				var newObj = {id: socket.id, userName: user.userName, color: msg.substring(11)};
				users[userIndex] = newObj;
			}
			else{
				txt = 'Invalid nickcolor, use format "/nickcolor rrbbgg"';
				socket.emit('general', txt);
			}
		}	
		else{
			//userMsg = hour, minute, seconds, name, color, message
			var userMsg = [];
			//get and send time to client
			var date = new Date();
			userMsg.push(date.getHours());
			userMsg.push(date.getMinutes());
			userMsg.push(date.getSeconds());
			//get and send username, color
			userMsg.push(user.userName);
			userMsg.push(user.color);
			userMsg.push(msg);
			//check if history has 200 messages
			if (chatHistory.length >= 200){
				chatHistory.shift();
			}
			//update chat history
			chatHistory.push(userMsg);
			//send message to all clients
			io.emit('chat message', userMsg);
		}
	});
	
	//Is preformed when a user disconnects
	socket.on('disconnect', function(){
		var userIndex = users.findIndex(x => x.id === socket.id);
		txt = "The following user has disconnected: " + users[userIndex].userName;
		users.splice(userIndex,1);
		userNames = [];
		for (i = 0; i < users.length; i++){
			userNames.push(users[i].userName);
		}
		io.emit('user list', userNames);
		io.emit('general', txt);
	});
});

http.listen(port, function(){
	console.log('listening on *:' + port);
});
