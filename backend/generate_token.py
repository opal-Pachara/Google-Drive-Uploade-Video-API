import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/drive']
CREDENTIALS_PATH = 'credentials/credentials.json'
TOKEN_PATH = 'credentials/token.json'

def main():
    creds = None
    # ตรวจสอบว่ามี token.json อยู่แล้วหรือไม่
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
        
    # ถ้ายังไม่มี Token หรือ Token หมดอายุ ให้ทำการล็อกอินใหม่
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing access token...")
            creds.refresh(Request())
        else:
            print(f"กำลังเปิดเบราว์เซอร์เพื่อล็อกอิน... กรุณาอนุญาตสิทธิ์ Google Drive")
            if not os.path.exists(CREDENTIALS_PATH):
                print(f"Error: ไม่พบไฟล์ {CREDENTIALS_PATH} กรุณาดาวน์โหลดจาก Google Cloud Console มาวางไว้ก่อน")
                return
                
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
            
        # บันทึก token ลงไฟล์สำหรับการรันครั้งต่อไป
        with open(TOKEN_PATH, 'w') as token_file:
            token_file.write(creds.to_json())
            print(f"สร้างไฟล์ {TOKEN_PATH} สำเร็จแล้ว!")

if __name__ == '__main__':
    main()
