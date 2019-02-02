var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var port = process.env.PORT || 80;
var server = app.listen(port, function () {
    console.log('listening for requests on port ' + port);
});

// Online nibas
var online = [];

// Static files
app.get('/', (req, res) => {
    res.render('index.ejs', {
        count: online.length + 1
    });
});
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.sockets.on('connection', (socket) => {

    console.log('Made socket connection ', socket.id);

    // Handle user disconnect event
    socket.on('disconnect', function () {
        var entry = online.find(function (element) {
            return String(element.socketId) === socket.id;
        });

        // console.log(entry);
        console.log(socket.id + ' Got disconnected!');

        online = online.filter(function (x) {
            return x.socketId !== socket.id;
        });

        if (entry !== undefined) {
            io.sockets.emit('disconnect', [entry.name, online.length]);
        } else {
            io.sockets.emit('disconnect', ['a strange user', online.length]);
        }
    });

    // Handle user joined event
    socket.on('user-joined', function (data) {
        online.push({
            socketId: socket.id,
            name: data.handle
        });
        data.online = online.length;
        console.log(data);
        socket.broadcast.emit('user-joined', data);
    });

    socket.on('name-change', function (data) {
        console.log(socket.id + ' requested a name change!');
        for (var i = 0; i < online.length; i++) {
            console.log(online[i]);
            if (String(online[i].socketId) === socket.id) {
                io.sockets.emit('name-change', [online[i].name, data.handle]);
                online[i].name = data.handle;
            }
        }
    });

    // Handle chat event
    socket.on('chat', function (data) {
        // console.log(data);
        io.sockets.emit('chat', data);
    });

    // Handle typing event
    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data);
    });

});