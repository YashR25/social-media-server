const Post = require("../models/Post");
const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2;
const {mapPostOutput} = require('../utils/Utils')

const followAndUnfollowUserController = async (req, res) => {

    try {
        const {userIdToFollow} = req.body;
    const curUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if(userIdToFollow == curUserId){
        return res.send(error(409, 'cannot follow yourself'))
    }

    if(!userToFollow){
        return res.send(error(404,'User not found'))
    }

    if(curUser.following.includes(userIdToFollow)){
        const userToFollowIndex = await curUser.following.indexOf(userIdToFollow)
        curUser.following.splice(userToFollowIndex, 1);

        const curUserIndex = await userToFollow.followers.indexOf(curUserId)
        userToFollow.followers.splice(curUserIndex, 1);

    }else{
        curUser.following.push(userIdToFollow);
        userToFollow.followers.push(curUserId);
    }

    await curUser.save();
    await userToFollow.save();

    return res.send(success(201, {user: userToFollow}))
    } catch (e) {
       return res.send(error(500, e.message)) 
    }
    
}

const getPostOfFollowing = async (req, res) => {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate('following');

    const fullPosts = await Post.find({
        'owner': {
            '$in': curUser.following
        }
    }).populate('owner')

    const posts = await fullPosts.map((post) => {
        return mapPostOutput(post, req._id)
    }).reverse();

    const followingsIds = curUser.following.map(item => item._id);
    followingsIds.push(req._id)
    const suggetions = await User.find({
        _id: {
            '$nin': followingsIds
        }
    })
    return res.send(success(201, {...curUser._doc, posts, suggetions}))
}

const getMyPost = async (req, res) => {
    try {
        const curUserID = req._id;
        const allPost = await Post.find({
            owner: curUserID
        }).populate('likes');
        return res.send(success(201,allPost))
    } catch (e) {
        return res.send(error(500, e.message)) 
    }
} 

const getUserPosts = async (req, res) => {
    try {
        const {userId} = req.body;

        if(!userId){
            return res.send(error(400, 'userId is required'))
        }
        const allPost = await Post.find({
            owner: userId
        }).populate('likes');
        return res.send(success(201,allPost))
    } catch (e) {
        return res.send(error(500, e.message)) 
    }
}

const deleteMyProfile = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        await Post.deleteMany({
            owner: curUserId
        })

    

        curUser.followers.forEach(async (followerId) => {
            const followerUser = await User.findById(followerId);
            if(followerUser){
                const index = await followerUser?.following?.indexOf(curUserId);
                followerUser.following.splice(index, 1);
                await followerUser.save();
            }
        })

        curUser.following.forEach(async (followingId) => {
            const followingUser = await User.findById(followingId);
            if(followingUser){
                const index = await followingUser.followers.indexOf(curUserId);
                followingUser.followers.splice(index, 1);
                await followingUser.save();
            }
        })

        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = await post.likes.indexOf(curUserId);
            if(index){
                post.likes.splice(index, 1);
                await post.save();
            }
        })

        await curUser.remove();

        return res.send(success(400, 'User Deleted Successfully'))
    } catch (e) {
        return res.send(error(500, e.message))
    }
    

}

const getMyInfo = async (req, res) => {
    try {
        const user =  await User.findById(req._id);
        res.send(success(200,{user}))
    } catch (e) {
        res.send(error(400, e.message))        
    }
}

const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req._id)
        const {name, bio, userImg} = req.body;

        if(name){
            user.name = name
        }

        if(bio){
            user.bio = bio
        }

        if(userImg){
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: 'profileImg'
            })
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id
            }
        }

        await user.save();
        return res.send(success(200, {user}))
    } catch (e) {
        res.send(error(400, e.message))
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId
        const user = await User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        });   
        const fullPosts = await user.posts
        const posts = await fullPosts.map((post) => {
            return mapPostOutput(post, req._id)
        }).reverse();

        console.log(posts)
        return res.send(success(200, {...user._doc, posts}))

    } catch (e) {
        res.send(error(500, e.message))
    }

}

module.exports = {
    followAndUnfollowUserController,
    getPostOfFollowing,
    getMyPost,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateMyProfile,
    getUserProfile
}