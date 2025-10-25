// /controllers/likeController.js
// Handles post likes/unlikes. Uses Like model (unique index) plus post.likes array for quick counts.

const Like = require('../models/Like');
const Blog = require('../models/blogModel');

/**
 * Like a post
 * - req.params.id: post id
 * - req.user._id: the liker
 *
 * Implementation notes:
 * - We create a Like document (unique compound index on user+post prevents duplicates).
 * - We also add the user id to Post.likes array using $addToSet for quick counts.
 */
const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    console.log("req.user:", req.user);
    const userId = req.user.id || req.user._id;

    // Ensure post exists
    const post = await Blog.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Try to create Like - unique index prevents duplicates
    try {
      const like = new Like({ user: userId, post: postId });
      await like.save();
      // Add to post.likes array (idempotent thanks to $addToSet)
      await Blog.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
      return res.json({ message: 'Liked' });
    } catch (err) {
      // Duplicate key error (already liked) - code 11000 in Mongo
      if (err.code === 11000) return res.status(400).json({ error: 'Already liked' });
      throw err;
    }
  } catch (err) {
    console.error('likePost error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Unlike a post
 * - req.params.id: post id
 * - req.user._id: the user
 *
 * Implementation notes:
 * - Remove Like document if exists and pull user id from post.likes array.
 */
const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id || req.user._id;

    // Remove like doc (if any)
    await Like.findOneAndDelete({ user: userId, post: postId });

    // Remove from post.likes array (safe even if user wasn't present)
    await Blog.findByIdAndUpdate(postId, { $pull: { likes: userId } });

    res.json({ message: 'Unliked' });
  } catch (err) {
    console.error('unlikePost error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports =  {
  likePost,
  unlikePost
};
