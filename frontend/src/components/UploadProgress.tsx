import React from 'react';

export interface FileProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface UploadProgressProps {
  progresses: FileProgress[];
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progresses }) => {
  if (progresses.length === 0) return null;

  return (
    <div className="w-full mt-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-2xl font-semibold mb-6 text-slate-800">สถานะการอัปโหลด</h3>
      <div className="space-y-6">
        {progresses.map((p, index) => (
          <div key={`${p.fileName}-${index}`} className="flex flex-col space-y-2">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-slate-700 truncate w-2/3">{p.fileName}</span>
              {p.status === 'completed' && <span className="text-green-600 font-semibold">✅ Upload Complete</span>}
              {p.status === 'error' && <span className="text-red-500 font-semibold">❌ {p.errorMessage}</span>}
              {(p.status === 'uploading' || p.status === 'pending') && (
                <span className="text-primary font-semibold">{p.progress}%</span>
              )}
            </div>
            
            {(p.status === 'uploading' || p.status === 'pending' || p.status === 'completed') && (
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${p.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            )}
            
            {p.status === 'uploading' && (
              <span className="text-sm text-slate-500">Uploading...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
