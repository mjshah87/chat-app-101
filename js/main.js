$(function(){
	var $users = $('#users');
	var $send = $('#send');
	var $modalClose = $('#close-modal');
	var $selectusername = $('#select-username');
	var $message = $('#message');
	var $chat= $('#chat');

	var socket = io.connect();

	showModal();

// if(sessionStorage['popup'] != 'true'){
// 	sessionStorage['popup'] = 'true';
// 	showModal(); //Only on first page load?
// }

	$selectusername.on('click',function(e){
		var $username = $('#username').val();
		e.preventDefault();
			socket.emit('new-user', $username, function(error){
				if(error){
					alert( 'Username is already taken, try another' );
					showModal();
				}
			});
	});

	// when the user sends a message.
	$send.on('click', function(e){
		e.preventDefault();
		socket.emit('send-message', $message.val(), function(error){
			displayMessage("<span class='error'>" + error + " </span> ");
		});
		$message.val('');
	});

	// Disable inputs if the user closes the modal without entering a username.
	$modalClose.on('click', function(e){
		e.preventDefault();
		$("#message").prop('disabled', true);
		$("#send").prop('disabled', true);
	});

	$('#rchat').on('click', function(e){
		e.preventDefault();
		socket.emit('switch-room', "chat");
	});

	$('#rhottub').on('click', function(e){
		e.preventDefault();
		socket.emit('switch-room', "hottub");
	});

	// New message to be displayed in the chat window.
	socket.on('new-message', function(data){
		displayMessage("<span class='chat'><strong>" + data.user +" :</strong> " + data.message);
	});

	socket.on('new-pm', function(data){
		displayMessage("<span class='pm'><strong>" + data.user +" :</strong> " + data.message);
	});

	// Display the list of users connected.
	socket.on('users', function(users){
		displayUsers(users);
	});

	// Display user joined
	socket.on('user-joined', function(message){
		displayMessage(message);
	});

	//Display user left.
	socket.on('user-disconnected', function(message){
		displayMessage(message);
	});

	socket.on('update-chat', function(message){
		displayMessage(message);
	});

	socket.on('clear-chat', function(){
		clearChat();
	});

	function displayUsers(users){
		var usernames = '';
		for(i=0; i < users.length; i++){
			usernames += users[i] + '<br/>'
		}

		$users.html(usernames);
	}

	function displayMessage(message){
		$chat.append(message + "</br>");
	}

	function clearChat(){
		$chat.empty();
	}

	function showModal(){
		$('#myModal').modal({
			backdrop: 'static',
  			keyboard: false,
			show: true
		});
	}

	function hideModal(){
		$('#myModal').modal('hide');

	}
});