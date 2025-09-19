
import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useCourses } from '@/hooks/useCourses';
import { useNavigate } from 'react-router-dom';
import { SportType, Course } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';

const CreateCourse = () => {
  const { isConnected, isTrainer } = useWallet();
  const { createCourse } = useCourses();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [sportType, setSportType] = useState<SportType>(SportType.YOGA);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine date and time into datetime strings
  const timeStart = startDate && startTime ? `${startDate}T${startTime}` : '';
  const timeEnd = endDate && endTime ? `${endDate}T${endTime}` : '';

  // Update end date/time when start date/time changes
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate && new Date(value) > new Date(endDate)) {
      setEndDate(''); // Reset end date if it's now invalid
      setEndTime('');
    }
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    // If end date is same as start date and end time is before start time, reset end time
    if (endDate === startDate && endTime && value >= endTime) {
      setEndTime('');
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    // If end date is same as start date and end time is before start time, reset end time
    if (value === startDate && endTime && startTime && endTime <= startTime) {
      setEndTime('');
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date and time inputs
    if (!startDate || !startTime || !endDate || !endTime) {
      alert('Please select both start and end date and time');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      alert('End time must be after start time');
      return;
    }

    if (startDateTime <= new Date()) {
      alert('Start time must be in the future');
      return;
    }

    setIsSubmitting(true);

    try {
      const newCourse = {
        title,
        description,
        price,
        image,
        sportType,
        location,
        timeStart: timeStart,
        timeEnd: timeEnd,
        capacity: capacity ? parseInt(capacity) : undefined
      };

      const createdCourse = await createCourse(newCourse);

      if (createdCourse) {
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
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
            Please connect your wallet to create a course.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (!isTrainer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Trainer Registration Required</h1>
          <p className="text-muted-foreground mb-8">
            You need to register as a trainer before creating courses.
          </p>
          <Button onClick={() => navigate('/profile')}>
            Go to Profile
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">
          Fill out the form to create a new course NFT.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Enter the details for your new course. These will be stored on the blockchain and IPFS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Advanced Yoga Sessions"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe what participants will learn in this course"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (in ETH)</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="e.g., 0.05 ETH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g., 10 (leave empty for unlimited)"
                  min="0"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sportType">Sport Type</Label>
                  <Select 
                    value={sportType} 
                    onValueChange={(value) => setSportType(value as SportType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SportType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g., Central Park, New York"
                  />
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Label className="text-base font-medium text-blue-900 dark:text-blue-100">🕐 Course Start Time</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium">📅 Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-medium">⏰ Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        required
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    📝 Select the date and time when your course begins
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Label className="text-base font-medium text-green-900 dark:text-green-100">🕐 Course End Time</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium">📅 Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium">⏰ Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => handleEndTimeChange(e.target.value)}
                        required
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                    📝 Select the date and time when your course ends
                  </p>
                </div>

                {(timeStart || timeEnd) && (
                  <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Label className="text-base font-medium text-purple-900 dark:text-purple-100">📋 Time Preview</Label>
                    <div className="mt-2 space-y-1">
                      {timeStart && (
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          🟢 <strong>Starts:</strong> {new Date(timeStart).toLocaleString()}
                        </p>
                      )}
                      {timeEnd && (
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          🔴 <strong>Ends:</strong> {new Date(timeEnd).toLocaleString()}
                        </p>
                      )}
                      {timeStart && timeEnd && (
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          ⏱️ <strong>Duration:</strong> {Math.round((new Date(timeEnd).getTime() - new Date(timeStart).getTime()) / (1000 * 60 * 60))} hours
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Course Image URL</Label>
                <Input 
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  placeholder="https://example.com/course-image.jpg"
                />
                
                {image && (
                  <div className="mt-4">
                    <div className="w-full h-48 rounded-md overflow-hidden border border-gray-200">
                      <img 
                        src={image} 
                        alt="Course preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Course...
                    </>
                  ) : (
                    <>Create Course</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default CreateCourse;
