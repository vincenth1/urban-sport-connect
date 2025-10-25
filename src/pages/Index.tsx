
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import CourseGrid from '@/components/CourseGrid';
import { ChevronRight, Search, Medal, Shield, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const { courses, isLoading } = useCourses();
  
  // Only show 4 courses on the landing page
  const featuredCourses = courses.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="hero-section relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
          <div className="absolute w-full h-full -z-10">
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl animate-float" />
            <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-blue-300/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center text-center">
            <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full animate-in fade-in">
              Decentralized Urban Sports Platform
            </span>
            
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl animate-in slide-up" style={{ animationDelay: '150ms' }}>
              Find & Book Urban Sports Courses On The Blockchain
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl animate-in slide-up" style={{ animationDelay: '300ms' }}>
              Access unique sport experiences through NFT-powered course bookings. 
              Learn from expert trainers and build your skills in a decentralized ecosystem.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-in slide-up" style={{ animationDelay: '450ms' }}>
              <Link to="/courses">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Courses
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/trainer-dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Become a Trainer
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 animate-in fade-in" style={{ animationDelay: '600ms' }}>
              <div className="aspect-video max-w-3xl w-full rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900&q=80" 
                  alt="Urban sports training" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured courses section */}
        <section className="section bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-bold">Featured Courses</h2>
                <p className="text-muted-foreground mt-2">
                  Discover our most popular sports courses
                </p>
              </div>
              <Link to="/courses">
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  View All Courses
                </Button>
              </Link>
            </div>
            
            <CourseGrid 
              courses={featuredCourses} 
              isLoading={isLoading} 
              showFilters={false}
            />
          </div>
        </section>
        
        {/* Features section */}
        <section className="section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why Choose SportChain?</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Our decentralized platform offers unique benefits for both trainers and sports enthusiasts
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Medal className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Quality Courses</h3>
                <p className="text-muted-foreground mt-3">
                  Each course is verified on the blockchain and backed by trainer reputation.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Secure Booking</h3>
                <p className="text-muted-foreground mt-3">
                  Smart contracts ensure transparent and secure transactions for all parties.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Time-Based Access</h3>
                <p className="text-muted-foreground mt-3">
                  Courses are available for a specific duration, ensuring fair access for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="section bg-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Start Your Sports Journey?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join our platform today and discover the best urban sports courses near you.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/courses">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Browse Courses
                  </Button>
                </Link>
           
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
