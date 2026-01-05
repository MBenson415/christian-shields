const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    context.log('Login function processing request.');
    const { email, password } = req.body;

    if (!email || !password) {
        context.res = {
            status: 400,
            body: "Please provide email and password"
        };
        return;
    }

    try {
        // Connect to SQL
        context.log('Connecting to SQL...');
        const pool = await sql.connect(process.env["SqlConnectionString"] || {
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            server: process.env.SQL_SERVER,
            database: process.env.SQL_DATABASE,
            options: {
                encrypt: true
            }
        });

        // Fetch user
        context.log(`Fetching user for email: ${email}`);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM CHRISTIAN_SHIELDS_MEMBERS WHERE email = @email');

        if (result.recordset.length === 0) {
            context.log('User not found.');
            context.res = {
                status: 401,
                body: "Invalid email or password"
            };
            return;
        }

        const user = result.recordset[0];

        // Check password
        if (!user.password_hash) {
             context.log('User has no password hash.');
             context.res = {
                status: 401,
                body: "Invalid email or password"
            };
            return;
        }

        context.log('Verifying password...');
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            context.log('Invalid password.');
            context.res = {
                status: 401,
                body: "Invalid email or password"
            };
            return;
        }

        // Check for active subscription in Stripe
        context.log('Checking Stripe subscription...');
        const customers = await stripe.customers.list({ email: email, limit: 100 });
        let activeSubscriptions = [];

        for (const customer of customers.data) {
            const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: 'active'
            });
            activeSubscriptions.push(...subscriptions.data);
        }

        if (activeSubscriptions.length === 0) {
            context.log('No active subscription found.');
            context.res = {
                status: 403,
                body: "Your membership has expired. Please purchase a new subscription in the store to restore access."
            };
            return;
        }

        // Find best subscription for image
        let maxOrder = -1;
        let subscriptionImage = null;

        for (const sub of activeSubscriptions) {
            let product = sub.items.data[0].price.product;
            if (typeof product === 'string') {
                product = await stripe.products.retrieve(product);
            }

            if (product && product.metadata) {
                const order = parseInt(product.metadata.order || '0');
                if (order > maxOrder) {
                    maxOrder = order;
                    subscriptionImage = product.images && product.images.length > 0 ? product.images[0] : null;
                }
            }
        }

        // Generate Token
        context.log('Generating token...');
        const secret = process.env.JWT_SECRET || 'supersecretkey'; 
        const token = jwt.sign({ id: user.Id, email: user.email }, secret, { expiresIn: '1h' });

        context.res = {
            body: {
                token,
                user: {
                    id: user.Id,
                    email: user.email,
                    name: user.member_username || user.name,
                    subscription_image: subscriptionImage
                }
            }
        };

    } catch (error) {
        context.log.error('Error logging in:', error);
        context.res = {
            status: 500,
            body: "Error logging in: " + error.message
        };
    }
};
