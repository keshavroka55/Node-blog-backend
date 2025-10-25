// /routes/likeRoutes.js
// Like endpoints mounted on /api/posts/:id/like and /api/posts/:id/unlike

const express = require('express');
const router = express.Router();

const likeCtrl = require('../controllers/likeControllers');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/:id/like', authenticateUser, likeCtrl.likePost);
router.delete('/:id/unlike', authenticateUser, likeCtrl.unlikePost);


module.exports = router;
