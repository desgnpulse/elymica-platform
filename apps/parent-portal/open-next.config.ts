import { defineCloudflareConfig } from '@opennextjs/cloudflare/config';

export default defineCloudflareConfig({
  // Default settings run the entire app in the Node.js compatibility layer
  // so server-side features like NextAuth keep working.
});
