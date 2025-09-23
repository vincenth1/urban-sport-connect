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
import { toast } from '@/components/ui/use-toast';
import { useEditCourse } from '@/hooks/useEditCourse';
import { burnItemNft, setItemMetadata, getItemNft, removeFromCounter } from '@/utils/contracts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SportType } from '@/types';
import { Loader2, User as UserIcon, AlertCircle, PlusCircle, Users, TrendingUp, Award, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Component to display course capacity
const CapacityDisplay = ({ courseId, tokenId, fallbackCapacity }: { courseId: string; tokenId: string; fallbackCapacity: number }) => {
  const [activeCount, setActiveCount] = React.useState<number | null>(null);
  const [maxCapacity, setMaxCapacity] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchCapacityInfo = async () => {
      try {
        const item = await getItemNft(courseId);
        const [active, capacity] = await Promise.all([
          item.activeRenterCount(Number(tokenId)),
          item.capacity(Number(tokenId))
        ]);
        setActiveCount(Number(active));
        setMaxCapacity(Number(capacity));
      } catch (error) {
        console.warn('Failed to fetch capacity info:', error);
        setActiveCount(0);
        setMaxCapacity(fallbackCapacity);
      }
    };
    fetchCapacityInfo();
  }, [courseId, tokenId, fallbackCapacity]);

  if (activeCount === null || maxCapacity === null) {
    return <span className="text-muted-foreground">Loading...</span>;
  }

  const isFull = activeCount >= maxCapacity;
  const isNearFull = activeCount > maxCapacity * 0.8;

  return (
    <span className={`font-semibold ${isFull ? 'text-red-600' : isNearFull ? 'text-amber-600' : 'text-green-600'}`}>
      {activeCount}/{maxCapacity}
      {isFull && <span className="ml-1 text-xs">FULL</span>}
    </span>
  );
};

type ProfileProps = { initialTab?: 'booked' | 'trainer' | 'become-trainer' };

const Profile = ({ initialTab }: ProfileProps) => {
  const { isConnected, displayAddress, user, isUserLoading } = useWallet();
  const { bookedCourses, courses, updateCourseInState, removeCourseFromState } = useCourses();
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
  const [isLoadingCourseData, setIsLoadingCourseData] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCourseImage, setEditCourseImage] = useState('');
  const [editCoursePrice, setEditCoursePrice] = useState('');
  const [editCourseLocation, setEditCourseLocation] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editCourseSport, setEditCourseSport] = useState<string>('');
  const [editCapacity, setEditCapacity] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);

  // Combine date and time into datetime strings for edit
  const editTimeStart = editStartDate && editStartTime ? `${editStartDate}T${editStartTime}` : '';
  const editTimeEnd = editEndDate && editEndTime ? `${editEndDate}T${editEndTime}` : '';

  useEffect(() => {
    if (user?.isTrainer && activeTab !== 'trainer' && !initialTab) {
      setActiveTab('trainer');
    }
  }, [user?.isTrainer]);

  // Calculate total participants from blockchain data
  useEffect(() => {
    const myCourses = courses.filter(c => c.trainer.toLowerCase() === user?.address.toLowerCase());
    const fetchTotalParticipants = async () => {
      try {
        let total = 0;
        for (const course of myCourses) {
          try {
            const item = await getItemNft(course.id);
            const activeCount = await item.activeRenterCount(Number(course.tokenId || '1'));
            total += Number(activeCount);
          } catch (error) {
            console.warn(`Failed to fetch participants for course ${course.id}:`, error);
          }
        }
        setTotalBookings(total);
      } catch (error) {
        console.warn('Failed to fetch total participants:', error);
        setTotalBookings(0);
      }
    };

    if (myCourses.length > 0 && user?.address) {
      fetchTotalParticipants();
    } else {
      setTotalBookings(0);
    }
  }, [courses, user?.address]);

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

  const handleDeleteCourse = async (courseId: string) => {
    setIsDeletingCourse(true);
    try {
      console.log('Starting course deletion for:', courseId);

      // Check for active bookings first
      console.log('Checking for active bookings...');
      const itemNft = await getItemNft(courseId);
      const activeCount = await itemNft.activeRenterCount(1);
      console.log('Active renter count:', Number(activeCount));

      if (Number(activeCount) > 0) {
        toast({
          title: 'Cannot Delete Course',
          description: `This course has ${activeCount} active booking(s). You cannot delete a course with active participants.`,
          variant: 'destructive'
        });
        return;
      }

      // Step 1: Update IPFS metadata to mark as deleted
      console.log('Step 1: Updating IPFS metadata');
      toast({ title: 'Deleting Course', description: 'Updating course metadata...' });
      const deletedMeta = {
        name: '[DELETED COURSE]',
        description: 'This course has been deleted by the trainer',
        image: 'https://via.placeholder.com/400x300?text=DELETED',
        attributes: [
          { trait_type: 'Status', value: 'Deleted' }
        ]
      };
      const ipfsUri = await uploadToIPFS(deletedMeta);
      console.log('IPFS upload successful, URI:', ipfsUri);

      // Step 2: Update on-chain metadata
      console.log('Step 2: Updating on-chain metadata');
      toast({ title: 'Deleting Course', description: 'Updating blockchain metadata...' });
      await setItemMetadata(courseId, 1, '[DELETED COURSE]', 'This course has been deleted by the trainer', ipfsUri);
      console.log('On-chain metadata updated successfully');

      // Step 3: Try to burn the NFT (may fail if contract doesn't have burn function)
      console.log('Step 3: Attempting to burn NFT');
      toast({ title: 'Deleting Course', description: 'Removing NFT from blockchain...' });
      try {
        await burnItemNft(courseId, 1);
        console.log('NFT burned successfully');
      } catch (burnError) {
        console.warn('Burn failed (contract may not have burn function):', burnError);
        // Continue with deletion even if burn fails
      }

      // Step 4: Remove from NFTCounter registry
      console.log('Step 4: Removing from NFTCounter registry');
      toast({ title: 'Deleting Course', description: 'Removing from course registry...' });
      await removeFromCounter(courseId, import.meta.env.VITE_SECRET);
      console.log('Removed from registry successfully');

      // Step 5: Remove from local state completely
      console.log('Step 5: Removing from local state');
      removeCourseFromState(courseId);
      toast({ title: 'Course Deleted', description: 'Course has been successfully deleted' });
      console.log('Course deletion completed successfully');

      setShowDeleteDialog(false);
      setDeletingCourseId(null);
    } catch (error) {
      console.error('Failed to delete course:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        courseId
      });
      toast({
        title: 'Delete Failed',
        description: `Failed to delete course: ${error.message || 'Unknown error'}. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setIsDeletingCourse(false);
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
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Trainer Profile Card */}
                <div className="xl:col-span-1">
                  <Card className="sticky top-24 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">Trainer Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                            <img
                              src={user.trainerProfile?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                              alt={user.trainerProfile?.name || 'Trainer Avatar'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                            <ShieldCheck className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {user.trainerProfile?.name || 'Trainer'}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            {user.trainerProfile?.bio || 'Tell students about yourself and your expertise'}
                          </p>
                        </div>
                        <Button
                          onClick={async () => {
                            // Fetch current trainer profile data
                            setIsSavingProfile(true);
                            try {
                              // Set current values
                              setName(user.trainerProfile?.name || '');
                              setBio(user.trainerProfile?.bio || '');
                              setAvatar(user.trainerProfile?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
                              setShowProfileDialog(true);
                            } finally {
                              setIsSavingProfile(false);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-4 w-4 mr-2" />
                              Edit Profile
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Courses Section */}
                <div className="xl:col-span-3">
                  {/* Statistics Cards */}
                  {(() => {
                    const myCourses = courses.filter(c => c.trainer.toLowerCase() === user.address.toLowerCase());
                    const totalCourses = myCourses.length;
                    const activeCourses = myCourses.filter(c => {
                      const endTime = (c as any).timeEnd;
                      return endTime && new Date(endTime) > new Date();
                    }).length;

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                                  <p className="text-2xl font-bold">{totalCourses}</p>
                                </div>
                                <Award className="h-8 w-8 text-blue-200" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-green-100 text-sm font-medium">Active Courses</p>
                                  <p className="text-2xl font-bold">{activeCourses}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-200" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-purple-100 text-sm font-medium">Total Participants</p>
                                  <p className="text-2xl font-bold">{totalBookings}</p>
                                </div>
                                <Users className="h-8 w-8 text-purple-200" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h3>
                            <p className="text-muted-foreground mt-1">Manage your training courses and track participant bookings</p>
                          </div>
                          <Button
                            onClick={() => navigate('/create-course')}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Course
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {myCourses.map((course) => (
                            <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold line-clamp-1">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1">{course.description}</CardDescription>
                                  </div>
                                  <div className="ml-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      {course.sportType}
                                    </span>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="relative overflow-hidden rounded-lg">
                                  <img src={course.image} alt={course.title} className="w-full h-32 object-cover transition-transform duration-200 hover:scale-105" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      Capacity:
                                    </span>
                                    <span className="font-medium">
                                      <CapacityDisplay courseId={course.id} tokenId={course.tokenId || '1'} fallbackCapacity={course.capacity || 1} />
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Price:</span>
                                    <span className="font-medium text-green-600">{course.price}</span>
                                  </div>

                                  {course.location && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">Location:</span>
                                      <span className="font-medium truncate ml-2">{course.location}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={async () => {
                                      setIsLoadingCourseData(true);
                                      setEditingCourseId(course.id);

                                      try {
                                        // If course data is incomplete, fetch from IPFS
                                        let completeCourse = course;
                                        if (!course.timeStart || !course.timeEnd || !course.location || course.sportType === SportType.OTHER || !course.capacity) {
                                          try {
                                            const item = await getItemNft(course.id);
                                            const meta = await item.getTokenMetadata(1);

                                            if (meta.image && meta.image.startsWith('ipfs://')) {
                                              const { fetchFromIPFSMemo } = await import('@/utils/ipfs');
                                              const ipfsData = await fetchFromIPFSMemo(meta.image);

                                              completeCourse = {
                                                ...course,
                                                timeStart: ipfsData.timeStart || course.timeStart,
                                                timeEnd: ipfsData.timeEnd || course.timeEnd,
                                                location: ipfsData.location || course.location,
                                                sportType: ipfsData.sportType || course.sportType,
                                                capacity: ipfsData.capacity || course.capacity
                                              };
                                            }
                                          } catch (error) {
                                            console.warn('Failed to fetch complete course data:', error);
                                          }
                                        }

                                        // Set all form fields with complete data
                                        setEditCourseTitle(completeCourse.title);
                                        setEditCourseDesc(completeCourse.description);
                                        setEditCourseImage(completeCourse.image);
                                        setEditCoursePrice(completeCourse.price);
                                        setEditCourseLocation(completeCourse.location || '');
                                        setEditCapacity((completeCourse as any).capacity?.toString() || '');

                                        // Parse timeStart and timeEnd into separate date and time
                                        const timeStart = (completeCourse as any).timeStart;
                                        const timeEnd = (completeCourse as any).timeEnd;
                                        if (timeStart) {
                                          const startDateTime = new Date(timeStart);
                                          setEditStartDate(startDateTime.toISOString().split('T')[0]);
                                          setEditStartTime(startDateTime.toTimeString().slice(0, 5));
                                        } else {
                                          setEditStartDate('');
                                          setEditStartTime('');
                                        }
                                        if (timeEnd) {
                                          const endDateTime = new Date(timeEnd);
                                          setEditEndDate(endDateTime.toISOString().split('T')[0]);
                                          setEditEndTime(endDateTime.toTimeString().slice(0, 5));
                                        } else {
                                          setEditEndDate('');
                                          setEditEndTime('');
                                        }

                                        setEditCourseSport((completeCourse as any).sportType || SportType.OTHER);
                                        setShowCourseDialog(true);
                                      } finally {
                                        setIsLoadingCourseData(false);
                                      }
                                    }}
                                  >
                                    {isLoadingCourseData && editingCourseId === course.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : null}
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm" onClick={() => {
                                        setDeletingCourseId(course.id);
                                        setShowDeleteDialog(true);
                                      }}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-3">
                                          <div className="text-sm">
                                            Are you sure you want to delete this course? This action cannot be undone.
                                          </div>
                                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                                            <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                                              What happens when you delete a course:
                                            </div>
                                            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-4">
                                              <li>• 📝 Course metadata will be marked as deleted</li>
                                              <li>• 🖼️ Course image will be replaced with "DELETED" placeholder</li>
                                              <li>• 🔗 NFT will be burned from the blockchain</li>
                                              <li>• 📋 Course will be removed from the registry</li>
                                              <li>• 👥 All participants will lose access</li>
                                              <li>• 💰 Any funds in the contract will remain accessible to you</li>
                                            </ul>
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            This will require multiple blockchain transactions. Please don't close this window until the process is complete.
                                          </div>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setShowDeleteDialog(false)} disabled={isDeletingCourse}>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteCourse(course.id)}
                                          disabled={isDeletingCourse}
                                          className="bg-destructive hover:bg-destructive/90"
                                        >
                                          {isDeletingCourse ? (
                                            <>
                                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              Deleting...
                                            </>
                                          ) : (
                                            'Delete Course'
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ec-title">Course Title</Label>
              <Input id="ec-title" value={editCourseTitle} onChange={(e) => setEditCourseTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ec-desc">Description</Label>
              <Textarea id="ec-desc" value={editCourseDesc} onChange={(e) => setEditCourseDesc(e.target.value)} className="min-h-[100px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ec-price">Price (ETH)</Label>
                <Input id="ec-price" value={editCoursePrice} onChange={(e) => setEditCoursePrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-capacity">Capacity (optional)</Label>
                <Input
                  id="ec-capacity"
                  type="number"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  placeholder="e.g., 10 (leave empty for unlimited)"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="ec-location">Location</Label>
              <Input id="ec-location" value={editCourseLocation} onChange={(e) => setEditCourseLocation(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ec-img">Course Image URL</Label>
              <Input id="ec-img" value={editCourseImage} onChange={(e) => setEditCourseImage(e.target.value)} />
            </div>

            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Label className="text-base font-medium text-blue-900 dark:text-blue-100">🕐 Course Start Time</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date" className="text-sm">📅 Date</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-time" className="text-sm">⏰ Time</Label>
                    <Input
                      id="edit-start-time"
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <Label className="text-base font-medium text-green-900 dark:text-green-100">🕐 Course End Time</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date" className="text-sm">📅 Date</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      min={editStartDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-time" className="text-sm">⏰ Time</Label>
                    <Input
                      id="edit-end-time"
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {(editTimeStart || editTimeEnd) && (
                <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Label className="text-base font-medium text-purple-900 dark:text-purple-100">📋 Time Preview</Label>
                  <div className="mt-2 space-y-1">
                    {editTimeStart && (
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        🟢 <strong>Starts:</strong> {new Date(editTimeStart).toLocaleString()}
                      </p>
                    )}
                    {editTimeEnd && (
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        🔴 <strong>Ends:</strong> {new Date(editTimeEnd).toLocaleString()}
                      </p>
                    )}
                    {editTimeStart && editTimeEnd && (
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        ⏱️ <strong>Duration:</strong> {Math.round((new Date(editTimeEnd).getTime() - new Date(editTimeStart).getTime()) / (1000 * 60 * 60))} hours
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editingCourseId) return;
                await saveCourse(editingCourseId, 1, {
                  title: editCourseTitle,
                  description: editCourseDesc,
                  image: editCourseImage,
                  price: editCoursePrice,
                  location: editCourseLocation,
                  timeStart: editTimeStart,
                  timeEnd: editTimeEnd,
                  sportType: editCourseSport as any,
                  capacity: editCapacity ? parseInt(editCapacity) : undefined
                });
                setShowCourseDialog(false);
              }}
              disabled={isSavingCourse}
            >{isSavingCourse ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;

// Dialogs for editing profile and courses
// Note: In a real app, consider colocating these in components.
export const ProfileDialogs = () => null;
