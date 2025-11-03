import os
import zipfile
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from werkzeug.utils import secure_filename

# --- 1. Initialize FastAPI App ---
app = FastAPI()

# --- 2. CORS Configuration ---
# This allows your React frontend to communicate with this backend.
origins = [
    "http://localhost:3000",  # Default port for Create React App
    "http://localhost:5173",  # Default port for Vite
    # Add any other origins you might use for development.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Configure Directories ---
# Set up paths for temporary uploads and the final extracted files.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
EXTRACTED_DIR = os.path.join(BASE_DIR, 'extracted_files')

# Create these directories if they don't already exist.
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(EXTRACTED_DIR, exist_ok=True)


# --- 4. API Endpoint for ZIP Upload ---
@app.post("/upload-zip")
def upload_zip(zipfile_upload: UploadFile = File(..., alias="zipfile")):
    """
    Handles the POST request for uploading and extracting a .zip file.
    'zipfile' is the key your frontend FormData must use.
    """
    # Validate the file type.
    if not zipfile_upload.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .zip file.")

    # Sanitize the filename to prevent security vulnerabilities.
    filename = secure_filename(zipfile_upload.filename)
    zip_path = os.path.join(UPLOADS_DIR, filename)

    try:
        # Save the uploaded .zip file to the 'uploads' directory.
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(zipfile_upload.file, buffer)
        print(f"File temporarily saved to: {zip_path}")

        # Create a dedicated folder for the extracted content inside 'extracted_files'.
        output_dir_name = os.path.splitext(filename)[0]  # Filename without .zip extension
        extraction_path = os.path.join(EXTRACTED_DIR, output_dir_name)
        os.makedirs(extraction_path, exist_ok=True)

        # --- Extraction Logic ---
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extraction_path)
        
        print(f"Successfully extracted files to: {extraction_path}")

        # Get the list of filenames that were extracted.
        extracted_files = os.listdir(extraction_path)

        # Return a success response with the list of files.
        return {
            "message": "File unzipped successfully!",
            "files": extracted_files
        }

    except Exception as e:
        # If any error occurs, return a server error response.
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the file: {e}")

    finally:
        # --- Cleanup ---
        # This block always runs, ensuring the temporary .zip file is deleted.
        zipfile_upload.file.close()
        if os.path.exists(zip_path):
            os.remove(zip_path)
            print(f"Cleaned up and deleted temporary file: {zip_path}")