angular.module('starter.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {

      var MAPTYPE_ID = 'custom_style';

      function initialize() {

        var styleOpts = [
          {
            stylers: [
              { hue: '#8A4B08' },
              { visibility: 'simplified' },
              { gamma: 0.4 },
              { weight: 0.6 }
            ]
          },
          {
            elementType: 'labels',
            stylers: [
              { visibility: 'off' }
            ]
          },
          {
            featureType: 'water',
            stylers: [
              { color: '#008989' }
            ]
          }
        ];

        var mapOptions = {
          center: new google.maps.LatLng(43.07493, -89.381388),
          zoom: 12,
          mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, MAPTYPE_ID]
          },
          mapTypeId: MAPTYPE_ID
        };

        var map = new google.maps.Map($element[0], mapOptions);

        var styledMapOptions = {
          name: 'Custom Style'
        };

        var customMapType = new google.maps.StyledMapType(styleOpts, styledMapOptions);
        map.mapTypes.set(MAPTYPE_ID, customMapType);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);

            GeoMarker = new GeolocationMarker();
            GeoMarker.setCircleOptions({fillColor: '#808080'})


            google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
              map.setCenter(this.getPosition());
              map.fitBounds(this.getBounds());
            });

            google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
              alert('There was an error obtaining your position. Message: ' + e.message);
            });

            GeoMarker.setMap(map);
            // var image = 'img/Blue_pog_20.png'
            // var marker = new google.maps.Marker({
            //     position: pos,
            //     map: map,
            //     icon: image,
            //     title: 'My Location'
            // });

            // google.maps.event.addListener(marker, 'click', function() {
            //   $state.go('app.fragment', {fragmentId:marker.title} );
            // });

            //map.setCenter(pos);
          }, function() {
            handleNoGeolocation(true);
          });
        } else {
          handleNoGeolocation(false);
        }
        //var pos = new google.maps.LatLng(43.07493, -89.381388)
        
        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
          var content = 'Error: The Geolocation service failed.';
        } else {
          var content = 'Error: Your browser doesn\'t support geolocation.';
        }

        var options = {
          map: map,
          position: new google.maps.LatLng(60, 105),
          content: content
        };

        var infowindow = new google.maps.InfoWindow(options);
        map.setCenter(options.position);
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
})

.directive('showonhoverparent', function() {
      return {
         link : function($scope, element, attrs) {
            element.parent().bind('mouseenter', function() {
              $scope.display = '';
              console.log($scope);
              console.log(element);
              // element.show();
            });
            element.parent().bind('mouseleave', function() {
              $scope.display = ':none';
              // element.hide();
            });
       }
   };
});
