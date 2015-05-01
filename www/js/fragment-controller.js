angular.module('starter.controllers')

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
      //$scope.getChildren($scope.parentFragment, true);
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
    var children = fragment.get('Children');
    for (var i = 0; i < children.length; i++) {
      children[i].fetch({
        success: function(child){
          console.log('fetched: ' + child.get('Text'));
        }
      });
    };

    console.log("children: " + fragment.get('Children'));
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
    // if (fragment.get('ParentId') !== null) {
    //   if (fragment.childrenDisplayed === false) {
    //     $scope.getChildren(fragment, false);
    //     fragment.childrenDisplayed = true;
    //   }
    // }
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

    parent.add("Children", newFragment);
    parent.save(null, {
      success: function(fragment) {
        console.log("parent: " + fragment);
        
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
});