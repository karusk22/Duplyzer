import React from 'react';
import CodeChecker from './components/CodeChecker'; // Import the new component
import './index.css'; // Assuming you have this file for base styles

function App() {
  return (
    // This is the main page wrapper
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-blue-50 p-6 lg:p-12 font-sans">
      {/* Render the one main component */}
      <CodeChecker />
    </div>
  );
}

export default App;