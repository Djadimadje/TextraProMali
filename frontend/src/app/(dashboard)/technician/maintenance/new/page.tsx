'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import NewTaskForm from '../../../../../../components/maintenance/NewTaskForm';
import Card from '../../../../../../components/ui/Card';

export default function NewMaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card padding="lg">
        <div className="p-4">
          <NewTaskForm onClose={() => router.push('/dashboard/technician/machines')} onCreated={() => router.push('/dashboard/technician/machines')} />
        </div>
      </Card>
    </div>
  );
}
