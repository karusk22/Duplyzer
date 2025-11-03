import React, { useState } from "react";
import axios from "axios";

export default function CodeSubmitForm() {
  const [codes, setCodes] = useState({
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
  });

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
        setImageUrl(response.data.image_url);
        setMessage("Similarity graph generated successfully!");
      } else {
        setMessage("No image received. Check your backend response.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Code Plagiarism Checker
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Paste up to 5 code snippets below and check their similarity.
        </p>

        {/* Flex Row Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT SIDE — Code Input Section */}
          <div className="w-full md:w-1/2 space-y-4">
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

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Check Similarity"}
            </button>

            {message && (
              <p className="text-center text-gray-700 font-medium mt-2">
                {message}
              </p>
            )}
          </div>

          {/* RIGHT SIDE — Graph Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center border-l border-gray-200 pl-6">
            {imageUrl ? (
              <>
                <h3 className="text-lg font-medium mb-2 text-gray-800">
                  Generated Similarity Graph
                </h3>
                <img
                  src={`${imageUrl}?t=${Date.now()}`}
                  alt="Similarity Graph"
                  className="max-w-full rounded-lg border shadow-md"
                />
              </>
            ) : (
              <p className="text-gray-500 italic text-sm text-center">
                Your similarity graph will appear here after submission.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
