import express,{Router} from 'express'
import { getUserProfile,bookmarkPage,getUserLibrary,getWishlist,deleteAccount,updateProfile,addToWishlist, createUser, loginUser, logoutUser, removeFromWishlist } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import { createCheckoutSession, handleWebhook, verifyPurchase } from '../controllers/bookPurchase.controller.js';


const userRouter=Router()

userRouter.post('/signup',createUser)
userRouter.post('/login',loginUser)
userRouter.get('/logout',auth,logoutUser)
userRouter.post('/addToWishlist',auth,addToWishlist)
userRouter.get('/removeFromWishlist',auth,removeFromWishlist)
userRouter.post('/updateProfile',auth,updateProfile)
userRouter.get('/wishlist', auth,getWishlist);
userRouter.delete('/delete', auth,deleteAccount);
// userRouter.post('/buy', auth,buyBook);
userRouter.get('/profile', auth,getUserProfile);
userRouter.post('/bookmark',auth, bookmarkPage);
userRouter.get('/library',auth, getUserLibrary);

// Create checkout session for book purchase
userRouter.post('/create-checkout-session', auth, createCheckoutSession);
// Handle Stripe webhook
userRouter.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);
// Verify purchase status
userRouter.get('/verify', auth, verifyPurchase);

export default userRouter