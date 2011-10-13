Dashboard.Chart.Graphite = function(options, defaults) {
  this.chart = null
  this.options = options || {}
  this.defaults = defaults || {}
  this.dataRequest = $.get(this.optionsToUrl())
}

Dashboard.Chart.Graphite.prototype.optionsToUrl = function() {
  return decodeURIComponent('/load?url=http%3A%2F%2Flocalhost%3A9393%2Fgraphite.test.txt')
}

Dashboard.Chart.Graphite.prototype.extractData = function(data) {
  var graphData = data.split('\n').map(function(l) {
    if(l.length > 0) {
      var title = l.match(/(.*\))/)[0]
      return { title: title, values: l.replace(title + ',', '').split(',')}
    }
  })
  return graphData.filter(function(hash) { return !!hash })
}

Dashboard.Chart.Graphite.prototype.getChartOptions = function(domElement) {
  var chartOptions = jQuery.extend(this.defaults.graphite || {}, { domElement: domElement })
  chartOptions = jQuery.extend(chartOptions, this.options)

  return chartOptions
}

Dashboard.Chart.Graphite.prototype.render = function(domElement) {
  var self = this
    , chartOptions = this.getChartOptions(domElement)

  this.dataRequest.success(function(data) {
    var graphData = self.extractData(data)

    graphData.forEach(function(data, i) {
      if(i < (graphData.length-1)) {
        var yValues = data.values.slice(3).map(function(value){ return parseFloat(value) })
        new Dashboard.Chart(chartOptions).render(yValues)
      }
    })
  })
}
