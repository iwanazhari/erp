import { useState, useRef } from 'react';
import { privateApi } from '@/services/authApi';

type Props = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  maxFileSizeMB?: number;
};

/**
 * Upload gambar ke backend & kembalikan URL.
 * Backend: POST /api/upload/image (multipart/form-data)
 */
export default function ImageUploader({
  value,
  onChange,
  label = 'Upload gambar',
  hint,
  maxFileSizeMB = 5,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, GIF, WEBP, dll.)');
      return;
    }

    // Validate file size
    const maxSize = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Ukuran file maksimal ${maxFileSizeMB}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await privateApi.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data?.data?.url || response.data?.url;
      if (!imageUrl) {
        throw new Error('Tidak ada URL gambar dari server');
      }

      onChange(imageUrl);
      setPreview(imageUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      const message = err?.response?.data?.message || err?.message || 'Gagal mengupload gambar';
      setError(message);
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-uploaded
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}

      {preview ? (
        <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-3">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            title="Hapus gambar"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
              <div className="text-sm text-slate-600">Mengupload...</div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 hover:border-indigo-400 hover:bg-indigo-50/50"
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <svg className="mb-3 h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-slate-600">Mengupload...</p>
            </>
          ) : (
            <>
              <svg className="mb-3 h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-slate-700">Klik untuk upload gambar</p>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, GIF, WEBP (max {maxFileSizeMB}MB)</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  );
}
