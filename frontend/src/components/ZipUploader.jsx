import React, { useState } from 'react';
import axios from 'axios';

// Note: This component assumes Tailwind CSS is set up in your project.

function ZipUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (event) => {
    // Reset status on new file selection
    setUploadStatus('');
    setUploadedFiles([]);
    setUploadSuccess(false);

    const file = event.target.files[0];
    if (file && (file.type === "application/zip" || file.type === "application/x-zip-compressed")) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setUploadStatus("Please select a valid .zip file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a .zip file first!");
      return;
    }

    setUploadStatus("Uploading...");
    const formData = new FormData();
    // Use the key 'zipfile' that the server expects
    formData.append('zipfile', selectedFile);

    try {
      const response = await axios.post("http://localhost:5000/upload-zip", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadStatus(response.data.message);
      setUploadedFiles(response.data.files || []);
      setUploadSuccess(true);
      
    } catch (error) {
      console.error("Error uploading zip file:", error);
      setUploadStatus(error.response?.data || "File upload failed. Check the server connection.");
      setUploadSuccess(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
      <div className="container max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ZIP File Uploader for ML Model</h1>
          <p className="text-gray-600">Select a .zip archive to upload and extract on the server.</p>
        </header>
        
        <div className="upload-box border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="file-upload"
              className="hidden"
              accept=".zip,application/zip,application/x-zip-compressed" 
              onChange={handleFileChange} 
            />
            <label htmlFor="file-upload" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer font-medium hover:bg-blue-700 transition-colors">
              {selectedFile ? 'File Selected' : 'Choose a .zip File'}
            </label>
          </div>

          {selectedFile && (
            <div className="file-info mt-4 text-sm text-gray-500">
              <p><strong>Selected file:</strong> {selectedFile.name}</p>
            </div>
          )}
          
          <button onClick={handleUpload} className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg text-base font-semibold cursor-pointer hover:bg-green-700 transition-colors transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" disabled={!selectedFile}>
            Upload and Unzip
          </button>
        </div>

        {uploadStatus && (
          <div className={`status-message mt-6 p-4 rounded-lg font-medium ${uploadSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <p>{uploadStatus}</p>
          </div>
        )}

        {uploadSuccess && uploadedFiles.length > 0 && (
          <div className="extracted-files mt-6 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="mt-0 text-gray-800 border-b border-gray-200 pb-2 mb-4 font-semibold">Extracted Files:</h3>
            <ul className="list-none p-0">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="py-2 border-b border-gray-200 last:border-b-0">{file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ZipUploader;
