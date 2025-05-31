import Stripe from 'stripe';
import dotenv from 'dotenv';
import Book from '../models/book.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transactions.model.js';

dotenv.config();

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { bookId } = req.body;
        if (!bookId) {
            return res.status(400).json({ success: false, message: 'Book ID is required' });
        }

        const userId = req.user?.id || req.userId; // Handle both auth middleware formats
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Get book details
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Create Stripe checkout session
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: book.name,
                            description: `By ${book.author}`,
                        },
                        unit_amount: Math.round(book.price * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/purchase/cancel`,
            metadata: {
                bookId: bookId,
                userId: userId
            }
        });

        // Create a pending transaction
        await Transaction.create({
            userid: userId,
            book: bookId,
            amount: book.price,
            paymentmethod: 'CREDIT CARD',
            status: 'Pending'
        });

        res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Error creating checkout session' });
    }
};

export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            // Update transaction status
            await Transaction.findOneAndUpdate(
                {
                    userid: session.metadata.userId,
                    book: session.metadata.bookId,
                    status: 'Pending'
                },
                { status: 'Completed' }
            );

            // Add book to user's library
            await User.findByIdAndUpdate(
                session.metadata.userId,
                {
                    $push: {
                        library: {
                            books: session.metadata.bookId,
                            purchaseDate: new Date()
                        }
                    }
                }
            );

            // Increment book's number of users
            await Book.findByIdAndUpdate(
                session.metadata.bookId,
                { $inc: { numberofusers: 1 } }
            );
        } catch (error) {
            console.error('Error processing successful payment:', error);
            return res.status(500).json({ success: false, message: 'Error processing payment' });
        }
    }

    res.json({ received: true });
};

export const verifyPurchase = async (req, res) => {
    try {
        const { sessionId } = req.query;
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.json({ success: false, message: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
}; 