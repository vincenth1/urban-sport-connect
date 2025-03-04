
import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useCourses } from '@/hooks/useCourses';
import WalletConnect from '@/components/WalletConnect';
import CourseGrid from '@/components/CourseGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Edit, Copy, CheckCircle, Clock } from 'lucide-react';
import { useWeb3 } from '@/context/Web3Context';
import { BookedCourse } from '@/types';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const { isConnected, account, displayAddress } = useWallet();
  const { user, isUserLoading, registerAsTrainer } = useWeb3();
  const { bookedCourses } = useCourses();
  const [copied, setCopied] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [trainerBio, setTrainerBio] = useState('');
  const [trainerAvatar, setTrainerAvatar] = useState('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300');
  
  if (!isConnected) {
    return <WalletConnect fullPage message="Connect your wallet to view your profile" />;
  }
  
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  const handleRegisterAsTrainer = async () => {
    if (!trainerName || !trainerBio) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsRegistering(true);
    try {
      await registerAsTrainer(trainerName, trainerBio, trainerAvatar);
      setTrainerName('');
      setTrainerBio('');
    } catch (error) {
      console.error("Failed to register as trainer:", error);
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Group booked courses by expiration status
  const activeBookings = bookedCourses.filter(course => 
    new Date(course.expiresAt) > new Date()
  );
  
  const expiredBookings = bookedCourses.filter(course => 
    new Date(course.expiresAt) <= new Date()
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">My Profile</CardTitle>
                    <CardDescription>
                      Manage your account and courses
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Wallet Address
                    </h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-secondary px-3 py-1 rounded text-sm flex-1 overflow-hidden text-ellipsis">
                        {account}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={copyAddress}
                        title="Copy address"
                      >
                        {copied ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {user?.isTrainer ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Trainer Status
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Registered as Trainer
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Trainer Status
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Register as Trainer
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Register as Trainer</DialogTitle>
                            <DialogDescription>
                              Fill out the form below to become a trainer and offer your own courses.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Name</Label>
                              <Input 
                                id="name" 
                                value={trainerName} 
                                onChange={(e) => setTrainerName(e.target.value)} 
                                placeholder="Your trainer name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea 
                                id="bio" 
                                value={trainerBio} 
                                onChange={(e) => setTrainerBio(e.target.value)} 
                                placeholder="Tell us about your experience and expertise"
                                rows={3}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="avatar">Avatar URL</Label>
                              <Input 
                                id="avatar" 
                                value={trainerAvatar} 
                                onChange={(e) => setTrainerAvatar(e.target.value)} 
                                placeholder="URL to your profile picture"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleRegisterAsTrainer} 
                              disabled={isRegistering}
                            >
                              {isRegistering ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Registering...
                                </>
                              ) : (
                                "Register as Trainer"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="w-full max-w-md grid grid-cols-2">
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Active Bookings
                  </TabsTrigger>
                  <TabsTrigger value="expired" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Expired Bookings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-6">
                  {activeBookings.length > 0 ? (
                    <CourseGrid 
                      courses={activeBookings} 
                      isBooked={true}
                      showBookButton={false}
                      showFilters={false}
                    />
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-secondary/30">
                      <p className="text-muted-foreground">You don't have any active bookings.</p>
                      <Button asChild className="mt-4">
                        <a href="/courses">Browse Courses</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="expired" className="mt-6">
                  {expiredBookings.length > 0 ? (
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground">
                        These bookings have expired and are no longer accessible.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {expiredBookings.map((booking: BookedCourse) => (
                          <Card key={booking.id} className="opacity-70">
                            <CardHeader>
                              <CardTitle className="text-lg">{booking.title}</CardTitle>
                              <CardDescription>
                                Expired on {format(new Date(booking.expiresAt), 'PPP')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-muted-foreground">
                                <p>Sport: {booking.sportType}</p>
                                <p>Duration: {booking.duration} days</p>
                                <p>Price: {booking.price}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-secondary/30">
                      <p className="text-muted-foreground">You don't have any expired bookings.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
