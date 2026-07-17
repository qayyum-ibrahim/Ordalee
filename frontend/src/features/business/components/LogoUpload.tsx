'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadLogoToCloudinary } from '@/lib/services/cloudinary';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinaryImage';
import { Button } from '@/components/ui/button';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onUploaded: (url: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function LogoUpload({ currentLogoUrl, onUploaded }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Image must be under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadLogoToCloudinary(file);
      onUploaded(url);
    } catch {
      setError("Couldn't upload the logo. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
        {currentLogoUrl ? (
          // Deliberately a plain <img>, not next/image: Cloudinary's URL
          // transformation above already does the resizing/format work
          // next/image would otherwise do. Routing an already-optimized
          // image through a second optimization pipeline adds a proxy
          // hop for no benefit — the opposite of what was asked for here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getOptimizedImageUrl(currentLogoUrl, { width: 128, height: 128 })}
            alt="Business logo" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div>
        <Button type="button" variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? 'Uploading…' : currentLogoUrl ? 'Change logo' : 'Upload logo'}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WEBP. Up to 5MB.</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
    </div>
  );
}