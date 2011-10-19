Dashboard.Chart = function(values, timestamps) {
  this.highlights = []
  this.graphs = []
  this.values = values
  this.timestamps = timestamps
}

Dashboard.Chart.prototype.render = function(options) {
  var self = this

  this.options = $.extend({
    width: 640,
    height: 480,
    domElement: null,
    xAxisLabelCount: 4,
    yAxisLabelCount: 7
  }, options || {})

  this.paper = new Raphael(
    this.options.domElement,
    this.options.width,
    this.options.height
  )

  this.values.forEach(function(values) {
    var color   = Raphael.getRGB(Raphael.getColor(1))
      , options = {rgb: { red: color.r, blue: color.b, green: color.g }}
      , graph   = new Dashboard.Chart.Graph(self, values)

    self.graphs.push(graph)
    graph.render(options)
  })

  Raphael.getColor.reset()

  jQuery(this.options.domElement)
    .mousemove(function(e) { self.graphs[0].highlight(e) })
    .mouseout(function() { self.graphs[0].unhighlight() })

  this._drawAxisLabels()
}

// private

Dashboard.Chart.prototype.__defineGetter__('maxValue', function() {
  var maxValues = this.graphs.map(function(g) {
    return Dashboard.Chart.Helpers.max(g.values)
  })

  return Dashboard.Chart.Helpers.max(maxValues)
})

Dashboard.Chart.prototype._drawLabel = function(text, x, y) {
  var text = this.paper.text(100, 100, "heyho").attr({font: '12px Helvetica, Arial', fill: "#999000"})
  this.paper.set().push(text)
}

Dashboard.Chart.prototype._drawYAxisLabels = function() {
  var self       = this
    , maxY       = this.maxValue
    , values     = []
    , labelCount = this.options.yAxisLabelCount

  for(var i = 1; i < labelCount; i++)
    values.push(maxY * i/labelCount)

  values.forEach(function(value) {
    console.log()
    var _value    = Dashboard.Chart.Helpers.valueToRelative(value, self.graphs[0].valueConversionOptions)
      , text      = self.paper.text(20, _value, parseInt(value).toString())
      , x         = ((text.getBBox().width / 2) + 2)

    self.paper.set().push(text.attr({x: x, 'fill': 'white'}))
  })
}

Dashboard.Chart.prototype._drawXAxisLabels = function() {
  var self = this

  this.timestamps.forEach(function(value, i) {
    var text = self.paper.text(0, self.options.height - 7, value.toString())
      , x    = null

    if(i == 0)
      x = (text.getBBox().width / 2) + 5
    else if(i == self.timestamps.length - 1)
      x = self.options.width - (text.getBBox().width / 2) - 5
    else
      x = self.options.width * (i / (self.timestamps.length - 1))

    self.paper.set().push(text.attr({'fill': 'white', 'x': x}))
  })
}

Dashboard.Chart.prototype._drawAxisLabels = function() {
  this._drawYAxisLabels()
  this._drawXAxisLabels()
}
