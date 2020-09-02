  
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userData=[],messages=[];
var i,messageId=0,connectedUsers=0;
var usernameDuplicate=false,passwordDuplicate=false,login=false,userExists=false;
var adminPassword="Administrator@09";

// register for an account
app.get('/register', function (req, res) {
	res.sendfile("register.html");
});

// login into your account
app.get('/login', function (req, res) {
	if(connectedUsers<50){
		res.sendfile("login.html");
	}
	else if(connectedUsers>=50){
		res.send("Too many connected users");
	}
});

// reset your username or password
app.get('/update', function (req, res) {
	res.sendfile("update.html");
	
});

// navigate to admin dashboard
app.get('/admin', function (req, res) {
	res.sendfile("admin.html");
	
});

// if connection is recieved through socket check for data being sent 
io.on('connection', function(socket) {
	
	connectedUsers++;
	
	socket.on("disconnect",function(){
		connectedUsers--;
	});
	
	socket.on("validateRegisterInfo",function(data){
		
		usernameDuplicate=false;
		passwordDuplicate=false;
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username == data.username){
				usernameDuplicate=true;
			}
			if(userData[i].password == data.password){
				passwordDuplicate=true;
			}
		}
		
		socket.emit("usernameDuplicate",usernameDuplicate);
		socket.emit("passwordDuplicate",passwordDuplicate);
	});
	
	socket.on("register",function(data){
		userData.push({username:data.username,password:data.password});
		
	});
	
	socket.on("validateLoginInfo",function(data){
		
		login=false;
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username==data.username && userData[i].password==data.password){
				login=true;
			}
		}
		
		socket.emit("login",login);
	});
		
	socket.on("update",function(data){
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username==data.oldUsername && userData[i].password==data.oldPassword){
				userData[i].username=data.newUsername;
				userData[i].password=data.newPassword;
			}
		}
	});
	
	socket.on("getMessages",function(){
		
		for(i=0;i<=messages.length-1;i++){

			io.sockets.emit("getMessage",messages[i]);

		}
	});
	

	socket.on("sendMessage",function(data){
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username == data.to){
				userExists=true;
				
			}
		}
		
		if(userExists){
			messages.push({to:data.to,from:data.from,subject:data.subject,message:data.message,date:data.date,id:messageId,deleted:false});
			io.sockets.emit("getMessage",{to:data.to,from:data.from,subject:data.subject,message:data.message,date:data.date,id:messageId,deleted:false});
			messageId++;
		}
		
		else if(!userExists){
			socket.emit("userNotExist",data.to);
		}
		
		userExists=false;

	});
	
	socket.on("deleteMessage",function(id){	
		
		for(i=0;i<=messages.length-1;i++){
			
			if(messages[i].id==id){
				messages[i].deleted=true;
			}
		}
		
		io.sockets.emit("messagesUpdated",messages);
		
	});
	
	socket.on("changeMessages",function(usernames){
		for(i=0;i<=messages.length-1;i++){
			if(messages[i].to == usernames.oldUsername){
				messages[i].to=usernames.newUsername;
			}
			
			if(messages[i].from == usernames.oldUsername){
				messages[i].from=usernames.newUsername;
			}
		}
		
		io.sockets.emit("messagesUpdated",messages);
		
	});
	
	socket.on("sendAdminPassword",function(){
		socket.emit("getAdminPassword",adminPassword);
	});
	
	socket.on("changeAdminPassword",function(passwd){
		
		adminPassword=passwd;
		io.sockets.emit("getAdminPassword",adminPassword);
		
	});
});

	
http.listen(60274, function() {
   console.log('listening on localhost:60274');
});