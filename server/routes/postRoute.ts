import express, { Response, Request, Router } from "express";
import { body, validationResult } from "express-validator";
import { omit } from "lodash";
import isAuthenticated from "../middlewares/isAuthenticated";
import Post from "../models/postModel";
import User from "../models/userModel";
import multer from "multer"

const router: Router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 3 },
})

//get all posts
router.get("/", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).send({
      error: error.message,
    });
  }
});

//create post
router.post(
  "/",
  body("caption")
    .exists()
    .withMessage("Caption in required")
    .isLength({
      min: 5,
      max: 100,
    })
    .withMessage("Caption must be between 5 and 100 characters"),
  body("image").exists().withMessage("Image is required"),
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { caption, image } = req.body;
    const userId = res.locals.user._id;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: errors.array()[0].msg,
        });
      } else {
        const postboi = await Post.create({
          caption: caption,
          image: image,
          userId: userId,
        });
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
      }
    } catch (error: any) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);

//get user posts
router.get(
  "/userposts",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const userId = res.locals.user._id;
    try {
      const posts = await Post.find({ userId: userId });
      res.status(200).json(posts);
    } catch (error: any) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);

//get user posts by id
router.get("/userposts/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ userId: userId });
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).send({
      error: error.message,
    });
  }
});

//like post
router.put(
  "/like/:postId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = res.locals.user._id;
    try {
      const post = await Post.findById(postId);
      if (post.likes.includes(userId)) {
        await post.updateOne({
          $pull: { likes: userId },
        });
        const newpost1 = await Post.find().sort({ createdAt: -1 });
        res.json(newpost1);
      } else {
        await post.updateOne({
          $push: { likes: userId },
        });
        const newpost2 = await Post.find().sort({ createdAt: -1 });
        res.json(newpost2);
      }
    } catch (error: any) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);

//trending posts
router.get("/trending", async (req, res) => {
  try {
    const postsStuff = await Post.find()
      .sort({
        likes: -1,
      })
      .limit(5);
    res.json(postsStuff);
  } catch (error: any) {
    res.status(500).send({
      error: error.message,
    });
  }
});

//get post by id
router.get("/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    res.status(200).json(post);
  } catch (error: any) {
    res.status(500).send({
      error: error.message,
    });
  }
});

//delete post
router.delete(
  "/:postId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
      const post = await Post.findById(postId);
      if (post.userId === res.locals.user._id) {
        await Post.findByIdAndDelete(postId);
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
      } else {
        res.status(403).send({
          error: "You can't delete other posts",
        });
      }
    } catch (error: any) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);

//update post
router.put(
  "/:postId",
  body("caption")
    .exists()
    .withMessage("Caption in required")
    .isLength({
      min: 5,
      max: 100,
    })
    .withMessage("Caption must be between 5 and 100 characters"),
  body("image").exists().withMessage("Image is required"),
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { caption, image } = req.body;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: errors.array()[0].msg,
        });
      } else {
        const post = await Post.findById(postId);
        if (post.userId === res.locals.user._id) {
          await Post.findByIdAndUpdate(postId, {
            caption: caption,
            image: image,
          });
          const posts = await Post.find().sort({ createdAt: -1 });
          res.status(200).json(posts);
        } else {
          res.status(403).send({
            error: "You can't update other posts",
          });
        }
      }
    } catch (error: any) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);

//comment on a post
router.post(
  "/:postId/comment",
  body("comment").exists().withMessage("Comment is required"),
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = res.locals.user._id;
    const comment = req.body.comment;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: errors.array()[0].msg,
        });
      } else {
        const post = await Post.findById(postId);
        const user = await User.findById(userId);
        const userboi = omit(user?.toJSON(), "password");
        await post.updateOne({
          $push: {
            comments: {
              userboi,
              comment,
            },
          },
        });
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
      }
    } catch (error: any) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);

router.post("/imageboi", upload.single("image"), async (req, res) => {
  try {
    res.json("Uploaded")
  } catch (error: any) {
    res.status(500).send({
      error: error.message,
    });
  }
})

export default router;
