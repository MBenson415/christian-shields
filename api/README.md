# Christian Shields Copy

This is a copy of the Christian Shields website, built with React (Vite) and Azure Static Web Apps.
It integrates with Stripe to list products and handle checkout.

## Prerequisites

- Node.js
- Azure Functions Core Tools (for running the API locally)
- Stripe Account (Publishable and Secret keys)

## Setup

1.  Install dependencies for the client:
    ```bash
    npm install
    ```

2.  Install dependencies for the API:
    ```bash
    cd api
    npm install
    cd ..
    ```

3.  Configure Stripe keys:
    - The `api/local.settings.json` file is already configured with the provided secret key for local development.
    - For production (Azure Static Web Apps), add `STRIPE_SECRET_KEY` as an application setting in the Azure portal.

## Running Locally

1.  Start the Azure Functions API:
    ```bash
    cd api
    func start
    ```

2.  In a separate terminal, start the React app:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

Deploy to Azure Static Web Apps using the Azure CLI or GitHub Actions.
Ensure the `api_location` is set to `api` and `app_location` is set to `/`.

## To do

1. Implement Stripe store and checkout session

2. Member sign-up and login

3. Backend: Check membership status

4. Separate store for members only (free shipping)

5. Implement BandsInTown API event feed on front page