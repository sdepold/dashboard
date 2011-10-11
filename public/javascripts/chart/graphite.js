Dashboard.Chart.Graphite = function(url) {
  this.chart = null
  this.dataRequest = $.get(url)
}

Dashboard.Chart.Graphite.prototype.render = function(domElement) {
  this.dataRequest.success(function(data) {
    var graphData = data.split('\n').map(function(l) {
      if(l.length > 0) {
        var title = l.match(/(.*\))/)[0]
        return { title: title, values: l.replace(title + ',', '').split(',')}
      }
    })
    graphData = graphData.filter(function(hash) { return !!hash })
    graphData.forEach(function(data, i) {
      if(i < (graphData.length-1)) {
        var yValues = data.values.slice(3).map(function(value){ return parseFloat(value) })
        new Dashboard.Chart({ domElement: domElement }).render(yValues)
      }
    })
  })
}
