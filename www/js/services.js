var app = angular.module('starter.services', [])

app.service('sharedProps', function() {
  var markersCollection = {};

  return {
    getMarkers: function() {
      return markersCollection;
    },
    setMarkers: function(col) {
      markersCollection = col;
    }
  }
})