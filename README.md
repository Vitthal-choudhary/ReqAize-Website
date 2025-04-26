# ReqAize - Jira Integration Project

## Overview
ReqAize is a web application with Jira integration capabilities that allows users to connect to Jira, view projects and issues, and manage requirements in a streamlined interface. This application uses a shared Jira OAuth configuration, allowing multiple users to connect to Jira without individual setup.

## Key Features
- Secure OAuth 2.0 authentication with Jira
- View and search Jira projects
- Access and manage Jira issues
- Cross-system compatibility for team collaboration
- Modern responsive UI

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn or pnpm
- A web browser with cookies enabled

### Installation
1. Clone the repository
   ```
   git clone https://github.com/Vitthal-choudhary/ReqAize-Website
   cd ReqAize-Website
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Jira Integration

This project comes with pre-configured Jira credentials in the `next.config.mjs` file, so you can use the Jira integration immediately without setting up your own Jira application.

### Browser Settings for Jira Access
For the Jira integration to work properly:
1. Ensure cookies are enabled in your browser
2. Do not use incognito/private browsing mode
3. If third-party cookies are blocked, you may need to allow them

### Troubleshooting Jira Connection
If you encounter an "Invalid state parameter" error:
1. Clear your browser cookies
2. Try a different browser
3. Check console logs for detailed error information
4. Ensure your system clock is accurate
5. Verify cookies are being properly set in your browser

## Project Structure
```
/app                # Next.js application routes
  /api              # API routes
    /jira           # Jira API endpoints
/components         # React components
/lib                # Utility functions and shared code
  /jira             # Jira API client and types
/hooks              # Custom React hooks
/public             # Static assets
```

## Technology Stack
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Atlassian Jira API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/) - Jira integration

## Privacy Policy
Our [Privacy Policy](https://github.com/Vitthal-choudhary/privacy-policy) explains how we handle your data when using this application. By using this app, you agree to the terms outlined in the privacy policy.

### Data Usage
- Authentication tokens are stored securely in cookies on your device
- We do not maintain a database of user information
- Your Jira data is accessed through the Atlassian API but not permanently stored on our servers

## Contact
For questions or support, contact:
- Email: vitthal.choudhary.14@gmail.com
- GitHub: [https://github.com/Vitthal-choudhary](https://github.com/Vitthal-choudhary)

## License
This project is available for use under the MIT license.