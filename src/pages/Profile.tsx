import React, { useEffect, useState } from 'react';
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
import { updateIPFSJson, uploadToIPFS } from '@/utils/ipfs';
import { useEditCourse } from '@/hooks/useEditCourse';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SportType } from '@/types';
import { Loader2, User as UserIcon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type ProfileProps = { initialTab?: 'booked' | 'trainer' | 'become-trainer' };

const Profile = ({ initialTab }: ProfileProps) => {
  const { isConnected, displayAddress, user, isUserLoading } = useWallet();
  const { bookedCourses, courses, updateCourseInState } = useCourses();
  const { registerAsTrainer, updateTrainerProfile } = useWeb3();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'booked' | 'trainer' | 'become-trainer'>(initialTab || 'booked');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { isSaving: isSavingCourse, saveCourse } = useEditCourse((updated) => {
    updateCourseInState(updated);
  });
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCourseImage, setEditCourseImage] = useState('');
  const [editCoursePrice, setEditCoursePrice] = useState('');
  const [editCourseLocation, setEditCourseLocation] = useState('');
  const [editCourseTime, setEditCourseTime] = useState('');
  const [editCourseSport, setEditCourseSport] = useState<string>('');

  useEffect(() => {
    if (user?.isTrainer && activeTab !== 'trainer' && !initialTab) {
      setActiveTab('trainer');
    }
  }, [user?.isTrainer]);
  
  const handleRegisterAsTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await registerAsTrainer(name, bio, avatar);
      setActiveTab('trainer');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center mt-20">
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
        <Footer />
      </div>
    );
  }
  
  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center mt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Wallet: {displayAddress}
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-8">
            <TabsTrigger value="booked">My Booked</TabsTrigger>
            {user?.isTrainer && (
              <TabsTrigger value="trainer">My Trainer Space</TabsTrigger>
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
          
          {user?.isTrainer && (
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
                            src={user.trainerProfile?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                            alt={user.trainerProfile?.name || 'Trainer Avatar'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-bold">{user.trainerProfile?.name || 'Trainer'}</h3>
                        <p className="text-center text-muted-foreground">
                          {user.trainerProfile?.bio || 'Tell students about you'}
                        </p>
                        <Button onClick={() => {
                          setName(user.trainerProfile?.name || '');
                          setBio(user.trainerProfile?.bio || '');
                          setAvatar(user.trainerProfile?.avatar || '');
                          setShowProfileDialog(true);
                        }} className="w-full">Edit Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">My Courses</h3>
                    <Button onClick={() => navigate('/create-course')}>Create Course</Button>
                  </div>
                  {(() => {
                    const myCourses = courses.filter(c => c.trainer.toLowerCase() === user.address.toLowerCase());
                    return myCourses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {myCourses.map((course) => (
                          <Card key={course.id}>
                            <CardHeader>
                              <CardTitle className="text-base">{course.title}</CardTitle>
                              <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded" />
                              <div className="flex justify-end">
                                <Button variant="outline" onClick={() => {
                                  setEditingCourseId(course.id);
                                  setEditCourseTitle(course.title);
                                  setEditCourseDesc(course.description);
                                  setEditCourseImage(course.image);
                                  setEditCoursePrice(course.price);
                                  setEditCourseLocation(course.location || '');
                                  setEditCourseTime((course as any).time || '');
                                  setEditCourseSport((course as any).sportType || '');
                                  setShowCourseDialog(true);
                                }}>Edit</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
                        <Button onClick={() => navigate('/create-course')}>
                          Create Your First Course
                        </Button>
                      </CardContent>
                    </Card>
                    );
                  })()}
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
      
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Trainer Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="dlg-name">Name</Label>
              <Input id="dlg-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dlg-bio">Bio</Label>
              <Textarea id="dlg-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dlg-avatar">Avatar URL</Label>
              <Input id="dlg-avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!user) return;
                try {
                  setIsSavingProfile(true);
                  await updateTrainerProfile?.(name, bio, avatar);
                  setShowProfileDialog(false);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsSavingProfile(false);
                }
              }}
              disabled={isSavingProfile}
            >{isSavingProfile ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="ec-title">Title</Label>
              <Input id="ec-title" value={editCourseTitle} onChange={(e) => setEditCourseTitle(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="ec-desc">Description</Label>
              <Textarea id="ec-desc" value={editCourseDesc} onChange={(e) => setEditCourseDesc(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="ec-img">Image URL</Label>
              <Input id="ec-img" value={editCourseImage} onChange={(e) => setEditCourseImage(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ec-price">Price (ETH)</Label>
              <Input id="ec-price" value={editCoursePrice} onChange={(e) => setEditCoursePrice(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={editCourseSport} onValueChange={(v) => setEditCourseSport(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SportType).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="ec-location">Location</Label>
              <Input id="ec-location" value={editCourseLocation} onChange={(e) => setEditCourseLocation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ec-time">Time</Label>
              <Input id="ec-time" type="datetime-local" value={editCourseTime} onChange={(e) => setEditCourseTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editingCourseId) return;
                await saveCourse(editingCourseId, 1, { title: editCourseTitle, description: editCourseDesc, image: editCourseImage, price: editCoursePrice, location: editCourseLocation, time: editCourseTime, sportType: editCourseSport as any });
                setShowCourseDialog(false);
              }}
              disabled={isSavingCourse}
            >{isSavingCourse ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  /* Dialogs appended below */
};

export default Profile;

// Dialogs for editing profile and courses
// Note: In a real app, consider colocating these in components.
export const ProfileDialogs = () => null;
