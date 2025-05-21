import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { createCheckoutSession } from "../api/routes/checkout";
import { StripeService, SubscriptionTier } from "../api/stripe";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SubscriptionLogin } from "../components/SubscriptionLogin";
import { getSubscriptionPriceId } from "../api/stripePrices";

// Get Stripe publishable key from service
const stripePublishableKey = StripeService.getPublicKey();
const stripePromise = loadStripe(stripePublishableKey);

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const sessionId = searchParams.get("session_id");
  const { toast } = useToast();
  
  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setAuthenticatedUserId(user.uid);
      } else {
        setIsAuthenticated(false);
        setAuthenticatedUserId(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Handle cases where the user returns after payment
  useEffect(() => {
    if (sessionId && authenticatedUserId) {
      // Show confirmation message if they're returning from successful payment
      toast({
        title: "Redirecting to success page",
        description: "Your subscription is being processed...",
      });
      
      // Redirect to success page
      window.location.href = "/subscribe/success?session_id=" + sessionId + "&user_id=" + authenticatedUserId;
    }
  }, [sessionId, authenticatedUserId, toast]);

  // State for custom donation amount
  const [donationAmount, setDonationAmount] = useState<number>(1);
  
  // Suggested donation amounts (for display only - all use the same price ID)
  const donationSuggestions = [
    { amount: 1, label: "Basic" },
    { amount: 5, label: "Standard" },
    { amount: 10, label: "Supporter" },
    { amount: 20, label: "Champion" },
    { amount: 50, label: "Hero" },
  ];
  
  // State for subscription flow
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle subscription with proper Stripe integration
  const handleSubscription = async (priceId: string, subscriptionTier: SubscriptionTier, planTitle: string) => {
    if (!authenticatedUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with your subscription.",
        variant: "destructive"
      });
      setHasError(true);
      setErrorMessage("Authentication is required. Please log in to continue.");
      return;
    }
    
    // Reset error state
    setHasError(false);
    setErrorMessage("");
    
    // Set loading state for the specific plan
    setProcessingTier(planTitle);
    
    try {
      // Create a subscription checkout session with the custom donation amount
      const result = await createCheckoutSession(
        priceId,
        authenticatedUserId,
        `${window.location.origin}/subscribe/success`,
        `${window.location.origin}/subscribe?canceled=true`,
        donationAmount // Pass the donation amount for custom pricing
      );
      
      if ('error' in result) {
        console.error('Error creating checkout session:', result.error);
        toast({
          title: "Subscription Error",
          description: result.error,
          variant: "destructive"
        });
        setHasError(true);
        setErrorMessage(result.error);
        return;
      }
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        const errorMsg = "Could not initialize payment provider.";
        console.error(errorMsg);
        toast({
          title: "Payment Error",
          description: errorMsg,
          variant: "destructive"
        });
        setHasError(true);
        setErrorMessage(errorMsg);
        return;
      }
      
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: result.sessionId 
      });
      
      if (error) {
        console.error('Error redirecting to checkout:', error);
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to start checkout process",
          variant: "destructive"
        });
        setHasError(true);
        setErrorMessage(error.message || "Failed to start checkout process");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error('Error in subscription flow:', error);
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
      setHasError(true);
      setErrorMessage(errorMsg);
    } finally {
      setProcessingTier(null);
    }
  };

  // Check if user is upgrading from free tier (via query param)
  const isUpgrade = searchParams.get("upgrade") === "true";

  // Handle successful login
  const handleLoginSuccess = (userId: string) => {
    setIsAuthenticated(true);
    setAuthenticatedUserId(userId);
    toast({
      title: "Login Successful",
      description: "You can now subscribe to the Assist App."
    });
  };

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      {!isAuthenticated ? (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Subscribe to The Assist App</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Log in with your Assist App account to continue to subscription
          </p>
          <SubscriptionLogin onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {isUpgrade ? "Upgrade Your Membership" : "Support The Assist App"}
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              {isUpgrade 
                ? "Upgrade to access our Impact Dashboard and exclusive features designed to enhance your experience." 
                : "Join our community of supporters and help us continue providing valuable services to those in need."}
            </p>
          </div>
        
          {/* Premium features highlight section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Impact Dashboard</h3>
              <p className="text-gray-500 text-center text-sm">Track your contribution's impact with detailed metrics and visualizations.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Donor Community</h3>
              <p className="text-gray-500 text-center text-sm">Join a community of donors passionate about making positive change.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Secure & Easy</h3>
              <p className="text-gray-500 text-center text-sm">Simple, secure payment processing with immediate account access.</p>
            </div>
          </div>

          <div className="mt-8 max-w-md mx-auto">
            {/* Slider-based donation card */}
            <Card className="flex flex-col ring-2 ring-black">
              <CardHeader>
                <CardTitle>Assist App Subscription</CardTitle>
                <CardDescription>
                  Choose your monthly contribution
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Amount display with manual input */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold mr-2">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={donationAmount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          setDonationAmount(value);
                        }
                      }}
                      className="text-5xl font-bold w-24 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                    />
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                {/* Preset amounts */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {donationSuggestions.map((suggestion) => (
                    <Button 
                      key={suggestion.amount}
                      variant={donationAmount === suggestion.amount ? "default" : "outline"}
                      className="px-4 py-2 h-auto"
                      onClick={() => setDonationAmount(suggestion.amount)}
                    >
                      ${suggestion.amount}
                    </Button>
                  ))}
                </div>
                
                {/* Custom amount slider */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Adjust your amount
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={donationAmount > 100 ? 100 : donationAmount}
                    onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="mt-2 text-xs text-gray-500 italic">
                    Tip: You can also type any amount directly in the box above
                  </div>
                </div>
                
                {/* Features list */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium mb-2">All subscribers receive:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 shrink-0" />
                      <span>Full access to all app features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 shrink-0" />
                      <span>Impact Dashboard access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 shrink-0" />
                      <span>Community participation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 shrink-0" />
                      <span>Support our mission</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-black hover:bg-black/90 text-white" 
                  onClick={() => handleSubscription(getSubscriptionPriceId(), SubscriptionTier.MONTHLY, `Assist App Subscription ($${donationAmount}/mo)`)}
                  disabled={!!processingTier}
                  variant="default"
                >
                  {processingTier ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe Now ($${donationAmount}/month)`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 mb-4">
              Once you subscribe, your account will be automatically upgraded and you'll gain immediate access
              to all supported features in the app. Just sign in with the same account you used to subscribe.
            </p>
            <p className="text-gray-500 text-sm">
              Have questions? Contact us at support@theassistapp.org
            </p>
          </div>
        </>
      )}
    </div>
  );
}
