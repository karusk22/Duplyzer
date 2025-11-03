import React, { useState } from 'react';
import axios from 'axios';

export default function CodeChecker() {
  const [codes, setCodes] = useState({
    code1: "",
    code2: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCodes((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const codeArray = Object.values(codes).filter((c) => c.trim() !== "");
    if (codeArray.length < 2) {
      setMessage("Please enter at least two code snippets to compare.");
      return;
    }

    setLoading(true);
    setMessage("");
    setImageUrl("");

    try {
      const response = await axios.post("http://localhost:8000/check", {
        codes: codeArray,
        lang: "python",
      });

      if (response.data.image_url) {
        setImageUrl(`${response.data.image_url}?t=${Date.now()}`);
        setMessage("Similarity graph generated successfully!");
      } else {
        setMessage("No image received. Check your backend response.");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.code === "ERR_NETWORK") {
        setMessage("Cannot connect to server at http://localhost:8000. Is it running?");
      } else {
        setMessage(error.response?.data?.detail || "Error checking similarity.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setMessage(""); 
    const file = event.target.files[0];
    if (file && (file.type === "application/zip" || file.type === "application/x-zip-compressed")) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setMessage("Please select a valid .zip file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a .zip file first!");
      return;
    }

    setLoading(true);
    setMessage("");
    setImageUrl("");
    
    const formData = new FormData();
    formData.append('zipfile', selectedFile);

    try {
      const response = await axios.post("http://localhost:8000/upload-zip", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data.image_url) {
        setImageUrl(`${response.data.image_url}?t=${Date.now()}`);
        setMessage("Similarity graph from ZIP generated successfully!");
      } else {
        setMessage("No image received from ZIP. Check backend response.");
      }
      
    } catch (error) {
      console.error("Error uploading zip file:", error);
      if (error.code === "ERR_NETWORK") {
        setMessage("Cannot connect to server at http://localhost:8000. Is it running?");
      } else {
         setMessage(error.response?.data?.detail || "File upload failed.");
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Code Plagiarism Checker
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/2 space-y-6">

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Paste Code Snippets</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(codes).map((key, index) => (
                <textarea
                  key={key}
                  name={key}
                  value={codes[key]}
                  onChange={handleChange}
                  placeholder={`Enter Code ${index + 1}`}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm resize-none"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="text-gray-500 font-medium">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Upload a .zip File</h3>
            <div className="upload-box border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
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
              {selectedFile && (
                <div className="file-info mt-3 text-sm text-gray-600">
                  <strong>Selected:</strong> {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <button 
              onClick={handleUpload} 
              className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" 
              disabled={!selectedFile || loading} 
            >
              {loading ? 'Processing...' : 'Upload ZIP and Check'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading} 
              className={`w-full py-3 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Check Snippets"}
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col border-l-0 md:border-l border-t md:border-t-0 border-gray-200 pt-6 md:pt-0 md:pl-8 space-y-6">
          
          { message && ( 
            <div className="w-full">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Status</h3>
              <div className={`p-4 rounded-lg font-medium ${imageUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            </div>
          )}

          <div className="w-full">
            <h3 className="text-lg font-medium mb-3 text-gray-800">
              Similarity Graph
            </h3>
            <div className="w-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-500">Generating Graph...</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Similarity Graph"
                  className="max-w-full rounded-lg border shadow-md"
                />
              ) : (
                <p className="text-gray-500 italic text-sm text-center px-4">
                  Your similarity graph will appear here.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}