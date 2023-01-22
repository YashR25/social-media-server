const userController = require('../controllers/userController')
const { requireUser } = require('../middlewares/requireUser')

const router = require('express').Router();

router.post('/follow', requireUser, userController.followAndUnfollowUserController)
router.post('/getFeedData', requireUser, userController.getPostOfFollowing)
router.get('/getMyPost',requireUser, userController.getMyPost)
router.post('/getUserPosts', requireUser, userController.getUserPosts)
router.delete('/',requireUser, userController.deleteMyProfile)
router.get('/getMyInfo', requireUser, userController.getMyInfo)
router.put('/', requireUser, userController.updateMyProfile)

router.post('/getUserProfile', requireUser, userController.getUserProfile)

module.exports = router;