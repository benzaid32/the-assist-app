import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search, Plus, Map, FileText, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';

// Form schema for adding impact stories
const storyFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  content: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  category: z.enum(["rent", "utilities", "medical", "food", "other"], {
    required_error: "Please select a category.",
  }),
  anonymized: z.boolean().default(true),
});

// Mock donor feed stories
const mockStories = [
  { 
    id: 1, 
    title: "Helped Pay Rent for Family", 
    content: "Your donation helped a family of four cover their rent after the primary earner lost their job due to medical issues. They were able to stay in their home while searching for new employment.",
    location: "Chicago, IL", 
    category: "rent",
    date: "2025-05-15",
    impressions: 145,
    anonymized: true,
    approved: true 
  },
  { 
    id: 2, 
    title: "Provided 100 Meals to Food Bank", 
    content: "Thanks to your support, we were able to provide 100 meals through a local food bank to families experiencing food insecurity. Many of these families include young children who now have access to nutritious meals.",
    location: "Dallas, TX", 
    category: "food",
    date: "2025-05-14",
    impressions: 98,
    anonymized: true,
    approved: true 
  },
  { 
    id: 3, 
    title: "Supported Medical Bills for Child", 
    content: "Your generosity helped cover essential medical treatments for a 7-year-old child with a chronic condition. The family was struggling with mounting healthcare costs that their insurance didn't fully cover.",
    location: "Miami, FL", 
    category: "medical",
    date: "2025-05-13",
    impressions: 210,
    anonymized: true,
    approved: true 
  },
  { 
    id: 4, 
    title: "Assisted with Utility Bills", 
    content: "During an unusually cold winter, your donation helped several elderly residents keep their heat on by covering their utility bills. This prevented potential health emergencies during the cold weather.",
    location: "Boston, MA", 
    category: "utilities",
    date: "2025-05-12",
    impressions: 87,
    anonymized: true,
    approved: true 
  },
  { 
    id: 5, 
    title: "Emergency Housing Support", 
    content: "A family that lost their home due to a fire received emergency housing assistance thanks to your donation. They were provided temporary accommodation while they worked with insurance to rebuild.",
    location: "Seattle, WA", 
    category: "rent",
    date: "2025-05-11",
    impressions: 76,
    anonymized: true,
    approved: false 
  }
];

const AdminDonorFeed = () => {
  const [stories, setStories] = useState(mockStories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof storyFormSchema>>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: "",
      content: "",
      location: "",
      category: "rent",
      anonymized: true,
    },
  });

  const filteredStories = stories.filter(story => 
    searchTerm === '' || 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStory = (values: z.infer<typeof storyFormSchema>) => {
    const newStory = {
      id: stories.length + 1,
      title: values.title,
      content: values.content,
      location: values.location,
      category: values.category,
      date: new Date().toISOString().split('T')[0],
      impressions: 0,
      anonymized: values.anonymized,
      approved: false
    };
    
    setStories([...stories, newStory]);
    toast({
      title: "Story added",
      description: "The impact story has been added and is awaiting approval.",
    });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleEditStory = (values: z.infer<typeof storyFormSchema>) => {
    if (selectedStory) {
      const updatedStories = stories.map(story => 
        story.id === selectedStory.id 
          ? { 
              ...story, 
              title: values.title,
              content: values.content,
              location: values.location,
              category: values.category,
              anonymized: values.anonymized
            } 
          : story
      );
      
      setStories(updatedStories);
      toast({
        title: "Story updated",
        description: "The impact story has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setSelectedStory(null);
    }
  };

  const handleDeleteStory = (id: number) => {
    const updatedStories = stories.filter(story => story.id !== id);
    setStories(updatedStories);
    toast({
      title: "Story deleted",
      description: "The impact story has been permanently removed.",
    });
  };

  const handleApproveStory = (id: number) => {
    const updatedStories = stories.map(story => 
      story.id === id ? { ...story, approved: true } : story
    );
    setStories(updatedStories);
    toast({
      title: "Story approved",
      description: "The impact story is now visible to donors.",
    });
  };

  const openEditDialog = (story: any) => {
    setSelectedStory(story);
    form.reset({
      title: story.title,
      content: story.content,
      location: story.location,
      category: story.category as any,
      anonymized: story.anonymized
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch(category) {
      case 'rent':
        return 'bg-black text-white';
      case 'utilities':
        return 'bg-gray-800 text-white';
      case 'medical':
        return 'bg-gray-700 text-white';
      case 'food':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donor Feed</h1>
        <p className="text-muted-foreground">
          Manage impact stories that appear in the donor community
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Impact Story
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impact Stories</CardTitle>
          <CardDescription>
            Stories shared with donors about how their contributions are making a difference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.location}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadgeColor(story.category)}`}>
                      {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{story.date}</TableCell>
                  <TableCell>{story.impressions}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${story.approved ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {story.approved ? 'Published' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(story)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!story.approved && (
                        <Button variant="ghost" size="icon" onClick={() => handleApproveStory(story.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteStory(story.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filteredStories.length} of {stories.length} impact stories
          </div>
          <div className="text-xs text-muted-foreground">
            {stories.filter(s => s.approved).length} published · {stories.filter(s => !s.approved).length} pending
          </div>
        </CardFooter>
      </Card>

      {/* Add Story Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Impact Story</DialogTitle>
            <DialogDescription>
              Create a new anonymized story to show donors how their contributions are making a difference.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddStory)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Helped Family Stay in Their Home" {...field} />
                    </FormControl>
                    <FormDescription>
                      Create a brief, impactful headline.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your donation helped a family of four cover their rent after the primary earner lost their job due to medical issues."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the impact in a personal yet anonymized way.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Chicago, IL" {...field} />
                      </FormControl>
                      <FormDescription>
                        City and state only (for privacy).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="rent">Rent/Housing</option>
                          <option value="utilities">Utilities</option>
                          <option value="medical">Medical</option>
                          <option value="food">Food</option>
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Story</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Story Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Impact Story</DialogTitle>
            <DialogDescription>
              Update the details of this impact story.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditStory)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Content</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="rent">Rent/Housing</option>
                          <option value="utilities">Utilities</option>
                          <option value="medical">Medical</option>
                          <option value="food">Food</option>
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Story</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDonorFeed;
