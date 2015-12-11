var express = require('express'),
	app = express(),
	http = require('http').createServer(app),
	io = require('socket.io').listen(http),
	users = [],
	rooms = ['lobby','chat','hottub'];

http.listen(process.env.PORT || 3000);

app.get('/',function(req,res){
	console.log('Sending index.html');
	res.sendFile(__dirname + '/index.html');
});

  // Routing
  app.use('/js',  express.static(__dirname + '/js'));
  app.use('/css', express.static(__dirname + '/css'));

io.on('connection', function(socket){

	handleNewUser(socket);
	handleSwitchRoom(socket);
	handleSendMessage(socket);
	handleDisconnect(socket);	
});
	
function handleNewUser(socket){
	socket.on('new-user', function(username, error){
		if(users.indexOf(username) != -1){
			//User name taken. Return error. 
			error(true);
		} else {
			error(false);
			updateUser(socket, username);
			joinRoom(socket,'lobby'); //Join default room.

			// Welcome user.
			socket.emit('update-chat','SERVER: ' + 'Welcome! ' + username + ' You have connected to lobby');

			// To everyone but the user.
			socket.broadcast.emit('user-joined', 'SERVER: ' + username + ' has connected');

			// Update users list.
			 updateConnectedUsers(socket, users);
			}
		});
}

function handleSwitchRoom(socket){
	socket.on('switch-room', function(newRoom){
		
		leaveRoom(socket); //Leave current room
		broadcastToRoom(socket, socket.room, 'update-chat', 'SERVER: ' + socket.username + ' has left this room');

		joinRoom(socket, newRoom); //Join new room
		broadcastToRoom(socket, newRoom, 'update-chat', 'SERVER: ' + socket.username + ' has joined this room');

		socket.emit('update-chat', 'SERVER:' + ' You have connected to ' + newRoom);
	});
}

function handleSendMessage(socket){
	socket.on('send-message', function(message){
		io.sockets.in(socket.room).emit('new-message', {user : socket.username, message : message});
	});
}

function handleDisconnect(socket){
	socket.on('disconnect', function(data){
		
		if(!socket.username) return;
		users.splice(users.indexOf(socket.username), 1);
		updateConnectedUsers(socket, users);
		broadcastToRoom(socket, socket.room,'user-disconnected', socket.username + ' disconnected');
	});
}

function updateUser(socket, username){
	socket.username = username;
	users.push(socket.username);
}

function joinRoom(socket, newRoom){
	socket.room = newRoom;
	socket.join(newRoom);
}

function leaveRoom(socket){
	socket.leave(socket.room); // leave the current room
	socket.emit('clear-chat'); // clear chat window.
}

function broadcastToRoom(socket, room, event, message){
	socket.broadcast.to(room).emit(event, message);
}

function updateConnectedUsers(socket, users){
	io.emit('users', users);
}