const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    const { priceId } = req.body;
    // Use the origin from the request or default to localhost for dev
    // In production, Azure SWA will handle the origin correctly or we can set a specific URL
    const domainURL = req.headers.origin || 'http://localhost:5173';

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // Redirect back to the site
            success_url: `${domainURL}/success`,
            cancel_url: `${domainURL}/store`,
        });

        context.res = {
            body: { url: session.url }
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: error.message
        };
    }
}
