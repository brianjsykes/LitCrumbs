angular.module('starter.controllers')

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
});
