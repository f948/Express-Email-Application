var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userData=[];
var i;
var usernameDuplicate=false,passwordDuplicate=false,login=false;

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
	
});

http.listen(60276, function() {
   console.log('listening on localhost:60276');
});