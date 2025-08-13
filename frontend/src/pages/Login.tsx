
// // import { useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Code, User, Shield } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "sonner";

// // const Login = () => {
// //   const navigate = useNavigate();
// //   const [studentForm, setStudentForm] = useState({ id: "", password: "" });
// //   const [adminForm, setAdminForm] = useState({ email: "", password: "" });

// //   const handleStudentLogin = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (studentForm.id && studentForm.password) {
// //       toast.success("Student login successful!");
// //       navigate("/student/dashboard");
// //     } else {
// //       toast.error("Please fill in all fields");
// //     }
// //   };

// //   const handleAdminLogin = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (adminForm.email && adminForm.password) {
// //       toast.success("Admin login successful!");
// //       navigate("/admin/dashboard");
// //     } else {
// //       toast.error("Please fill in all fields");
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
// //       <div className="w-full max-w-md">
// //         <div className="text-center mb-8">
// //           <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
// //             <Code className="w-8 h-8 text-white" />
// //           </div>
// //           <h1 className="text-3xl font-bold text-gray-900">Aakam Assessment Platform</h1>
// //           <p className="text-gray-600 mt-2">Sign in to your account</p>
// //         </div>

// //         <Card className="shadow-xl border-0">
// //           <CardHeader>
// //             <CardTitle className="text-center">Login</CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <Tabs defaultValue="student" className="w-full">
// //               <TabsList className="grid w-full grid-cols-2 mb-6">
// //                 <TabsTrigger value="student" className="flex items-center gap-2">
// //                   <User className="w-4 h-4" />
// //                   Student
// //                 </TabsTrigger>
// //                 <TabsTrigger value="admin" className="flex items-center gap-2">
// //                   <Shield className="w-4 h-4" />
// //                   Admin
// //                 </TabsTrigger>
// //               </TabsList>
              
// //               <TabsContent value="student">
// //                 <form onSubmit={handleStudentLogin} className="space-y-4">
// //                   <div>
// //                     <Label htmlFor="studentId">Student ID</Label>
// //                     <Input
// //                       id="studentId"
// //                       type="text"
// //                       placeholder="Enter your student ID"
// //                       value={studentForm.id}
// //                       onChange={(e) => setStudentForm({...studentForm, id: e.target.value})}
// //                       className="mt-1"
// //                     />
// //                   </div>
// //                   <div>
// //                     <Label htmlFor="studentPassword">Password</Label>
// //                     <Input
// //                       id="studentPassword"
// //                       type="password"
// //                       placeholder="Enter your password"
// //                       value={studentForm.password}
// //                       onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
// //                       className="mt-1"
// //                     />
// //                   </div>
// //                   <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
// //                     Sign In as Student
// //                   </Button>
// //                 </form>
// //               </TabsContent>
              
// //               <TabsContent value="admin">
// //                 <form onSubmit={handleAdminLogin} className="space-y-4">
// //                   <div>
// //                     <Label htmlFor="adminEmail">Email</Label>
// //                     <Input
// //                       id="adminEmail"
// //                       type="email"
// //                       placeholder="Enter your email"
// //                       value={adminForm.email}
// //                       onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
// //                       className="mt-1"
// //                     />
// //                   </div>
// //                   <div>
// //                     <Label htmlFor="adminPassword">Password</Label>
// //                     <Input
// //                       id="adminPassword"
// //                       type="password"
// //                       placeholder="Enter your password"
// //                       value={adminForm.password}
// //                       onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
// //                       className="mt-1"
// //                     />
// //                   </div>
// //                   <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
// //                     Sign In as Admin
// //                   </Button>
// //                 </form>
// //               </TabsContent>
// //             </Tabs>
            
// //             <div className="text-center mt-6">
// //               <a href="#" className="text-sm text-blue-600 hover:underline">
// //                 Forgot your password?
// //               </a>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;



// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Code, User, Shield } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { GoogleLogin } from '@react-oauth/google';

// const Login = () => {
//   const navigate = useNavigate();
//   const [studentForm, setStudentForm] = useState({ id: "", password: "" });
//   const [adminForm, setAdminForm] = useState({ email: "", password: "" });

//   const handleStudentLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (studentForm.id && studentForm.password) {
//       toast.success("Student login successful!");
//       navigate("/student/dashboard");
//     } else {
//       toast.error("Please fill in all fields");
//     }
//   };

//   const handleAdminLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (adminForm.email && adminForm.password) {
//       toast.success("Admin login successful!");
//       navigate("/admin/dashboard");
//     } else {
//       toast.error("Please fill in all fields");
//     }
//   };

//   const handleGoogleLogin = async (credentialResponse: any) => {
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/google', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ token: credentialResponse.credential }),
//       });
      
//       const data = await response.json();
//       if (data.success) {
//         localStorage.setItem('token', data.token);
//         toast.success("Google login successful!");
//         // Redirect based on user role or to a default page
//         navigate("/dashboard");
//       } else {
//         toast.error(data.message || "Google login failed");
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       toast.error("An error occurred during login");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
//             <Code className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">Aakam Assessment Platform</h1>
//           <p className="text-gray-600 mt-2">Sign in to your account</p>
//         </div>

//         <Card className="shadow-xl border-0">
//           <CardHeader>
//             <CardTitle className="text-center">Login</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="student" className="w-full">
//               <TabsList className="grid w-full grid-cols-2 mb-6">
//                 <TabsTrigger value="student" className="flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Student
//                 </TabsTrigger>
//                 <TabsTrigger value="admin" className="flex items-center gap-2">
//                   <Shield className="w-4 h-4" />
//                   Admin
//                 </TabsTrigger>
//               </TabsList>
              
//               <TabsContent value="student">
//                 <form onSubmit={handleStudentLogin} className="space-y-4">
//                   <div>
//                     <Label htmlFor="studentId">Student ID</Label>
//                     <Input
//                       id="studentId"
//                       type="text"
//                       placeholder="Enter your student ID"
//                       value={studentForm.id}
//                       onChange={(e) => setStudentForm({...studentForm, id: e.target.value})}
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="studentPassword">Password</Label>
//                     <Input
//                       id="studentPassword"
//                       type="password"
//                       placeholder="Enter your password"
//                       value={studentForm.password}
//                       onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
//                       className="mt-1"
//                     />
//                   </div>
//                   <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
//                     Sign In as Student
//                   </Button>
//                 </form>
//               </TabsContent>
              
//               <TabsContent value="admin">
//                 <form onSubmit={handleAdminLogin} className="space-y-4">
//                   <div>
//                     <Label htmlFor="adminEmail">Email</Label>
//                     <Input
//                       id="adminEmail"
//                       type="email"
//                       placeholder="Enter your email"
//                       value={adminForm.email}
//                       onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="adminPassword">Password</Label>
//                     <Input
//                       id="adminPassword"
//                       type="password"
//                       placeholder="Enter your password"
//                       value={adminForm.password}
//                       onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
//                       className="mt-1"
//                     />
//                   </div>
//                   <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
//                     Sign In as Admin
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>

//             <div className="relative my-6">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
//               </div>
//             </div>

//             <div className="flex justify-center">
//               <GoogleLogin
//                 onSuccess={handleGoogleLogin}
//                 onError={() => toast.error("Google login failed")}
//                 shape="pill"
//                 theme="filled_blue"
//                 size="large"
//                 text="signin_with"
//                 width="300"
//               />
//             </div>
            
//             <div className="text-center mt-6">
//               <a href="#" className="text-sm text-blue-600 hover:underline">
//                 Forgot your password?
//               </a>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const [studentForm, setStudentForm] = useState({ id: "", password: "" });
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentForm.id && studentForm.password) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: studentForm.id, 
            password: studentForm.password 
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success("Student login successful!");
          navigate("/student/dashboard");
        } else {
          toast.error(data.error || "Login failed");
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error("An error occurred during login");
      }
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminForm.email && adminForm.password) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: adminForm.email, 
            password: adminForm.password 
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success("Admin login successful!");
          navigate("/admin/create-test");
        } else {
          toast.error(data.error || "Invalid credentials");
        }
      } catch (error) {
        console.error('Admin login error:', error);
        toast.error("An error occurred during login");
      }
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success("Google login successful!");
        navigate("/student/assessment");
      } else {
        toast.error(data.error || "Google login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-25 h-25 rounded-xl flex items-center justify-center mx-auto mb-4">
            <img
                src="/sample/Infinity-Ora_Round_Logo.jpeg"
                alt="Infinity Logo"
                className="w-20 h-20 object-contain rounded-full"
              />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Infinity Assessment Platform</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Email</Label>
                    <Input
                      id="studentId"
                      type="email"
                      placeholder="Enter your email"
                      value={studentForm.id}
                      onChange={(e) => setStudentForm({...studentForm, id: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentPassword">SIM Number</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your SIM number"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Sign In as Student
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Sign In as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed")}
                shape="pill"
                theme="filled_blue"
                size="large"
                text="signin_with"
                width="300"
              />
            </div>
            
            <div className="text-center mt-6">
              <a href="#" className="text-sm text-purple-600 hover:underline">
                Forgot your password?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;