"use strict";
/**
 * Enterprise-grade subscription management callable functions
 *
 * This module provides secure callable functions for client-initiated subscription operations
 * following enterprise security standards for authentication and authorization
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionStatus = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Callable function to securely update subscription status from client
 * This follows enterprise-grade security practices for subscription management
 */
exports.updateSubscriptionStatus = functions.https.onCall(async (request) => {
    var _a;
    // Extract data from the request (Firebase Functions v6 compatibility)
    const data = request.data;
    // Security check: ensure user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required to update subscription');
    }
    // Security check: ensure user can only update their own subscription
    // or is an admin
    const isAdmin = ((_a = request.auth.token) === null || _a === void 0 ? void 0 : _a.admin) === true;
    if (request.auth.uid !== data.userId && !isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'You can only update your own subscription');
    }
    // Validate input data
    if (!data.subscriptionData || !data.subscriptionData.stripeSubscriptionId) {
        throw new functions.https.HttpsError('invalid-argument', 'Valid subscription data is required');
    }
    try {
        const db = admin.firestore();
        const batch = db.batch();
        // Update user document with subscription status
        const userRef = db.collection('users').doc(data.userId);
        batch.set(userRef, {
            hasActiveSubscription: data.subscriptionData.status === 'active',
            subscriptionStatus: data.subscriptionData.status,
            subscriptionTier: data.subscriptionData.tier,
            subscriptionDomain: 'theassistapp.org',
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        // Update or create subscriber document
        const subscriberRef = db.collection('subscribers').doc(data.userId);
        batch.set(subscriberRef, {
            subscription: {
                status: data.subscriptionData.status,
                tier: data.subscriptionData.tier,
                stripeSubscriptionId: data.subscriptionData.stripeSubscriptionId,
                startDate: data.subscriptionData.startDate ?
                    (data.subscriptionData.startDate instanceof Date ?
                        admin.firestore.Timestamp.fromDate(data.subscriptionData.startDate) :
                        admin.firestore.Timestamp.fromDate(new Date(data.subscriptionData.startDate))) :
                    admin.firestore.FieldValue.serverTimestamp(),
                endDate: data.subscriptionData.endDate ?
                    (data.subscriptionData.endDate instanceof Date ?
                        admin.firestore.Timestamp.fromDate(data.subscriptionData.endDate) :
                        admin.firestore.Timestamp.fromDate(new Date(data.subscriptionData.endDate))) :
                    null,
                canceledAt: data.subscriptionData.canceledAt ?
                    (data.subscriptionData.canceledAt instanceof Date ?
                        admin.firestore.Timestamp.fromDate(data.subscriptionData.canceledAt) :
                        admin.firestore.Timestamp.fromDate(new Date(data.subscriptionData.canceledAt))) :
                    null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            },
            userId: data.userId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        // Add audit log for security compliance
        const auditLogRef = db.collection('subscriptionAuditLogs').doc();
        batch.set(auditLogRef, {
            userId: data.userId,
            action: 'subscription_updated',
            subscriptionId: data.subscriptionData.stripeSubscriptionId,
            status: data.subscriptionData.status,
            tier: data.subscriptionData.tier,
            updatedBy: request.auth.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'client_function'
        });
        // Commit all operations atomically
        await batch.commit();
        // Return success response
        return {
            success: true,
            message: 'Subscription status updated successfully'
        };
    }
    catch (error) {
        // Structured error logging for enterprise-grade observability
        functions.logger.error('Error updating subscription status:', {
            userId: data.userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        throw new functions.https.HttpsError('internal', `Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});
//# sourceMappingURL=subscription.js.map