
import React, { useState } from 'react';
import { useCourses } from '@/hooks/useCourses';
import CourseGrid from '@/components/CourseGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const Courses = () => {
  const { courses, isLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.sportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold">All Courses</h1>
              <p className="text-muted-foreground mt-2">
                Discover and book sports courses in your area
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 sm:w-auto">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Courses</SheetTitle>
                    <SheetDescription>
                      Apply filters to find the perfect course for you.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="sort">Sort By</Label>
                      <Select defaultValue="newest">
                        <SelectTrigger id="sort">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="duration-short">Duration: Shortest First</SelectItem>
                          <SelectItem value="duration-long">Duration: Longest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Price Range</Label>
                      <Slider defaultValue={[0, 100]} max={100} step={1} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 ETH</span>
                        <span>1 ETH</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Duration (days)</Label>
                      <Slider defaultValue={[0, 30]} max={30} step={1} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 days</span>
                        <span>30 days</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="Enter city or area" />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2">
                      <Button variant="outline">Reset</Button>
                      <Button>Apply Filters</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <CourseGrid 
              courses={filteredCourses} 
              isLoading={isLoading}
              emptyMessage={
                searchTerm 
                  ? "No courses found matching your search criteria." 
                  : "No courses available at the moment."
              }
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
