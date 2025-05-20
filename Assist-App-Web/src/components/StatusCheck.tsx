
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Award, AlertCircle } from 'lucide-react';

type Status = 'pending' | 'verified' | 'selected' | 'rejected';

interface StatusCheckProps {
  status: Status;
}

const StatusCheck = ({ status = 'pending' }: StatusCheckProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Application Under Review',
          description: 'Your documents are currently being verified. This usually takes 1-3 business days.',
          icon: <Clock className="h-12 w-12 text-yellow-500" />,
          badgeClass: 'status-badge status-badge-pending'
        };
      case 'verified':
        return {
          title: 'Application Verified',
          description: "Your documents have been verified. You're now eligible for selection.",
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          badgeClass: 'status-badge status-badge-verified'
        };
      case 'selected':
        return {
          title: 'Selected for Assistance',
          description: "Congratulations! You've been selected to receive financial assistance.",
          icon: <Award className="h-12 w-12 text-purple-500" />,
          badgeClass: 'status-badge status-badge-selected'
        };
      case 'rejected':
        return {
          title: 'Application Needs Attention',
          description: 'There was an issue with your application. Please contact support for details.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          badgeClass: 'status-badge status-badge-rejected'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex items-center">
        <div className="mb-4">
          {statusInfo.icon}
        </div>
        <CardTitle className="text-center">{statusInfo.title}</CardTitle>
        <div className="mt-2">
          <span className={statusInfo.badgeClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <CardDescription className="text-center mt-2">
          {statusInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Application ID</span>
            <span className="font-medium">APPL-123456</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Submission Date</span>
            <span className="font-medium">May 15, 2025</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Last Updated</span>
            <span className="font-medium">May 15, 2025</span>
          </div>
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500">
              Questions? Contact <span className="text-uplift-primary font-medium">support@uplift.org</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCheck;
