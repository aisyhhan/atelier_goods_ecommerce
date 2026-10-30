import JSZip from 'jszip';
import { LARAVEL_PROJECT_FILES } from '../data/laravelProjectData.ts';

export async function downloadLaravelProjectZip() {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('atelier-laravel-ecommerce');
  if (!root) return;

  // Add all Laravel files
  for (const file of LARAVEL_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Generate zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'atelier-laravel-ecommerce.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
