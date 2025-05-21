"use strict";
/**
 * Enterprise-grade Stripe subscription system
 *
 * This is a comprehensive implementation that follows enterprise security standards:
 * - Proper webhook signature verification
 * - Secure callable functions with authentication
 * - Transaction-based database operations
 * - Comprehensive error handling and logging
 * - Audit trail for all subscription changes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionStatus = exports.stripeWebhook = void 0;
// Initialize Firebase Admin SDK
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
// Export webhook handler for Stripe events
var stripe_1 = require("./webhooks/stripe");
Object.defineProperty(exports, "stripeWebhook", { enumerable: true, get: function () { return stripe_1.stripeWebhook; } });
// Export callable function for client-side operations
var subscription_1 = require("./callables/subscription");
Object.defineProperty(exports, "updateSubscriptionStatus", { enumerable: true, get: function () { return subscription_1.updateSubscriptionStatus; } });
//# sourceMappingURL=index.js.map