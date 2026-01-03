const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    try {
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
        });

        context.res = {
            body: products.data
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: "Error fetching products"
        };
    }
}
