import { useState } from 'react';
import api from '../../../api/axios';
import Toast from '../../shared/Toast/Toast';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setToast({
          show: true,
          message: 'Please upload a PDF, DOCX, or TXT file',
          type: 'error'
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setToast({
          show: true,
          message: 'File size must be less than 10MB',
          type: 'error'
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setToast({
        show: true,
        message: 'Please select a file first',
        type: 'error'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/jobseeker/resume/upload-and-parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParsedData(response.data.parsedData);
      setToast({
        show: true,
        message: 'Resume uploaded and parsed successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Upload error:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to upload resume',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Resume</h2>
        
        {/* File Upload Section */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mb-4">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-sm text-gray-500">PDF, DOCX, or TXT files up to 10MB</p>
          </div>
          
          {file && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="mb-8">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Processing...' : 'Upload and Parse Resume'}
          </button>
        </div>

        {/* Parsed Data Display */}
        {parsedData && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Parsed Resume Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {parsedData.fullName || 'Not found'}</p>
                  <p><span className="font-medium">Email:</span> {parsedData.email || 'Not found'}</p>
                  <p><span className="font-medium">Phone:</span> {parsedData.phone || 'Not found'}</p>
                  <p><span className="font-medium">Location:</span> {parsedData.location || 'Not found'}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Experience</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total Years:</span> {parsedData.totalExperienceYears || 'Not calculated'}</p>
                  <p><span className="font-medium">Current Role:</span> {parsedData.currentJobTitle || 'Not found'}</p>
                </div>
              </div>

              {/* Skills */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
                  <div className="space-y-2">
                    {parsedData.education.map((edu, index) => (
                      <div key={index} className="text-sm">
                        <p><span className="font-medium">{edu.degree}</span> {edu.field && `in ${edu.field}`}</p>
                        {edu.institution && <p className="text-gray-600">{edu.institution}</p>}
                        {edu.year && <p className="text-gray-600">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {parsedData.workExperience && parsedData.workExperience.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Work Experience</h4>
                  <div className="space-y-3">
                    {parsedData.workExperience.map((exp, index) => (
                      <div key={index} className="text-sm border-l-2 border-blue-200 pl-3">
                        <p className="font-medium">{exp.jobTitle}</p>
                        {exp.company && <p className="text-gray-600">{exp.company}</p>}
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-gray-500">{exp.startDate} - {exp.endDate}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default ResumeUpload;