var express = require('express');
var jwt = require("express-jwt");
var router = express.Router();
var auth = jwt({secret: "SECRET", userProperty: "payload"});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// This is how you hide your access tokens in conjunction with the gitignore file.
var fs = require("fs");
var env = fs.existsSync("./env.js") ? require("../env.js") : process.env;
// console.log(env.token);
var request = require("request");
var mongoose = require("mongoose");
var passport = require("passport");
var Post = mongoose.model("Post");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.get("/search", function(req, res){
  request({
    url: "https://www.stattleship.com/basketball/nba/game_logs?player_id=" + req.query.q,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/vnd.stattleship.com; version=1",
      "Authorization": "Token token=" + env.token
    }
  }, function(err, response, body){
    res.send(body)
  })

});

router.get("/posts", function(req, res, next){
  Post.find(function(err, posts){
    if(err) { return next(err); }

    res.json(posts);
  });
});

router.post("/posts", auth, function(req, res, next){
  var post = new Post(req.body);
  post.author = req.payload.username;

  post.save(function(err, post){
    if(err) { return next(err); }

    res.json(post);
  });
});

router.param("post", function(req, res, next, id) {
  // Query the database for the post by the post id
  var query = Post.findById(id);

  // Execute the query, gives us back an error or the actual post
  query.exec(function (err, post) {
    // If you get an error, return it
    if (err) { return next(err); }
    // If the post isn't there, create a new error saying that
    if (!post) { return next(new Error("Cannot find this posting")); }
    // If the post is there, return it
    req.post = post;
    return next();
  });
});

router.param("comment", function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error("Cannot find this comment")); }
    req.comment = comment;
    return next();
  });
});

router.get("/posts/:post", function(req, res, next) {
  req.post.populate("comments", function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put("/posts/:post/upvote", auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put("/posts/:post/comments/:comment/upvote", auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

router.post("/posts/:post/comments", auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment) {
    if (err) { return next(err); }

    req.post.comments.push(comment);
    req.post.save(function (err, post){
      if (err) { return next(err); }

      res.json(comment);
    });
  });
});

module.exports = router;
