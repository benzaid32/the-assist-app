import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { verifySessionCompletion } from "../api/routes/checkout";
import { SubscriptionStatus, StripeService } from "../api/stripe";
import { useToast } from "@/components/ui/use-toast";

export default function SubscribeSuccess() {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sessionId = searchParams.get("session_id");
  const userId = searchParams.get("user_id");
  
  // Verify the subscription was successful
  useEffect(() => {
    async function verifySubscription() {
      if (!sessionId) {
        setError("No session ID found. Please try again or contact support.");
        setProcessing(false);
        return;
      }
      
      if (!userId) {
        setError("No user ID found. Please try again from the app.");
        setProcessing(false);
        return;
      }
      
      try {
        // Verify the checkout session completed successfully
        const result = await verifySessionCompletion(sessionId);
        
        if (!result.success || result.error) {
          setError(result.error || "Payment verification failed. Please contact support.");
          setProcessing(false);
          return;
        }
        
        // Update subscription status in Firestore
        if (result.userId && result.subscriptionId && result.status) {
          // Determine subscription tier based on the checkout session
          // In a real implementation, you'd get the product details to determine tier
          // For now, default to monthly
          await StripeService.updateSubscriptionStatus(result.userId, {
            status: result.status as SubscriptionStatus,
            tier: "monthly",
            stripeSubscriptionId: result.subscriptionId,
            updatedAt: new Date(),
          });
          
          setSuccess(true);
          toast({
            title: "Subscription Activated",
            description: "Your account has been successfully upgraded!",
          });
        } else {
          setError("Missing subscription details. Please contact support.");
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        setError("An unexpected error occurred. Please contact support.");
      } finally {
        setProcessing(false);
      }
    }
    
    verifySubscription();
  }, [sessionId, userId, toast]);

  return (
    <div className="container mx-auto py-16 px-4 md:px-6 flex justify-center items-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        {processing ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Processing Subscription</CardTitle>
              <CardDescription>
                Please wait while we activate your account
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>
                We're processing your subscription. This should only take a moment...
              </p>
            </CardContent>
          </>
        ) : error ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <CardTitle className="text-2xl">Subscription Error</CardTitle>
              <CardDescription>
                We encountered an issue with your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-red-500">
                {error}
              </p>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact our support team at support@theassistapp.org
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button className="w-full" asChild>
                <Link to="/subscribe">Try Again</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
              <CardDescription>
                Thank you for supporting The Assist App
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>
                Your subscription has been successfully activated. Your account now has full access to all supported features.
              </p>
              <p className="text-sm text-muted-foreground">
                Please return to the app to enjoy your membership benefits.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button className="w-full" asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
