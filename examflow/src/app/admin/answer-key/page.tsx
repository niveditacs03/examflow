'use client';

import { useState } from 'react';
import Parse from '@/lib/parse';
import Link from 'next/link';

export default function AdminAnswerKeyPage() {
  const [examName, setExamName] = useState<string>('XYZ Exam 2025');
  const [totalQuestions, setTotalQuestions] = useState<number>(44);
  const [answerKey, setAnswerKey] = useState<Record<string, string>>({});
  const [answerString, setAnswerString] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAnswerChange = (questionNum: number, option: string) => {
    setAnswerKey(prev => ({
      ...prev,
      [`Q${questionNum}`]: option
    }));
  };

  const generateAnswerString = () => {
    const answers: string[] = [];
    for (let i = 1; i <= totalQuestions; i++) {
      const answer = answerKey[`Q${i}`] || '-';
      answers.push(answer);
    }
    const generated = answers.join('');
    setAnswerString(generated);
  };

  const handleQuickFill = (pattern: 'all-a' | 'all-b' | 'all-c' | 'all-d' | 'random') => {
    const newAnswerKey: Record<string, string> = {};
    const options = ['A', 'B', 'C', 'D'];
    
    for (let i = 1; i <= totalQuestions; i++) {
      if (pattern === 'random') {
        newAnswerKey[`Q${i}`] = options[Math.floor(Math.random() * 4)];
      } else {
        const selectedOption = pattern.split('-')[1].toUpperCase();
        newAnswerKey[`Q${i}`] = selectedOption;
      }
    }
    
    setAnswerKey(newAnswerKey);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      if (!answerString || answerString.length !== totalQuestions) {
        throw new Error('Please generate answer string first');
      }

      // Save to database
      const AnswerKey = Parse.Object.extend('AnswerKey');
      const answerKeyObj = new AnswerKey();

      answerKeyObj.set('examName', examName);
      answerKeyObj.set('totalQuestions', totalQuestions);
      answerKeyObj.set('answerKey', answerKey);
      answerKeyObj.set('answerString', answerString);
      answerKeyObj.set('createdAt', new Date());
      answerKeyObj.set('status', 'active');

      await answerKeyObj.save();

      setSaved(true);
      console.log('✅ Answer key saved successfully!');

    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save answer key');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAnswerKey({});
    setAnswerString('');
    setSaved(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4 group">
            <div className="bg-blue-900 p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-4xl text-white">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ExamFlow Admin</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
            Create Answer Key
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Set the correct answers for the examination
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

        {/* Success Message */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <div className="text-sm text-green-800">
                <p className="font-semibold">Answer key saved successfully!</p>
              </div>
            </div>
          </div>
        )}

        {/* Exam Details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Exam Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Total Questions
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                min={1}
                max={100}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Fill Options */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Fill</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleQuickFill('all-a')}
              className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 font-semibold"
            >
              All A
            </button>
            <button
              onClick={() => handleQuickFill('all-b')}
              className="px-4 py-2 bg-green-100 text-green-900 rounded-lg hover:bg-green-200 font-semibold"
            >
              All B
            </button>
            <button
              onClick={() => handleQuickFill('all-c')}
              className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg hover:bg-yellow-200 font-semibold"
            >
              All C
            </button>
            <button
              onClick={() => handleQuickFill('all-d')}
              className="px-4 py-2 bg-purple-100 text-purple-900 rounded-lg hover:bg-purple-200 font-semibold"
            >
              All D
            </button>
            <button
              onClick={() => handleQuickFill('random')}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-semibold"
            >
              Random
            </button>
          </div>
        </div>

        {/* Answer Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Answer Key</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
              <div key={num} className="border border-slate-300 dark:border-slate-600 rounded-lg p-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Q{num}</p>
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerChange(num, option)}
                      className={`flex-1 py-1 rounded text-sm font-semibold transition-colors ${
                        answerKey[`Q${num}`] === option
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer String Display */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Answer String</h3>
            <button
              onClick={generateAnswerString}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-semibold"
            >
              Generate String
            </button>
          </div>
          {answerString && (
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <p className="font-mono text-sm break-all text-slate-900 dark:text-slate-100">
                {answerString}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Length: {answerString.length} characters
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSave}
            disabled={saving || !answerString}
            className="px-8 py-3 bg-blue-900 text-white text-lg font-bold rounded-xl hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {saving ? 'Saving...' : 'Save Answer Key'}
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 border-2 border-slate-400 text-slate-700 dark:text-slate-300 text-lg font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Reset
          </button>
          <Link
            href="/"
            className="px-8 py-3 border-2 border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400 text-lg font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}