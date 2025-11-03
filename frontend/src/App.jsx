import React from 'react';
import ZipUploader from './components/ZipUploader'; // Import the new component
import './index.css';
import CodeSubmitForm from './components/Input';

// In a larger application, you would use a library like React Router here.
// For this example, we'll just render the main component.
function App() {
  return (
    <div className="App">
      <CodeSubmitForm/>
    </div>
  );
}

export default App;

