var app = angular.module("sportsApp", ["ui.router"]);

app.config([
  "$stateProvider",
  "$urlRouterProvider",
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state("home", {
        url: "/home",
        templateUrl: "/home.html",
        controller: "MainController",
        // Get all the current posts on loading of the home page
        resolve: {
          postPromise: ["posts", function(posts) {
            return posts.getAll();
          }]
        }
      })
      .state("posts", {
        url: "/posts/{id}",
        templateUrl: "/posts.html",
        controller: "PostsController"
      });

      $urlRouterProvider.otherwise("home");
  }]);


app.factory("posts", ["$http", function($http){
  // Create an object with an array of posts
  var o = {
    posts: []
  };
  // Wiring up of our backend posts we've made to our frontend home page
  o.getAll = function() {
    return $http.get("/posts").success(function(data) {
      angular.copy(data, o.posts);
    });
  }
  // Save new posts to make them persistent with a post function
  o.create = function(post) {
    return $http.post("/posts", post).success(function(data) {
      o.posts.push(data);
    });
  };

  o.upvote = function(post) {
    return $http.put("/posts/" + post._id + "/upvote").success(function(data) {
      post.upvotes += 1;
    });
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
      posts.create({
        title: $scope.title,
        link: $scope.link,
      });
      $scope.title="";
      $scope.link="";
    };

    $scope.addUpvote = function(post){
      posts.upvote(post);
    };

  }]);

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
