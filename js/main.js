function drawElements() {
  d3svg.selectAll('circle').data(c_queue).enter().append('circle')
  .attr('cx', function (d) { return 50 * d; })
  .attr('cy', 30)
  .attr('r', 0)
  .transition()
  .attr('r', 25);
}
