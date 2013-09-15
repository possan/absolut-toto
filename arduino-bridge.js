var io = require('socket.io-client');
var serialportmodule = require("serialport");

var com = new serialportmodule.SerialPort("/dev/tty.usbmodem1411",{
  baudrate: 9600,
  parser: serialportmodule.parsers.readline("\n")
});

var ids = [];

// var socket = io.connect('http://172.16.10.97:22222/');
var socket = io.connect('http://localhost:22222/');

socket.on('connect', function (data) {
  console.log('connect', data);
  // socket.emit('get-button-id', {});
});

com.on("data", function (data) {
  console.log('data', data);

  if (data == '+1') { socket.emit('button-down', { id: '1' } ); }
  if (data == '-1') { socket.emit('button-up', { id: '1' } ); }

  if (data == '+2') { socket.emit('button-down', { id: '2' } ); }
  if (data == '-2') { socket.emit('button-up', { id: '2' } ); }

  if (data == '+3') { socket.emit('button-down', { id: '3' } ); }
  if (data == '-3') { socket.emit('button-up', { id: '3' } ); }

  if (data == '+4') { socket.emit('button-down', { id: '4' } ); }
  if (data == '-4') { socket.emit('button-up', { id: '4' } ); }
});

