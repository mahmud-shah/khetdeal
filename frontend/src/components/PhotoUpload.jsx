import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadFile } from '../config/supabase';

export default function PhotoUpload({ value = [], onChange, bucket = 'listing-photos', max = 5, multiple = true }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const urls = [];
      for (const file of files) {
        if (value.length + urls.length >= max) break;
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
        const url = await uploadFile(bucket, path, file);
        urls.push(url);
      }
      onChange(multiple ? [...value, ...urls] : urls.slice(-1));
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const remove = (idx) => {
    const updated = value.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((url, i) => (
          <div key={i} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-khet-200 dark:border-khet-700">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
              aria-label="Remove"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <label className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-khet-300 dark:border-khet-600 flex flex-col items-center justify-center cursor-pointer hover:border-farm-green dark:hover:border-farm-light transition-colors">
            {uploading ? (
              <Loader2 size={18} className="animate-spin text-khet-400" />
            ) : (
              <>
                <Upload size={18} className="text-khet-400 mb-1" />
                <span className="text-[10px] text-khet-500">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}