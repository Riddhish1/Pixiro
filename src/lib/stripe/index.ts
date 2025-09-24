import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  // apiVersion: '2025-02-24.acacia',
  apiVersion: '2025-04-30.basil',
  appInfo:{
    name: 'Leaderboard Saas',
    version: '0.1.0'
  }
}) 