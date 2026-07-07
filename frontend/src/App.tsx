import { useState, useEffect } from 'react';
import { UploadArea } from './components/UploadArea';
import { UploadList } from './components/UploadList';
import { UploadProgress, type FileProgress } from './components/UploadProgress';
import { uploadVideoFile, checkDuplicate, getStorageQuota, type QuotaResponse } from './api';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [progresses, setProgresses] = useState<FileProgress[]>([]);
  const [duplicates, setDuplicates] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [quota, setQuota] = useState<QuotaResponse | null>(null);

  const fetchQuota = async () => {
    const q = await getStorageQuota();
    if (q) setQuota(q);
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Check for duplicates
    for (const file of selectedFiles) {
      const isDuplicate = await checkDuplicate(file.name);
      if (isDuplicate) {
        setDuplicates(prev => ({ ...prev, [file.name]: true }));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Initialize progress state
    const initialProgresses: FileProgress[] = files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'pending'
    }));
    setProgresses(initialProgresses);

    // Upload sequentially to avoid overloading and for clearer progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to uploading
      setProgresses(prev => {
        const newP = [...prev];
        newP[i].status = 'uploading';
        return newP;
      });

      try {
        await uploadVideoFile(file, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgresses(prev => {
            const newP = [...prev];
            newP[i].progress = percentCompleted;
            return newP;
          });
        });
        
        // Success
        setProgresses(prev => {
          const newP = [...prev];
          newP[i].progress = 100;
          newP[i].status = 'completed';
          return newP;
        });

      } catch (error: any) {
        // Error
        setProgresses(prev => {
          const newP = [...prev];
          newP[i].status = 'error';
          newP[i].errorMessage = error.message;
          return newP;
        });
      }
    }

    setIsUploading(false);
    fetchQuota(); // Refresh quota after upload completes
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">ระบบอัปโหลดวิดีโอ</h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-8">
          ระบบง่ายๆ สำหรับอัปโหลดคลิปวิดีโอ (mp4, mov, avi, mkv) หลายไฟล์พร้อมกัน ระบบจะจัดเก็บในโฟลเดอร์ของวันนี้โดยอัตโนมัติ
        </p>

        {quota && (
          <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
              <span>พื้นที่ใช้งาน (Google Drive)</span>
              <span>{formatBytes(quota.usage)} / {formatBytes(quota.limit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${quota.usage_percent > 90 ? 'bg-red-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min(quota.usage_percent, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
        {!isUploading && progresses.length === 0 && (
          <UploadArea onFilesSelected={handleFilesSelected} />
        )}
        
        {!isUploading && progresses.length === 0 && files.length > 0 && (
          <UploadList files={files} onRemoveFile={handleRemoveFile} duplicates={duplicates} />
        )}

        {(isUploading || progresses.length > 0) && (
          <UploadProgress progresses={progresses} />
        )}

        {!isUploading && progresses.length > 0 && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setFiles([]);
                setProgresses([]);
                setDuplicates({});
              }}
              className="bg-gray-200 hover:bg-gray-300 text-slate-800 text-2xl font-semibold py-4 px-12 rounded-full shadow-md transition-transform hover:scale-105"
            >
              อัปโหลดไฟล์ใหม่
            </button>
          </div>
        )}
      </div>

      {!isUploading && files.length > 0 && progresses.length === 0 && (
        <div className="text-center">
          <button 
            onClick={handleUpload}
            className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white text-3xl font-bold py-6 px-16 rounded-full shadow-2xl transition-transform hover:scale-105"
          >
            อัปโหลด
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
