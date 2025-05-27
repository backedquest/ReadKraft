import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export async function createUser(request,response){
    try{
        const {name,email,password} = request.body
        if(!name || !email || !password){
            return response.status(400).json({
                message :"Invalid inputs",
                error : true,
                success: false
            })
        }
        const user= await userModel.findOne({email})
        if(user){
            return response.status(400).json({
                message :"User already exists",
                error : true,
                success: false
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword= await bcrypt.hash(password,salt)
        const newUser= {
            name,email,password:hashPassword
        }
        const save = await (new userModel(newUser)).save() 
        
        
        
        return response.json({
            message :"SignUp successful"
            ,error:false,
            success: true
        })
    }
    catch(error){
        return response.status(500).json({
            message : error.status || error,
            error: true,
            success: false
        })
    }
}

export async function loginUser(request, response) {
    try {
        const { email, password } = request.body

        if (!email || !password) {
            return response.status(400).json({
                message: "Invalid inputs",
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email })
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return response.status(401).json({
                message: "Invalid credentials",
                error: true,
                success: false
            })
        }

        // Token generation can be added here (e.g., JWT)
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        // Generate refresh token (expires in 7 days)
        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',accessToken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)


        const addRefreshTokenToDatabase= await userModel.updateOne({email},{refreshToken : refreshToken})

        return response.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        })
        
    }
}

export async function logoutUser(request, response) {
    try {
        // Clear the HTTP-only cookie storing the refresh token
        response.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        })

        response.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        })

        return response.json({
            message: "Logout successful",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        })
    }
}

export async function removeFromWishlist(request, response) {
    try {
        const { userId, bookId } = request.body;

        if (!userId || !bookId) {
            return response.status(400).json({
                success: false,
                message: 'User ID and Book ID are required'
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return response.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove bookId from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
        await user.save();

        return response.status(200).json({
            success: true,
            message: 'Book removed from wishlist',
            wishlist: user.wishlist
        });

    } catch (error) {
        return response.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}


export async function addToWishlist(request, response) {
    try {
        const { userId, bookId } = request.body

        if (!userId || !bookId) {
            return response.status(400).json({
                message: "User ID and Book ID are required",
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        if (user.wishlist.includes(bookId)) {
            return response.status(409).json({
                message: "Book already in wishlist",
                error: true,
                success: false
            })
        }

        user.wishlist.push(bookId)
        await user.save()

        return response.json({
            message: "Book added to wishlist",
            wishlist: user.wishlist,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        })
    }
}