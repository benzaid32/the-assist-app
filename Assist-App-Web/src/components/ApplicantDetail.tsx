
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Applicant } from '@/data/mockApplicants';

interface ApplicantDetailProps {
  applicant: Applicant;
  onApprove: () => void;
  onDeny: () => void;
  onFlag: () => void;
}

const ApplicantDetail: React.FC<ApplicantDetailProps> = ({
  applicant,
  onApprove,
  onDeny,
  onFlag
}) => {
  return (
    <div className="border-l border-gray-200 p-8 h-full">
      <h2 className="text-3xl font-bold mb-2">{applicant.name}</h2>
      <p className="text-xl mb-2">{applicant.dob}</p>
      <p className="text-xl mb-8">{applicant.address}</p>

      <div className="space-y-4 mb-8">
        <div>
          <h3 className="font-medium mb-2">ID</h3>
          <div className="border border-gray-200 rounded-md p-4 flex items-center space-x-4">
            {applicant.documents?.id ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                  {applicant.documents.id.url.endsWith('.pdf') ? (
                    <FileText className="h-8 w-8 text-gray-400" />
                  ) : (
                    <img 
                      src={applicant.documents.id.url} 
                      alt="ID" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">D. 224333769</p>
                  <p className="text-sm text-gray-500">10/16/2030</p>
                  <p className="text-sm text-gray-500">Mar 3, Oct. 2024</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No ID document provided</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Utility Bill</h3>
          <div className="border border-gray-200 rounded-md p-4 flex items-center space-x-4">
            {applicant.documents?.bill ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto text-gray-400" />
                    <span className="text-xs font-medium">PDF</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Utility Bill</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No bill document provided</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-8">
        <Button onClick={onApprove} variant="admin-approve">
          Approve
        </Button>
        <Button onClick={onDeny} variant="admin-deny">
          Deny
        </Button>
        <Button onClick={onFlag} variant="admin-flag">
          Flag
        </Button>
      </div>
    </div>
  );
};

export default ApplicantDetail;
