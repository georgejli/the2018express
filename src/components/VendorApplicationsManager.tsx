import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, DollarSign, Users, Store, Loader2, ChevronDown, ChevronUp, CloudUpload } from "lucide-react";
import { format } from "date-fns";

interface VendorApplication {
  id: string;
  event_id: string;
  event_date: string;
  name: string;
  email: string;
  phone: string;
  table_tier: string;
  table_tier_label: string;
  table_quantity: number;
  vendor_count: number;
  price_per_table: number;
  total_price: number;
  merchandise_description: string;
  special_requests: string | null;
  has_paid: boolean;
  amount_paid: number;
  payment_notes: string | null;
  status: string;
  created_at: string;
  synced_to_sheets_at: string | null;
}

const VendorApplicationsManager = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingApp, setEditingApp] = useState<VendorApplication | null>(null);
  const [editFormData, setEditFormData] = useState({
    has_paid: false,
    amount_paid: 0,
    payment_notes: "",
    status: "pending",
  });
  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleSyncToSheets = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-vendors-to-sheets");
      
      if (error) throw error;

      toast({
        title: "Sync completed!",
        description: `Synced ${data.applicationsSynced} applications to Google Sheets.`,
      });
      
      // Refresh to show updated sync timestamps
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleEditClick = (app: VendorApplication) => {
    setEditingApp(app);
    setEditFormData({
      has_paid: app.has_paid,
      amount_paid: app.amount_paid,
      payment_notes: app.payment_notes || "",
      status: app.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;

    setSaving(true);
    const { error } = await supabase
      .from("vendor_applications")
      .update({
        has_paid: editFormData.has_paid,
        amount_paid: editFormData.amount_paid,
        payment_notes: editFormData.payment_notes || null,
        status: editFormData.status,
      })
      .eq("id", editingApp.id);

    if (error) {
      toast({
        title: "Error updating application",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application updated",
        description: "Changes saved successfully.",
      });
      setEditingApp(null);
      fetchApplications();
    }
    setSaving(false);
  };

  const toggleRowExpanded = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const uniqueEvents = [...new Set(applications.map((a) => a.event_date))];

  const filteredApplications = applications.filter((app) => {
    const matchesEvent = eventFilter === "all" || app.event_date === eventFilter;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesEvent && matchesStatus;
  });

  // Stats
  const stats = {
    totalApplications: applications.length,
    totalTablesRequested: applications.reduce((sum, a) => sum + a.table_quantity, 0),
    totalRevenue: applications.reduce((sum, a) => sum + a.total_price, 0),
    totalPaid: applications.filter((a) => a.has_paid).reduce((sum, a) => sum + a.amount_paid, 0),
    pendingPayment: applications.filter((a) => !a.has_paid).length,
  };

  const getStatusBadge = (status: string, hasPaid: boolean) => {
    if (hasPaid) {
      return <Badge className="bg-green-600 text-white">Paid</Badge>;
    }
    switch (status) {
      case "approved":
        return <Badge className="bg-blue-600 text-white">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalApplications}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tables Requested</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalTablesRequested}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">${stats.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${stats.totalPaid}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
            <Store className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingPayment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="event-filter" className="text-sm text-muted-foreground">
            Event:
          </Label>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger id="event-filter" className="w-[200px]">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {uniqueEvents.map((event) => (
                <SelectItem key={event} value={event}>
                  {event}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
            Status:
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="w-[150px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchApplications} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleSyncToSheets} disabled={syncing}>
            <CloudUpload className={`mr-2 h-4 w-4 ${syncing ? "animate-pulse" : ""}`} />
            {syncing ? "Syncing..." : "Sync to Sheets"}
          </Button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Tables</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  No vendor applications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <>
                  <TableRow key={app.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => toggleRowExpanded(app.id)}>
                    <TableCell>
                      {expandedRows.has(app.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{app.event_date}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{app.email}</div>
                        <div className="text-muted-foreground">{app.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{app.table_quantity} × {app.table_tier_label.split(" ")[0]}</div>
                        <div className="text-muted-foreground">{app.vendor_count} vendor(s)</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">${app.total_price}</div>
                        {app.has_paid && (
                          <div className="text-green-500">Paid: ${app.amount_paid}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status, app.has_paid)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(app);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(app.id) && (
                    <TableRow key={`${app.id}-details`}>
                      <TableCell colSpan={9} className="bg-secondary/30 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Merchandise Description</Label>
                            <p className="mt-1 text-sm">{app.merchandise_description}</p>
                          </div>
                          {app.special_requests && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Special Requests</Label>
                              <p className="mt-1 text-sm">{app.special_requests}</p>
                            </div>
                          )}
                          {app.payment_notes && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Payment Notes</Label>
                              <p className="mt-1 text-sm">{app.payment_notes}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-xs text-muted-foreground">Table Details</Label>
                            <p className="mt-1 text-sm">
                              {app.table_tier_label} @ ${app.price_per_table}/table
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Vendor Application</DialogTitle>
          </DialogHeader>
          {editingApp && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="font-medium">{editingApp.name}</p>
                <p className="text-sm text-muted-foreground">{editingApp.event_date}</p>
                <p className="text-sm text-muted-foreground">
                  {editingApp.table_quantity} tables @ ${editingApp.price_per_table} = ${editingApp.total_price}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editFormData.status} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_paid"
                  checked={editFormData.has_paid}
                  onCheckedChange={(checked) => 
                    setEditFormData({ 
                      ...editFormData, 
                      has_paid: !!checked,
                      amount_paid: checked ? editingApp.total_price : 0,
                    })
                  }
                />
                <Label htmlFor="has_paid">Has Paid</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_paid">Amount Paid ($)</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  min={0}
                  value={editFormData.amount_paid}
                  onChange={(e) => setEditFormData({ ...editFormData, amount_paid: parseInt(e.target.value) || 0 })}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_notes">Payment Notes</Label>
                <Textarea
                  id="payment_notes"
                  value={editFormData.payment_notes}
                  onChange={(e) => setEditFormData({ ...editFormData, payment_notes: e.target.value })}
                  placeholder="e.g., Paid via Venmo on 1/15"
                  className="bg-secondary"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingApp(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorApplicationsManager;