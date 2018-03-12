//Donald Lukinuk 10126621
//SENG 513 Winter 2018
$(function () {
	var socket = io();
	var myName = "filler";
	$('form').submit(function(){
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('all messages', function(msg){
		for (i = 0; i < msg.length; i++){
			//userMsg = hour, minute, seconds, name, color, message
			usrMsg = msg[i];
			hours = usrMsg[0];
			minutes = usrMsg[1];
			seconds = usrMsg[2];
			name = usrMsg[3];
			usrColor = usrMsg[4];
			message = usrMsg[5];
			if (myName === name){
				txt = '<li><b>'+hours +':'+minutes+':'+seconds+' '+'<font color="'+usrColor+'">'+name+'</font>'+': '+message+'</b></li>';
			}
			else{
				txt = '<li>'+hours +':'+minutes+':'+seconds+' '+'<font color="'+usrColor+'">'+name+'</font>'+': '+message+'</li>';
			}
				$('#messages').append(txt);
		}
		$(".pre-scrollable").scrollTop($(".pre-scrollable")[0].scrollHeight);
	});
	socket.on('chat message', function(msg){
		//userMsg = hour, minute, seconds, name, color, message
		hours = msg[0];
		minutes = msg[1];
		seconds = msg[2];
		name = msg[3];
		usrColor = msg[4];
		message = msg[5];
		if (myName === name){
			txt = '<li><b>'+hours +':'+minutes+':'+seconds+' '+'<font color="'+usrColor+'">'+name+'</font>'+': '+message+'</b></li>';
		}
		else{
			txt = '<li>'+hours +':'+minutes+':'+seconds+' '+'<font color="'+usrColor+'">'+name+'</font>'+': '+message+'</li>';
		}
		$('#messages').append(txt);
		$(".pre-scrollable").scrollTop($(".pre-scrollable")[0].scrollHeight);
	});
	//adding this made scrolling broken on new messages
	socket.on('changed username', function(msg){
		myName = msg;
		txt = 'Your Name Is ' + msg;
		$('#userName').text(txt);
	});
	socket.on('user list', function(msg){
		txt = '<ul id="users"><li>'+msg[0]+'</li></ul>';
		$('#users').replaceWith(txt);
		for (i = 1; i < msg.length; i++){
			txt = '<li>'+msg[i]+'</li>';
			$('#users').append(txt);
			$(".pre-scrollable").scrollTop($(".pre-scrollable")[0].scrollHeight);
		}
	});
	socket.on('general', function(msg){
		$('#messages').append($('<li>').text(msg));
		$(".pre-scrollable").scrollTop($(".pre-scrollable")[0].scrollHeight);
	});
});