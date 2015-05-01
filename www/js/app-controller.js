angular.module('starter.controllers')

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
});
