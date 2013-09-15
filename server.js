//
// bar server
//

var g_queue = [];
var g_index = 10;
var g_allsockets = [];
var g_bartenders = {};
var g_game = '';

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    osc = require('node-osc');

var oscclient = new osc.Client('127.0.0.1', 3333);

app.listen(22222);

function handler (req, res) {
  console.log('req.url', req.url);

  var filename = req.url;
  if (filename == '/') filename = '/index.html';
  fs.readFile(__dirname + '' + filename,
    function (err, data) {
      if (err) {
        res.writeHead(404);
        return res.end('Error');
      }
      res.writeHead(200);
      res.end(data);
    }
  );
}

function broadcast(eventname, eventdata) {
  g_allsockets.forEach(function(socket) {
    socket.emit(eventname, eventdata);
  });
}

function broadcast_queue() {
  broadcast('queue-update', {
    game: g_game,
    queue: g_queue,
    bartenders: g_bartenders
  });
  oscclient.send('/queue', g_queue.join(','));
  oscclient.send('/bartenders', JSON.stringify(g_bartenders));
  oscclient.send('/game', g_game);
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
    if (id != '') {
      var idx = g_queue.indexOf(id);
      if (idx != -1) {
        broadcast('queue-remove', { place: pos, id: data.id });
      }
    }
  });

  socket.on('button-down', function (data) {
    console.log('button-down', data);
    var pos = g_queue.length;
    g_queue.push(data.id);
    broadcast_queue();
    broadcast('queue-add', { place: pos, id: data.id });
  });

  socket.on('button-up', function (data) {
    console.log('button-up', data);

    // if in use by bartender, ignore button-up.

    var in_progress = false;
    var key;
    while(key in g_bartenders) {
      if (g_bartenders[key] == data.id)
        in_progress = true;
    }

    if (in_progress)
      return;

    var idx = g_queue.indexOf(data.id);
    if (idx != -1) {
      g_queue.splice(idx, 1);
      // delete(g_queue[idx]);
      broadcast('queue-remove', { place: idx, id: data.id });
    }

    broadcast_queue();
  });

  socket.on('game-start', function (data) {
    console.log('begin game');
    g_game = data.game;
    broadcast_queue();
  });

  socket.on('game-end', function (data) {
    console.log('end game');
    g_game = '';
    broadcast_queue();
  });

  socket.on('bartender-serve', function (data) {
    // console.log('button-up', data);
    // g_queue.push('-'+data.id);
    g_bartenders[data.bartender] = data.customer;
    broadcast_queue();
    broadcast('bartender-serve', { bartender: data.bartender, customer: data.id });
  });

  socket.on('bartender-done', function (data) {
    // console.log('button-up', data);
    // g_queue.push('-'+data.id);
    if (g_bartenders[data.bartender]) {
      var customer = g_bartenders[data.bartender];
      delete(g_bartenders[data.bartender]);
      var idx = g_queue.indexOf(customer);
      if (idx != -1) {
        g_queue.splice(idx, 1);
      }
    }
    broadcast_queue();
    broadcast('bartender-done', { bartender: data.bartender });
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

});
