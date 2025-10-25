const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentControllers');
const { authenticateUser } = require('../middleware/authMiddleware');


// Only authenticated users can add, update, or delete comments
router.post('/', authenticateUser, commentController.addComment);
router.put('/:id', authenticateUser, commentController.updateComment);
router.delete('/:id', authenticateUser, commentController.deleteComment);


module.exports = router;
