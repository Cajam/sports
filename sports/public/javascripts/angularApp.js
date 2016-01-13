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
        controller: "PostsController",
        resolve: {
          post: ["$stateParams", "posts", function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthController',
        onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
          }
        }]
      })
      .state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthController',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      });

      $urlRouterProvider.otherwise("home");
  }]);

app.factory("auth", ["$http", "$window", function($http, $window) {
  var auth = {};

  auth.saveToken = function(token) {
    $window.localStorage["sports-token"] = token;
  }

  auth.getToken = function() {
    return $window.localStorage["sports-token"];
  }

  auth.isLoggedIn = function() {
    var token = auth.getToken();

    if (token) {
      var payload = JSON.parse($window.atob(token.split(".")[1]));

      return payload.exp = Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function() {
    if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split(".")[1]));

      return payload.username;
    }
  };

  auth.register = function(user) {
    return $http.post("/register", user).success(function(data) {
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function(user) {
    return $http.post("/login", user).success(function(data) {
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function() {
    $window.localStorage.removeItem("sports-token");
  };


  return auth;
}]);


app.factory("posts", ["$http", "auth", function($http, auth){
  // Create an object with an array of posts
  var o = {
    posts: []
  };
  // Wiring up of our backend posts we've made to our frontend home page
  o.getAll = function() {
    return $http.get("/posts").success(function(data) {
      angular.copy(data, o.posts);
    });
  };

  o.get = function(id) {
    return $http.get("/posts/" + id).then(function(res){
      return res.data;
    });
  };
  // Save new posts to make them persistent with a post function
  o.create = function(post) {
    return $http.post("/posts", post, {
      headers: {Authorization: "Bearer " +auth.getToken()}
    }).success(function(data) {
      o.posts.push(data);
    });
  };

  o.upvote = function(post) {
    return $http.put("/posts/" + post._id + "/upvote", null, {
      headers: {Authorization: "Bearer " +auth.getToken()}
    }).success(function(data) {
      post.upvotes += 1;
    });
  };

  o.addComment = function(id, comment) {
    return $http.post("/posts/" + id + "/comments", comment, {
      headers: {Authorization: "Bearer " +auth.getToken()}
    });
  };

  o.upvoteComment = function(post, comment) {
    return $http.put("/posts/" + post._id + "/comments/" + comment._id + "/upvote", null, {
      headers: {Authorization: "Bearer " +auth.getToken()}
    }).success(function(data){
      comment.upvotes += 1
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
  "post",
  function($scope, $stateParams, posts, post){
    $scope.post = post;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.addComment = function(){
      if($scope.body === "") {return;}
        posts.addComment(post._id, {
        body: $scope.body,
        author: "user"
      }).success(function(comment) {
        $scope.post.comments.push(comment);
      });

      $scope.body = "";
    }

    $scope.addUpvote = function(comment) {
      posts.upvoteComment(post, comment);
    }
  }]);

app.controller('AuthController', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavController', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
