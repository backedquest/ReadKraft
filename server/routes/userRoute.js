import Router from 'express'
import { addToWishlist, createUser, loginUser, logoutUser, removeFromWishlist } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
const userRouter=Router()

userRouter.post('/signup',createUser)
userRouter.post('/login',loginUser)
userRouter.get('/logout',auth,logoutUser)
userRouter.post('/addToWishllist',auth,addToWishlist)
userRouter.get('/removeFromWishlist',auth,removeFromWishlist)

export default userRouter