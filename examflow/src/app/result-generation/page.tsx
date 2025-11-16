'use client';

import { useState, ChangeEvent } from 'react';
import Parse from '@/lib/parse';
import Tesseract from 'tesseract.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ResultData {
  registrationNumber: string;
  candidateName: string;
  examName: string;
  dateOfBirth: string;
  examCategory: string;
  candidateAnswerString: string;
  correctAnswerString: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  score: number;
  percentage: number;
}

export default function ResultGenerationPage() {
  const [admitCardFile, setAdmitCardFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdmitCardFile(file);
      setResult(null);
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
        const regNumberMatch = text.match(/XYZ\d+/i);
        if (regNumberMatch) {
          resolve(regNumberMatch[0].toUpperCase());
        } else {
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

  const compareAnswers = (candidateAnswer: string, correctAnswer: string) => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    const minLength = Math.min(candidateAnswer.length, correctAnswer.length);

    for (let i = 0; i < minLength; i++) {
      const candidate = candidateAnswer[i];
      const correct_ans = correctAnswer[i];

      if (candidate === '-' || candidate === ' ') {
        unattempted++;
      } else if (candidate === correct_ans) {
        correct++;
      } else {
        wrong++;
      }
    }

    return { correct, wrong, unattempted };
  };

  const handleGenerateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admitCardFile) {
      setError('Please upload an admit card');
      return;
    }

    setProcessing(true);
    setError('');
    setOcrProgress(0);

    try {
      // Step 1: Extract Registration Number
      const extractedRegNumber = await extractRegistrationNumber(admitCardFile);
      console.log('Registration Number:', extractedRegNumber);

      // Step 2: Find Candidate
      const Candidate = Parse.Object.extend('Candidate');
      const candidateQuery = new Parse.Query(Candidate);
      candidateQuery.equalTo('registrationNumber', extractedRegNumber);
      const candidate = await candidateQuery.first();

      if (!candidate) {
        throw new Error(`No candidate found with registration number: ${extractedRegNumber}`);
      }

      // Step 3: Get Candidate's OMR Result
      const ExamResult = Parse.Object.extend('ExamResult');
      const examResultQuery = new Parse.Query(ExamResult);
      examResultQuery.equalTo('registrationNumber', extractedRegNumber);
      const examResult = await examResultQuery.first();

      if (!examResult) {
        throw new Error('No exam result found for this candidate. Please process OMR sheet first.');
      }

      const candidateAnswerString = examResult.get('answerString');

      // Step 4: Get Answer Key
      const AnswerKey = Parse.Object.extend('AnswerKey');
      const answerKeyQuery = new Parse.Query(AnswerKey);
      answerKeyQuery.equalTo('examName', candidate.get('examName'));
      answerKeyQuery.equalTo('status', 'active');
      const answerKey = await answerKeyQuery.first();

      if (!answerKey) {
        throw new Error('No answer key found for this exam.');
      }

      const correctAnswerString = answerKey.get('answerString');
      const totalQuestions = answerKey.get('totalQuestions');

      // Step 5: Compare Answers
      const { correct, wrong, unattempted } = compareAnswers(
        candidateAnswerString,
        correctAnswerString
      );

      const score = correct;
      const percentage = (correct / totalQuestions) * 100;

      // Step 6: Prepare Result Data
      const resultData: ResultData = {
        registrationNumber: extractedRegNumber,
        candidateName: candidate.get('fullName'),
        examName: candidate.get('examName'),
        dateOfBirth: candidate.get('dateOfBirth')?.toISOString().split('T')[0] || '',
        examCategory: candidate.get('examCategory'),
        candidateAnswerString,
        correctAnswerString,
        totalQuestions,
        correctAnswers: correct,
        wrongAnswers: wrong,
        unattempted,
        score,
        percentage,
      };

      // Step 7: Store Final Result
      const FinalResult = Parse.Object.extend('FinalResult');
      const finalResult = new FinalResult();

      finalResult.set('registrationNumber', extractedRegNumber);
      finalResult.set('candidateId', candidate.id);
      finalResult.set('candidateName', candidate.get('fullName'));
      finalResult.set('examName', candidate.get('examName'));
      finalResult.set('totalQuestions', totalQuestions);
      finalResult.set('correctAnswers', correct);
      finalResult.set('wrongAnswers', wrong);
      finalResult.set('unattempted', unattempted);
      finalResult.set('score', score);
      finalResult.set('percentage', percentage);
      finalResult.set('status', 'published');
      finalResult.set('generatedAt', new Date());

      await finalResult.save();

      console.log('✅ Result generated and saved!');
      setResult(resultData);

    } catch (err) {
      console.error('Result generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate result');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setAdmitCardFile(null);
    setPreview('');
    setResult(null);
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
              <span className="material-symbols-outlined text-4xl text-white">assessment</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ExamFlow</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
            Generate Result
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Upload admit card to generate and view exam result
          </p>
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
        {!result && (
          <form onSubmit={handleGenerateResult} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  Upload Admit Card <span className="text-red-500">*</span>
                </label>
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
                      Processing...
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
                      Generating Result...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">calculate</span>
                      Generate Result
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl shadow-2xl p-8 text-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4">
                  <span className="material-symbols-outlined text-6xl">emoji_events</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">{result.candidateName}</h3>
                <p className="text-blue-100 mb-6">{result.registrationNumber}</p>
                
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-blue-100 text-sm mb-1">Score</p>
                    <p className="text-4xl font-bold">{result.score}/{result.totalQuestions}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-blue-100 text-sm mb-1">Percentage</p>
                    <p className="text-4xl font-bold">{result.percentage.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Detailed Analysis</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 text-center">
                  <p className="text-green-600 dark:text-green-400 font-semibold mb-1">Correct</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{result.correctAnswers}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
                  <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Wrong</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">{result.wrongAnswers}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-center">
                  <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Unattempted</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{result.unattempted}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Exam Name</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{result.examName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Category</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{result.examCategory}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date of Birth</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(result.dateOfBirth).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-lg"
              >
                Generate Another Result
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