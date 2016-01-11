var app = angular.module("sportsApp", []);


app.factory("posts", [function(){
  // Create an object with an array of posts
  var o = {
    posts: []
  };
  return o;
}]);

app.controller("MainController", [
  // Service injection to the main controller
  "$scope",
  "posts",
  function($scope, posts){
    $scope.test = "Hello, world!";

    $scope.posts = posts.posts;

    $scope.addPost = function(){
      // This prevents the user from adding a blank entry
      if(!$scope.title || $scope.title === "") {return;}
      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0
      });
      $scope.title="";
      $scope.link="";
    };

    $scope.addUpvote = function(post){
      post.upvotes += 1;
    };

  }
]);
