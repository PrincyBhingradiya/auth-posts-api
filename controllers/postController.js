const Post = require('../models/post');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
  const { title, body, isActive, latitude, longitude } = req.body;

  if (!title || title.trim() === "")
    return res.status(400).json({ message: "Title is required" });

  if (!body || body.trim() === "")
    return res.status(400).json({ message: "Body is required" });

  if (latitude && typeof latitude !== "number")
    return res.status(400).json({ message: "Latitude must be a number" });

  if (longitude && typeof longitude !== "number")
    return res.status(400).json({ message: "Longitude must be a number" });

  try {
    const post = await Post.create({
      title,
      body,
      createdBy: req.user._id,
      isActive: isActive ?? true, 
      location: { latitude, longitude }
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id });
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { title, body, isActive } = req.body;

  try {
    let post = await Post.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

     if ((!title || title.trim() === "") && (!body || body.trim() === "")) {
      return res.status(400).json({ message: "Title and Body are required" });
    }

    if (!title || title.trim() === "")
      return res.status(400).json({ message: "Title is required" });

    if (!body || body.trim() === "")
      return res.status(400).json({ message: "Body is required" });

    post.title = title;
    post.body = body;

    if (typeof isActive === "boolean") post.isActive = isActive;

    await post.save();

    res.json({ success: true, message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPostsByLocation = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude)
    return res.status(400).json({ message: "Latitude & Longitude required" });

  try {
    const posts = await Post.find({
      'location.latitude': parseFloat(latitude),
      'location.longitude': parseFloat(longitude)
    });

    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPostStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({ createdBy: req.user._id });
    const activeCount = await Post.countDocuments({ createdBy: req.user._id, isActive: true });
    const inactiveCount = await Post.countDocuments({ createdBy: req.user._id, isActive: false });

    res.json({
      success: true,
      totalPosts,
      activeCount,
      inactiveCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
