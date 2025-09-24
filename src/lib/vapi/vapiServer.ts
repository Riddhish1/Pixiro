import { VapiClient } from '@vapi-ai/server-sdk'
import jwt from 'jsonwebtoken'

// Define the payload
const payload = {
  orgId: process.env.VAPI_ORG_ID,
  token: {
    // This is the scope of the token
    tag: 'private',
  },
}

// Get the private key from environment variables
const key = process.env.VAPI_PRIVATE_KEY!

// Define token options
const options = {
  expiresIn: 2800, // 1 hour in seconds
}

// Generate the token using a JWT library or built-in functionality
const token = jwt.sign(payload, key, options)

export const vapiServer = new VapiClient({ token: token })
