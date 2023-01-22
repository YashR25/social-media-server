const User = require('../models/User')
const Post = require('../models/Post')
const cloudinary = require('cloudinary').v2;

const { success, error } = require("../utils/responseWrapper");
const { mapPostOutput } = require('../utils/Utils');

const createPostController = async (req, res) => {
    try {

        const {caption, postImg} = req.body;
        const owner = req._id;

        if(!caption || !postImg){
            return res.send(error(400,'caption & post image is required'))
        }

        const cloudImage = await cloudinary.uploader.upload(postImg, {
            folder: 'postImg'
        })

        const user = await User.findById(req._id)

        const post = await Post.create({
            caption,
            owner,
            image: {
                publicId: cloudImage.public_id,
                url: cloudImage.url
            }
        })

        user.posts.push(post);
        await user.save();

        return res.send(success(201, post));
        
    } catch (e) {
        return res.send(error(500, e.message));
    }

}

const likeAndUnlikePostController = async (req, res) => {
    try {
        const {postId} = req.body;
        const curUser = req._id;
        const post = await Post.findById(postId)

        if(!post){
            return res.send(error(404, "Post not found"))
        }

        if(post.likes.includes(curUser)){
            const index = post.likes.indexOf(curUser);
            post.likes.splice(index, 1);
        }else{
            post.likes.push(curUser);
        }
        await post.save();
        res.send(success(200, {post: mapPostOutput(post, req._id)}))
    } catch (e) {
        return res.send(error(500, e.message))
    }
    
}

const updatePostController = async (req, res) => {
    try {
        const {caption, postId} = req.body;
        const curUserId = req._id;

        const curUser = await User.findById(curUserId);
        const post = await Post.findById(postId);

        if(!post){
            return res.send(error(404, 'Post not found'))
        }

        if(post.owner.toString() !== curUserId){
            return res.send(error(409, 'Post can only be edited by owner'))
        }

        if(caption){
            post.caption = caption;
        }

        await post.save();

        return res.send(success(201,post))
    } catch (e) {
        return res.send(error(500, e.message))
    }
    

}

const deletePostController = async (req, res) => {

    try {

        const {postId} = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId)
        const curUser = await User.findById(curUserId)

        if(!post){
            return res.send(error(404, 'Post not found'))
        }

        if(post.owner.toString() !== curUserId){
            return res.send(error(409, 'Post can only be deleted by owner'))
        }

        const index = await curUser.posts.indexOf(postId);
        curUser.posts.splice(index, 1)
        await curUser.save()
        await post.remove();

        return res.send(success(201, 'Post deleted successfully'))
        
    } catch (e) {
        return res.send(error(500, e.message))
    }
    

}

module.exports = {
    createPostController,
    likeAndUnlikePostController,
    updatePostController,
    deletePostController
}