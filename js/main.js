function tick() {

}

function removeElements(size) {
  d3svg.selectAll('circle').data(c_queue)
  .exit()
  .transition()
  .duration(120)
  .attr('r', size+(size/6))
  .attr('alpha', 0)
  .transition()
  .duration(180)
  .attr('r', 0).remove();
}

function drawElements(size) {  
  var 
  colors = [
    "#FF9EA0",
    "#A99DFF",
    "#FF94FF",
    "#7FFF9F"
  ],
  circles = d3svg.selectAll('circle').data(c_queue);

  circles.enter().append('circle')
  .attr('cx', function (d, i) { return (125 * i) + (size + 25); })
  .attr('cy', 125)
  .attr('r', 0)
  .attr('fill', function (d, i) { return colors[i]; })
  .transition()
  .duration(180)
  .attr('r', size);
}
