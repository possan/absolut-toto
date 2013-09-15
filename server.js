//
// bar server
//

var g_queue = [];

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
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    }
  );
}

io.sockets.on('connection', function (socket) {

  socket.emit('welcome', { hello: 'world' });

  socket.on('my other event', function (data) {
    console.log(data);
  });

});
