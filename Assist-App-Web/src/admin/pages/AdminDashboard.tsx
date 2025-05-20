
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, CheckCircle, DollarSign, Heart, MessageCircle, FileText, BarChart4, Map, UserCheck } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/admin/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Mock data for charts
const monthlyData = [
  { month: 'Jan', donations: 4200, applicants: 42 },
  { month: 'Feb', donations: 5800, applicants: 53 },
  { month: 'Mar', donations: 6700, applicants: 62 },
  { month: 'Apr', donations: 8200, applicants: 78 },
  { month: 'May', donations: 9000, applicants: 92 }
];

// Donation categories data
const donationCategoryData = [
  { name: 'One-time donors', value: 430 },
  { name: 'Regular donors', value: 210 },
];

// Community engagement data
const communityData = [
  { name: 'Donor Circle', value: 640, color: '#000000' },
  { name: 'Support Network', value: 248, color: '#666666' },
];

const COLORS = ['#000000', '#666666', '#999999', '#cccccc'];

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for the dashboard
  const stats = [
    {
      title: 'Total Donors',
      value: '640',
      icon: <Heart className="h-8 w-8 text-black" />,
      description: '12% increase this month'
    },
    {
      title: 'Verified Applicants',
      value: '248',
      icon: <UserCheck className="h-8 w-8 text-black" />,
      description: '18 new this week'
    },
    {
      title: 'Funds Raised',
      value: '$24,500',
      icon: <DollarSign className="h-8 w-8 text-black" />,
      description: 'Monthly goal: $25,000 (98%)'
    },
    {
      title: 'Assistance Provided',
      value: '86',
      icon: <CheckCircle className="h-8 w-8 text-black" />,
      description: 'Recipients this month'
    },
  ];

  // Mock data for donor feed content
  const donorFeedItems = [
    { id: 1, title: "Helped Pay Rent for Family", location: "Chicago, IL", views: 145 },
    { id: 2, title: "Provided 100 Meals to Food Bank", location: "Dallas, TX", views: 98 },
    { id: 3, title: "Supported Medical Bills for Child", location: "Miami, FL", views: 210 },
    { id: 4, title: "Assisted with Utility Bills", location: "Boston, MA", views: 87 },
  ];

  // Mock data for resource hub content
  const resourceHubItems = [
    { id: 1, title: "How Verification Works", type: "video", downloads: 78 },
    { id: 2, title: "Housing Assistance Guide", type: "pdf", downloads: 124 },
    { id: 3, title: "Utility Bill Support FAQ", type: "article", downloads: 96 },
    { id: 4, title: "Medical Expense Application", type: "pdf", downloads: 113 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's what's happening with the Assist App communities today
        </p>
      </div>

      {/* Monthly goal progress */}
      <Card className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Donation Goal</span>
            <span className="text-sm font-medium">$24,500/$25,000</span>
          </div>
          <Progress value={98} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>98% Complete</span>
            <span>10 days remaining</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donor-circle">Donor Circle</TabsTrigger>
          <TabsTrigger value="support-network">Support Network</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>
                  Donations and applicant trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="#000000" />
                      <YAxis yAxisId="right" orientation="right" stroke="#666666" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="donations" fill="#000000" name="Donations ($)" />
                      <Bar yAxisId="right" dataKey="applicants" fill="#666666" name="Applicants" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Community Breakdown</CardTitle>
                <CardDescription>
                  Distribution across our two communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={communityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {communityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions across both communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      i % 4 === 0 ? 'bg-black' : 
                      i % 4 === 1 ? 'bg-black' : 
                      i % 4 === 2 ? 'bg-gray-500' :
                      'bg-gray-700'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {i % 4 === 0 ? 'New donation received' : 
                         i % 4 === 1 ? 'Impact story approved' : 
                         i % 4 === 2 ? 'New application verified' :
                         'Resource added to hub'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? '2 minutes ago' : 
                         i === 1 ? '45 minutes ago' : 
                         i === 2 ? '2 hours ago' : 
                         i === 3 ? 'Yesterday' : 
                         '2 days ago'}
                      </p>
                    </div>
                    <div className="text-xs text-right">
                      <p className="font-medium">
                        {i % 4 === 0 ? '$25.00' : 
                         i % 4 === 1 ? 'Chicago, IL' : 
                         i % 4 === 2 ? 'Sarah Smith' :
                         'Housing Guide'}
                      </p>
                      <p className="text-muted-foreground">
                        {i % 4 === 0 ? 'One-time donor' : 
                         i % 4 === 1 ? 'Rent assistance' : 
                         i % 4 === 2 ? 'Medical assistance' :
                         'PDF document'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="donor-circle" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Donor Feed Content</CardTitle>
                  <Button size="sm" variant="outline">Add New Story</Button>
                </div>
                <CardDescription>
                  Manage impact stories shown to donors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donorFeedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.location} · {item.views} views</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="icon" variant="ghost"><FileText className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost"><MessageCircle className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">View All Stories</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Donor Insights</CardTitle>
                <CardDescription>
                  Donation patterns and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donationCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {donationCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Donation</span>
                    <span className="font-medium">$38.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Repeat Donors</span>
                    <span className="font-medium">38%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Donor Retention</span>
                    <span className="font-medium">72%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="support-network" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resource Hub</CardTitle>
                  <Button size="sm" variant="outline">Upload Resource</Button>
                </div>
                <CardDescription>
                  Educational content for applicants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceHubItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type.toUpperCase()} · {item.downloads} downloads
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="icon" variant="ghost"><FileText className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost"><Users className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">Manage All Resources</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Verification Queue</CardTitle>
                <CardDescription>
                  Pending applicant verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{[
                          "Maria Garcia",
                          "James Wilson",
                          "Emily Johnson",
                          "David Robinson"
                        ][i]}</p>
                        <p className="text-xs text-muted-foreground">
                          {[
                            "Housing assistance",
                            "Medical expenses",
                            "Utility bills",
                            "Food assistance"
                          ][i]} · Submitted {[
                            "2h",
                            "6h",
                            "1d",
                            "2d"
                          ][i]} ago
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <Button variant="outline">View All Applications</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
