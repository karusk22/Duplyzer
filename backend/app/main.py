import os
import zipfile
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from werkzeug.utils import secure_filename
from pathlib import Path

from .routes.checkerRoute import checkRouter, check_similarity, CodeRequest

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent 
STATIC_DIR = BACKEND_DIR / "static"
UPLOADS_DIR = BACKEND_DIR / 'uploads'
EXTRACTED_DIR = BACKEND_DIR / 'extracted_files'

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(EXTRACTED_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.post("/upload-zip")
def upload_zip_and_check_similarity(zipfile_upload: UploadFile = File(..., alias="zipfile")):
    """
    Handles uploading, extracting, reading, and checking similarity
    all in one API call.
    """
    if not zipfile_upload.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .zip file.")

    filename = secure_filename(zipfile_upload.filename)
    zip_path = os.path.join(UPLOADS_DIR, filename)
    
    code_strings = []
    extraction_path = ""

    try:
        # --- 1. Save and Extract ZIP ---
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(zipfile_upload.file, buffer)

        output_dir_name = os.path.splitext(filename)[0]
        extraction_path = os.path.join(EXTRACTED_DIR, output_dir_name)
        
        if os.path.exists(extraction_path):
             shutil.rmtree(extraction_path)
        os.makedirs(extraction_path, exist_ok=True)

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extraction_path)
        
        extracted_files = os.listdir(extraction_path)
        for f_name in extracted_files:
            if f_name.endswith(('.py', '.java', '.c', '.cpp', '.js', '.txt')):
                try:
                    with open(os.path.join(extraction_path, f_name), 'r', encoding='utf-8') as f:
                        code_strings.append(f.read())
                except Exception as e:
                    print(f"Warning: Could not read file {f_name}. Error: {e}")

        if len(code_strings) < 2:
            raise HTTPException(status_code=400, detail=f"ZIP file must contain at least 2 readable code files. Found {len(code_strings)}.")

        code_request = CodeRequest(codes=code_strings, lang="python")
        
        similarity_results = check_similarity(code_request)
        
        return similarity_results

    except HTTPException as he:
       
        raise he
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the file: {e}")

    finally:
    
        zipfile_upload.file.close()
        if os.path.exists(zip_path):
            os.remove(zip_path)
        


app.include_router(checkRouter)