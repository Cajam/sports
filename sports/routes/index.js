var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require("mongoose");
var Post = mongoose.model("Post");
var Comment = mongoose.model("Comment");


router.get("/posts", function(req, res, next){
  Post.find(function(err, posts){
    if(err) { return next(err); }

    res.json(posts);
  });
});

router.post("/posts", function(req, res, next){
  var post = new Post(req.body);

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

router.put("/posts/:post/upvote", function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put("/posts/:post/comments/:comment/upvote", function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

router.post("/posts/:post/comments", function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

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
