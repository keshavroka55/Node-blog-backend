const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogsByUser,
  getBlogById,
  updateBlog,
  deleteBlog,
  searchBlogs,
} = require("../controllers/blogControllers");
const { uploadBlogImage } = require("../services/fileUploadService");
const { authenticateUser } = require("../middleware/authMiddleware");

// Route to create a new blog post with image upload
router.post(
  "/create-blog",
  authenticateUser,
  uploadBlogImage.single("imageUrl"),
  createBlog
);

/**
 * @description get all blogs
 * @api GET /api/v1/blogs
 * @access Public
 * @type GET
 * @returns response
 */
router.get("/all", getAllBlogs);

/**
 * @description get all blogs by a specific user
 * @api GET /api/v1/blogs/user/:userId
 * @access Public
 * @type GET
 * @returns response
 */
router.get("/user/:userId", authenticateUser, getBlogsByUser);

/**
 * @description get a single blog by its ID
 * @api GET /api/v1/blogs/:blogId
 * @access Public
 * @type GET
 * @returns response
 */
// get the single vlog. 
router.get("/:blogId", getBlogById);

/**
 * @description update a blog by its ID
 * @api PUT /api/v1/blogs/:blogId
 * @access Private
 * @type PUT
 * @returns response
 */
router.put(
  "/:blogId",
  authenticateUser,
  uploadBlogImage.single("imageUrl"),
  updateBlog
);

/**
 * @description delete a blog by its ID
 * @api DELETE /api/v1/blogs/:blogId
 * @access Private
 * @type DELETE
 * @returns response
 */
router.delete("/:blogId", authenticateUser, deleteBlog);

/**
 * @description search blogs by title or content
 * @api GET /api/v1/blogs/list/search?query=keyword&page=1&limit=10
 * @access Public
 * @type GET
 * @returns JSON response with blogs, total count, page, and limit
 */
router.get("/list/search", searchBlogs);

// export the router
module.exports = router;