
import React from 'react';
import { Applicant } from '@/data/mockApplicants';

interface ApplicantsTableProps {
  applicants: Applicant[];
  selectedApplicant: Applicant;
  onSelectApplicant: (applicant: Applicant) => void;
}

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({ 
  applicants, 
  selectedApplicant, 
  onSelectApplicant 
}) => {
  return (
    <table className="admin-table w-full">
      <thead>
        <tr>
          <th className="text-sm font-medium tracking-wide">Name</th>
          <th className="text-sm font-medium tracking-wide">Date of Birth</th>
          <th className="text-sm font-medium tracking-wide">Address</th>
          <th className="text-sm font-medium tracking-wide">Status</th>
        </tr>
      </thead>
      <tbody>
        {applicants.map((applicant) => (
          <tr 
            key={applicant.id}
            onClick={() => onSelectApplicant(applicant)}
            className={`cursor-pointer hover:bg-gray-50 ${selectedApplicant.id === applicant.id ? 'bg-gray-50' : ''}`}
          >
            <td className="font-medium">{applicant.name}</td>
            <td className="font-normal">{applicant.dob}</td>
            <td className="font-normal">{applicant.address}</td>
            <td>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                applicant.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                applicant.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                applicant.status === 'Approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {applicant.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApplicantsTable;
