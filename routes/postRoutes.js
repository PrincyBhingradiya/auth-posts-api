const express = require('express');
const auth = require('../middleware/auth');
const {createPost,getMyPosts,updatePost,deletePost,getPostsByLocation,getPostStats} = require('../controllers/postController');

const router = express.Router();

router.post('/', auth, createPost);
router.get('/', auth, getMyPosts);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.get('/location/filter', auth, getPostsByLocation);
router.get('/stats/count', auth, getPostStats);

module.exports = router;
