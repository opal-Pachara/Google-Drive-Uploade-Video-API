import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv']
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white hover:border-primary hover:bg-gray-50'}
      `}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-24 h-24 mx-auto text-primary mb-6" />
      <p className="text-3xl font-semibold mb-4 text-slate-700">
        กรุณาเลือกคลิปที่ต้องการอัปโหลด
      </p>
      <button className="bg-primary hover:bg-blue-700 text-white text-2xl font-semibold py-4 px-12 rounded-full shadow-lg transition-transform hover:scale-105 mb-4">
        เลือกไฟล์
      </button>
      <p className="text-xl text-slate-500">
        หรือลากไฟล์มาวางที่นี่
      </p>
    </div>
  );
};
