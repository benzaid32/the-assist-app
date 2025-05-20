import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserType } from '../types/auth';

// Types for user data
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserType | string;
  donationHistory?: {
    amount: number;
    date: string;
  }[];
  impactMetrics?: {
    peopleHelped: number;
    totalDonated: number;
    applicantsSupported: number;
  };
  preferences?: {
    notificationSettings: {
      email: boolean;
      push: boolean;
    };
    privacySettings: {
      shareImpactStories: boolean;
      showDonationAmount: boolean;
    };
  };
}

/**
 * Custom hook to fetch and manage user data
 * @returns User data and loading/error states
 */
export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        setUserData(null);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real app, this would be a call to a database or API
        // This is a mock implementation for demonstration purposes
        const mockUserData: UserData = {
          id: user.userId || 'user-123',
          name: user.displayName || 'Demo User',
          email: user.email || 'user@example.com',
          role: (user.userType as UserType) || UserType.SUBSCRIBER,
          donationHistory: [
            { amount: 50, date: '2025-04-15' },
            { amount: 100, date: '2025-03-10' },
            { amount: 75, date: '2025-02-05' },
          ],
          impactMetrics: {
            peopleHelped: 12,
            totalDonated: 225,
            applicantsSupported: 8,
          },
          preferences: {
            notificationSettings: {
              email: true,
              push: true,
            },
            privacySettings: {
              shareImpactStories: true,
              showDonationAmount: false,
            },
          },
        };
        
        // Simulate API delay
        setTimeout(() => {
          setUserData(mockUserData);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const updateUserData = async (updates: Partial<UserData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would update the user data in a database
      // Mock implementation for demonstration
      setTimeout(() => {
        setUserData((prev) => prev ? { ...prev, ...updates } : null);
        setIsLoading(false);
      }, 500);
      
      return true;
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data. Please try again later.');
      setIsLoading(false);
      return false;
    }
  };
  
  return { userData, isLoading, error, updateUserData };
};
