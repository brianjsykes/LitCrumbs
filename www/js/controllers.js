angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicLoading) {
    // Form data for the login modal
  $scope.loginData = {};
  var currentUser = Parse.User.current();
  $rootScope.user = null;
  $rootScope.isLoggedIn = false;

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  
    if (currentUser) {
        $rootScope.user = currentUser;
        $rootScope.isLoggedIn = true;
        $state.go('app.map');
    } else {
      $scope.modal.show();
    };

  });

  $scope.signUpClicked = function() {
    console.log('signup clicked');
    $scope.modal.hide();
    console.log('go');
    $state.go('app.signup')
  };

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

    // Open the login modal
  $scope.logout = function() {
    console.log("logging out");
    Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('login');
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    Parse.User.logIn($scope.loginData.email.toLowerCase(), 
                     $scope.loginData.password, {
      success: function(user) {
        $ionicLoading.hide();
        $rootScope.user = user;
        $rootScope.isLoggedIn = true;
        $state.go('app.map', {
          clear: true
        });
      },
      error: function(user, err) {
        $ionicLoading.hide();
        //login failed
        if (err.code === 101) {
          $scope.error.message = 'Invalid login credentials, please try again.';
          $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
        } else {
          $scope.error.message = 'An unexpected error has occurred, ' +
                      'please try again.';
          $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
        }
        $scope.$apply();
      }
    });
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})


.controller('LoginCtrl', function($scope, $state, $ionicLoading, $rootScope) {
  console.log('loginctrl');
  $scope.loginData = {};
  console.log("user: " + $rootScope.user);
  $scope.loginViewType = "view";

  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    Parse.User.logIn($scope.loginData.email.toLowerCase(), 
                     $scope.loginData.password, {
      success: function(user) {
        $ionicLoading.hide();
        $rootScope.user = user;
        $rootScope.isLoggedIn = true;
        $state.go('app.map', {
          clear: true
        });
      },
      error: function(user, err) {
        $ionicLoading.hide();
        //login failed
        if (err.code === 101) {
          $scope.error.message = 'Invalid login credentials, please try again.';
          $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
        } else {
          $scope.error.message = 'An unexpected error has occurred, ' +
                      'please try again.';
          $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
        }
        $scope.$apply();
      }
    });
  };
})

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
})


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
})

.controller('FragmentCtrl', function($scope, $state, $stateParams, $ionicLoading) {
  $ionicLoading.show();
  $scope.user = Parse.User.current();
  $scope.parentFragment = null;
  $scope.fragments = [];
  $scope.newFragData = {};
  var Fragment = Parse.Object.extend("Fragment");
  var query = new Parse.Query(Fragment);
  query.get($stateParams.fragmentId, {
      success: function(result) {
          result.displayTitle = true;
          result.displayAddForm = false;
          result.displayTabs = true;
          $scope.parentFragment = result;
          $scope.fragments.push(result); 
      },
      error: function(error) {
          console.log(error);
          $ionicLoading.hide();
      }
  }).then(function(result){
      $scope.getChildren($scope.parentFragment, true);
      $ionicLoading.hide();
  });

  $scope.getChildren = function(fragment, isParent) {
    var childQuery = new Parse.Query(Fragment);
    childQuery.equalTo("ParentId", fragment.id);
    childQuery.find().then(function(results) {
      fragment.children = results;
      console.log("results: " + results);
      for (var i = 0; i < results.length; i++) {
        results[i].displayAddForm = false;
        results[i].displayTabs = false;
        results[i].displayTitle = false;
        results[i].childrenDisplayed = false;
        if (fragment.childrenDisplayed === false || isParent === true) {
          $scope.fragments.push(results[i]);
        }
      };
      console.log("scope: " + $scope.fragments);
    });
    fragment.childrenDisplayed = true;
  };

  $scope.enterFragment = function(fragment) {
    console.log("fragment: " + fragment.childrenDisplayed);
    for (var i = 0; i < $scope.fragments.length; i++) {
      if($scope.fragments[i].displayTabs === true){
        if ($scope.fragments[i].id !== fragment.id) {
          $scope.fragments[i].displayTabs = false;
        }
      }
    }
    if (fragment.displayTabs === true) {
      fragment.displayTabs = false;
    } else {
      fragment.displayTabs = true;
    }
    if (fragment.get('ParentId') !== null) {
      if (fragment.childrenDisplayed === false) {
        $scope.getChildren(fragment, false);
        fragment.childrenDisplayed = true;
      }
    }
  };

  $scope.leaveFragment = function(fragment) {
    fragment.displayTabs = false;
  };

  $scope.toggleAddForm = function(fragment, showForm) {
    console.log('show');
    fragment.displayAddForm = showForm;
  };

  $scope.postFragment = function(parent) {
    $ionicLoading.show();
    var Fragment = Parse.Object.extend("Fragment");
    var newFragment = new Fragment();
    newFragment.set("Point", parent.get('Point'));
    newFragment.set("Title", parent.get('Title'));
    newFragment.set("Text", $scope.newFragData.text);
    newFragment.set("Type", parent.get('Type'));
    newFragment.set("ParentId", parent.id);
    newFragment.set("AuthorId", Parse.User.current().id);
    newFragment.set("AuthorName", Parse.User.current().get('personname'));

    newFragment.save(null, {
      success: function(fragment) {
        console.log("new: " + fragment);
        parent.displayAddForm = false;
        fragment.displayAddForm = false;
        fragment.displayTabs = false;
        fragment.displayTitle = false;
        $scope.fragments.push(fragment); 
        $ionicLoading.hide();
        $scope.newFragData = {};
      },
      error: function(err) {

      }
    });
  };

  $scope.months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
})

.controller('SignUpCtrl', function($scope, $state, $ionicLoading, $rootScope) {
  $scope.user = {};
    $scope.error = {};
    $scope.signup = function(){

      $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
      var user = new Parse.User();
      var email = $scope.user.email.toLowerCase();
      user.set("username", email);
      user.set("personname", $scope.user.personname);
      user.set("password", $scope.user.password);
      user.set("email", email);

      user.signUp(null, {
        success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('app', {
                    clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                    $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
                } else if (error.code === 202) {
                    $scope.error.message = 'The email address is already ' +
                        'registered';
                     $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
      });
    };
})


.controller('ForgotPasswordCtrl', function($scope, $state, $ionicLoading, 
                       $rootScope, $ionicHistory) {
  $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
              $ionicLoading.hide();
                $ionicLoading.show({ template: 'A password reset email is on the way.', 
            noBackdrop: true, duration: 2000 });
                $scope.state.success = true;
                $scope.$apply();
                $ionicHistory.goBack();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                    $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                    $ionicLoading.show({ template: $scope.error.message, 
            noBackdrop: true, duration: 2000 });
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('app');
    };
})


.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});


