var colors = [
  "#FF9EA0",
  "#A99DFF",
  "#FF94FF",
  "#7FFF9F"
];

function removeElements(data) {
  $('#render').find('.no_'+data.id).remove();
}

function drawElements(data) {
  var elem = document.createElement('div');
  elem = $(elem);
  elem.addClass('player no_'+data.id);
  elem.html('<p>Player<br>#'+data.id+'</p>');
  elem.css({
    'background-color': colors[data.id%colors.length]
  });
  elem.appendTo($('#render'));
  elem.addClass('show');
}