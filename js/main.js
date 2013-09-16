var colors = [
  "#FF9EA0",
  "#A99DFF",
  "#FF94FF",
  "#7FFF9F"
];
var hostname = document.location.hostname;

function removeElements(data) {
  var elem = $('#render').find('.no_'+data.id);
  elem.removeClass('opened');
  setTimeout(function () {
    elem.remove();
  }, 200);
}

function drawElements(data) {
  var elem = document.createElement('div');
  elem = $(elem);
  elem.addClass('player no_'+data.id);
  elem.addClass('playeranim btn btn-big');
  elem.addClass('');
  elem.html('<p>#'+data.id+'</p>');
  elem.css({
    'background-color': colors[data.id%colors.length]
  });
  elem.appendTo($('#render'));
  setTimeout(function() {
    elem.addClass('opened');
  }, 5);
}

function drawStaticElements(data) {
  var elem = $('.player');
  elem.html('<p>#'+data+'</p>');
  elem.css({
    'background-color': colors[data%colors.length]
  });
}