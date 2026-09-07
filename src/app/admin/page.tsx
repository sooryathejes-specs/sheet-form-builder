import React from 'react';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | SheetForm',
  description: 'Manage forms, edit fields configurations, and view spreadsheet response logs.',
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
