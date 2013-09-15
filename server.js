//
// bar server
//

var g_queue = [];
var g_index = 0;
var g_allsockets = [];

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs')

app.listen(22222);

function handler (req, res) {
  console.log('req.url', req.url);

  var filename = 'index.html';
  if (req.url == '/button') {
    filename = 'button.html';
  } else if (req.url == '/bartender') {
    filename = 'bartender.html';
  } else if (req.url == '/renderer') {
    filename = 'renderer.html';
  }

  fs.readFile(__dirname + '/' + filename,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error');
      }
      res.writeHead(200);
      res.end(data);
    }
  );
}

function broadcast(event) {
  g_allsockets.forEach(function(socket) {
    socket.emit('queue-update', event);
  });
}

function broadcast_queue() {
  g_allsockets.forEach(function(socket) {
    socket.emit('queue-update', {
      queue: g_queue
    });
  });
}

io.sockets.on('connection', function (socket) {

  var id = '';

  g_allsockets.push(socket);

  socket.emit('welcome', { hello: 'world' });

  broadcast_queue();

  socket.on('disconnect', function (data) {
    console.log('disconnected', id);
    var idx = g_allsockets.indexOf(socket);
    delete(g_allsockets[idx]);
  });

  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('button-down', function (data) {
    console.log('button-down', data);
    g_queue.push('+'+data.id);
    broadcast_queue();
  });

  socket.on('button-up', function (data) {
    console.log('button-up', data);
    g_queue.push('-'+data.id);
    broadcast_queue();
  });

  socket.on('get-button-id', function (data) {
    console.log('get-button-id', data);
    id = g_index;
    g_index ++;
    // Math.floor(Math.random() * 100);
    console.log('assign id', id);
    socket.emit('button-id', { id: id });
    broadcast_queue();
  });

  socket.on('my other event', function (data) {
    console.log(data);
  });

});
