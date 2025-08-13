import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, AlertCircle, Upload, Clock, Crown, Shield, Users, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const sampleCsv = `name,email,sin_number,department\nJohn Doe,john@example.com,SIM001,CSE\nJane Smith,jane@example.com,SIM002,ECE`;

const plans = [
  { 
    id: 1,
    title: "1 Year Plan", 
    description: "Perfect for short-term projects and trials.", 
    price: "₹2999",
    features: ["Up to 100 students", "Basic analytics", "Email support"],
    duration: 1,
    popular: false
  },
  { 
    id: 2,
    title: "2 Year Plan", 
    description: "Great value for growing institutions.", 
    price: "₹4999",
    features: ["Up to 500 students", "Advanced analytics", "Priority support"],
    duration: 2,
    popular: true
  },
  { 
    id: 3,
    title: "3 Year Plan", 
    description: "Most popular among educational institutions.", 
    price: "₹6999",
    features: ["Up to 1000 students", "Custom reports", "Dedicated support"],
    duration: 3,
    popular: false
  },
  { 
    id: 4,
    title: "4 Year Plan", 
    description: "Complete academic cycle coverage.", 
    price: "₹8999",
    features: ["Unlimited students", "Full analytics suite", "24/7 support"],
    duration: 4,
    popular: false
  },
  { 
    id: 5,
    title: "Special Plan", 
    description: "Custom duration and enterprise features.", 
    price: "Contact us",
    features: ["Custom student limits", "White-label solution", "Enterprise support"],
    duration: null,
    popular: false
  },
];

const activeLicenses = [
  { id: 1, plan: "2 Year Plan", startDate: "2024-01-15", endDate: "2026-01-15", students: 245, status: "active" },
  { id: 2, plan: "1 Year Plan", startDate: "2023-06-01", endDate: "2024-06-01", students: 89, status: "expired" },
];

const AdminLicense = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [esimNumber, setEsimNumber] = useState("");
  const [email, setEmail] = useState("");
  const [utcTime, setUtcTime] = useState("");

  // UTC Timer
  useEffect(() => {
    const updateUTCTime = () => {
      const now = new Date();
      const utc = now.toUTCString().split(' ')[4]; // Gets HH:MM:SS
      setUtcTime(utc);
    };
    updateUTCTime();
    const interval = setInterval(updateUTCTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    // Auto-calculate end date for standard plans
    if (plan.duration) {
      const start = new Date();
      const end = new Date(start);
      end.setFullYear(start.getFullYear() + plan.duration);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleClose = () => {
    setSelectedPlan(null);
    setStartDate("");
    setEndDate("");
    setCsvFile(null);
    setName("");
    setEsimNumber("");
    setEmail("");
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "license_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('planTitle', selectedPlan.title);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);

    try {
      const response = await fetch('http://localhost:5000/api/license/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        // Activate the license
        const activateResponse = await fetch('http://localhost:5000/api/license/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ licenseId: data.licenseId }),
        });

        if (activateResponse.ok) {
          toast({
            title: "License Purchased & Activated Successfully! 🎉",
            description: `${selectedPlan?.title} activated from ${startDate} to ${endDate}`,
          });
        } else {
          toast({
            title: "License Uploaded but Activation Failed",
            description: "Please try activating manually",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Failed to upload license",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('License upload error:', error);
      toast({
        title: "Error",
        description: "Failed to process license",
        variant: "destructive"
      });
    }
    
    handleClose();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">License Management</h1>
              <p className="text-purple-100 mt-2">Manage subscription plans and active licenses with comprehensive control</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-lg px-4 py-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-mono text-sm font-medium text-white">{utcTime} UTC</span>
              </div>
            </div>
          </div>
        </div>


        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Available Plans
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Licenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative flex flex-col h-full transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'border-primary shadow-md' : 'border-border'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <div className="text-3xl font-bold text-primary">{plan.price}</div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      Choose Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Licenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeLicenses.map((license) => (
                    <div key={license.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{license.plan}</h3>
                        <p className="text-sm text-muted-foreground">
                          {license.startDate} to {license.endDate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {license.students} students enrolled
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(license.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Purchase Dialog */}
        {selectedPlan && (
          <Dialog open={!!selectedPlan} onOpenChange={() => handleClose()}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Purchase {selectedPlan.title}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      disabled={selectedPlan.duration} // Auto-calculated for standard plans
                    />
                  </div>
                </div>

                {selectedPlan.title === "Special Plan" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Additional Information Required
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="esimNumber">ESIM Number</Label>
                        <Input
                          id="esimNumber"
                          value={esimNumber}
                          onChange={(e) => setEsimNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email ID</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="csvFile">Upload Student List (CSV)</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    required
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleDownloadSample}
                      className="p-0 h-auto"
                    >
                      Download Sample Template
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!startDate || !endDate || !csvFile || 
                      (selectedPlan.title === "Special Plan" && (!name || !esimNumber || !email))}
                  >
                    Purchase License
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLicense;