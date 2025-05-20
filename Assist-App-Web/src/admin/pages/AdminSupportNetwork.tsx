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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search, Plus, FileText, Video, Film, FileQuestion, File, Upload, RefreshCw, Send, Eye, Edit, Trash2 } from 'lucide-react';

// Form schema for adding resources
const resourceFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  type: z.enum(["video", "pdf", "article"], {
    required_error: "Please select a resource type.",
  }),
  category: z.enum(["housing", "utilities", "medical", "food", "general"], {
    required_error: "Please select a category.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

// Form schema for answering questions
const answerFormSchema = z.object({
  answer: z.string().min(10, {
    message: "Answer must be at least 10 characters.",
  }),
});

// Mock resources data
const mockResources = [
  { 
    id: 1, 
    title: "How Verification Works", 
    description: "A step-by-step guide to the verification process for assistance applicants.",
    type: "video", 
    category: "general",
    url: "https://example.com/verification-video",
    date: "2025-05-15",
    downloads: 78,
  },
  { 
    id: 2, 
    title: "Housing Assistance Guide", 
    description: "Comprehensive information on applying for and receiving housing assistance.",
    type: "pdf", 
    category: "housing",
    url: "https://example.com/housing-guide.pdf",
    date: "2025-05-14",
    downloads: 124,
  },
  { 
    id: 3, 
    title: "Utility Bill Support FAQ", 
    description: "Frequently asked questions about utility bill assistance programs.",
    type: "article", 
    category: "utilities",
    url: "https://example.com/utility-faq",
    date: "2025-05-13",
    downloads: 96,
  },
  { 
    id: 4, 
    title: "Medical Expense Application", 
    description: "Guide to applying for medical expense assistance and required documentation.",
    type: "pdf", 
    category: "medical",
    url: "https://example.com/medical-guide.pdf",
    date: "2025-05-12",
    downloads: 113,
  },
  { 
    id: 5, 
    title: "Food Assistance Programs", 
    description: "Overview of available food assistance programs and eligibility requirements.",
    type: "article", 
    category: "food",
    url: "https://example.com/food-assistance",
    date: "2025-05-11",
    downloads: 82,
  },
];

// Mock Q&A data
const mockQuestions = [
  {
    id: 1,
    question: "How long does the verification process usually take?",
    answer: "The verification process typically takes 3-5 business days from the time all required documents are submitted. You'll receive status updates via email throughout the process.",
    askedBy: "anonymous",
    date: "2025-05-15",
    status: "answered"
  },
  {
    id: 2,
    question: "What documents do I need for utility bill assistance?",
    answer: "For utility bill assistance, you'll need to provide: 1) A copy of your current utility bill showing the past due amount, 2) Proof of identity (government-issued ID), 3) Proof of residency (lease agreement or mortgage statement), and 4) Documentation of financial hardship.",
    askedBy: "user123",
    date: "2025-05-14",
    status: "answered"
  },
  {
    id: 3,
    question: "If I was rejected, can I apply again?",
    answer: null,
    askedBy: "user456",
    date: "2025-05-13",
    status: "pending"
  },
  {
    id: 4,
    question: "Do you provide assistance for dental emergencies?",
    answer: null,
    askedBy: "anonymous",
    date: "2025-05-12",
    status: "pending"
  },
  {
    id: 5,
    question: "How often can I request assistance?",
    answer: "Eligible applicants can request assistance once every 90 days. This cooling-off period helps ensure we can distribute aid to as many people as possible. However, exceptions may be made for critical emergencies - please contact support directly in these cases.",
    askedBy: "user789",
    date: "2025-05-11",
    status: "answered"
  },
];

const AdminSupportNetwork = () => {
  const [resources, setResources] = useState(mockResources);
  const [questions, setQuestions] = useState(mockQuestions);
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const { toast } = useToast();

  const resourceForm = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "article",
      category: "general",
      url: "",
    },
  });

  const answerForm = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      answer: "",
    },
  });

  const filteredResources = resources.filter(resource => 
    resourceSearchTerm === '' || 
    resource.title.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(resourceSearchTerm.toLowerCase())
  );

  const filteredQuestions = questions.filter(question => 
    questionSearchTerm === '' || 
    question.question.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
    (question.answer && question.answer.toLowerCase().includes(questionSearchTerm.toLowerCase()))
  );

  const handleAddResource = (values: z.infer<typeof resourceFormSchema>) => {
    const newResource = {
      id: resources.length + 1,
      title: values.title,
      description: values.description,
      type: values.type,
      category: values.category,
      url: values.url,
      date: new Date().toISOString().split('T')[0],
      downloads: 0,
    };
    
    setResources([...resources, newResource]);
    toast({
      title: "Resource added",
      description: "The resource has been added to the library.",
    });
    setIsAddResourceDialogOpen(false);
    resourceForm.reset();
  };

  const handleEditResource = (values: z.infer<typeof resourceFormSchema>) => {
    if (selectedResource) {
      const updatedResources = resources.map(resource => 
        resource.id === selectedResource.id 
          ? { 
              ...resource, 
              title: values.title,
              description: values.description,
              type: values.type,
              category: values.category,
              url: values.url,
            } 
          : resource
      );
      
      setResources(updatedResources);
      toast({
        title: "Resource updated",
        description: "The resource has been successfully updated.",
      });
      setIsEditResourceDialogOpen(false);
      setSelectedResource(null);
    }
  };

  const handleAnswerQuestion = (values: z.infer<typeof answerFormSchema>) => {
    if (selectedQuestion) {
      const updatedQuestions = questions.map(question => 
        question.id === selectedQuestion.id 
          ? { 
              ...question, 
              answer: values.answer,
              status: "answered"
            } 
          : question
      );
      
      setQuestions(updatedQuestions);
      toast({
        title: "Question answered",
        description: "Your answer has been published to the support network.",
      });
      setIsAnswerDialogOpen(false);
      setSelectedQuestion(null);
      answerForm.reset();
    }
  };

  const handleDeleteResource = (id: number) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    setResources(updatedResources);
    toast({
      title: "Resource deleted",
      description: "The resource has been removed from the library.",
    });
  };

  const openEditResourceDialog = (resource: any) => {
    setSelectedResource(resource);
    resourceForm.reset({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      url: resource.url,
    });
    setIsEditResourceDialogOpen(true);
  };

  const openAnswerDialog = (question: any) => {
    setSelectedQuestion(question);
    if (question.answer) {
      answerForm.reset({ answer: question.answer });
    } else {
      answerForm.reset({ answer: "" });
    }
    setIsAnswerDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch(category) {
      case 'housing':
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

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'video':
        return 'bg-black text-white';
      case 'pdf':
        return 'bg-gray-700 text-white';
      case 'article':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-black';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'article':
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Network</h1>
        <p className="text-muted-foreground">
          Manage resources and Q&A for verified applicants
        </p>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resources">Resource Hub</TabsTrigger>
          <TabsTrigger value="questions">Q&A</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources"
                className="pl-8"
                value={resourceSearchTerm}
                onChange={(e) => setResourceSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddResourceDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Library</CardTitle>
              <CardDescription>
                Educational content for applicants to understand the assistance process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getTypeIcon(resource.type)}
                          <span className="ml-2">{resource.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeColor(resource.type)}`}>
                          {resource.type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadgeColor(resource.category)}`}>
                          {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{resource.date}</TableCell>
                      <TableCell>{resource.downloads}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditResourceDialog(resource)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteResource(resource.id)}>
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
                Showing {filteredResources.length} of {resources.length} resources
              </div>
              <div className="text-xs text-muted-foreground">
                Total downloads: {resources.reduce((sum, resource) => sum + resource.downloads, 0)}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4 mt-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions"
              className="pl-8"
              value={questionSearchTerm}
              onChange={(e) => setQuestionSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Q&A</CardTitle>
              <CardDescription>
                Questions from verified applicants and their answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-base">{question.question}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Asked by {question.askedBy === 'anonymous' ? 'Anonymous' : question.askedBy} on {question.date}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${question.status === 'answered' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {question.status === 'answered' ? 'Answered' : 'Pending'}
                      </span>
                    </div>
                    
                    {question.answer ? (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <p className="text-sm">{question.answer}</p>
                      </div>
                    ) : (
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" onClick={() => openAnswerDialog(question)}>
                          <Send className="mr-2 h-4 w-4" />
                          Answer Question
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                Showing {filteredQuestions.length} of {questions.length} questions
              </div>
              <div className="text-xs text-muted-foreground">
                {questions.filter(q => q.status === 'answered').length} answered · {questions.filter(q => q.status === 'pending').length} pending
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Add educational content to the Resource Hub for applicants.
            </DialogDescription>
          </DialogHeader>
          <Form {...resourceForm}>
            <form onSubmit={resourceForm.handleSubmit(handleAddResource)} className="space-y-4">
              <FormField
                control={resourceForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Housing Assistance Guide" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resourceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A comprehensive guide to applying for housing assistance..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={resourceForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a resource type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resourceForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="housing">Housing</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={resourceForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/resource" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to the resource file or webpage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddResourceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Resource</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditResourceDialogOpen} onOpenChange={setIsEditResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update the details of this resource.
            </DialogDescription>
          </DialogHeader>
          <Form {...resourceForm}>
            <form onSubmit={resourceForm.handleSubmit(handleEditResource)} className="space-y-4">
              <FormField
                control={resourceForm.control}
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
                control={resourceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={resourceForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a resource type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resourceForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="housing">Housing</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={resourceForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditResourceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Resource</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Answer Question Dialog */}
      <Dialog open={isAnswerDialogOpen} onOpenChange={setIsAnswerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
            <DialogDescription>
              Provide an answer to the community question.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{selectedQuestion.question}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Asked by {selectedQuestion.askedBy === 'anonymous' ? 'Anonymous' : selectedQuestion.askedBy} on {selectedQuestion.date}
              </p>
            </div>
          )}
          <Form {...answerForm}>
            <form onSubmit={answerForm.handleSubmit(handleAnswerQuestion)} className="space-y-4">
              <FormField
                control={answerForm.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a clear and helpful answer..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a comprehensive answer that addresses the question directly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAnswerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Answer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupportNetwork;
