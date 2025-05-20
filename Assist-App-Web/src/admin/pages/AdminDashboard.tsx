
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, AlertCircle, CheckCircle, DollarSign, Heart } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '@/admin/context/AuthContext';

// Mock data for charts
const monthlyData = [
  { month: 'Jan', donations: 4200, applicants: 42 },
  { month: 'Feb', donations: 5800, applicants: 53 },
  { month: 'Mar', donations: 6700, applicants: 62 },
  { month: 'Apr', donations: 8200, applicants: 78 },
  { month: 'May', donations: 9000, applicants: 92 }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for the dashboard
  const stats = [
    {
      title: 'Total Subscribers',
      value: '1,248',
      icon: <Heart className="h-8 w-8 text-accent" />,
      description: '12% increase this month'
    },
    {
      title: 'Applications',
      value: '248',
      icon: <Users className="h-8 w-8 text-blue-500" />,
      description: '18 new this week'
    },
    {
      title: 'Funds Raised',
      value: '$24,500',
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      description: 'Monthly goal: $50,000'
    },
    {
      title: 'Assistance Provided',
      value: '86',
      icon: <CheckCircle className="h-8 w-8 text-secondary" />,
      description: 'Recipients this month'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's what's happening with the Assist App today
        </p>
      </div>

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
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="donations" fill="#8884d8" name="Donations ($)" />
                  <Bar yAxisId="right" dataKey="applicants" fill="#82ca9d" name="Applicants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest applications and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    i % 3 === 0 ? 'bg-green-500' : 
                    i % 3 === 1 ? 'bg-blue-500' : 
                    'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {i % 3 === 0 ? 'Payment processed' : 
                       i % 3 === 1 ? 'New application received' : 
                       'Application verified'}
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
                      {i % 3 === 0 ? '$500.00' : 
                       i % 3 === 1 ? 'John Doe' : 
                       'Sarah Smith'}
                    </p>
                    <p className="text-muted-foreground">
                      {i % 3 === 0 ? 'Rent assistance' : 
                       i % 3 === 1 ? 'Utilities' : 
                       'Medical'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
