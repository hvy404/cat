import Link from 'next/link';

export default function CanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Canceled</h1>
        <p className="mb-4">Your payment was canceled. No charges were made.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}