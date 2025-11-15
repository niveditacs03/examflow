'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Parse from '@/lib/parse';
import { CandidateFormData } from '@/types/candidate';
import crypto from 'crypto';

export default function RegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CandidateFormData>({
    // Personal Information
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Exam Details
    examName: 'XYZ Exam 2025',
    examCategory: '',
    
    // Educational Qualification
    qualification: '',
    passingYear: '',
    percentage: '',
    
    // Exam Center Preference
    preferredCenter1: '',
    preferredCenter2: '',
    preferredCenter3: '',
    
    // Identity Proof
    aadharNumber: '',
    
    // Photo
    photoURL: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Parse object for Candidate
      const Candidate = Parse.Object.extend('Candidate');
      const candidate = new Candidate();

      // Set all form data
      candidate.set('fullName', formData.fullName);
      candidate.set('fatherName', formData.fatherName);
      candidate.set('motherName', formData.motherName);
      candidate.set('dateOfBirth', new Date(formData.dateOfBirth));
      candidate.set('gender', formData.gender);
      candidate.set('email', formData.email);
      candidate.set('phone', formData.phone);
      candidate.set('address', formData.address);
      candidate.set('city', formData.city);
      candidate.set('state', formData.state);
      candidate.set('pincode', formData.pincode);
      candidate.set('examName', formData.examName);
      candidate.set('examCategory', formData.examCategory);
      candidate.set('qualification', formData.qualification);
      candidate.set('passingYear', formData.passingYear);
      candidate.set('percentage', parseFloat(formData.percentage));
      candidate.set('preferredCenter1', formData.preferredCenter1);
      candidate.set('preferredCenter2', formData.preferredCenter2);
      candidate.set('preferredCenter3', formData.preferredCenter3);
      candidate.set('aadharNumber', formData.aadharNumber);
      candidate.set('photoURL', formData.photoURL);
      
      // Generate unique registration number
      const registrationNumber = `XYZ${Date.now()}${Math.floor(Math.random() * 1000)}`;
      candidate.set('registrationNumber', registrationNumber);
      
      // Set status
      candidate.set('status', 'registered');
      candidate.set('admitCardGenerated', false);
      
      // Generate hash for blockchain verification
      const dataString = JSON.stringify({
        name: formData.fullName,
        dob: formData.dateOfBirth,
        email: formData.email,
        regNumber: registrationNumber,
        timestamp: Date.now()
      });
      const registrationHash = crypto.createHash('sha256').update(dataString).digest('hex');
      candidate.set('registrationHash', registrationHash);

      // Save to Back4app (automatically persists to blockchain)
      const savedCandidate = await candidate.save();
      
      // Redirect to admit card page with candidate ID
      router.push(`/admit-card?id=${savedCandidate.id}`);
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Candidate Registration
          </h1>
          <p className="text-gray-600">XYZ Exam 2025 - Fill all details carefully</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-navy-800">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="As per 10th certificate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father&apos;s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother&apos;s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="examCategory"
                  value={formData.examCategory}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-navy-800">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="10 digit mobile number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{12}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="12 digit Aadhar"
                />
              </div>

            </div>
          </div>

          {/* Educational Qualification */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-navy-800">Educational Qualification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="10th">10th Pass</option>
                  <option value="12th">12th Pass</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Post Graduation">Post Graduation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="passingYear"
                  value={formData.passingYear}
                  onChange={handleChange}
                  required
                  min={1990}
                  max={2025}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleChange}
                  required
                  min={0}
                  max={100}
                  step={0.01}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

            </div>
          </div>

          {/* Exam Center Preference */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-navy-800">Exam Center Preference</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Preference <span className="text-red-500">*</span>
                </label>
                <select
                  name="preferredCenter1"
                  value={formData.preferredCenter1}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select Center</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Second Preference
                </label>
                <select
                  name="preferredCenter2"
                  value={formData.preferredCenter2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select Center</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Third Preference
                </label>
                <select
                  name="preferredCenter3"
                  value={formData.preferredCenter3}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select Center</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
