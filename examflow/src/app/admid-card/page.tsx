'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Parse from '@/lib/parse';
import { CandidateData } from '@/types/candidate';

function AdmitCardContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('id');
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      const Candidate = Parse.Object.extend('Candidate');
      const query = new Parse.Query(Candidate);
      const result = await query.get(candidateId as string);
      
      // Update admit card status
      result.set('admitCardGenerated', true);
      await result.save();
      
      setCandidate({
        id: result.id!,
        registrationNumber: result.get('registrationNumber'),
        fullName: result.get('fullName'),
        fatherName: result.get('fatherName'),
        dateOfBirth: result.get('dateOfBirth'),
        examName: result.get('examName'),
        examCategory: result.get('examCategory'),
        assignedCenter: result.get('preferredCenter1'),
        examDate: '15th December 2025',
        reportingTime: '9:00 AM',
        registrationHash: result.get('registrationHash'),
        photoURL: result.get('photoURL'),
        blockchainId: result.id!
      });
      
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAdmitCard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your admit card...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Candidate not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-navy-900 border border-navy-900 rounded-lg hover:bg-navy-50"
          >
            ← Back
          </button>
          <button
            onClick={downloadAdmitCard}
            className="px-6 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
          >
            Download Admit Card
          </button>
        </div>
      </div>

      {/* Admit Card */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
        
        {/* Header */}
        <div className="bg-navy-900 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">ExamFlow - Admit Card</h1>
          <p className="text-navy-200">{candidate.examName}</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          
          {/* Candidate Photo and Basic Info */}
          <div className="flex gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-200 border-2 border-gray-300 rounded">
                {candidate.photoURL ? (
                  <img src={candidate.photoURL} alt="Candidate" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Photo
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Registration Number</p>
                  <p className="font-bold text-lg">{candidate.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Candidate Name</p>
                  <p className="font-bold">{candidate.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Father&apos;s Name</p>
                  <p className="font-semibold">{candidate.fatherName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold">
                    {new Date(candidate.dateOfBirth).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{candidate.examCategory}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* Exam Details */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-navy-900">Exam Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Exam Center</p>
                <p className="font-semibold">{candidate.assignedCenter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Exam Date</p>
                <p className="font-semibold">{candidate.examDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reporting Time</p>
                <p className="font-semibold">{candidate.reportingTime}</p>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* Blockchain Verification */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-navy-900">Blockchain Verification</h3>
            <p className="text-xs text-gray-600 mb-2">
              This admit card is secured on blockchain. Verify authenticity at examflow.xyz/verify
            </p>
            <div className="bg-white p-2 rounded border border-gray-200">
              <p className="text-xs font-mono break-all text-gray-700">
                Hash: {candidate.registrationHash}
              </p>
              <p className="text-xs font-mono text-gray-700 mt-1">
                Blockchain ID: {candidate.blockchainId}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-navy-900">Important Instructions</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Bring this admit card and a valid photo ID to the exam center</li>
              <li>Report at the center 30 minutes before the exam start time</li>
              <li>Electronic devices are strictly prohibited</li>
              <li>Verification can be done using the blockchain hash provided above</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p>This is a computer-generated admit card and does not require a signature</p>
          <p className="mt-1">Secured by ExamFlow Blockchain Technology</p>
        </div>

      </div>
    </div>
  );
}

export default function AdmitCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdmitCardContent />
    </Suspense>
  );
}
