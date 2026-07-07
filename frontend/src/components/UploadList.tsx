import React from 'react';
import { XCircle } from 'lucide-react';

interface UploadListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  duplicates: Record<string, boolean>;
}

export const UploadList: React.FC<UploadListProps> = ({ files, onRemoveFile, duplicates }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full mt-8">
      <h3 className="text-2xl font-semibold mb-4 text-slate-800">รายการไฟล์</h3>
      <div className="flex flex-col space-y-4">
        {files.map((file, index) => {
          const isDuplicate = duplicates[file.name];
          const objectUrl = URL.createObjectURL(file);
          
          return (
          <div key={`${file.name}-${index}`} className={`flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border ${isDuplicate ? 'border-amber-400 bg-amber-50' : 'border-gray-100'}`}>
            <div className="flex items-center space-x-4 overflow-hidden flex-1">
              <div className="w-24 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                <video src={objectUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xl text-slate-700 truncate">{file.name}</span>
                {isDuplicate && (
                  <span className="text-sm font-semibold text-amber-600 mt-1">⚠️ วันนี้มีการอัปโหลดไฟล์ชื่อนี้ไปแล้ว (อาจซ้ำซ้อน)</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => onRemoveFile(index)}
              className="text-red-500 hover:text-red-700 transition-colors p-2 flex-shrink-0 ml-4"
              title="ลบไฟล์"
            >
              <XCircle className="w-8 h-8" />
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
};
