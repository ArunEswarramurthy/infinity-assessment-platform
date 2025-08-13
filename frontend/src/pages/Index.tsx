
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Code, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Smart Assessments",
      description: "AI-powered MCQ tests with adaptive difficulty and comprehensive analytics dashboard",
      color: "purple"
    },
    {
      icon: Code,
      title: "Live Coding Environment",
      description: "Multi-language compiler support with real-time execution and automated test case validation",
      color: "indigo"
    },
    {
      icon: Users,
      title: "Advanced Management",
      description: "Streamlined student onboarding, progress tracking, and performance monitoring tools",
      color: "violet"
    },
    {
      icon: Award,
      title: "Intelligent Analytics",
      description: "Deep insights with predictive analytics, performance trends, and detailed reporting",
      color: "blue"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img
                src="/sample/Infinity-Ora_Round_Logo.jpeg"
                alt="Infinity Logo"
                className="w-10 h-10 object-contain rounded-full"
              />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Infinity</h1>
                <p className="text-xs text-gray-500 -mt-1">Assessment Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
                <a href="#stats" className="text-gray-600 hover:text-purple-600 transition-colors">About</a>
                <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>
              </nav>
              <Button onClick={() => navigate("/login")} className="infinity-button">
                Get Started
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            🚀 Next-Generation Assessment Technology
          </div>
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Learning with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Infinity Assessment
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            Empower educators and students with our comprehensive assessment platform featuring 
            real-time coding environments, intelligent analytics, and seamless evaluation workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="infinity-button text-lg px-10 py-4 h-auto"
            >
              Start Your Journey
              <span className="ml-2">→</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/login")}
              className="text-lg px-10 py-4 h-auto border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
            >
              Educator Portal
            </Button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            ✓ No setup required  ✓ Instant feedback  ✓ Advanced analytics
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Modern Education</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to create, manage, and analyze assessments in one integrated platform</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="infinity-card group hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="infinity-card p-12 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Educational Institutions Worldwide</h3>
            <p className="text-gray-600">Join thousands of educators and students already using Infinity</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">10,000+</div>
              <div className="text-gray-600 font-medium">Active Students</div>
              <div className="text-sm text-gray-500 mt-1">Across 50+ institutions</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">25,000+</div>
              <div className="text-gray-600 font-medium">Assessments Completed</div>
              <div className="text-sm text-gray-500 mt-1">This month alone</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
              <div className="text-sm text-gray-500 mt-1">From educators</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-gray-600 font-medium">Platform Availability</div>
              <div className="text-sm text-gray-500 mt-1">99.9% uptime</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Revolutionize Your Teaching?</h3>
          <p className="text-xl mb-8 opacity-90">Join the next generation of educators using AI-powered assessment tools</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 text-lg px-10 py-4 h-auto font-bold rounded-xl shadow-lg transition-all duration-300"
            >
              🚀 Launch Platform
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 hover:scale-105 text-lg px-10 py-4 h-auto font-bold rounded-xl transition-all duration-300"
            >
              📋 View Demo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
