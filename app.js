var app = angular.module("sportsApp", []);

app.controller("MainController", [
  "$scope",
  function($scope){
    $scope.test = "Hello, world!";
    $scope.posts = [
      {title: "post 1", upvotes: 5},
      {title: "post 2", upvotes: 10}
    ];
  }
]);
