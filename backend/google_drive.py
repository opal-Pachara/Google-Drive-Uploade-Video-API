import os
import datetime
from zoneinfo import ZoneInfo
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from config import settings
import io

class GoogleDriveManager:
    def __init__(self):
        self.credentials_path = settings.CREDENTIALS_PATH
        self.token_path = settings.TOKEN_PATH
        self.scopes = settings.SCOPES
        self.service = self._get_service()

    def _get_service(self):
        creds = None
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, self.scopes)
            
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                raise Exception(f"ไม่พบไฟล์ {self.token_path} กรุณารันสคริปต์ generate_token.py ก่อนใช้งาน")
                
        return build('drive', 'v3', credentials=creds)

    def _get_or_create_folder(self, folder_name: str) -> str:
        """
        Check if a folder with `folder_name` exists. If yes, return its ID.
        If no, create it and return its ID.
        """
        parent_id = settings.PARENT_FOLDER_ID

        # Build query
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
            
        response = self.service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
        files = response.get('files', [])

        if files:
            # Return the first matching folder ID
            return files[0].get('id')
        else:
            # Create a new folder
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            if parent_id:
                file_metadata['parents'] = [parent_id]
                
            folder = self.service.files().create(body=file_metadata, fields='id').execute()
            return folder.get('id')

    def get_storage_quota(self) -> dict:
        """
        Retrieves the storage quota information from Google Drive.
        """
        response = self.service.about().get(fields="storageQuota").execute()
        return response.get('storageQuota', {})

    def check_file_exists(self, file_name: str) -> bool:
        """
        Check if a file with `file_name` already exists in today's folder.
        """
        today = datetime.datetime.now(ZoneInfo("Asia/Bangkok")).strftime("%Y-%m-%d")
        # Ensure folder exists and get its ID
        folder_id = self._get_or_create_folder(today)
        
        query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
        response = self.service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
        files = response.get('files', [])
        
        return len(files) > 0

    async def upload_file(self, file_name: str, file_content: bytes, mime_type: str) -> str:
        """
        Uploads a file to a folder named by the current date (YYYY-MM-DD).
        """
        today = datetime.datetime.now(ZoneInfo("Asia/Bangkok")).strftime("%Y-%m-%d")
        folder_id = self._get_or_create_folder(today)

        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaIoBaseUpload(io.BytesIO(file_content), mimetype=mime_type, resumable=True)
        
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        return folder_id

drive_manager = GoogleDriveManager()
