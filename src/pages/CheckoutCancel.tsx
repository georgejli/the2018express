import { Link, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CheckoutCancel = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 pt-16">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-destructive/20 p-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
          </div>

          <h1 className="mb-4 font-display text-4xl text-foreground">
            Payment Cancelled
          </h1>

          <p className="mb-8 text-muted-foreground">
            Your payment was cancelled and you have not been charged. 
            Your tickets have not been reserved.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutCancel;
