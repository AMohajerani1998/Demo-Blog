const Post = require("../models/post");
const sessionValidation = require("../util/session-validation");
const inputValidation = require("../util/input-validation");

function getHome(req, res) {
    res.render("home");
}

async function getPosts(req, res) {
    if (!res.locals.isAuth) {
        console.log("You are not autheticated to access this page!");
        return res.status(401).render("401");
    }
    let inputData = sessionValidation.checkSessionInputData(req, {
        enteredPostTitle: "",
        enteredPostContent: "",
    });
    const posts = await Post.fetchall();
    res.render("posts", { inputData: inputData, posts: posts });
}

async function createPost(req, res) {
    const enteredData = req.body;
    const enteredPostTitle = enteredData.title;
    const enteredPostContent = enteredData.content;
    if (!inputValidation.postInputValidation(enteredPostTitle, enteredPostContent)) {
        sessionValidation.flashInputError(req, {
            errorMessage : 'Invalid input! Please try again.',
            enteredPostTitle : enteredPostTitle, 
            enteredPostContent : enteredPostContent
        }, function(){
            return res.redirect("/posts");
        })
        return;
    }
    const post = new Post(enteredPostTitle, enteredPostContent);
    await post.save();
    res.redirect("/posts");
}

async function viewPost(req, res, next) {
    let post;
    try{
        post = new Post(null, null, req.params.id);
    } catch(error){
        res.status(404).render('404')
    }
    await post.fetch();
    if (!post.title || !post.content) {
        res.status(404).render("404");
    }
    let inputData = sessionValidation.checkSessionInputData(req, {
        enteredPostTitle: post.title,
        enteredPostContent: post.content
    })
    res.render("edit-post", { inputData: inputData, postId: post.id });
}

async function editPost(req, res) {
    const enteredData = req.body;
    const enteredPostTitle = enteredData.title;
    const enteredPostContent = enteredData.content;
    const post = new Post(enteredPostTitle, enteredPostContent, req.params.id);
    if (!inputValidation.postInputValidation(enteredPostTitle, enteredPostContent)) {
        sessionValidation.flashInputError(req, {
            errorMessage: 'Invalid input! Please try again.',
            enteredPostTitle : enteredPostTitle,
            enteredPostContent : enteredPostContent
        }, function(){
            res.redirect(`/posts/${post.id}/edit`)
        })
        return;
    }
    await post.save();
    res.redirect("/posts");
}

async function deletePost(req, res) {
    const post = new Post(null, null, req.params.id);
    post.delete();
    res.redirect("/posts");
}

module.exports = {
    getHome: getHome,
    getPosts: getPosts,
    createPost: createPost,
    viewPost: viewPost,
    editPost: editPost,
    deletePost: deletePost,
};
