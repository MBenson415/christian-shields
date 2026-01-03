# Christian Shields on react-js and Azure Static Web App

This is the  Christian Shields website, built with React (Vite) and Azure Static Web Apps.
It integrates with Stripe to list products and handle checkout, uses Bandsintown API for event feed, and manages member features using Azure SQL Server backend.

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
    - For production (Azure Static Web Apps), add `STRIPE_SECRET_KEY` as an application setting in the Azure portal manually.

## Running Locally

1.  Start both the Client and API with a single command:
    ```bash
    npm start
    ```

2.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

Deploy to Azure Static Web Apps using the Azure CLI or GitHub Actions.
Ensure the `api_location` is set to `api` and `app_location` is set to `/`.

Development site prior to DNS transfer is available at [https://red-meadow-05ef5440f.6.azurestaticapps.net](https://red-meadow-05ef5440f.6.azurestaticapps.net).

## To do

[X] Replicate Squarespace styling

[X] New Subscriber component

[X] Implement BandsInTown API event feed on front page

[X] Implement Stripe Products and checkout session

[ ] Implement Cart

[ ] Member sign-up and login

[ ] Backend: Check membership status

[ ] Separate store for members only (free shipping)