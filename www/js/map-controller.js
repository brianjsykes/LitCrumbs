angular.module('starter.controllers')

.controller('MapCtrl', function($scope, $state, $rootScope, $ionicLoading, $ionicModal, sharedProps) {
  $scope.pos = null;
  $scope.nearbyFragments = null;
  $scope.mc = null;
  $scope.map = null;
  $scope.fragData = {};
  $scope.loginViewType = "modal-view";
  console.log("user: " + $rootScope.user);

  if ($rootScope.user === null) {
    console.log($rootScope.user);
    $state.go('login', {
          clear: true
        });
    // $ionicModal.fromTemplateUrl('templates/login.html', {
    //   scope: $scope
    // }).then(function(modal) {
    //   $scope.loginModal = modal;
    //   $scope.loginModal.show();
    // });
  };

  $ionicModal.fromTemplateUrl('templates/newFragment.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.mapCreated = function(map) {
    //google.maps.event.addDomListener(window, 'load', initialize);
    $scope.map = map;
    $scope.getPosition().then(function() {
      var mcOptions = {gridSize: 50, maxZoom: 15};
      $scope.mc = new MarkerClusterer($scope.map, mcOptions);
      $scope.mc.zoomOnClick_ = false;
      //console.log($scope.mc);
      google.maps.event.addListener($scope.mc, 'clusterclick', function(mCluster) {
        var markers = mCluster.getMarkers();
        sharedProps.setMarkers(markers);
        //console.log(markers);
        $state.go('app.fragments');
        // var infoWindow = new google.maps.InfoWindow();
        // infoWindow.setContent(contentString);
        // infoWindow.setPosition(mCluster.getCenter());
        // infoWindow.open($scope.map);
        // console.log(mCluster.getMarkers());
      });

      // google.maps.event.addListener($scope.map, 'zoom_changed', function() {
      //   $scope.refreshMap();
      // });
    }).then(function() {
      $scope.getNearbyFragments().then(function() {
        //console.log($scope.mc.clusters_);
      });
    });
    
  };

  $scope.refreshMap = function () {
    console.log('refresh');
    google.maps.event.trigger($scope.map, 'resize');
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.map.setCenter(GeoMarker.getPosition());
  };

  $scope.newFragment = function() {
    $scope.modal.show();
  };

  $scope.postFragment = function() {
    $ionicLoading.show();
    console.log($scope.fragData);
    $scope.pos = GeoMarker.getPosition();
    console.log($scope.pos);
    var Fragment = Parse.Object.extend("Fragment");
    var newFragment = new Fragment();
    var point = new Parse.GeoPoint($scope.pos.k,
                                  $scope.pos.D);
    newFragment.set("Point", point);
    newFragment.set("Title", $scope.fragData.title);
    newFragment.set("Text", $scope.fragData.text);
    newFragment.set("Type", $scope.fragData.type);
    newFragment.set("AuthorId", Parse.User.current().id);
    newFragment.set("AuthorName", Parse.User.current().get('personname'));
    //console.log(newFragment);
    //alert($scope.pos.coords.latitude);
    newFragment.save(null, {
      success: function(fragment) {
        console.log("new: " + fragment);
        $ionicLoading.hide();
        $scope.dropMarker(fragment);
        $scope.modal.hide();
        $scope.fragData = {};
      },
      error: function(err) {

      }
    });

  };

  $scope.closeModal = function(){
    $scope.modal.hide();
  };

  $scope.getNearbyFragments = function() {
    return new Promise(function(resolve, reject) {
      var point = new Parse.GeoPoint($scope.pos.coords.latitude,
                                    $scope.pos.coords.longitude);
      var Fragment = Parse.Object.extend("Fragment");
      var query = new Parse.Query(Fragment);
      query.near("Point", point);
      //query.limit(100);
      query.doesNotExist("ParentId");
      query.find({
        success: function(results) {
          $scope.nearbyFragments = results;
          resolve(results);
        },
        error: function(error) {
            console.log(error);
            reject(error.message);
        }
      })
    }).then(function() {
      for (var i = 0; i < $scope.nearbyFragments.length; i++) {
        $scope.dropMarker($scope.nearbyFragments[i]);
      };
    });
  };

  $scope.dropMarker = function(fragment) {

    var point = fragment.get("Point");
    var type = fragment.get("Type");

    if (type === 'Poem') {
      var image = 'img/Poem.png';
    }
    else if (type === 'Prose') {
      var image = 'img/Prose.png';
    }
    else {
      var image = 'img/signature_40.png';
    }

    var pos = new google.maps.LatLng(point.latitude, point.longitude);
    var infowindow = new google.maps.InfoWindow({
      content: fragment.get("Title")
    });
    var marker = new google.maps.Marker({
        position: pos,
        map: $scope.map,
        icon: image,
        title: fragment.id
    });
    google.maps.event.addListener(marker, 'click', function() {
      //infowindow.open($scope.map,marker);
      $state.go('app.fragment', {fragmentId:marker.title} );
    });
    google.maps.event.addListener(marker, 'mouseover', function() {
      infowindow.open($scope.map,marker);
      //$state.go('app.fragment', {fragmentId:marker.title} );
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
      infowindow.close();
      //$state.go('app.fragment', {fragmentId:marker.title} );
    });
    $scope.mc.addMarker(marker);
  };


  $scope.getPosition = function() {
    return new Promise(function(resolve, reject) {
      console.log('inpos');
       navigator.geolocation.getCurrentPosition(function (pos) {
        $scope.pos = pos;
        resolve(pos);
      }, function (error) {
        reject(error.message);
      });
    });
  };
});