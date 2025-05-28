import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import bookModel from "../models/book.model.js";
import transactionModel from "../models/transactions.model.js";
import stripe from "../utils/stripe.js";

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

export async function updateProfile(request,response){
    try {
        const userId = request.userId; // Comes from auth middleware
        const updates = req.body; // Fields like name, email, etc.
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const user = await userModel.findByIdAndUpdate(userId, updates, {
            new: true,           // Return updated document
            runValidators: true  // Ensure schema validation
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data : user,
        });
    } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: true,
    });
  }
}

export async function getWishlist(request, response) {
    try {
        const { userId } = request.userId;

        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const user = await userModel.findById(userId).populate('wishlist');

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Wishlist retrieved successfully",
            wishlist: user.wishlist,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export async function deleteAccount(request,response){
    try{
        const userId = request.userId; // From JWT middleware

        const user = await userModel.findByIdAndDelete(userId);

        if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found or already deleted',
        });
        }
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
        return res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    }
    catch(error){
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export async function getUserProfile(request, response) {
    try {
        const { userId } = request.userId;

        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const user = await userModel.findById(userId).select('-password'); // Exclude password

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "User profile fetched successfully",
            profile: user,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export async function buyBook(request,response){
    try {
    const userId = request.userId;
    const { bookId } = request.body;

    const user = await userModel.findById(userId);
    const book = await bookModel.findById(bookId);

    if (!user || !book) {
      return res.status(404).json({ success: false, message: "User or Book not found" });
    }

    const alreadyBought = user.library.some(entry => entry.book.toString() === bookId);
    if (alreadyBought) {
      return res.status(400).json({ success: false, message: "Book already purchased" });
    }

    const amount = book.price || 0;

    if (amount === 0) {
      user.library.push({ book: bookId, purchaseDate: new Date() });
      await user.save();

      await transactionModel.create({
        userId,
        book: bookId,
        amount: 0,
        paymentMethod: "free",
        status: "completed"
      });

      return res.status(200).json({ success: true, message: "Book purchased for free" });
    }

    // Stripe PaymentIntent for paid book
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount ,
      currency: "inr",
      metadata: {
        userId: userId.toString(),
        bookId: bookId.toString()
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: "Payment initiated"
    });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }

export async function bookmarkPage(request, response) {
    try {
        const { userId } = request.userId;
        const { bookId, pageNumber = 1 } = request.body;

        if (!userId || !bookId) {
            return response.status(400).json({
                message: "User ID and Book ID are required",
                error: true,
                success: false
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const book = await bookModel.findById(bookId);
        if (!book) {
            return response.status(404).json({
                message: "Book not found",
                error: true,
                success: false
            });
        }

        const totalPages = book.size || 1;
        const progress = Math.min((pageNumber / totalPages) * 100, 100);

        const existingEntryIndex = user.readingHistory.findIndex(entry =>
            entry.book.toString() === bookId
        );

        if (existingEntryIndex !== -1) {
            // Update existing history entry
            user.readingHistory[existingEntryIndex].lastPageRead = pageNumber;
            user.readingHistory[existingEntryIndex].progress = progress;
            user.readingHistory[existingEntryIndex].lastRead = new Date();
        } else {
            // Add new history entry
            user.readingHistory.push({
                book: bookId,
                lastPageRead: pageNumber,
                progress,
                lastRead: new Date()
            });
        }

        await user.save();

        return response.json({
            message: "Page bookmarked successfully",
            readingHistory: user.readingHistory,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}


export async function getUserLibrary(request, response) {
    try {
        const { userId } = request.userId;

        if (!userId) {
            return response.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        // Populate book details from library
        const user = await userModel.findById(userId).populate({
            path: 'library',
            populate: {
                path: 'book', // only needed if library is an array of { book, purchaseDate }
                model: 'book'
            }
        });

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "User library fetched successfully",
            library: user.library,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

