from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from typing import List
import datetime
from zoneinfo import ZoneInfo
import logging
from google_drive import drive_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Video Upload API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the exact domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv'}

@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    uploaded_count = 0
    folder_name = datetime.datetime.now(ZoneInfo("Asia/Bangkok")).strftime("%Y-%m-%d")
    
    for file in files:
        # Check extension
        ext = ""
        if "." in file.filename:
            ext = "." + file.filename.split(".")[-1].lower()
            
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"ไฟล์นี้ไม่สามารถอัปโหลดได้: {file.filename} (รองรับเฉพาะ mp4, mov, avi, mkv)")

        try:
            content = await file.read()
            # Upload to Google Drive
            await drive_manager.upload_file(file.filename, content, file.content_type)
            uploaded_count += 1
        except Exception as e:
            logger.error(f"เกิดข้อผิดพลาดในการบันทึกไฟล์ {file.filename}: {e}")
            raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดในการบันทึกไฟล์")

    return {
        "success": True,
        "uploaded": uploaded_count,
        "folder": folder_name
    }

@app.get("/api/check-duplicate")
def check_duplicate(filename: str):
    try:
        exists = drive_manager.check_file_exists(filename)
        return {"exists": exists}
    except Exception as e:
        logger.error(f"Error checking duplicate for {filename}: {e}")
        raise HTTPException(status_code=500, detail="ไม่สามารถตรวจสอบไฟล์ซ้ำได้")

@app.get("/api/quota")
def get_quota():
    try:
        quota = drive_manager.get_storage_quota()
        limit = int(quota.get('limit', 0))
        usage = int(quota.get('usage', 0))
        return {
            "limit": limit,
            "usage": usage,
            "usage_percent": (usage / limit * 100) if limit > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error fetching quota: {e}")
        raise HTTPException(status_code=500, detail="ไม่สามารถดึงข้อมูลพื้นที่คงเหลือได้")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mount the static directory if it exists (for Monolith deployment)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    # If the route is an API call, return standard JSON 404
    if request.url.path.startswith("/api/"):
        return {"detail": "Not Found"}
    
    # Otherwise, fallback to serving index.html for React Router SPA
    if os.path.exists(os.path.join(static_dir, "index.html")):
        return FileResponse(os.path.join(static_dir, "index.html"))
    return {"detail": "Not Found"}
