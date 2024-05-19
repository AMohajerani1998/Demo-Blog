const express = require("express");
const router = express.Router();
const guardRoute = require("../middlewares/auth-protection-middleware");

const postControllers = require("../controllers/post-controllers");

router.get("/", postControllers.getHome);

router.use(guardRoute );

router.get("/posts", postControllers.getPosts);

router.post("/posts", postControllers.createPost);

router.get("/posts/:id/edit", postControllers.viewPost);

router.post("/posts/:id/edit", postControllers.editPost);

router.post("/posts/:id/delete", postControllers.deletePost);

module.exports = router;
