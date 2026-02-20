import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Search, RefreshCw, Mail, Ticket, DollarSign, Users, UserPlus, QrCode, UserCheck, TrendingUp, Menu, X, CalendarPlus, Pencil, Calendar, Trash2, Copy, Home, Store, Star, Settings } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import EventForm from "@/components/EventForm";
import VendorApplicationsManager from "@/components/VendorApplicationsManager";
import EventGuestsManager from "@/components/admin/EventGuestsManager";
import FeaturedCelebritiesManager from "@/components/admin/FeaturedCelebritiesManager";
import HeroBannerManager from "@/components/admin/HeroBannerManager";
import BannerTextManager from "@/components/admin/BannerTextManager";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/data/events";

interface TicketOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_id: string;
  event_name: string;
  event_date: string;
  ticket_type: string;
  quantity: number;
  total_amount: number;
  status: string | null;
  created_at: string | null;
  qr_code: string | null;
  checked_in: boolean | null;
}

interface EventCheckInStats {
  eventId: string;
  eventName: string;
  totalTickets: number;
  checkedIn: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("tickets");
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Set document title for admin dashboard
  useEffect(() => {
    document.title = "Admin Dashboard - 34th St Card Show";
    return () => {
      document.title = "34th St Card Show";
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventFormMode, setEventFormMode] = useState<"add" | "edit">("add");
  const [editingEvent, setEditingEvent] = useState<(Event & { description?: string; dbId?: string }) | null>(null);
  const [deleteEventOpen, setDeleteEventOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<(Event & { description?: string; dbId?: string }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events: dbEvents, refetch: refetchEvents, deleteEvent } = useEvents();

  // Get the most recent event for defaults
  const mostRecentEvent = dbEvents.length > 0 ? dbEvents[dbEvents.length - 1] : null;

  const handleAddEvent = () => {
    setEventFormMode("add");
    setEditingEvent(null);
    setEventFormOpen(true);
  };

  const handleEditEvent = (event: Event & { description?: string; dbId?: string }) => {
    setEventFormMode("edit");
    setEditingEvent(event);
    setEventFormOpen(true);
  };

  const handleDeleteClick = (event: Event & { description?: string; dbId?: string }) => {
    setDeletingEvent(event);
    setDeleteEventOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent?.dbId) {
      toast({
        title: "Cannot delete static event",
        description: "This event is from static data and cannot be deleted. Create events in the admin dashboard to manage them.",
        variant: "destructive",
      });
      setDeleteEventOpen(false);
      setDeletingEvent(null);
      return;
    }
    
    setIsDeleting(true);
    const success = await deleteEvent(deletingEvent.dbId);
    setIsDeleting(false);
    
    if (success) {
      toast({
        title: "Event deleted",
        description: `${deletingEvent.month} ${deletingEvent.date}, ${deletingEvent.year} has been deleted.`,
      });
    } else {
      toast({
        title: "Failed to delete event",
        description: "There was an error deleting the event. Please try again.",
        variant: "destructive",
      });
    }
    
    setDeleteEventOpen(false);
    setDeletingEvent(null);
  };

  const handleDuplicateEvent = (event: Event & { description?: string; dbId?: string }) => {
    // Create a copy without the dbId so it creates a new event
    const duplicatedEvent = { ...event, dbId: undefined };
    setEventFormMode("add");
    setEditingEvent(duplicatedEvent);
    setEventFormOpen(true);
  };

  useEffect(() => {
    // Auth is now handled by AdminAuthGuard in App.tsx
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ticket_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleResendEmail = async (orderId: string) => {
    setResendingId(orderId);
    try {
      const { data, error } = await supabase.functions.invoke("send-ticket-email", {
        body: { orderId },
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Ticket email has been resent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResendingId(null);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { email: newAdminEmail, password: newAdminPassword },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Admin created!",
        description: `Admin account for ${newAdminEmail} has been created.`,
      });

      setNewAdminEmail("");
      setNewAdminPassword("");
      setCreateAdminOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to create admin",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.qr_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesEvent = eventFilter === "all" || order.event_id === eventFilter;

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const uniqueEvents = [...new Set(orders.map((o) => o.event_id))];

  const stats = {
    totalOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.total_amount, 0),
    totalTickets: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.quantity, 0),
    totalCheckedIn: orders
      .filter((o) => o.status === "completed" && o.checked_in)
      .reduce((sum, o) => sum + o.quantity, 0),
  };

  // Calculate check-in stats per event
  const eventCheckInStats: EventCheckInStats[] = uniqueEvents.map((eventId) => {
    const eventOrders = orders.filter((o) => o.event_id === eventId && o.status === "completed");
    const eventName = eventOrders[0]?.event_name || eventId;
    const totalTickets = eventOrders.reduce((sum, o) => sum + o.quantity, 0);
    const checkedIn = eventOrders
      .filter((o) => o.checked_in)
      .reduce((sum, o) => sum + o.quantity, 0);
    
    return {
      eventId,
      eventName,
      totalTickets,
      checkedIn,
    };
  }).filter((e) => e.totalTickets > 0);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-600 text-white">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-gray-600 text-white">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-display text-2xl text-foreground">
            <span className="text-gradient-gold">Admin</span> Dashboard
          </h1>
          
          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/admin/check-in")}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Check-In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddEvent}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
            <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Admin Account</DialogTitle>
                  <DialogDescription>
                    Create a new admin user who can access this dashboard.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-secondary"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={creatingAdmin}>
                    {creatingAdmin ? "Creating..." : "Create Admin"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden border-t border-border/50 transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "mt-4 max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/");
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button
              variant="default"
              onClick={() => {
                navigate("/admin/check-in");
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Check-In Scanner
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleAddEvent();
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreateAdminOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-none md:inline-flex">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="celebrities" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Celebrities</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalTickets}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.totalCheckedIn} / {stats.totalTickets}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-In Stats Per Event */}
        {eventCheckInStats.length > 0 && (
          <Card className="mb-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <TrendingUp className="h-5 w-5 text-accent" />
                Check-In Progress by Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventCheckInStats.map((event) => {
                const percentage = event.totalTickets > 0 
                  ? Math.round((event.checkedIn / event.totalTickets) * 100) 
                  : 0;
                return (
                  <div key={event.eventId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{event.eventName}</span>
                      <span className="text-muted-foreground">
                        {event.checkedIn} / {event.totalTickets} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Events Management */}
        <Card className="mb-6 border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg text-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Manage Events
              </div>
              <Button variant="outline" size="sm" onClick={handleAddEvent}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dbEvents.length === 0 ? (
              <p className="text-center text-muted-foreground">No events found. Add your first event!</p>
            ) : (
              <div className="space-y-3">
                {dbEvents.map((event) => (
                  <Collapsible
                    key={event.dbId || event.id}
                    open={expandedEventId === event.id}
                    onOpenChange={(open) => setExpandedEventId(open ? event.id : null)}
                  >
                    <div className="rounded-lg border border-border bg-secondary/50">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {event.month} {event.date}, {event.year}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.venue} • {event.time}
                          </div>
                          <div className="mt-1 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              GA: ${event.gaPrice}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              VIP: ${event.vipPrice}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-accent"
                              title="Manage celebrities & sponsors"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateEvent(event)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Duplicate event"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {event.dbId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(event)}
                              className="text-muted-foreground hover:text-destructive"
                              title="Delete event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="text-muted-foreground/30 cursor-not-allowed"
                              title="Static event - cannot be deleted"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t border-border p-4">
                          <EventGuestsManager eventId={event.id} />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-secondary md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full bg-secondary md:w-40">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {uniqueEvents.map((eventId) => (
                  <SelectItem key={eventId} value={eventId}>
                    {eventId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-muted-foreground">Event</TableHead>
                    <TableHead className="text-muted-foreground">Ticket</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">{order.event_id}</p>
                            <p className="text-xs text-muted-foreground">{order.event_date}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={order.ticket_type === "VIP" ? "default" : "secondary"}>
                              {order.ticket_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">×{order.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-accent">
                          ${order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.created_at
                            ? format(new Date(order.created_at), "MMM d, yyyy h:mm a")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendEmail(order.id)}
                            disabled={resendingId === order.id || order.status !== "completed"}
                            title={order.status !== "completed" ? "Only completed orders can receive emails" : "Resend ticket email"}
                          >
                            <Mail className={`h-4 w-4 ${resendingId === order.id ? "animate-pulse" : ""}`} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
          </TabsContent>

          <TabsContent value="vendors" className="mt-6">
            <VendorApplicationsManager />
          </TabsContent>

          <TabsContent value="celebrities" className="mt-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Star className="h-5 w-5 text-accent" />
                  Featured Celebrities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeaturedCelebritiesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <BannerTextManager />
            <HeroBannerManager />
          </TabsContent>
        </Tabs>
      </main>

      <EventForm
        isOpen={eventFormOpen}
        onClose={() => {
          setEventFormOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={() => {
          refetchEvents();
          fetchOrders();
        }}
        mode={eventFormMode}
        editEvent={editingEvent}
        defaultEvent={mostRecentEvent ? {
          venue: mostRecentEvent.venue,
          address: mostRecentEvent.address,
          gaPrice: mostRecentEvent.gaPrice,
          vipPrice: mostRecentEvent.vipPrice,
          gaFeatures: mostRecentEvent.gaFeatures,
          vipFeatures: mostRecentEvent.vipFeatures,
        } : undefined}
      />

      {/* Delete Event Confirmation Dialog */}
      <AlertDialog open={deleteEventOpen} onOpenChange={setDeleteEventOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event for{" "}
              <span className="font-semibold text-foreground">
                {deletingEvent?.month} {deletingEvent?.date}, {deletingEvent?.year}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
