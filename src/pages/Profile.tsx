
import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useCourses } from '@/hooks/useCourses';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseGrid from '@/components/CourseGrid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWeb3 } from '@/context/Web3Context';
import { Loader2, User as UserIcon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { isConnected, displayAddress, user, isUserLoading } = useWallet();
  const { bookedCourses } = useCourses();
  const { registerAsTrainer } = useWeb3();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRegisterAsTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await registerAsTrainer(name, bio, avatar);
      // Refresh the page after successful registration
      window.location.reload();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Wallet Not Connected</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your wallet to view your profile and booked courses.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Wallet: {displayAddress}
        </p>
      </div>
      
      <Tabs defaultValue="booked">
        <TabsList className="mb-8">
          <TabsTrigger value="booked">My Booked Courses</TabsTrigger>
          {user?.isTrainer && (
            <TabsTrigger value="trainer">Trainer Profile</TabsTrigger>
          )}
          {!user?.isTrainer && (
            <TabsTrigger value="become-trainer">Become a Trainer</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="booked">
          <div className="space-y-8">
            <CourseGrid 
              courses={bookedCourses} 
              isBooked={true}
              showBookButton={false}
              showFilters={false}
              emptyMessage="You haven't booked any courses yet."
            />
          </div>
        </TabsContent>
        
        {user?.isTrainer && user.trainerProfile && (
          <TabsContent value="trainer">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Trainer Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden">
                        <img 
                          src={user.trainerProfile.avatar} 
                          alt={user.trainerProfile.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold">{user.trainerProfile.name}</h3>
                      <p className="text-center text-muted-foreground">
                        {user.trainerProfile.bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">My Courses</h3>
                {user.trainerProfile.courses.length > 0 ? (
                  <CourseGrid 
                    courses={user.trainerProfile.courses} 
                    showBookButton={false}
                    showFilters={false}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
                      <Button onClick={() => navigate('/create-course')}>
                        Create Your First Course
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        )}
        
        {!user?.isTrainer && (
          <TabsContent value="become-trainer">
            <Card>
              <CardHeader>
                <CardTitle>Become a Trainer</CardTitle>
                <CardDescription>
                  Fill out the form below to register as a trainer and start creating courses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterAsTrainer} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                      placeholder="Tell us about your experience, qualifications, etc."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile Picture URL</Label>
                    <Input 
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/your-image.jpg"
                    />
                    
                    {avatar && (
                      <div className="mt-2 flex justify-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200">
                          <img 
                            src={avatar} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>Register as Trainer</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Profile;
