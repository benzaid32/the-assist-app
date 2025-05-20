
// Mock applicant data for the admin dashboard
export interface Applicant {
  id: string;
  name: string;
  dob: string;
  address: string;
  status: string;
  documents?: {
    id?: {
      url: string;
      name: string;
    };
    bill?: {
      url: string;
      name: string;
    };
  };
  ssn?: string;
}

export const mockApplicants: Applicant[] = [
  { 
    id: 'APPL-123456', 
    name: 'Laura Parker', 
    dob: '04/12/1980', 
    address: 'Mar 3, Los Angeles, CA', 
    status: 'Submitted',
    documents: {
      id: { url: '/placeholder.svg', name: 'ID Card' },
      bill: { url: 'document.pdf', name: 'Utility Bill' }
    }
  },
  { 
    id: 'APPL-123457', 
    name: 'James Smith', 
    dob: '00/21/1975', 
    address: '456 Elm St', 
    status: 'Submitted' 
  },
  { 
    id: 'APPL-123458', 
    name: 'Sarah Johnson', 
    dob: '11/15/1888', 
    address: '789 Maple Ave', 
    status: 'In Review' 
  },
  { 
    id: 'APPL-123459', 
    name: 'Michael Brown', 
    dob: '06/30/1969', 
    address: '321 Pine St', 
    status: 'Submitted' 
  },
];
