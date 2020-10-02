var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userData=[],messages=[],posts=[];
var i,messageId=0,connectedUsers=0;
var usernameExists=false,passwordExists=false,login=false,userExists=false;
var adminPassword="Administrator@09";

const port = process.env.PORT || 3000

app.get('/', function (req, res) {
	res.sendfile("register.html");
});

// register for an account
app.get('/register.html', function (req, res) {
	res.sendfile("register.html");
});

// login into your posts account
app.get('/posts.html', function (req, res) {
	if(connectedUsers<50){
		res.sendfile("posts.html");
	}
	else if(connectedUsers>=50){
		res.send("Too many connected users");
	}
});

// login into your email account
app.get('/email.html', function (req, res) {
	if(connectedUsers<50){
		res.sendfile("email.html");
	}
	else if(connectedUsers>=50){
		res.send("Too many connected users");
	}
});

// get a user's posts 
app.get('/search.html', function (req, res) {
	res.sendfile("search.html");
});

// reset your username or password
app.get('/update.html', function (req, res) {
	res.sendfile("update.html");
	
});

// navigate to admin dashboard
app.get('/admin.html', function (req, res) {
	res.sendfile("admin.html");
	
});

// if connection is recieved through socket check for data being sent 
io.on('connection', function(socket) {
	
	connectedUsers++;
	
	socket.on("disconnect",function(){
		connectedUsers--;
	});
	
	socket.on("validateRegisterInfo",function(data){
		
		usernameExists=false;
		passwordExists=false;
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username == data.username){
				usernameExists=true;
			}
			if(userData[i].password == data.password){
				passwordExists=true;
			}
		}
		
		socket.emit("isRegisterInfoNew",{usernameStatus:usernameExists,passwordStatus:passwordExists});

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
	
	socket.on("getPosts",function(){
		
		for(i=0;i<=posts.length-1;i++){

			io.sockets.emit("getPost",posts[i]);

		}
	});
	

	

	socket.on("sendMessage",function(data){
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username == data.to){
				userExists=true;
				
			}
		}
		
		if(userExists){
			messages.push({to:data.to,from:data.from,subject:data.subject,image:data.image,message:data.message,date:data.date,id:messageId,deleted:false});
			io.sockets.emit("getMessage",{to:data.to,from:data.from,subject:data.subject,image:data.image,message:data.message,date:data.date,id:messageId,deleted:false});
			messageId++;
		}
		
		else if(!userExists){
			socket.emit("userNotExist",data.to);
		}
		
		userExists=false;

	});
	
	socket.on("getUserPosts",function(username){
		
		for(i=0;i<=userData.length-1;i++){
			
			if(userData[i].username == username){
				userExists=true;
				
			}
		}
		
		if(userExists){
			
			for(i=0;i<=posts.length-1;i++){

				socket.emit("getPost",posts[i]);

			}
		}
		
		else if(!userExists){
			
			socket.emit("userNotExist",username);
			
		}
		
		userExists=false;
		
	});
	
	socket.on("sendPost",function(data){
		
			posts.push({from:data.from,subject:data.subject,image:data.image,message:data.message,date:data.date,id:messageId,deleted:false});
			io.sockets.emit("getPost",{from:data.from,subject:data.subject,image:data.image,message:data.message,date:data.date,id:messageId,deleted:false});
			messageId++;

	});
	
	socket.on("deleteMessage",function(id){	
		
		for(i=0;i<=messages.length-1;i++){
			
			if(messages[i].id==id){
				messages[i].deleted=true;
			}
		}

	});
	
	socket.on("deletePost",function(id){	
		
		for(i=0;i<=posts.length-1;i++){
			
			if(posts[i].id==id){
				posts[i].deleted=true;
			}
		}


		
	});
	
	socket.on("change",function(usernames){
		for(i=0;i<=messages.length-1;i++){
			if(messages[i].to == usernames.oldUsername){
				messages[i].to=usernames.newUsername;
			}
			
			if(messages[i].from == usernames.oldUsername){
				messages[i].from=usernames.newUsername;
			}
		}
		
		for(i=0;i<=posts.length-1;i++){

			if(posts[i].from == usernames.oldUsername){
				posts[i].from=usernames.newUsername;
			}
		}
		
	});
	
	socket.on("sendAdminPassword",function(){
		socket.emit("getAdminPassword",adminPassword);
	});
	
	socket.on("changeAdminPassword",function(passwd){
		
		adminPassword=passwd;
		io.sockets.emit("getAdminPassword",adminPassword);
		
	});
});

	
http.listen(port, function() {
   console.log('listening on localhost'+port);
});