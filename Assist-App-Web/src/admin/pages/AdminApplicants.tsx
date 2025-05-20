
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import ApplicantDetail from '@/components/ApplicantDetail';
import ApplicantsTable from '@/admin/components/ApplicantsTable';
import { mockApplicants } from '@/data/mockApplicants';

const AdminApplicants = () => {
  const [selectedApplicant, setSelectedApplicant] = useState(mockApplicants[0]);
  const { toast } = useToast();
  
  const handleApprove = () => {
    toast({
      title: "Application Approved",
      description: `${selectedApplicant.name}'s application has been approved.`,
    });
  };
  
  const handleDeny = () => {
    toast({
      title: "Application Denied",
      description: `${selectedApplicant.name}'s application has been denied.`,
    });
  };
  
  const handleFlag = () => {
    toast({
      title: "Application Flagged",
      description: `${selectedApplicant.name}'s application has been flagged for review.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selected Applicants</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <ApplicantsTable 
            applicants={mockApplicants}
            selectedApplicant={selectedApplicant}
            onSelectApplicant={setSelectedApplicant}
          />
        </div>
        
        <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
          <ApplicantDetail
            applicant={selectedApplicant}
            onApprove={handleApprove}
            onDeny={handleDeny}
            onFlag={handleFlag}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminApplicants;
