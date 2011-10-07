Dashboard.Graph = function(options) {
  this.options = $.extend({
    width: 640,
    height: 480,
    domElement: null
  }, options || {})


  console.log(this.options)

  this.paper = new Raphael(
    this.options.domElement,
    this.options.width,
    this.options.height
  )
}

Dashboard.Graph.prototype.generatePathString = function(values) {
  var maxY = values.reduce(function(value, prevValue) { return (value > prevValue) ? value : prevValue }, 0)
    , ratX = 1.0 * this.options.width / values.length
    , ratY = 1.0 * this.options.height / maxY
    , self = this
    , path = 'M0,%{height}L%{valuePath}L%{width},%{height}Z'

  var valuePath = values.map(function(value, i) {
    var x = (ratX * i)
      , y = self.options.height - (ratY * value)

    return [x, y].join(',')
  }).join('L')

  path = path
    .replace(new RegExp('%{height}', 'g'), this.options.height)
    .replace(new RegExp('%{width}', 'g'), this.options.width)
    .replace(new RegExp('%{valuePath}', 'g'), valuePath)

  return path
}

Dashboard.Graph.prototype.render = function(values) {
  var path  = this.generatePathString(values)
    , self  = this

  this
    .paper
    .path(path)
    .attr({stroke: 'rgba(200,0,0,1)', fill: 'rgba(200,0,0,0.6)', 'stroke-width': 2})
    .mousemove(function(a,b,c) {
      self.drawLabel('heyho', 100, 50)
    })
}

Dashboard.Graph.prototype.drawLabel = function(text, x, y) {
  var text = this.paper.text(100, 100, "heyho").attr({font: '12px Helvetica, Arial', fill: "#999000"})
  this.paper.set().push(text)
}
