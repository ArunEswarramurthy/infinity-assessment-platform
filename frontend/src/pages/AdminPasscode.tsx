// import { useState, useEffect } from "react";
// import AdminLayout from "@/components/AdminLayout";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Shield,
//   Copy,
//   Clock,
//   AlertTriangle,
//   Users,
//   RefreshCw,
//   Activity,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// type TimeLeft = {
//   hours: number;
//   minutes: number;
//   seconds: number;
// };

// const AdminPasscode = () => {
//   const { toast } = useToast();
//   const [passcode, setPasscode] = useState<string>("");
//   const [lastUpdated, setLastUpdated] = useState<string | null>(null);
//   const [studentsUsed, setStudentsUsed] = useState<number>(0);
//   const [timeLeft, setTimeLeft] = useState<TimeLeft>({
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });
//   const [supervisorPasscode, setSupervisorPasscode] = useState<string>("");
//   const [supervisorLastUpdated, setSupervisorLastUpdated] = useState<string | null>(null);
//   const [supervisorUsed, setSupervisorUsed] = useState<number>(0);
//   const [istTime, setIstTime] = useState<string>("");

//   // Fetch current passcode on mount
//   useEffect(() => {
//     fetchCurrentPasscode();
//   }, []);

//   // Countdown timer based on lastUpdated
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (lastUpdated) {
//         const now = new Date();
//         const updatedTime = new Date(lastUpdated);
//         const diffSeconds = 86400 - Math.floor((now.getTime() - updatedTime.getTime()) / 1000);

//         if (diffSeconds <= 0) {
//           generateNewPasscode(); // auto-refresh
//         } else {
//           const hours = Math.floor(diffSeconds / 3600);
//           const minutes = Math.floor((diffSeconds % 3600) / 60);
//           const seconds = diffSeconds % 60;
//           setTimeLeft({ hours, minutes, seconds });
//         }
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [lastUpdated]);

//   // GET request to backend
//   const fetchCurrentPasscode = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/passcode/current");
//       const data = await res.json();
//       setPasscode(data.code);
//       setLastUpdated(data.lastUpdated);
//       setStudentsUsed(data.studentsUsed);
//     } catch (err) {
//       toast({
//         title: "Fetch Failed",
//         description: "Couldn't load current passcode.",
//         variant: "destructive",
//       });
//     }
//   };

//   // POST new passcode to backend
//   const generateNewPasscode = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/passcode/generate", {
//         method: "POST",
//       });
//       const data = await res.json();
//       setPasscode(data.passcode.code);
//       setLastUpdated(data.passcode.lastUpdated);
//       setStudentsUsed(data.passcode.studentsUsed || 0);

//       toast({
//         title: "Passcode Generated 🔄",
//         description: `New passcode: ${data.passcode.code}`,
//       });
//     } catch (err) {
//       toast({
//         title: "Generation Failed",
//         description: "Couldn't generate new passcode.",
//         variant: "destructive",
//       });
//     }
//   };

//   const copyPasscode = async () => {
//     try {
//       await navigator.clipboard.writeText(passcode);
//       toast({
//         title: "Copied",
//         description: "Passcode copied to clipboard.",
//       });
//     } catch {
//       toast({
//         title: "Failed to Copy",
//         description: "Could not copy to clipboard.",
//         variant: "destructive",
//       });
//     }
//   };

//   // Fetch supervisor passcode
//   const fetchSupervisorPasscode = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/passcode/supervisor");
//       const data = await res.json();
//       setSupervisorPasscode(data.code);
//       setSupervisorLastUpdated(data.lastUpdated);
//       setSupervisorUsed(data.studentsUsed);
//     } catch (err) {
//       toast({
//         title: "Fetch Failed",
//         description: "Couldn't load supervisor passcode.",
//         variant: "destructive",
//       });
//     }
//   };

//   // POST new supervisor passcode
//   const generateNewSupervisorPasscode = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/passcode/supervisor/generate", {
//         method: "POST",
//       });
//       const data = await res.json();
//       setSupervisorPasscode(data.passcode.code);
//       setSupervisorLastUpdated(data.passcode.lastUpdated);
//       setSupervisorUsed(data.passcode.studentsUsed || 0);
//       toast({
//         title: "Supervisor Passcode Generated 🔄",
//         description: `New supervisor passcode: ${data.passcode.code}`,
//       });
//     } catch (err) {
//       toast({
//         title: "Generation Failed",
//         description: "Couldn't generate new supervisor passcode.",
//         variant: "destructive",
//       });
//     }
//   };

//   const copySupervisorPasscode = async () => {
//     try {
//       await navigator.clipboard.writeText(supervisorPasscode);
//       toast({
//         title: "Copied",
//         description: "Supervisor passcode copied to clipboard.",
//       });
//     } catch {
//       toast({
//         title: "Failed to Copy",
//         description: "Could not copy to clipboard.",
//         variant: "destructive",
//       });
//     }
//   };

//   const formatTime = (num: number) => num.toString().padStart(2, "0");

//   useEffect(() => {
//     const updateIST = () => {
//       const now = new Date();
//       // Convert to IST (UTC+5:30)
//       const utc = now.getTime() + now.getTimezoneOffset() * 60000;
//       const istOffset = 5.5 * 60 * 60000;
//       const istDate = new Date(utc + istOffset);
//       const hr = istDate.getHours().toString().padStart(2, "0");
//       const min = istDate.getMinutes().toString().padStart(2, "0");
//       const sec = istDate.getSeconds().toString().padStart(2, "0");
//       setIstTime(`${hr}:${min}:${sec} IST`);
//     };
//     updateIST();
//     const interval = setInterval(updateIST, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <AdminLayout>
//       <div className="max-w-6xl mx-auto space-y-6">
//         <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Shield className="w-8 h-8" />
//               <div>
//                 <h1 className="text-2xl font-bold">Passcode Management</h1>
//                 <p className="text-primary-foreground/80">
//                   Emergency access codes for student and supervisor authentication
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 bg-background/10 rounded-lg px-4 py-2">
//               <Activity className="w-5 h-5" />
//               <span className="font-mono text-lg font-bold">{istTime}</span>
//             </div>
//           </div>
//         </div>

//         {/* New layout: 2 columns on large screens, stacked on mobile */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Left column: Current Passcode + Supervisor Passcode */}
//           <div className="flex flex-col gap-6">
//             {/* Current Passcode Card */}
//             <Card className="border-2 border-orange-200">
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   <span className="flex items-center gap-2 text-orange-600">
//                     <Shield className="w-5 h-5" />
//                     Current Passcode
//                   </span>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="gap-2"
//                     onClick={generateNewPasscode}
//                   >
//                     <RefreshCw className="w-4 h-4" />
//                     Refresh
//                   </Button>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="text-center">
//                   <div className="bg-gray-900 rounded-lg p-6 mb-4">
//                     <div className="text-4xl font-mono font-bold text-green-400 tracking-widest">
//                       {passcode || "------"}
//                     </div>
//                   </div>
//                   <Button onClick={copyPasscode} className="w-full gap-2" size="lg">
//                     <Copy className="w-5 h-5" />
//                     Copy Passcode
//                   </Button>
//                 </div>

//                 <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
//                   <Clock className="w-4 h-4" />
//                   <span>
//                     Last Updated:{" "}
//                     {lastUpdated
//                       ? new Date(lastUpdated).toLocaleString()
//                       : "Loading..."}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>
//             {/* Supervisor Passcode Card */}
//             <Card className="border-2 border-blue-200">
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   <span className="flex items-center gap-2 text-blue-600">
//                     <Shield className="w-5 h-5" />
//                     Supervisor Passcode
//                   </span>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="gap-2"
//                     onClick={generateNewSupervisorPasscode}
//                   >
//                     <RefreshCw className="w-4 h-4" />
//                     Refresh
//                   </Button>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="text-center">
//                   <div className="bg-gray-900 rounded-lg p-6 mb-4">
//                     <div className="text-4xl font-mono font-bold text-blue-400 tracking-widest">
//                       {supervisorPasscode || "------"}
//                     </div>
//                   </div>
//                   <Button onClick={copySupervisorPasscode} className="w-full gap-2" size="lg">
//                     <Copy className="w-5 h-5" />
//                     Copy Passcode
//                   </Button>
//                 </div>
//                 <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
//                   <Clock className="w-4 h-4" />
//                   <span>
//                     Last Updated: {supervisorLastUpdated ? new Date(supervisorLastUpdated).toLocaleString() : "Loading..."}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//           {/* Right column: Next Refresh + Usage Statistics */}
//           <div className="flex flex-col gap-6">
//             {/* Next Refresh Card */}
//             <Card>
//               <CardHeader className="relative">
//                 <CardTitle className="flex items-center gap-2 text-blue-600">
//                   <Clock className="w-5 h-5" />
//                   Next Refresh
//                 </CardTitle>
//                 <span className="absolute top-2 right-4 flex items-center gap-1">
//                   <Activity className="w-5 h-5 text-green-500 animate-pulse" />
//                   <span className="text-xl font-mono text-red-500">{istTime}</span>
//                 </span>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600 mb-2">
//                     {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
//                   </div>
//                   <p className="text-sm text-gray-600">
//                     Refreshes in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//             {/* Usage Statistics Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-green-600">
//                   <Users className="w-5 h-5" />
//                   Usage Statistics
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-green-600 mb-2">
//                     {studentsUsed}
//                   </div>
//                   <p className="text-sm text-gray-600">
//                     Students used this passcode in the last 24 hours
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Alerts */}
//         <Alert className="border-blue-200 bg-blue-50">
//           <Shield className="h-4 w-4 text-blue-600" />
//           <AlertDescription className="text-blue-800">
//             <div className="space-y-2">
//               <p className="font-medium">🛟 Emergency Access Info</p>
//               <p>
//                 Students can use this passcode to bypass OTP during test login
//                 in urgent cases.
//               </p>
//             </div>
//           </AlertDescription>
//         </Alert>

//         <Alert className="border-orange-200 bg-orange-50">
//           <AlertTriangle className="h-4 w-4 text-orange-600" />
//           <AlertDescription className="text-orange-800">
//             <div className="space-y-2">
//               <p className="font-medium">⚠️ Important Notice</p>
//               <p>
//                 This passcode is refreshed every 24 hours. Only share during
//                 emergencies.
//               </p>
//             </div>
//           </AlertDescription>
//         </Alert>
//       </div>
//     </AdminLayout>
//   );
// };

// export default AdminPasscode;


import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Copy,
  Clock,
  AlertTriangle,
  Users,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
};

type PasscodeData = {
  code: string;
  lastUpdated: string;
  studentsUsed: number;
};

const AdminPasscode = () => {
  const { toast } = useToast();
  const [studentPasscode, setStudentPasscode] = useState<PasscodeData>({
    code: "",
    lastUpdated: "",
    studentsUsed: 0,
  });
  const [supervisorPasscode, setSupervisorPasscode] = useState<PasscodeData>({
    code: "",
    lastUpdated: "",
    studentsUsed: 0,
  });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [istTime, setIstTime] = useState<string>("");

  // Fetch both passcodes on mount
  useEffect(() => {
    fetchPasscodes();
  }, []);

  // Countdown timer based on student passcode's lastUpdated
  useEffect(() => {
    const interval = setInterval(() => {
      if (studentPasscode.lastUpdated) {
        const now = getCurrentIST();
        const updatedTime = new Date(studentPasscode.lastUpdated);
        const diffSeconds = 86400 - Math.floor((now.getTime() - updatedTime.getTime()) / 1000);

        if (diffSeconds <= 0) {
          fetchPasscodes(); // Auto-refresh when expired
        } else {
          const hours = Math.floor(diffSeconds / 3600);
          const minutes = Math.floor((diffSeconds % 3600) / 60);
          const seconds = diffSeconds % 60;
          setTimeLeft({ hours, minutes, seconds });
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [studentPasscode.lastUpdated]);

  // Helper function to get current IST time
  const getCurrentIST = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    return new Date(utc + istOffset);
  };

  // Fetch both passcodes
  const fetchPasscodes = async () => {
    try {
      const [studentRes, supervisorRes] = await Promise.all([
        fetch("http://localhost:5000/api/passcode/current"),
        fetch("http://localhost:5000/api/passcode/supervisor"),
      ]);

      const studentData = await studentRes.json();
      const supervisorData = await supervisorRes.json();

      setStudentPasscode({
        code: studentData.code,
        lastUpdated: studentData.lastUpdated,
        studentsUsed: studentData.studentsUsed,
      });

      setSupervisorPasscode({
        code: supervisorData.code,
        lastUpdated: supervisorData.lastUpdated,
        studentsUsed: supervisorData.studentsUsed,
      });

    } catch (err) {
      toast({
        title: "Fetch Failed",
        description: "Couldn't load passcodes.",
        variant: "destructive",
      });
    }
  };

  // Generate new student passcode
  const generateStudentPasscode = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/passcode/generate", {
        method: "POST",
      });
      const data = await res.json();
      setStudentPasscode(data.passcode);
      toast({
        title: "Student Passcode Generated",
        description: `New code: ${data.passcode.code}`,
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "Couldn't generate student passcode.",
        variant: "destructive",
      });
    }
  };

  // Generate new supervisor passcode
  const generateSupervisorPasscode = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/passcode/supervisor/generate", {
        method: "POST",
      });
      const data = await res.json();
      setSupervisorPasscode(data.passcode);
      toast({
        title: "Supervisor Passcode Generated",
        description: `New code: ${data.passcode.code}`,
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "Couldn't generate supervisor passcode.",
        variant: "destructive",
      });
    }
  };

  // Copy passcode to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${type} passcode copied to clipboard.`,
      });
    } catch {
      toast({
        title: "Failed to Copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Format time for display
  const formatTime = (num: number) => num.toString().padStart(2, "0");

  // Update IST time display
  useEffect(() => {
    const updateIST = () => {
      const now = getCurrentIST();
      const hr = now.getHours().toString().padStart(2, "0");
      const min = now.getMinutes().toString().padStart(2, "0");
      const sec = now.getSeconds().toString().padStart(2, "0");
      setIstTime(`${hr}:${min}:${sec} IST`);
    };
    updateIST();
    const interval = setInterval(updateIST, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Passcode Management</h1>
                <p className="text-primary-foreground/80">
                  Emergency access codes for student and supervisor authentication
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/10 rounded-lg px-4 py-2">
              <Activity className="w-5 h-5" />
              <span className="font-mono text-lg font-bold">{istTime}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Passcode Card */}
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-orange-600">
                  <Shield className="w-5 h-5" />
                  Student Passcode
                </span>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={generateStudentPasscode}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button> */}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-gray-900 rounded-lg p-6 mb-4">
                  <div className="text-4xl font-mono font-bold text-green-400 tracking-widest">
                    {studentPasscode.code || "------"}
                  </div>
                </div>
                <Button 
                  onClick={() => copyToClipboard(studentPasscode.code, "Student")} 
                  className="w-full gap-2" 
                  size="lg"
                  disabled={!studentPasscode.code}
                >
                  <Copy className="w-5 h-5" />
                  Copy Passcode
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Last Updated:{" "}
                  {studentPasscode.lastUpdated
                    ? new Date(studentPasscode.lastUpdated).toLocaleString()
                    : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Passcode Card */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  Supervisor Passcode
                </span>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={generateSupervisorPasscode}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button> */}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-gray-900 rounded-lg p-6 mb-4">
                  <div className="text-4xl font-mono font-bold text-blue-400 tracking-widest">
                    {supervisorPasscode.code || "------"}
                  </div>
                </div>
                <Button 
                  onClick={() => copyToClipboard(supervisorPasscode.code, "Supervisor")} 
                  className="w-full gap-2" 
                  size="lg"
                  disabled={!supervisorPasscode.code}
                >
                  <Copy className="w-5 h-5" />
                  Copy Passcode
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Last Updated:{" "}
                  {supervisorPasscode.lastUpdated
                    ? new Date(supervisorPasscode.lastUpdated).toLocaleString()
                    : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Refresh Card */}
          <Card>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                Next Refresh
              </CardTitle>
              <span className="absolute top-2 right-4 flex items-center gap-1">
                <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="text-xl font-mono text-red-500">{istTime}</span>
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatTime(timeLeft.hours)}:
                  {formatTime(timeLeft.minutes)}:
                  {formatTime(timeLeft.seconds)}
                </div>
                <p className="text-sm text-gray-600">
                  Refreshes in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Passcodes auto-refresh daily at 05:30 AM IST
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Users className="w-5 h-5" />
                Student Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {studentPasscode.studentsUsed}
                </div>
                <p className="text-sm text-gray-600">
                  Students used this passcode in the last 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">🛟 Emergency Access Info</p>
              <p>
                Students can use their passcode to bypass OTP during test login
                in urgent cases. Supervisors have a separate passcode for admin access.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">⚠️ Important Notice</p>
              <p>
                Passcodes are automatically refreshed every 24 hours at 05:30 AM IST.
                Manual refresh is also available. Keep these codes secure.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default AdminPasscode;
