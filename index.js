const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const path  = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.set('view engine', 'ejs');



const waitingUsers = [];
const rooms = {};



io.on('connection', (socket) => {   
    console.log('User connected ' + socket.id);

    socket.on('joinroom' ,function(){
        if(waitingUsers.length > 0){
            let partner = waitingUsers.shift();
            const roomName = `${socket.id}#${partner.id}`;
            console.log(roomName)
            partner.join(roomName);
            socket.join(roomName);
            io.to(roomName).emit('joined', roomName);
        }
        else{
            waitingUsers.push(socket);
        }

    })

    socket.on('message', ({room, message}) => {
        socket.broadcast.to(room).emit('message', message);
    });


    socket.on('signalingMessage' , function({room, message}){
        socket.broadcast.to(room).emit('signalinmessage', message);
    })

    socket.on('startVideoCall' , function({room}){
        socket.broadcast.to(room).emit('incomingCall');
    })

    socket.on('acceptCall' , function({room}){
        socket.broadcast.to(room).emit('callAccepted');
    })  

    socket.on('rejectCall' , function({room}){
        socket.broadcast.to(room).emit('callRejected');
    })
    
    socket.on('disconnect', () => {
        const index = waitingUsers.findIndex((user) => user.id === socket.id);
        if(index > -1){
            waitingUsers.splice(index, 1);
        }
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    res.render('chat');
}); 



server.listen(3000, () => {
    console.log('Server running on port 3000');
}); 
