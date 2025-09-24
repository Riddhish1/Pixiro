import { prismaClient } from '@/lib/prismaClient';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles the OAuth callback from Stripe Connect
 * Processes the authorization code and redirects the user to the settings page
 */
export async function GET(request: NextRequest) {
  try {
    // Extract search params
    const searchParams = request.nextUrl.searchParams;
    
    // Get required params
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Validate required parameters
    if (!code || !state) {
      console.error('Missing required parameters:', { code, state });
      // Redirect to settings page with error parameter
      return NextResponse.redirect(new URL(`/settings?success=false&message=Missing+required+parameters`, request.url));
    }
    
    console.log('Processing Stripe Connect callback:', { code, stateId: state });
    
    try {
      // Exchange the authorization code for an access token
      const response = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });
      
      // Validate Stripe user ID
      if (!response.stripe_user_id) {
        throw new Error("Failed to retrieve Stripe user ID");
      }
      
      // Update user with Stripe Connect ID
      await prismaClient.user.update({
        where: {
          id: state
        },
        data: {

          stripeConnectId: response.stripe_user_id,
        }
      });
      
      console.log('Successfully connected Stripe account:', { 
        userId: state, 
        stripeConnectId: response.stripe_user_id 
      });
      
      // Redirect to settings page with success message
      return NextResponse.redirect(
        new URL(`/settings?success=true&message=Stripe+account+connected+successfully`, request.url)
      );
      
    } catch (stripeError) {
      console.error('Stripe connection error:', stripeError);
      
      // Redirect to settings page with specific error message
      return NextResponse.redirect(
        new URL(`/settings?success=false&message=${encodeURIComponent((stripeError as Error).message)}`, request.url)
      );
    }
    
  } catch (error) {
    console.error('Unexpected error in Stripe callback handler:', error);
    
    // Redirect to settings page with generic error message
    return NextResponse.redirect(
      new URL(`/settings?success=false&message=An+unexpected+error+occurred`, request.url)
    );
  }
}