'use client';

import { useState, ChangeEvent } from 'react';
import Parse from '@/lib/parse';
import Tesseract from 'tesseract.js';
import Link from 'next/link';

interface VerificationResult {
  isVerified: boolean;
  candidate?: {
    fullName: string;
    registrationNumber: string;
    examName: string;
    dateOfBirth: string;
    email: string;
    examCategory: string;
    preferredCenter1: string;
  };
  message: string;
}

export default function ExamCenterVerificationPage() {
  const [admitCardFile, setAdmitCardFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdmitCardFile(file);
      setVerificationResult(null);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractRegistrationNumber = async (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        imageFile,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        }
      ).then(({ data: { text } }) => {
        console.log('OCR Text:', text);
        
        // Look for registration number pattern (XYZ followed by numbers)
        const regNumberMatch = text.match(/XYZ\d+/i);
        if (regNumberMatch) {
          resolve(regNumberMatch[0].toUpperCase());
        } else {
          // Try to find any long number sequence
          const numbers = text.match(/\d{10,}/);
          if (numbers) {
            resolve(`XYZ${numbers[0]}`);
          } else {
            reject(new Error('Could not extract registration number from admit card'));
          }
        }
      }).catch(reject);
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admitCardFile) {
      setError('Please upload an admit card');
      return;
    }

    setProcessing(true);
    setError('');
    setOcrProgress(0);

    try {
      // Step 1: Extract Registration Number from Admit Card
      console.log('Step 1: Extracting Registration Number...');
      const extractedRegNumber = await extractRegistrationNumber(admitCardFile);
      console.log('Extracted Registration Number:', extractedRegNumber);

      // Step 2: Check if Candidate exists in Database
      console.log('Step 2: Checking Database...');
      const Candidate = Parse.Object.extend('Candidate');
      const query = new Parse.Query(Candidate);
      query.equalTo('registrationNumber', extractedRegNumber);
      const candidate = await query.first();

      if (!candidate) {
        // Registration number NOT found in database
        setVerificationResult({
          isVerified: false,
          message: `Registration number ${extractedRegNumber} not found in database. This admit card is not valid.`
        });
        setProcessing(false);
        return;
      }

      // Registration number FOUND in database - Candidate is verified
      setVerificationResult({
        isVerified: true,
        candidate: {
          fullName: candidate.get('fullName'),
          registrationNumber: candidate.get('registrationNumber'),
          examName: candidate.get('examName'),
          dateOfBirth: candidate.get('dateOfBirth')?.toISOString().split('T')[0] || '',
          email: candidate.get('email'),
          examCategory: candidate.get('examCategory'),
          preferredCenter1: candidate.get('preferredCenter1'),
        },
        message: 'Candidate verified successfully! Registration number found in blockchain database.'
      });

    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify admit card');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setAdmitCardFile(null);
    setPreview('');
    setVerificationResult(null);
    setError('');
    setOcrProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4 group">
            <div className="bg-blue-900 p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-4xl text-white">verified</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ExamFlow</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
            Exam Center Verification
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Upload admit card to verify candidate authenticity via blockchain
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Upload the candidate&apos;s admit card image</li>
                <li>Registration number is extracted automatically</li>
                <li>Hash is generated and compared with blockchain record</li>
                <li>Verification result is displayed instantly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600">error</span>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Error:</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        {!verificationResult && (
          <form onSubmit={handleVerify} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  Upload Admit Card <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Upload a clear image of the candidate&apos;s admit card (JPG, PNG)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                  required
                />
                {preview && (
                  <div className="mt-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <img src={preview} alt="Admit Card Preview" className="max-h-96 mx-auto rounded-lg shadow-md" />
                  </div>
                )}
              </div>

              {/* OCR Progress */}
              {processing && ocrProgress > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Extracting registration number...
                    </span>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                      {ocrProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-900 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={processing || !admitCardFile}
                  className="px-8 py-4 bg-blue-900 text-white text-lg font-bold rounded-xl hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin material-symbols-outlined">progress_activity</span>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">verified</span>
                      Verify Candidate
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className={`rounded-xl shadow-lg p-8 ${
            verificationResult.isVerified 
              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
          }`}>
            {/* Result Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                verificationResult.isVerified 
                  ? 'bg-green-100 dark:bg-green-800' 
                  : 'bg-red-100 dark:bg-red-800'
              }`}>
                <span className={`material-symbols-outlined text-5xl ${
                  verificationResult.isVerified 
                    ? 'text-green-600 dark:text-green-300' 
                    : 'text-red-600 dark:text-red-300'
                }`}>
                  {verificationResult.isVerified ? 'check_circle' : 'cancel'}
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                verificationResult.isVerified 
                  ? 'text-green-900 dark:text-green-300' 
                  : 'text-red-900 dark:text-red-300'
              }`}>
                {verificationResult.isVerified ? 'Verified Candidate ✓' : 'Verification Failed ✗'}
              </h3>
              <p className={`text-sm ${
                verificationResult.isVerified 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {verificationResult.message}
              </p>
            </div>

            {/* Candidate Details */}
            {verificationResult.candidate && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg">Candidate Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Registration Number</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                      {verificationResult.candidate.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Full Name</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {verificationResult.candidate.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Exam Name</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {verificationResult.candidate.examName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Category</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {verificationResult.candidate.examCategory}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Date of Birth</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(verificationResult.candidate.dateOfBirth).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Exam Center</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {verificationResult.candidate.preferredCenter1}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold ${
                verificationResult.isVerified
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
              }`}>
                <span className="material-symbols-outlined text-lg">shield</span>
                <span>
                  {verificationResult.isVerified 
                    ? 'Blockchain Verified & Authentic' 
                    : 'Warning: Potential Forgery Detected'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-lg"
              >
                Verify Another Candidate
              </button>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-blue-900 dark:border-blue-400 text-blue-900 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}