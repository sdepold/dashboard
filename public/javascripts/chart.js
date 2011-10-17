Dashboard.Chart = function(options) {
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

  this.highlights = []
  this.graphs = []
  this.timestamps = null
}

Dashboard.Chart.prototype.render = function(_values, timestamps) {
  var self = this

  _values.forEach(function(values) {
    var color   = Raphael.getRGB(Raphael.getColor(1))
      , options = {rgb: { red: color.r, blue: color.b, green: color.g }}
      , graph   = new Dashboard.Chart.Graph(self.paper).render(values, options)

    self.graphs.push(graph)
  })

  Raphael.getColor.reset()

  //jQuery(this.options.domElement)
  //  .mousemove(function(e) { self._highlightValue(e) })
  //  .mouseout(function() { self.highlights.forEach(function(e){ e.remove() }) })

  //this._drawAxisLabels()
}

// private

Dashboard.Chart.prototype.__defineGetter__('maxValue', function() {
  return Dashboard.Chart.Helpers.max(this.values)
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
    var _value    = Dashboard.Chart.Helpers.valueToRelative(value, {width: self.paper.width, height: self.paper.height, values: self.values})
      , text      = self.paper.text(20, _value, parseInt(value).toString())
      , x         = ((text.getBBox().width / 2) + 5)
      , fillColor = Dashboard.Chart.Helpers.rgb({}, 50)

    self.paper.set().push(text.attr({x: x, 'font-weight':'bold', 'fill': 'rgba(' + fillColor + ',1)'}))
  })
}

Dashboard.Chart.prototype._drawXAxisLabels = function() {
  var self = this

  this.timestamps.forEach(function(value, i) {
    var text = self.paper.text(0, self.options.height - 10, value.toString())
      , x    = null

    if(i == 0)
      x = (text.getBBox().width / 2) + 5
    else if(i == self.timestamps.length - 1)
      x = self.options.width - (text.getBBox().width / 2) - 5
    else
      x = self.options.width * (i / (self.timestamps.length - 1))

    text.attr('x', x)
    self.paper.set().push(text.attr({'font-weight':'bold', 'fill': 'rgba(' + Dashboard.Chart.Helpers.rgb(self.options.rgb, 50) + ',1)'}))
  })
}

Dashboard.Chart.prototype._drawAxisLabels = function() {
  this._drawYAxisLabels()
  this._drawXAxisLabels()
}

Dashboard.Chart.prototype._highlightValue = function(e) {
  var mouseX   = e.offsetX
    , mouseY   = e.offsetY
    , segment  = null
    , linePath = null
    , attrs    = {stroke: 'rgba(' + Dashboard.Chart.Helpers.rgb(this.options.rgb) + ',1)', 'stroke-width': 2}

  segment = this._generatePathString(this.values).split('L').reduce(function(prev, seg) {
    var x = parseFloat(seg.split(',')[0])
      , y = parseFloat(seg.split(',')[1])

    if((!prev.x && !prev.y) &&(x >= mouseX) && (x > prev.x))
      return {x: x, y: y}
    else
      return prev
  }, {x: 0, y: 0})

  linePath = 'M%{x},%{y}L%{x},%{height}'
  linePath = linePath.replace(new RegExp('%{x}', 'g'), segment.x)
  linePath = linePath.replace('%{height}', this.options.height)
  linePath = linePath.replace('%{y}', segment.y)

  var line   = this.paper.path(linePath).attr(attrs)
    , circle = this.paper.circle(segment.x, segment.y, 6).attr(
        jQuery.extend(attrs, {
          fill: 'rgba(' + Dashboard.Chart.Helpers.rgb(this.options.rgb) + ',1)'
        })
      )
    , label  = this.paper.text(
        segment.x + 5,
        this.options.height - 25,
        Dashboard.Chart.Helpers.valueToAbsolute(this.options.width, this.options.height, segment.y)
      ).attr({
        'font-weight': 'bold',
        'fill': 'rgba(' + Dashboard.Chart.Helpers.rgb(this.options.rgb, 50) + ',1)'
      })
    , labelWidth = label.getBBox().width
    , labelX = segment.x + (labelWidth / 2) + 5

  if (labelX + labelWidth > this.options.width)
    labelX = segment.x - (labelWidth / 2) - 5

  label.attr('x', labelX)

  this.highlights.forEach(function(highlight) { highlight.remove() })
  this.highlights.push(line)
  this.highlights.push(circle)
  this.highlights.push(label)
}
