const Blog = require("../models/blogModel");

// Create a new blog post
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title, content, and author are required." });
    }
    const author = req.user.id; // Assuming authenticateUser middleware sets req.user

    // Handle image if uploaded
    const imageUrl = req.file ? `/public/blogImage/${req.file.filename}` : null;

    const newBlog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      author: author,
      imageUrl,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controller function to get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", " username email");
    return res.status(200).json({
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controller function to get all blogs by a specific user
const getBlogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blogs = await Blog.find({ author: userId }).populate(
      "author",
      " -_id username  email"
    );
    return res.status(200).json({
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controller function to get a single blog by its ID

const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById({ _id: blogId }).populate(
      "author",
      " username email"
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controller for update the blog
const updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content } = req.body;
    // console.log(title)

    // Find the blog by ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // user another apprach to udate  the blog fields using ternary operator
    blog.title = title ? title.trim() : blog.title;
    blog.content = content ? content.trim() : blog.content;

    // Handle image if uploaded
    if (req.file) {
      blog.imageUrl = `/public/blogImage/${req.file.filename}`;
    }

    // Save the updated blog
    await blog.save();

    return res.status(200).json({
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controller for delete the blog
const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find the blog by ID and delete it
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// controller to search blogs by title or content (with pagination) 
/**
 * Searches for blogs using an optimized text index and includes pagination.
 */
// const searchBlogs = async (req, res) => {
//   try {
//     // 1. Destructure and set defaults for pagination
//     const { query, page = 1, limit = 10 } = req.query;

//     // 2. More robust validation
//     if (!query || query.trim().length < 2) {
//       return res.status(400).json({
//         message: "Search query is required and must be at least 2 characters long",
//       });
//     }

//     // 3. Use the $text operator for efficient searching
//     // This requires a text index to be created on the collection
//     const searchQuery = { $text: { $search: query } };

//     // Calculate the number of documents to skip for pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // 4. Execute queries in parallel for better performance
//     const [blogs, totalCount] = await Promise.all([
//       Blog.find(searchQuery)
//         .populate("author", "username email")
//         // Sort by the relevance score provided by the text search
//         .sort({ score: { $meta: "textScore" } })
//         .skip(skip)
//         .limit(parseInt(limit)),
//       Blog.countDocuments(searchQuery)
//     ]);

//     // 5. Return a structured response with pagination metadata
//     return res.status(200).json({
//       message: "Search results",
//       data: {
//         blogs,
//         pagination: {
//           total: totalCount,
//           page: parseInt(page),
//           limit: parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error searching blogs:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

const searchBlogs = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
      .populate("author", "username email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    });

    return res.status(200).json({
      message: "Search results",
      blogs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error searching blogs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Export the controller function

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogsByUser,
  getBlogById,
  updateBlog,
  deleteBlog,
  searchBlogs,
};