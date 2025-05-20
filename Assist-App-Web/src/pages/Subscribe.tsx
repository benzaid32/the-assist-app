import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Plus } from "lucide-react";
import { createCheckoutSession, createOneTimePayment } from "../api/routes/checkout";
import { StripeService } from "../api/stripe";
import { useToast } from "@/components/ui/use-toast";

// Get Stripe publishable key from service
const stripePublishableKey = StripeService.getPublicKey();
const stripePromise = loadStripe(stripePublishableKey);

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const sessionId = searchParams.get("session_id");
  const { toast } = useToast();
  
  // Handle cases where the user returns after payment
  useEffect(() => {
    if (sessionId && userId) {
      // Show confirmation message if they're returning from successful payment
      toast({
        title: "Redirecting to success page",
        description: "Your subscription is being processed...",
      });
      
      // Redirect to success page
      window.location.href = "/subscribe/success?session_id=" + sessionId + "&user_id=" + userId;
    }
  }, [sessionId, userId, toast]);

  // Define donation options for simplified MVP approach
  const donationOptions = [
    {
      title: "Basic Donation",
      price: "$1",
      priceInCents: 100,
      features: [
        "Full access to Impact Dashboard",
        "Access to all premium features",
        "Support our mission"
      ],
    },
    {
      title: "Standard Donation",
      price: "$5",
      priceInCents: 500,
      features: [
        "Full access to Impact Dashboard",
        "Access to all premium features",
        "Support our mission"
      ],
      popular: true,
    },
    {
      title: "Premium Donation",
      price: "$20",
      priceInCents: 2000,
      features: [
        "Full access to Impact Dashboard",
        "Access to all premium features",
        "Support our mission"
      ],
    }
  ];
  
  // State for custom donation amount
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showCustomAmount, setShowCustomAmount] = useState<boolean>(false);

  // Handle donation with predefined amount
  const handleDonation = async (amountInCents: number, optionTitle: string) => {
    if (!userId) {
      toast({
        title: "User ID Required",
        description: "Please open this page from the app to associate your donation.",
        variant: "destructive"
      });
      return;
    }
    
    // Set loading state for the specific donation option
    setProcessingTier(optionTitle);
    
    try {
      // Create a one-time payment checkout session
      const result = await createOneTimePayment(
        amountInCents,
        userId,
        `${window.location.origin}/subscribe/success`,
        `${window.location.origin}/subscribe`
      );
      
      if ('error' in result) {
        toast({
          title: "Checkout Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: "Payment Error",
          description: "Could not initialize payment provider.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId: result.sessionId });
      
      if (error) {
        console.error('Error redirecting to checkout:', error);
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to start checkout process",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setProcessingTier(null);
    }
  };
  
  // Handle custom donation amount
  const handleCustomDonation = async () => {
    // Validate custom amount
    const amountValue = parseFloat(customAmount);
    if (isNaN(amountValue) || amountValue < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount (minimum $1).",
        variant: "destructive"
      });
      return;
    }
    
    // Convert to cents
    const amountInCents = Math.round(amountValue * 100);
    
    // Process the custom donation
    await handleDonation(amountInCents, "custom");
  };

  // Check if user is upgrading from free tier (via query param)
  const isUpgrade = searchParams.get("upgrade") === "true";

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {isUpgrade ? "Upgrade Your Membership" : "Support The Assist App"}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {isUpgrade 
            ? "Upgrade to access our Impact Dashboard and exclusive features designed to enhance your experience." 
            : "Join our community of supporters and help us continue providing valuable services to those in need."}
        </p>
        
        {/* Premium features highlight section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Impact Dashboard</h3>
            <p className="text-gray-500 text-center text-sm">Track your contribution's impact with detailed metrics and visualizations.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Premium Content</h3>
            <p className="text-gray-500 text-center text-sm">Gain access to exclusive resources and content unavailable on the free tier.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Priority Support</h3>
            <p className="text-gray-500 text-center text-sm">Get faster responses and dedicated assistance when you need help.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Fixed donation options */}
        {donationOptions.map((option, index) => (
          <Card key={index} className={`flex flex-col ${option.popular ? 'border-2 border-primary shadow-lg relative' : ''}`}>
            {option.popular && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">{option.price}</span>
                <span className="text-gray-500 ml-2">one-time</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {option.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleDonation(option.priceInCents, option.title)}
                disabled={!!processingTier}
                variant={option.popular ? "default" : "outline"}
              >
                {processingTier === option.title ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Donate Now"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Custom amount card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Custom Donation</CardTitle>
            <CardDescription>
              <span className="text-xl font-medium">Any amount</span>
              <span className="text-gray-500 ml-2">one-time</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3 mb-4">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Full access to Impact Dashboard</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Access to all premium features</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Support our mission</span>
              </li>
            </ul>
            
            <div className="mt-2">
              <label className="text-sm font-medium mb-1 block">Enter amount (min. $1)</label>
              <div className="flex items-center">
                <span className="mr-2 text-lg">$</span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleCustomDonation}
              disabled={!!processingTier || !customAmount}
              variant="outline"
            >
              {processingTier === "custom" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Donate Custom Amount"
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
    </div>
  );
}
