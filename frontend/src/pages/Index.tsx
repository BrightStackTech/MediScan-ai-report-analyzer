import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  ArrowRight, 
  FileText, 
  Brain, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle,
  Star,
  HeartPulse,
  Trophy
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: "98%", label: "Accuracy Rate" },
    { number: "10k+", label: "Reports Analyzed" },
    { number: "24/7", label: "Support Available" },
  ];

  const testimonials = [
    {
      quote: "MediScan has revolutionized how I understand my medical reports. It's incredibly user-friendly!",
      author: "Sarah Johnson",
      role: "Patient"
    },
    {
      quote: "As a healthcare provider, I recommend MediScan to all my patients. It helps them better understand their health.",
      author: "Dr. Michael Chen",
      role: "Cardiologist"
    },
    {
      quote: "The clarity and accuracy of the summaries are impressive. A game-changer in healthcare communication.",
      author: "Emma Thompson",
      role: "Healthcare Administrator"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-12 mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Left Content */}
          <div className="flex-1 text-left space-y-6">
            <div className="inline-block p-2 px-4 bg-primary/10 rounded-full mb-4">
              <span className="text-primary text-sm font-medium">AI-Powered Medical Report Analysis</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-gradient animate-fade-in">
              MediScan
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl animate-fade-up leading-relaxed">
              Transform complex medical reports into clear, easy-to-understand summaries using advanced AI technology. Get instant insights into your health documents.
            </p>
            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="group bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Start Analyzing
                <ArrowRight className={`ml-2 transition-transform duration-300 ${
                  isHovered ? "translate-x-1" : ""
                }`} />
              </Button>
              <Button
                onClick={() => navigate("/features")}
                size="lg"
                variant="outline"
                className="group hover:bg-primary/5"
              >
                Explore Features
              </Button>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <img
                src="/ai2.png"
                alt="AI Medical Analysis Illustration"
                className="w-full h-full object-contain animate-float"
              />
              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-3xl" />
              <div className="absolute -z-10 top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -z-10 bottom-10 left-10 w-32 h-32 bg-primary/15 rounded-full blur-2xl" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 my-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center glass-morphism p-6 rounded-xl animate-fade-up"
                 style={{ animationDelay: `${index * 100}ms` }}>
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of medical report understanding with our comprehensive feature set
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {[
            {
              icon: <FileText className="w-12 h-12 text-primary" />,
              title: "Smart Upload",
              description:
                "Support for multiple formats including PDFs, images, and scanned documents",
            },
            {
              icon: <Brain className="w-12 h-12 text-primary" />,
              title: "AI Analysis",
              description:
                "Advanced machine learning algorithms for accurate medical terminology interpretation",
            },
            {
              icon: <Stethoscope className="w-12 h-12 text-primary" />,
              title: "Clear Results",
              description:
                "Detailed yet simple explanations with important highlights and recommendations",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-morphism p-8 rounded-xl hover:bg-white/10 transition-all duration-300 animate-fade-up group hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gradient">Why Choose MediScan?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with user-friendly design to deliver the best experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Shield className="w-10 h-10 text-primary" />,
                title: "Privacy First",
                description: "HIPAA-compliant processing with end-to-end encryption for your data security.",
              },
              {
                icon: <Clock className="w-10 h-10 text-primary" />,
                title: "Instant Results",
                description: "Get your simplified report analysis in seconds with our optimized AI engine.",
              },
              {
                icon: <Users className="w-10 h-10 text-primary" />,
                title: "Patient-Friendly",
                description: "Complex medical terms explained in plain, understandable language for everyone.",
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-primary" />,
                title: "High Accuracy",
                description: "State-of-the-art AI models ensuring reliable and precise interpretations.",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="glass-morphism p-8 rounded-lg flex items-start space-x-6 animate-fade-up hover:bg-white/5 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 bg-primary/10 rounded-lg">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gradient">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed how they understand medical reports
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-morphism p-6 rounded-xl animate-fade-up">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center glass-morphism p-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-gradient">
              Ready to Understand Your Medical Reports?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who have already simplified their medical documentation experience.
              Start your journey to better health understanding today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/upload")}
                size="lg"
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                Get Started Now
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                onClick={() => navigate("/pricing")}
                size="lg"
                variant="outline"
                className="hover:bg-primary/5"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
