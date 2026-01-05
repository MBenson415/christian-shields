const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    const { items, mode } = req.body;
    // Use the origin from the request or default to localhost for dev
    // In production, Azure SWA will handle the origin correctly or we can set a specific URL
    const domainURL = req.headers.origin || 'http://localhost:5173';

    if (!items || items.length === 0) {
        context.res = {
            status: 400,
            body: "No items provided"
        };
        return;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: mode || 'payment',
            line_items: items.map(item => ({
                price: item.priceId,
                quantity: item.quantity,
            })),
            // Redirect back to the site
            success_url: `${domainURL}/success`,
            cancel_url: `${domainURL}/cart`,
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
