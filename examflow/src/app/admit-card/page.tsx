'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Parse from '@/lib/parse';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CandidateData {
  id: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  examName: string;
  examCategory: string;
  qualification: string;
  passingYear: string;
  percentage: number;
  preferredCenter1: string;
  aadharNumber: string;
  registrationNumber: string;
  registrationHash: string;
  photoURL?: string;
}

function AdmitCardContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('id');
  const admitCardRef = useRef<HTMLDivElement>(null);
  
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      const Candidate = Parse.Object.extend('Candidate');
      const query = new Parse.Query(Candidate);
      const result = await query.get(candidateId!);

      const candidateData: CandidateData = {
        id: result.id!,
        fullName: result.get('fullName'),
        fatherName: result.get('fatherName'),
        motherName: result.get('motherName'),
        dateOfBirth: result.get('dateOfBirth')?.toISOString().split('T')[0] || '',
        gender: result.get('gender'),
        email: result.get('email'),
        phone: result.get('phone'),
        city: result.get('city'),
        state: result.get('state'),
        pincode: result.get('pincode'),
        examName: result.get('examName'),
        examCategory: result.get('examCategory'),
        qualification: result.get('qualification'),
        passingYear: result.get('passingYear'),
        percentage: result.get('percentage'),
        preferredCenter1: result.get('preferredCenter1'),
        aadharNumber: result.get('aadharNumber'),
        registrationNumber: result.get('registrationNumber'),
        registrationHash: result.get('registrationHash'),
        photoURL: result.get('photoURL'),
      };

      setCandidate(candidateData);

      // Generate QR code with the registration hash
      const qrData = JSON.stringify({
        regNumber: candidateData.registrationNumber,
        hash: candidateData.registrationHash,
        name: candidateData.fullName,
        dob: candidateData.dateOfBirth,
        examName: candidateData.examName,
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setQrCodeUrl(qrUrl);
      
      // Save QR data to localStorage for blockchain integration
      try {
        localStorage.setItem('examflow_qr_data', qrData);
        localStorage.setItem('examflow_registration_hash', candidateData.registrationHash);
        localStorage.setItem('examflow_registration_number', candidateData.registrationNumber);
        console.log('QR data saved to localStorage for blockchain integration');
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!admitCardRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(admitCardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`AdmitCard_${candidate?.registrationNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download admit card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3b8a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admit card...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Candidate not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Action Buttons - Hidden in print */}
      <div className="max-w-4xl mx-auto mb-6 flex gap-4 justify-center print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-[#1e3b8a] text-white font-semibold rounded-lg hover:bg-[#1e3b8a]/90 transition-colors"
        >
          🖨️ Print Admit Card
        </button>
      </div>

      {/* Admit Card */}
      <div ref={admitCardRef} className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <div className="border-4 border-[#1e3b8a] p-6">
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="material-symbols-outlined text-4xl text-[#1e3b8a]">verified</span>
              <h1 className="text-3xl font-black text-[#1e3b8a]">ExamFlow</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{candidate.examName}</h2>
            <p className="text-lg font-semibold text-gray-600 mt-1">ADMIT CARD</p>
            <p className="text-sm text-gray-500 mt-1">Blockchain-Secured Examination System</p>
          </div>

          {/* Candidate Details */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Photo and QR */}
            <div className="col-span-3 flex flex-col gap-4">
              {/* Candidate Photo */}
              <div className="border-2 border-gray-300 p-2">
                {candidate.photoURL ? (
                  <img 
                    src={candidate.photoURL} 
                    alt="Candidate" 
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs text-center">Photo</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="border-2 border-gray-300 p-2">
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-full"
                  />
                )}
                <p className="text-xs text-center text-gray-500 mt-1">Scan to Verify</p>
              </div>
            </div>

            {/* Right Section - Details */}
            <div className="col-span-9">
              {/* Registration Number - Highlighted */}
              <div className="bg-[#1e3b8a] text-white p-3 rounded mb-4">
                <p className="text-sm font-medium">Registration Number</p>
                <p className="text-2xl font-bold">{candidate.registrationNumber}</p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Candidate Name</p>
                  <p className="font-semibold text-gray-800">{candidate.fullName}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Father&apos;s Name</p>
                  <p className="font-semibold text-gray-800">{candidate.fatherName}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Mother&apos;s Name</p>
                  <p className="font-semibold text-gray-800">{candidate.motherName}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Date of Birth</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(candidate.dateOfBirth).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Gender</p>
                  <p className="font-semibold text-gray-800">{candidate.gender}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Category</p>
                  <p className="font-semibold text-gray-800">{candidate.examCategory}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="font-semibold text-gray-800 text-xs">{candidate.email}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Mobile</p>
                  <p className="font-semibold text-gray-800">{candidate.phone}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Qualification</p>
                  <p className="font-semibold text-gray-800">{candidate.qualification}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Percentage</p>
                  <p className="font-semibold text-gray-800">{candidate.percentage}%</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Aadhar Number</p>
                  <p className="font-semibold text-gray-800">
                    {candidate.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '•••• •••• $3')}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Exam Center</p>
                  <p className="font-semibold text-gray-800">{candidate.preferredCenter1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Details Box */}
          <div className="mt-6 border-2 border-gray-300 rounded p-4 bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-3">Examination Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Exam Date</p>
                <p className="font-semibold text-gray-800">15th December 2025</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Reporting Time</p>
                <p className="font-semibold text-gray-800">9:00 AM</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Exam Duration</p>
                <p className="font-semibold text-gray-800">3 Hours</p>
              </div>
            </div>
          </div>

          {/* Important Instructions */}
          <div className="mt-6 border-t-2 border-gray-300 pt-4">
            <h3 className="font-bold text-gray-800 mb-2">Important Instructions:</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Bring this admit card and a valid photo ID to the examination center</li>
              <li>Report at the center at least 30 minutes before the exam start time</li>
              <li>Mobile phones and electronic devices are strictly prohibited</li>
              <li>Candidate must verify their details before the exam date</li>
              <li>This admit card is blockchain-verified and tamper-proof</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300 flex justify-between items-end">
            <div className="text-xs text-gray-500">
              <p className="font-semibold">Verification Hash:</p>
              <p className="font-mono break-all">{candidate.registrationHash.substring(0, 32)}...</p>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-gray-800 pt-1 mt-8 w-40">
                <p className="text-xs text-gray-600 font-medium">Authorized Signature</p>
              </div>
            </div>
          </div>

          {/* Blockchain Badge */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Blockchain Verified & Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdmitCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3b8a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdmitCardContent />
    </Suspense>
  );
}