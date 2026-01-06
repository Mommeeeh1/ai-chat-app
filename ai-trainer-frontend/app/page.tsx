'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Title */}
        <h1 className="text-6xl font-bold text-gray-900">
          AI Personal Trainer
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your personalized fitness companion powered by AI. 
          Get custom workout plans, nutrition advice, and real-time coaching.
        </p>
        
        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Get Started
          </button>
          </Link>
          <Link href="/login">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition">
              Login
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
