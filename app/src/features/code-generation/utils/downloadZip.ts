import JSZip from 'jszip';
import { ProjectCodeGenerationResponse } from '../types';

/**
 * Create a ZIP file from generated code and trigger download
 */
export const downloadGeneratedCodeAsZip = async (
  generatedCode: ProjectCodeGenerationResponse
): Promise<void> => {
  const zip = new JSZip();

  // Add files to ZIP organized by category
  Object.entries(generatedCode.files).forEach(([category, files]) => {
    if (files.length === 0) return;

    files.forEach(file => {
      // Use the filePath if available, otherwise use fileName
      const path = file.filePath || `${category}/${file.fileName}`;
      zip.file(path, file.content);
    });
  });

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: 'blob' });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${generatedCode.projectName.replace(/\s+/g, '-')}-generated-code.zip`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
