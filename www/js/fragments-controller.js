angular.module('starter.controllers')

.controller('FragmentsCtrl', function($scope, $state, $ionicLoading, sharedProps) {
  $ionicLoading.show();
  $scope.markers = sharedProps.getMarkers();
  $scope.fragments = [];
  var ids = [];
  for (var i = 0; i < $scope.markers.length; i++) {
    ids.push($scope.markers[i].title);
  };
  var Fragment = Parse.Object.extend("Fragment");
  var query = new Parse.Query(Fragment);
  query.containedIn("objectId", ids);
  query.doesNotExist("ParentId");
  query.find({
    success: function(results) {
      $ionicLoading.hide();
      $scope.fragments = results;
    },
    error: function(error) {
      
    }
  });
});