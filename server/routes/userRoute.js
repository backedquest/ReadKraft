import Router from 'express'
import { addToWishlist, createUser, loginUser, logoutUser, removeFromWishlist } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
const userRouter=Router()

userRouter.post('/signup',createUser)
userRouter.post('/login',loginUser)
userRouter.get('/logout',auth,logoutUser)
userRouter.post('/addToWishllist',auth,addToWishlist)
userRouter.get('/removeFromWishlist',auth,removeFromWishlist)
userRouter.post('/updateProfile',auth,updateProfile)
router.get('/wishlist', auth,getWishlist);
router.delete('/delete', auth,deleteAccount);
router.get('/profile', auth,getUserProfile);
router.post('/buy', auth,buyBook);
router.post('/bookmark',auth, bookmarkPage);
router.get('/library',auth, getUserLibrary);

export default userRouter