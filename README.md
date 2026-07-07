# Multiple Video Upload System

ระบบอัปโหลดวิดีโอหลายไฟล์พร้อมกันไปยัง Google Drive ออกแบบมาให้ใช้งานง่าย (User-Friendly) สำหรับผู้ใช้ทั่วไป (Low Tech Users) หน้าจอเรียบง่าย ฟอนต์ขนาดใหญ่ รองรับการลากไฟล์มาวาง (Drag & Drop) และแสดงสถานะการอัปโหลดแบบเรียลไทม์

## คุณสมบัติ (Features)
- อัปโหลดหลายไฟล์พร้อมกัน
- รองรับไฟล์วิดีโอ (mp4, mov, avi, mkv)
- จัดเก็บใน Google Drive อัตโนมัติ โดยสร้างโฟลเดอร์ตามวันที่ปัจจุบัน (YYYY-MM-DD)
- แสดง Progress Bar สำหรับแต่ละไฟล์
- หน้าจอ Responsive ใช้งานได้ทั้งบน Desktop, Tablet และ Mobile

## เทคโนโลยี (Tech Stack)
- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Storage**: Google Drive API
- **Deployment**: Docker & Docker Compose

---

## 1. การเตรียมการ (Prerequisites)

### การตั้งค่า Google Drive Service Account
เพื่อให้ระบบสามารถอัปโหลดไฟล์ขึ้น Google Drive ได้ คุณต้องสร้าง Service Account บน Google Cloud:
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่ หรือเลือกโปรเจกต์ที่มีอยู่
3. ค้นหาและเปิดใช้งาน **Google Drive API**
4. ไปที่ **IAM & Admin > Service Accounts**
5. สร้าง Service Account ใหม่
6. ไปที่แท็บ **Keys** ของ Service Account นั้น แล้วกด Add Key > Create new key เลือกประเภทเป็น **JSON**
7. ดาวน์โหลดไฟล์ JSON ที่ได้ เปลี่ยนชื่อเป็น `service_account.json`
8. นำไฟล์ `service_account.json` ไปใส่ไว้ในโฟลเดอร์ `backend/credentials/`

> **Note**: หากต้องการให้แอปอัปโหลดเข้าโฟลเดอร์ใดโฟลเดอร์หนึ่งโดยเฉพาะ คุณต้องแชร์โฟลเดอร์นั้นใน Google Drive ของคุณให้กับอีเมลของ Service Account ด้วยสิทธิ์ Editor แต่สำหรับโปรเจกต์นี้ ระบบจะสร้างโฟลเดอร์ใหม่ทุกวันในพื้นที่ของ Service Account เอง (หากต้องการดูไฟล์ต้องแชร์กลับมา หรือใช้ domain-wide delegation)

---

## 2. การรันระบบด้วย Docker (Production Ready)

ระบบถูกตั้งค่าให้รันได้ง่ายๆ ด้วย Docker Compose
1. ตรวจสอบให้แน่ใจว่าติดตั้ง Docker และ Docker Compose แล้ว
2. ตรวจสอบว่ามีไฟล์ `backend/credentials/service_account.json`
3. รันคำสั่ง:
```bash
docker-compose up --build -d
```
4. เปิดเบราว์เซอร์ไปที่ `http://localhost`

---

## 3. การรันแบบ Local (สำหรับนักพัฒนา)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # สำหรับ Mac/Linux
# venv\Scripts\activate สำหรับ Windows

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
API จะเปิดที่ `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
หน้าเว็บจะเปิดที่ `http://localhost:5173`

---

## 4. API Documentation

เมื่อ Backend ทำงาน คุณสามารถเข้าดูคู่มือ API อัตโนมัติ (Swagger UI) ได้ที่:
- `http://localhost:8000/docs`

**Endpoint หลัก**:
- `POST /upload`
- รับข้อมูลเป็น `multipart/form-data` ชื่อฟิลด์ `files` (สามารถส่งได้หลายไฟล์)
- **Response**:
```json
{
  "success": true,
  "uploaded": 5,
  "folder": "2026-07-07"
}
```
