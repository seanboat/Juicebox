const express = require("express");
const postsRouter = express.Router();
const { requireUser } = require("./utils");
const { createPost, updatePost, getPostById, getAllPosts } = require("../db");

// postsRouter.post("/", requireUser, async (req, res, next) => {
//   res.send({ message: "under construction" });
// });

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  let postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData = { ...postData, authorId: req.user.id, title, content };
    const post = await createPost(postData);
    if (post) {
      res.send({ post });
    } else {
      next({
        name: "PostCreationError",
        message: "Post creation failed!",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  let updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (comment) {
    updateFields.comment = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "Post can only be edited by authors",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
