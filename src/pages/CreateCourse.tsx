
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

const CreateCourse = () => {
  const { isConnected, isTrainer } = useWallet();
  const { createCourse } = useCourses();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [duration, setDuration] = useState('7');
  const [sportType, setSportType] = useState<SportType>(SportType.YOGA);
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newCourse = {
        title,
        description,
        price,
        image,
        duration: parseInt(duration),
        sportType,
        location,
        time
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
    <div className="container mx-auto px-4 py-8">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="duration">Duration (in days)</Label>
                  <Input 
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time"
                    type="datetime-local"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 2025-09-15T18:00"
                  />
                </div>
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
  );
};

export default CreateCourse;
