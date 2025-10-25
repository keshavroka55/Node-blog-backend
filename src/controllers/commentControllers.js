// /controllers/commentController.js
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Blog = require('../models/blogModel');

// Minimal fixed addComment (works with or without authenticated user)


const addComment = async (req, res) => {
  try {
    // correct extraction of postId
    // const postId= req.params;
    const { postId,content } = req.body;
    console.log("Received postId:", postId);


    if (!content || !content.toString().trim()) {
      return res.status(400).json({ error: 'Missing content' });
    }

    // validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }

    // Ensure the target post exists
    const blog = await Blog.findById(postId);
    if (!blog) return res.status(404).json({ error: 'Post not found' });

    // Build comment data
    const commentData = {
      post: postId,
      content: content.toString().trim()
    };

    // If request is authenticated and req.user exists, attach user
    if (req.user && req.user._id) commentData.user = req.user._id;

    const comment = new Comment(commentData);
    await comment.save();

    // Optionally populate the user (if present) for response
    await comment.populate({ path: 'user', select: 'name email' });

    return res.status(201).json({ message: 'Comment created', comment });
  } catch (err) {
    console.error('addComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId))
      return res.status(400).json({ error: 'Invalid comment id' });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // require authentication for update
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    if (!comment.user) return res.status(403).json({ error: 'Cannot edit anonymous comment' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (typeof content === 'string' && content.trim().length > 0) {
      comment.content = content.trim();
      await comment.save();
    }

    return res.json({ message: 'Comment updated', comment });
  } catch (err) {
    console.error('updateComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(commentId))
      return res.status(400).json({ error: 'Invalid comment id' });

    // populate post to check post owner
    const comment = await Comment.findById(commentId).populate('post');
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // require auth for delete
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const isCommentOwner = comment.user && comment.user.toString() === req.user._id.toString();
    const isPostOwner = comment.post && comment.post.author && comment.post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await comment.deleteOne();
    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addComment,
  updateComment,
  deleteComment
};
