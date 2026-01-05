const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    try {
        const products = await stripe.products.list({
            active: true,
        });
        
        const prices = await stripe.prices.list({
            active: true,
            limit: 100,
        });

        const productsWithPrices = products.data.map(product => {
            const productPrices = prices.data
                .filter(price => price.product === product.id)
                .sort((a, b) => {
                    const keyA = a.lookup_key || '';
                    const keyB = b.lookup_key || '';
                    return keyA.localeCompare(keyB);
                });
            return {
                ...product,
                prices: productPrices
            };
        }).sort((a, b) => {
            const orderA = parseInt(a.metadata.order) || 9999;
            const orderB = parseInt(b.metadata.order) || 9999;
            return orderA - orderB;
        });

        context.res = {
            body: productsWithPrices
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: "Error fetching products"
        };
    }
}
