import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-9/12 flex-1 text-center">
        <h1 className="text-6xl font-bold">
          Bergen County Academies National Honor Society
        </h1>

        <div className="flex mt-6">
          <Link href="/signin/student">
            <button className="px-5 py-3 text-lg text-white bg-blue-600 rounded-md">
              Sign-in to receive tutoring
            </button>
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-4">NHS Board Members</h2>
          <ul className="list-disc list-inside">
            <li>President - Jack Haji</li>
            <li>Vice President - Kaitlyn Acevedo</li>
            <li>Secretary - Shlok Jhaveri</li>
            <li>Treasurer - Kieran Chung</li>
            <li>Historian - Rudra Patel</li>
            <li>Tutoring Director - Krish Ramkumar</li>
            <li>Community Service Director - Claire Chang</li>
            <li>Webmaster - Krish Arora</li>
          </ul>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <Link href="/signin/nhs">
          <button className="text-sm text-gray-500">
            NHS Member Sign-in
          </button>
        </Link>
      </footer>
    </div>
  );
}
