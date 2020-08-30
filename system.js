var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userData=[];
var i,messageId=0;
var usernameDuplicate=false,passwordDuplicate=false,login=false,userExists=false;
var messages=[];
// register for an account
app.get('/register', function (req, res) {
	res.sendfile("register.html");
});

// login into your account
app.get('/login', function (req, res) {
	res.sendfile("login.html");
	
});

// reset your username or password
app.get('/update', function (req, res) {
	res.sendfile("update.html");
	
});

// if connection is recieved through socket check for data being sent 
io.on('connection', function(socket) {
	
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
	
	socket.on("getMessages",function(username){
		
		for(i=0;i<=messages.length-1;i++){
			
			if(!messages[i].deleted){
				io.sockets.emit("getMessage",{to:messages[i].to,from:messages[i].from,message:messages[i].message,date:messages[i].date,id:messages[i].id});
			}
			
		}
	});
	

	socket.on("sendMessage",function(data){
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username == data.to){
				userExists=true;
				
			}
		}
		
		if(userExists){
			messages.push({to:data.to,from:data.from,message:data.message,date:data.date,id:messageId,deleted:false});
			io.sockets.emit("newMessage",{to:data.to,from:data.from,message:data.message,date:data.date,id:messageId,deleted:false});
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
	});
});

http.listen(60274, function() {
   console.log('listening on localhost:60274');
});