Dashboard.Chart = function(options) {
  this.options = $.extend({
    width: 640,
    height: 480,
    domElement: null,
    rgb: {
      red: 200,
      green: 0,
      blue: 0
    }
  }, options || {})

  this.paper = new Raphael(
    this.options.domElement,
    this.options.width,
    this.options.height
  )
}

Dashboard.Chart.prototype.rgb = function(offset) {
  var rgb = this.options.rgb
    , add = function(a) { return (a+offset > 255) ? 255 : a+offset }

  offset = offset || 0

  return [add(rgb.red), add(rgb.green), add(rgb.blue)].join(',')
}

Dashboard.Chart.prototype.render = function(values) {
  var path  = this._generatePathString(this.values = values)
    , self  = this

  this
    .paper
    .path(path)
    .attr({stroke: 'rgba(' + this.rgb() + ',1)', fill: 'rgba(' + this.rgb() + ',0.6)', 'stroke-width': 2})
    .mousemove(function(a,b,c) {
      self._drawLabel('heyho', 100, 50)
    })

  this._drawAxisLabels(7)
}

// private

Dashboard.Chart.prototype.__defineGetter__('maxValue', function() {
  return this
    .values
    .reduce(function(value, prevValue) {
      return (value > prevValue) ? value : prevValue
    }, 0)
})

Dashboard.Chart.prototype._generatePathString = function() {
  var path = 'M0,%{height}L%{valuePath}L%{width},%{height}Z'
    , self = this

  var valuePath = this.values.map(function(value, i) {
    return [self._valueToRelative(i, {lengthwise: true}), self._valueToRelative(value)].join(',')
  }).join('L')

  path = path
    .replace(new RegExp('%{height}', 'g'), this.options.height)
    .replace(new RegExp('%{width}', 'g'), this.options.width)
    .replace(new RegExp('%{valuePath}', 'g'), valuePath)

  return path
}

Dashboard.Chart.prototype._drawLabel = function(text, x, y) {
  var text = this.paper.text(100, 100, "heyho").attr({font: '12px Helvetica, Arial', fill: "#999000"})
  this.paper.set().push(text)
}

Dashboard.Chart.prototype._valueToRelative = function(value, options) {
  var ratX   = 1.0 * this.options.width / this.values.length
    , ratY   = 1.0 * this.options.height / this.maxValue
    , result = null

  options = $.extend({lengthwise: false}, options || {})

  if(options.lengthwise)
    result = (ratX * value)
  else
    result = this.options.height - (ratY * value)

  return result
}

Dashboard.Chart.prototype._drawAxisLabels = function(labelCount) {
  var self   = this
    , maxY   = this.maxValue
    , values = []

  for(var i = 1; i < labelCount; i++) {
    values.push(maxY * i/labelCount)
  }

  values.forEach(function(value) {
    var text = self.paper.text(20, self._valueToRelative(value), parseInt(value).toString())
    self.paper.set().push(text.attr({'font-weight':'bold', 'fill': 'rgba(' + self.rgb(50) + ',1)'}))
  })
}
