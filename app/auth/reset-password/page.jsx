import { Suspense } from 'react';
import ResetPassword from '@/pages/ResetPassword';

function ResetPasswordContent() {
  return <ResetPassword />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

