const sql = require('mssql');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    context.log('Register function processing request.');
    const { email, password, username, isEmailSubscribed } = req.body;

    if (!email || !password || !username) {
        context.res = {
            status: 400,
            body: "Please provide email, password, and username"
        };
        return;
    }

    try {
        context.log(`Checking Stripe subscription for email: ${email}`);
        // Check for active subscription in Stripe
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
                body: "No active subscription found for this email. Please purchase a subscription in the store first."
            };
            return;
        }

        // Find best subscription
        let bestTier = null;
        let maxOrder = -1;

        for (const sub of activeSubscriptions) {
            let product = sub.items.data[0].price.product;
            if (typeof product === 'string') {
                product = await stripe.products.retrieve(product);
            }

            if (product && product.metadata) {
                const order = parseInt(product.metadata.order || '0');
                const tier = product.metadata.tier;

                if (order > maxOrder) {
                    maxOrder = order;
                    bestTier = tier;
                }
            }
        }
        context.log(`Best tier found: ${bestTier}`);

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

        // Check if user exists
        context.log('Checking if user exists...');
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM CHRISTIAN_SHIELDS_MEMBERS WHERE email = @email');

        if (checkUser.recordset.length > 0) {
            context.log('User already exists.');
            context.res = {
                status: 409,
                body: "User already exists"
            };
            return;
        }

        // Hash password
        context.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        context.log('Inserting user into database...');
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .input('member_username', sql.NVarChar, username)
            .input('subscription_tier', sql.NVarChar, bestTier)
            .input('is_email_subscribed', sql.Bit, isEmailSubscribed ? 1 : 0)
            .input('created', sql.DateTime, new Date())
            .query(`
                INSERT INTO CHRISTIAN_SHIELDS_MEMBERS (email, password_hash, member_username, subscription_tier, is_email_subscribed, created)
                VALUES (@email, @password_hash, @member_username, @subscription_tier, @is_email_subscribed, @created)
            `);

        context.log('User registered successfully.');
        context.res = {
            status: 201,
            body: "User registered successfully"
        };

    } catch (error) {
        context.log.error('Error registering user:', error);
        context.res = {
            status: 500,
            body: "Error registering user: " + error.message
        };
    }
};
