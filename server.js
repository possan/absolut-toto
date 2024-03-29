//
// bar server
//

var g_queue = [];
var g_index = 10;
var g_allsockets = [];
var g_bartenders = {};
var g_game = '';
var g_gamestate = {};

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs')
    //osc = require('node-osc');

/*io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});*/

//var oscclient = new osc.Client('127.0.0.1', 3333);

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
  /*oscclient.send('/queue', g_queue.join(','));
  oscclient.send('/bartenders', JSON.stringify(g_bartenders));
  oscclient.send('/game', g_game);*/
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

    if (g_game == 'spam') {

      if (typeof(g_gamestate.players[data.id]) == 'undefined')
        g_gamestate.players[data.id] = 0;

      g_gamestate.players[data.id] ++;

      if (g_gamestate.players[data.id] >= 100) {

        broadcast('game-over', { state: g_gamestate.players, winner: data.id });
        g_game = 'gameover';
        setTimeout(function() {
          broadcast('game-end', {});
          g_game = '';
          broadcast_queue();
        }, 5000);
      }

      console.log(g_gamestate.players);

      broadcast('game-update', { state: g_gamestate.players });
    } else if (g_game == 'react') {

      g_gamestate.players[data.id] = (+new Date()) - g_gamestate.gamestart;

      console.log(g_gamestate.players);
      broadcast('game-update', { state: g_gamestate.players });

    } else {

      var idx = g_queue.indexOf(data.id);
      if (idx == -1) {
        var pos = g_queue.length;
        g_queue.push(data.id);
        broadcast_queue();
        broadcast('queue-add', { place: pos, id: data.id });
        //oscclient.send('/midi/noteon', 0, 36 + parseInt(data.id, 10) - 1, 127);
      }
    }
  });

  socket.on('button-up', function (data) {
    console.log('button-up', data);

    //oscclient.send('/midi/noteoff', 0, 36 + parseInt(data.id, 10) - 1, 0);

    // if in use by bartender, ignore button-up.

    var in_progress = false;
    var key;
    for(key in g_bartenders) {
      if (g_bartenders[key] == data.id)
        in_progress = true;
    }

    if (in_progress) {
      console.log('release ignored, in progress.', g_bartenders);
      return;
    }

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
    if (g_game == 'spam') {
      g_gamestate = {
        players: {}
      };

      broadcast('game-init', { state: g_gamestate.players, game: g_game });
      setTimeout(function() {
        broadcast('game-prepare', { state: g_gamestate.players, time: 5 });
      }, 10);
      setTimeout(function() {
        broadcast('game-prepare', { state: g_gamestate.players, time: 4 });
      }, 1000);
      setTimeout(function() {
        broadcast('game-prepare', { state: g_gamestate.players, time: 3 });
      }, 2000);
      setTimeout(function() {
        broadcast('game-prepare', { state: g_gamestate.players, time: 2 });
      }, 3000);
      setTimeout(function() {
        broadcast('game-prepare', { state: g_gamestate.players, time: 1 });
      }, 4000);
      setTimeout(function() {
        broadcast('game-start', { state: g_gamestate.players, time: 0 });
      }, 5000);
    }

    if (g_game == 'react') {
      g_gamestate = {
        players: {}
      };

      broadcast('game-init', { state: g_gamestate.players, game: g_game });
      setTimeout(function() {
        broadcast('game-prepare', { state: g_gamestate.players, time: 6 });
      }, 10);
      setTimeout(function () {
        broadcast('game-prepare', { state: g_gamestate.players, time: 5 });
      }, 1000);
      setTimeout(function () {
        broadcast('game-prepare', { state: g_gamestate.players, time: 4 });
      }, 2000);
      setTimeout(function () {
        broadcast('game-prepare', { state: g_gamestate.players, time: 3 });
      }, 3000);
      setTimeout(function () {
        broadcast('game-prepare', { state: g_gamestate.players, time: 2 });
      }, 4000);
      setTimeout(function () {
        broadcast('game-prepare', { state: g_gamestate.players, time: 1 });
      }, 5000);
      setTimeout(function () {
        broadcast('game-prepare', { state: g_gamestate.players, time: 0 });
      }, 5000);
      setTimeout(function () {
        broadcast('game-start', { state: g_gamestate.players, time: 0 });
        g_gamestate.gamestart = +new Date();
      }, 5000 + Math.floor(Math.random() * (3000 - 1000 + 1) + 1000));
    }

    broadcast_queue();
  });

  socket.on('game-end', function (data) {
    console.log('end game', data);
    broadcast_queue();

    if (data.game == 'react') {
      var sortable = [];
      for (var id in g_gamestate.players) {
        sortable.push([id, g_gamestate.players[id]]);
      }
      var winner = sortable.sort(function(a,b) { return a[1]-b[1]; });
      winner = winner[0];

      broadcast('game-over', { state: g_gamestate.players, winner: winner });

      g_game = '';

    } else {
      g_game = '';
    }
  });

  socket.on('bartender-serve', function (data) {
    console.log('bartender-serve', data);
    // console.log('button-up', data);
    // g_queue.push('-'+data.id);
    g_bartenders[data.bartender] = data.customer;
    broadcast_queue();
    broadcast('bartender-serve', { bartender: data.bartender, customer: data.id });
  });

  socket.on('bartender-done', function (data) {
    console.log('bartender-done', data);
    // g_queue.push('-'+data.id);
    /* if (g_bartenders[data.bartender]) {
      var customer = g_bartenders[data.bartender];
      console.log('release bartender', data.bartender);
      delete(g_bartenders[data.bartender]);
      */
      var idx = g_queue.indexOf(data.customer);
      console.log('remove index', idx, g_queue);
      if (idx != -1) {
        g_queue.splice(idx, 1);
        broadcast('queue-remove', { place: idx, id: data.customer });
      }
      g_bartenders = [];
    // }
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
