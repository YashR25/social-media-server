const { success } = require("../utils/responseWrapper")

const getAllPostsController = async (req, res) => {
    console.log(req._id)
    // res.send('These are all posts')
    return res.send(success(200,'These are all posts'))
}

module.exports = {getAllPostsController}