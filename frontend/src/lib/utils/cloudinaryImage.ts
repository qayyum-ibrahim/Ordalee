interface OptimizedImageOptions {
  width: number;
  height: number;
  format?: 'auto' | 'jpg';
}

export function getOptimizedImageUrl(url: string, { width, height, format = 'auto' }: OptimizedImageOptions): string {
  const transformation = `f_${format},q_auto,w_${width},h_${height},c_fill,g_auto`;
  return url.replace('/upload/', `/upload/${transformation}/`);
}