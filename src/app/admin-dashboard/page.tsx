// admin-dashboard/page.tsx
import { Suspense } from 'react';
import AdminDashboard from './AdminDashboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  );
}

