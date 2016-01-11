var app = angular.module("sportsApp", ["ui.router"]);

app.config([
  "$stateProvider",
  "$urlRouterProvider",
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state("home", {
        url: "/home",
        templateUrl: "/home.html",
        controller: "MainController"
      })
      .state("posts", {
        url: "/posts/{id}",
        templateUrl: "/posts.html",
        controller: "PostsController"
      });

      $urlRouterProvider.otherwise("home");
  }]);


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
        upvotes: 0,
        comments: [
          {author: "testUser", body: "test body!", upvotes: 1}
        ]
      });
      $scope.title="";
      $scope.link="";
    };

    $scope.addUpvote = function(post){
      post.upvotes += 1;
    };

  }
]);

app.controller("PostsController", [
  "$scope",
  "$stateParams",
  "posts",
  function($scope, $stateParams, posts){
    $scope.post = posts.posts[$stateParams.id];
    $scope.addComment = function(){
      if($scope.body === "") {return;}
      $scope.post.comments.push({
        body: $scope.body,
        author: "user",
        upvotes: 0
      });
      $scope.body = "";
    };
  }]);
