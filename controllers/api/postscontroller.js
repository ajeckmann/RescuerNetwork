const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/authorize");
const Profile = require("../../models/ProfileModel");
const Rescuer = require("../../models/RescuerModel");
const Post = require("../../models/PostModel");
const { check, validationResult } = require("express-validator/check");
//declare the router

//all routes stem from localhost:5000/api/posts; ('/allposts' corresponds to 'localhost:5000/api/posts/allposts')

//CREATE NEW POST

router.post(
  "/",
  [
    authorize,
    [
      check(
        "content",
        "must include content at least 3 characters in length"
      ).isLength({ min: 3 })
    ]
  ],
  async (req, res) => {
    const posterrors = validationResult(req);
    if (!posterrors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ postErrors: errors.array() });
    }
    try {
      //get the rescuer adding the post (the rescuer logged in)
      const rescuerPosting = await Rescuer.findOne({
        _id: req.rescuer.id
      }).select("-password");
      const newPost = {
        content: req.body.content,
        posterName: rescuerPosting.firstname,
        rescuer: req.rescuer.id
      };
      const PostToAdd = new Post(newPost);
      await PostToAdd.save();
      res.json(PostToAdd.posterName);
      //
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Issues with Server adding Post");
    }
  }
);

///GET ALL POSTS
router.get("/allposts", [authorize], async (req, res) => {
  try {
    const allPosts = await Post.find().sort({ date: -1 });
    return res.json(allPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//GET SPECIFIC POST BY ID
router.get("/:postId", authorize, async (req, res) => {
  try {
    const postToFetch = await Post.findById(req.params.postId);
    if (!postToFetch) {
      return res.status(400).json({ msg: "no matching post" });
    }

    return res.json(postToFetch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error Retrieving Post");
  }
});

//delete post
router.delete("/deletepost/:postId", authorize, async (req, res) => {
  try {
    const postToDelete = await Post.findById(req.params.postId);
    if (postToDelete.rescuer.toString() !== req.rescuer.id) {
      return res.json({
        msg: "sorry, you are not authorized to delete this post"
      });
    }
    await postToDelete.remove();
    res.json({ msg: "post has been removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error Deleting Post");
  }
});

//add a like to a post
router.put("/addlike/:postId", authorize, async (req, res) => {
  try {
    const postToLike = await Post.findById(req.params.postId);
    const rescuerLiking = await Rescuer.findOne({ _id: req.rescuer.id });

    //filter through the likes to see if the rescuer is already there. If so, can't like the post again.

    if (
      postToLike.likes.filter(l => l.rescuer.toString() === req.rescuer.id)
        .length > 0
    ) {
      return res.json({ msg: "You have already liked this post" });
    }

    //like the post{

    postToLike.likes.unshift({
      rescuer: req.rescuer.id,
      firstName: rescuerLiking.firstname,
      lastName: rescuerLiking.lastname
    });

    postToLike.save();
    console.log(rescuerLiking.firstname);

    res.json({ msg: "post liked" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error Deleting Post");
  }
  //fetch the post

  //this will add the id of the rescuer liking the post to the array of likes
});

//delete like
router.put("/removelike/:postId", authorize, async (req, res) => {
  try {
    const postToUnLike = await Post.findById(req.params.postId);
    const rescuerUnLiking = await Rescuer.findOne({ _id: req.rescuer.id });

    //filter through the likes to see if the rescuer is already there. If so, can't like the post again.

    if (
      postToUnLike.likes.filter(l => l.rescuer.toString() === req.rescuer.id)
        .length == 0
    ) {
      return res.json({ msg: "You cannot unlike a post you haven't liked" });
    }

    //like the post{

    const indexToRemove = postToUnLike.likes
      .map(l => l.rescuer.toString())
      .indexOf(req.rescuer.id);
    postToUnLike.likes.splice(indexToRemove, 1);
    postToUnLike.save();

    res.json({ msg: "post unliked" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error Deleting Post");
  }
});
//ADD COMMENT
router.put(
  "/addcomment/:postId",
  [authorize, [check("content", "must include at least 3 characters")]],
  async (req, res) => {
    try {
      const rescuerCommenting = await Rescuer.findOne({ _id: req.rescuer.id });
      const postToUpdate = await Post.findById(req.params.postId);
      const commentToAdd = {
        rescuer: req.rescuer.id,
        content: req.body.content,
        commenterFirstName: rescuerCommenting.firstname,
        commenterLastName: rescuerCommenting.lastname
      };
      postToUpdate.comments.unshift(commentToAdd);
      postToUpdate.save();
      res.json({ msg: "comment added" });
      return res.json(postToUpdate);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error adding comment");
    }
  }
);

///DELETE COMMENT
router.delete(
  "/deletecomment/:postId/:commentId",
  authorize,

  async (req, res) => {
    try {
      const rescuerLoggedIn = await Rescuer.findOne({ _id: req.rescuer.id });
      const postToUpdate = await Post.findById(req.params.postId);
      const commentToDelete = await postToUpdate.comments.find(
        c => c.id === req.params.commentId
      );
      console.log(rescuerLoggedIn.firstname);
      console.log(postToUpdate.rescuer);
      console.log(commentToDelete);
      //creator of post can delete all comments on his/her post. A creator of a comment can delete his/her post. In order to delete a comment, you must be the creator of the comment or the creator of the POST on which that comment appears
      //if the person logged in is both not the creater of comment AND not the creator of the post
      if (
        commentToDelete.rescuer.toString() !== req.rescuer.id &&
        postToUpdate.rescuer.toString() !== req.rescuer.id
      ) {
        //return this message
        return res.json({
          msg: "you cannot delete this comment, as you did not write it"
        });
      }
      //otherwise, delete the comment
      const index = postToUpdate.comments
        .map(com => com.id)
        .indexOf(req.params.commentId);

      console.log(rescuerLoggedIn);
      postToUpdate.comments.splice(index, 1);
      postToUpdate.save();

      if (postToUpdate.rescuer.toString() === req.rescuer.id) {
        res.json({
          msg: `comment of ${commentToDelete.commenterFirstName} deleted by ${rescuerLoggedIn.firstname}, because ${rescuerLoggedIn.firstname} created the post on which this comment appears`
        });
      }

      if (commentToDelete.rescuer.toString() === req.rescuer.id) {
        res.json({
          msg: `comment of ${commentToDelete.commenterFirstName} deleted by ${rescuerLoggedIn.firstname}, because ${rescuerLoggedIn.firstname} created the comment`
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error removing comment");
    }
  }
);

module.exports = router;
