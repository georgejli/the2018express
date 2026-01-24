import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Camera, Keyboard, CheckCircle, XCircle, AlertTriangle, RotateCcw, Undo2 } from "lucide-react";

interface CheckInResult {
  success: boolean;
  error?: string;
  action?: string;
  message: string;
  order?: {
    id?: string;
    customer_name: string;
    customer_email?: string;
    ticket_type: string;
    quantity: number;
    event_name?: string;
    event_date?: string;
    status?: string;
    checked_in_at?: string;
  };
}

const CheckInPage = () => {
  const [scannerActive, setScannerActive] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [lastQrCode, setLastQrCode] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set page title
  useEffect(() => {
    document.title = "Check-In Scanner - 34th St Card Show";
    return () => {
      document.title = "34th St Card Show";
    };
  }, []);

  // Auth is now handled by AdminAuthGuard in App.tsx

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const processCheckIn = useCallback(async (qrCode: string, action: "check-in" | "uncheck-in" = "check-in") => {
    if (processing) return;
    
    setProcessing(true);
    setScannerActive(false);
    setLastQrCode(qrCode);

    try {
      const { data, error } = await supabase.functions.invoke("check-in-ticket", {
        body: { qrCode, action },
      });

      if (error) throw error;

      setLastResult(data as CheckInResult);

      if (data.success) {
        const actionText = action === "uncheck-in" ? "unchecked" : "checked in";
        toast({
          title: action === "uncheck-in" ? "↩️ Ticket unchecked!" : "✅ Check-in successful!",
          description: `${data.order.customer_name} - ${data.order.ticket_type} x${data.order.quantity} ${actionText}`,
        });
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        error: "ERROR",
        message: error.message || "Failed to process request",
      });
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }, [processing, toast]);

  const handleScan = useCallback((result: any) => {
    if (result && result[0]?.rawValue) {
      processCheckIn(result[0].rawValue);
    }
  }, [processCheckIn]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCheckIn(manualCode.trim());
      setManualCode("");
    }
  };

  const handleUncheckIn = async () => {
    if (!lastQrCode || !lastResult?.order?.id) return;
    await processCheckIn(lastQrCode, "uncheck-in");
  };

  const resetScanner = () => {
    setLastResult(null);
    setLastQrCode(null);
    setScannerActive(true);
  };

  const getResultIcon = () => {
    if (!lastResult) return null;
    if (lastResult.success) {
      if (lastResult.action === "uncheck-in") {
        return <Undo2 className="h-16 w-16 text-blue-500" />;
      }
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
    if (lastResult.error === "ALREADY_CHECKED_IN") {
      return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
    }
    return <XCircle className="h-16 w-16 text-red-500" />;
  };

  const getResultColor = () => {
    if (!lastResult) return "border-border";
    if (lastResult.success) {
      if (lastResult.action === "uncheck-in") return "border-blue-500 bg-blue-500/10";
      return "border-green-500 bg-green-500/10";
    }
    if (lastResult.error === "ALREADY_CHECKED_IN") return "border-yellow-500 bg-yellow-500/10";
    return "border-red-500 bg-red-500/10";
  };

  // Determine if we can show the uncheck button
  const canUncheck = lastResult?.success && lastResult?.action !== "uncheck-in" && lastResult?.order?.id;
  const canRecheckAfterUncheck = lastResult?.success && lastResult?.action === "uncheck-in" && lastQrCode;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-display text-2xl text-foreground">
            <span className="text-gradient-gold">Check-In</span> Scanner
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-lg p-4">
        {/* Scanner / Result Display */}
        <Card className={`mb-4 border-2 ${getResultColor()}`}>
          <CardContent className="p-4">
            {lastResult ? (
              <div className="flex flex-col items-center py-8 text-center">
                {getResultIcon()}
                <h2 className="mt-4 text-xl font-bold text-foreground">
                  {lastResult.success 
                    ? (lastResult.action === "uncheck-in" ? "Ticket Unchecked!" : "Check-In Successful!")
                    : lastResult.message}
                </h2>
                
                {lastResult.order && (
                  <div className="mt-4 w-full space-y-2 rounded-lg bg-secondary/50 p-4 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground">{lastResult.order.customer_name}</span>
                    </div>
                    {lastResult.order.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-sm text-foreground">{lastResult.order.customer_email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket:</span>
                      <span className="font-medium text-foreground">
                        {lastResult.order.ticket_type} × {lastResult.order.quantity}
                      </span>
                    </div>
                    {lastResult.order.event_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Event:</span>
                        <span className="text-sm text-foreground">{lastResult.order.event_name}</span>
                      </div>
                    )}
                    {lastResult.error === "ALREADY_CHECKED_IN" && lastResult.order.checked_in_at && (
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="text-sm text-yellow-500">
                          Already checked in at: {new Date(lastResult.order.checked_in_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-6 flex w-full flex-col gap-2">
                  {/* Show Undo button after successful check-in */}
                  {canUncheck && (
                    <Button 
                      onClick={handleUncheckIn} 
                      variant="outline" 
                      className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                      disabled={processing}
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      {processing ? "Processing..." : "Undo Check-In (Mis-scan)"}
                    </Button>
                  )}

                  {/* Show Re-check button after uncheck */}
                  {canRecheckAfterUncheck && (
                    <Button 
                      onClick={() => processCheckIn(lastQrCode!, "check-in")} 
                      variant="outline" 
                      className="w-full border-green-500 text-green-500 hover:bg-green-500/10"
                      disabled={processing}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {processing ? "Processing..." : "Re-check In This Ticket"}
                    </Button>
                  )}

                  {/* Show Uncheck button for already checked in tickets */}
                  {lastResult.error === "ALREADY_CHECKED_IN" && lastQrCode && (
                    <Button 
                      onClick={handleUncheckIn} 
                      variant="outline" 
                      className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                      disabled={processing}
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      {processing ? "Processing..." : "Uncheck This Ticket"}
                    </Button>
                  )}

                  <Button onClick={resetScanner} className="w-full" size="lg">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Scan Next Ticket
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {scannerActive && !showManualInput ? (
                  <div className="overflow-hidden rounded-lg">
                    <Scanner
                      onScan={handleScan}
                      allowMultiple={false}
                      scanDelay={500}
                      styles={{
                        container: { width: "100%" },
                        video: { width: "100%" },
                      }}
                    />
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Point camera at ticket QR code
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {processing ? "Processing..." : "Scanner ready"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toggle between scanner and manual input */}
        {!lastResult && (
          <div className="mb-4 flex gap-2">
            <Button
              variant={!showManualInput ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                setShowManualInput(false);
                setScannerActive(true);
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
            <Button
              variant={showManualInput ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                setShowManualInput(true);
                setScannerActive(false);
              }}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Manual
            </Button>
          </div>
        )}

        {/* Manual Input */}
        {showManualInput && !lastResult && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Manual Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <Input
                  placeholder="Enter QR code or ticket ID..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="bg-secondary"
                  autoFocus
                />
                <Button type="submit" className="w-full" disabled={processing || !manualCode.trim()}>
                  {processing ? "Checking..." : "Check In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-4 border-border bg-card">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-foreground">Quick Guide</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Green = Successful check-in</li>
              <li>• Blue = Ticket unchecked (undo)</li>
              <li>• Yellow = Already checked in (can uncheck)</li>
              <li>• Red = Invalid or unpaid ticket</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CheckInPage;
