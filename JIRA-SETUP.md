# JIRA Integration Setup Guide

## Environment Variables

Create a `.env` file in your project root with the following variables:

```
# JIRA OAuth credentials
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret
JIRA_REDIRECT_URI=http://localhost:3000/api/jira/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Obtaining JIRA Credentials

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Click "Create" to create a new OAuth 2.0 integration
3. Fill in the required details:
   - App name (e.g., "ReQAize JIRA Integration")
   - Description
   - Company URL
   - Callback URL: Set to `http://localhost:3000/api/jira/callback` for development

### Adding APIs to Your App

4. After creating your app, navigate to the "Permissions" tab
5. Click on "Add" to add APIs to your app
6. Select the following APIs:
   - **Jira API**: This provides access to Jira projects and issues
   - **Jira Software API**: For Jira Software-specific resources (if needed)
7. For each API, add the required scopes:
   - `read:jira-user`
   - `read:jira-work`
   - `write:jira-work`
   - `offline_access` (for refresh tokens)
8. Save the changes

### After Adding APIs

9. Navigate to the "Authorization" tab in the left sidebar
10. Under "OAuth 2.0 (3LO)", you should now see the Authorization URL generator
11. Click on "Configure" to set up your authorization settings:
    - Make sure the callback URL is set to `http://localhost:3000/api/jira/callback`
    - Verify that the correct scopes are selected

### Finalizing Registration

12. Go to the "Settings" tab to get your OAuth credentials
13. Copy your Client ID and Client Secret
14. Add these values to your `.env` file as:
    ```
    JIRA_CLIENT_ID=your_copied_client_id
    JIRA_CLIENT_SECRET=your_copied_client_secret
    ```

## Next Steps

After setting up the environment variables:

1. Restart your development server
2. Navigate to `/jira-integration` in your app
3. Click "Connect to JIRA" to start the OAuth flow

## Troubleshooting

- If you see an error like "Authorization URL generator: Your app doesn't have any APIs", make sure you've completed steps 4-7 above to add the Jira APIs to your application.
- If the OAuth flow fails, check that your callback URL in the Atlassian Developer Console exactly matches the one in your `.env` file.
- Ensure that all required scopes are added to each API in your app configuration. 