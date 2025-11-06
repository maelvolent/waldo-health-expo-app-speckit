/**
 * Convex Authentication Configuration
 * Integrates Clerk authentication with Convex backend
 *
 * This configuration allows Convex to verify JWT tokens from Clerk
 * and extract user identity for secure backend operations.
 */

export default {
  providers: [
    {
      domain: 'https://fleet-kingfish-30.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
};
