'use client';

import { useState, ChangeEvent } from 'react';
import Parse from '@/lib/parse';
import Tesseract from 'tesseract.js';
import Link from 'next/link';

interface OMRResult {
  name: string;
  roll_number: string;
  version: string;
  answers: Record<string, string | null>;
  answer_string: string;
}

export default function OMRProcessingPage() {
  const [omrFile, setOmrFile] = useState<File | null>(null);
  const [admitCardFile, setAdmitCardFile] = useState<File | null>(null);
  const [omrPreview, setOmrPreview] = useState<string>('');
  const [admitCardPreview, setAdmitCardPreview] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [omrResult, setOmrResult] = useState<OMRResult | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [answerStringHash, setAnswerStringHash] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Hash function using Web Crypto API
  const hashString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleOMRFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOmrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOmrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdmitCardFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdmitCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdmitCardPreview(reader.result as string);
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

  const processOMRSheet = async (file: File): Promise<OMRResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/process-omr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to process OMR sheet');
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!omrFile || !admitCardFile) {
      setError('Please upload both OMR sheet and admit card');
      return;
    }

    setProcessing(true);
    setError('');
    setStep(1);

    try {
      // Step 1: Process OMR Sheet
      console.log('Step 1: Processing OMR Sheet...');
      setStep(1);
      const omrData = await processOMRSheet(omrFile);
      setOmrResult(omrData);
      console.log('OMR Data:', omrData);

      // Step 2: Extract Registration Number from Admit Card
      console.log('Step 2: Extracting Registration Number...');
      setStep(2);
      const extractedRegNumber = await extractRegistrationNumber(admitCardFile);
      setRegistrationNumber(extractedRegNumber);
      console.log('Registration Number:', extractedRegNumber);

      // Step 3: Generate Hash from Answer String
      console.log('Step 3: Generating Hash...');
      setStep(3);
      const hash = await hashString(omrData.answer_string);
      setAnswerStringHash(hash);
      console.log('Answer String Hash:', hash);

      // Step 4: Find Candidate by Registration Number
      console.log('Step 4: Finding Candidate...');
      setStep(4);
      const Candidate = Parse.Object.extend('Candidate');
      const candidateQuery = new Parse.Query(Candidate);
      candidateQuery.equalTo('registrationNumber', extractedRegNumber);
      const candidate = await candidateQuery.first();

      if (!candidate) {
        throw new Error(`No candidate found with registration number: ${extractedRegNumber}`);
      }

      // Step 5: Store Results in Database
      console.log('Step 5: Storing in Database...');
      setStep(5);
      const ExamResult = Parse.Object.extend('ExamResult');
      const examResult = new ExamResult();

      // Link to candidate
      examResult.set('registrationNumber', extractedRegNumber);
      examResult.set('candidateId', candidate.id);
      examResult.set('candidateName', candidate.get('fullName'));
      
      // Store original answer string (simulating IPFS storage)
      examResult.set('answerString', omrData.answer_string);
      
      // Store the hash (for blockchain)
      examResult.set('answerStringHash', hash);
      
      // Store additional OMR data
      examResult.set('omrName', omrData.name);
      examResult.set('omrRollNumber', omrData.roll_number);
      examResult.set('version', omrData.version);
      examResult.set('totalQuestions', Object.keys(omrData.answers).length);
      examResult.set('answeredQuestions', Object.values(omrData.answers).filter(a => a !== null).length);
      
      // Metadata
      examResult.set('processedAt', new Date());
      examResult.set('status', 'secured');

      await examResult.save();

      console.log('✅ Result secured successfully!');
      setStep(6);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process OMR sheet');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setOmrFile(null);
    setAdmitCardFile(null);
    setOmrPreview('');
    setAdmitCardPreview('');
    setOmrResult(null);
    setRegistrationNumber('');
    setAnswerStringHash('');
    setStep(1);
    setOcrProgress(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined text-4xl text-[#1e3b8a]">verified</span>
            <h1 className="text-3xl font-bold text-[#1e3b8a]">ExamFlow</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Secure Exam Results</h2>
          <p className="text-gray-600 mt-2">Upload OMR sheet and admit card to process and secure results on blockchain</p>
        </div>

        {/* Server Status Info */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Local Server Required:</p>
              <p>Make sure your OMR processing server is running:</p>
              <code className="block mt-2 bg-blue-100 p-2 rounded text-xs">
                uvicorn main:app --reload --port 8000
              </code>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
        {!omrResult && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              {/* OMR Sheet Upload */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  1. Upload OMR Sheet <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOMRFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1e3b8a] file:text-white hover:file:bg-[#1e3b8a]/90 cursor-pointer"
                  required
                />
                {omrPreview && (
                  <div className="mt-4 border-2 border-gray-300 rounded-lg p-2">
                    <img src={omrPreview} alt="OMR Preview" className="max-h-64 mx-auto" />
                  </div>
                )}
              </div>

              {/* Admit Card Upload */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  2. Upload Admit Card <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Upload the admit card image to extract the registration number
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdmitCardFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1e3b8a] file:text-white hover:file:bg-[#1e3b8a]/90 cursor-pointer"
                  required
                />
                {admitCardPreview && (
                  <div className="mt-4 border-2 border-gray-300 rounded-lg p-2">
                    <img src={admitCardPreview} alt="Admit Card Preview" className="max-h-64 mx-auto" />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={processing || !omrFile || !admitCardFile}
                  className="px-8 py-3 bg-[#1e3b8a] text-white font-semibold rounded-lg hover:bg-[#1e3b8a]/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Processing...' : 'Process & Secure Results'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Processing Steps */}
        {processing && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Processing Steps</h3>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {step > 1 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="font-medium">Processing OMR Sheet...</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {step > 2 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="font-medium">Extracting Registration Number...</span>
                {step === 2 && ocrProgress > 0 && (
                  <span className="text-sm">({ocrProgress}%)</span>
                )}
              </div>
              <div className={`flex items-center gap-3 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {step > 3 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="font-medium">Generating Hash...</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {step > 4 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="font-medium">Finding Candidate Record...</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {step > 5 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="font-medium">Storing in Database...</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {step >= 6 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="font-medium font-bold">Complete!</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {omrResult && !processing && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              Processing Complete
            </h3>
            
            <div className="space-y-6">
              {/* Registration Number */}
              <div className="bg-[#1e3b8a] text-white p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">Registration Number</p>
                <p className="text-2xl font-bold">{registrationNumber}</p>
              </div>

              {/* OMR Data */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3">OMR Sheet Data</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name on OMR</p>
                    <p className="font-semibold">{omrResult.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Roll Number</p>
                    <p className="font-semibold">{omrResult.roll_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Version</p>
                    <p className="font-semibold">{omrResult.version || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Questions</p>
                    <p className="font-semibold">{Object.keys(omrResult.answers).length}</p>
                  </div>
                </div>
              </div>

              {/* Answer String */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">
                  Answer String (Original)
                  <span className="text-xs text-gray-500 ml-2 font-normal">→ Stored in Database (IPFS in production)</span>
                </h4>
                <p className="font-mono text-sm bg-gray-100 p-3 rounded break-all">
                  {omrResult.answer_string}
                </p>
              </div>

              {/* Hash */}
              <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">
                  Answer String Hash (SHA-256)
                  <span className="text-xs text-green-700 ml-2 font-normal">→ For Blockchain</span>
                </h4>
                <p className="font-mono text-xs break-all text-gray-700 mb-3 bg-white p-3 rounded">
                  {answerStringHash}
                </p>
                <div className="bg-white border border-green-300 rounded p-3 text-xs space-y-1">
                  <p><strong>Registration Number:</strong> {registrationNumber}</p>
                  <p><strong>Answer String:</strong> {omrResult.answer_string}</p>
                  <p><strong>Hash:</strong> {answerStringHash}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-green-700">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span className="text-sm font-semibold">Secured & Ready for Blockchain Integration</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-[#1e3b8a] text-white font-semibold rounded-lg hover:bg-[#1e3b8a]/90 transition-colors"
                >
                  Process Another Sheet
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(answerStringHash);
                    alert('Hash copied to clipboard!');
                  }}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Copy Hash
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-[#1e3b8a] text-[#1e3b8a] font-semibold rounded-lg hover:bg-[#1e3b8a]/10 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}