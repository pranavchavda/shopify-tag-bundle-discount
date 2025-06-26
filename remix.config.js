/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
  serverDependenciesToBundle: [
    "@shopify/shopify-app-remix",
    "@shopify/shopify-app-remix/server",
    "@shopify/shopify-app-session-storage-prisma",
    "@shopify/polaris",
    "@shopify/app-bridge-react",
  ],
};