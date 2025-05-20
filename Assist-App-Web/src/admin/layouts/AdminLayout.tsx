
import React, { useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset
} from '@/components/ui/sidebar';
import { Users, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/admin/context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  useEffect(() => {
    // Set page title based on current route
    const path = location.pathname.split('/').pop() || 'dashboard';
    const title = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = `Assist App Admin | ${title}`;
  }, [location]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <Sidebar className="bg-[#1F2937] text-white">
          <SidebarHeader>
            <div className="p-5">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 text-xs uppercase px-5 py-2">ADMIN PANEL</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/admin'} className="px-5 py-3 hover:bg-gray-800">
                      <Link to="/admin">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/admin/applicants'} className="px-5 py-3 hover:bg-gray-800">
                      <Link to="/admin/applicants">
                        <Users className="h-5 w-5" />
                        <span>Applicants</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/admin/payments'} className="px-5 py-3 hover:bg-gray-800">
                      <Link to="/admin/payments">
                        <FileText className="h-5 w-5" />
                        <span>Payments</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-5 border-t border-gray-700">
              <Button variant="outline" className="w-full bg-transparent border-gray-600 text-white hover:bg-gray-800 hover:text-white" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div></div>
              <div className="flex items-center gap-4">
                <span className="text-base font-medium">Admin</span>
              </div>
            </div>
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
