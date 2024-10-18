const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const path  = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.set('view engine', 'ejs');



const waitingusers = [];
const rooms = {};



io.on('connection', function (socket) {
    socket.on('joinroom', function () {
        if (waitingusers.length > 0) {
            let partner = waitingusers.shift();
            const roomname = `${socket.id}-${partner.id}`;
            socket.join(roomname);
            partner.join(roomname);
            io.to(roomname).emit('joined', roomname);
        }
        else {
            waitingusers.push(socket)
        }
    })
    socket.on('disconnect', function () {
        let index = waitingusers.findIndex(
            (waitingUser) => waitingUser.id === socket.id
        );
        waitingusers.splice(index, 1);
    })
    socket.on('message', function (data) {
        socket.broadcast.to(data.room).emit('message', data.message)
    })
    socket.on('signalingMessage', function (data) {
        socket.broadcast.to(data.room).emit('signalingMessage', data.message);
    })
    socket.on('startVideoCall', function ({ room }) {
        socket.broadcast.to(room).emit('incomingCall')
    })
    socket.on('acceptCall', function ({ room }) {
        socket.broadcast.to(room).emit('callAccepted')
    })
    socket.on('rejectCall', function ({ room }) {
        socket.broadcast.to(room).emit('callRejected')
    })

})

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    res.render('chat');
}); 



    setTimeout(() => {
        console.log('letting server to never stop');
    }, 100*60*60*24);

// setTimeout();

server.listen(process.env.PORT ||3000, () => {
    console.log('Server running on port 3000');
}); 
