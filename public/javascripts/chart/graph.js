Dashboard.Chart.Graph = function(paper) {
  if(!paper) throw new Error('No paper passed!')

  this.paper = paper
  this.path = null
  this.highlights = []
}

Dashboard.Chart.Graph.prototype.__defineGetter__('height', function() {
  return this.paper.height
})

Dashboard.Chart.Graph.prototype.__defineGetter__('width', function() {
  return this.paper.width
})

Dashboard.Chart.Graph.prototype.render = function(values, options) {
  this.values = values
  this.options = jQuery.extend({
    rgb: {
      red: 200,
      green: 0,
      blue: 0
    }
  }, options || {})

  var self  = this
    , path = this._generatePathString()
    , strokeColor = Dashboard.Chart.Helpers.rgb(this.options)
    , fillColor = Dashboard.Chart.Helpers.rgb(this.options.rgb)
    , graph = null

  graph = this
    .paper
    .path(path)
    .attr({stroke: 'rgba(' + fillColor + ',1)', fill: 'rgba(' + fillColor + ',0.6)', 'stroke-width': 2})

  return this
}

// private

Dashboard.Chart.Graph.prototype._generatePathString = function() {
  var path = 'M0,%{height}L%{valuePath}L%{width},%{height}Z'
    , self = this
    , options = {values: self.values, height: self.paper.height, width: self.paper.width}

  var valuePath = this.values.map(function(value, i) {
    var x = Dashboard.Chart.Helpers.valueToRelative(i, jQuery.extend({lengthwise: true}, options))
      , y = Dashboard.Chart.Helpers.valueToRelative(value, options)

    return [x, y].join(',')
  }).join('L')

  path = path
    .replace(new RegExp('%{height}', 'g'), this.paper.height)
    .replace(new RegExp('%{width}', 'g'), this.paper.width)
    .replace(new RegExp('%{valuePath}', 'g'), valuePath)

  return path
}
