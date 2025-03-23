'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as exifr from 'exifr';
import ImageUploader from '@/components/ImageUploader';
import ExifDisplay from '@/components/ExifDisplay';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      
      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      
      // First try to extract full EXIF data including all possible tags
      let exif: any;
      
      try {
        // Extract EXIF data with all options enabled for maximum data extraction
        exif = await exifr.parse(file, { 
          tiff: true,
          jfif: true, 
          icc: true,
          iptc: true,
          xmp: true,
          exif: true,
          gps: true,
          interop: true,
          translateKeys: true,
          translateValues: true,
          reviveValues: true,
          mergeOutput: true
        });
        
        // Try a second extraction method that might catch different data
        const tiffData = await exifr.parse(file, true); 
        if (tiffData) {
          // Merge with main EXIF data
          exif = { ...exif, ...tiffData };
        }
      } catch (error) {
        console.error('Error with advanced EXIF parsing, trying basic parse:', error);
        // Fallback to basic parsing if advanced fails
        exif = await exifr.parse(file);
      }
      
      // Add file info to EXIF data
      const enrichedExif = {
        ...exif,
        FileName: file.name,
        FileSize: formatFileSize(file.size),
        FileType: file.type.split('/')[1].toUpperCase(),
        FileTypeExtension: file.name.split('.').pop(),
        ImageWidth: exif?.ImageWidth || exif?.width,
        ImageHeight: exif?.ImageHeight || exif?.height,
      };
      
      // Log the full EXIF data to console for debugging
      console.log('Full EXIF data:', enrichedExif);
      
      setExifData(enrichedExif);
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
      setExifData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Free Online EXIF Data Viewer
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your image to instantly view EXIF metadata including camera settings, date, location, and more.
          </p>
        </header>

        <div className="max-w-7xl mx-auto">
          {!selectedImage ? (
            <div className="mb-12">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
              <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
                <div className="relative aspect-square overflow-hidden rounded-md">
        <Image
                    src={selectedImage}
                    alt="Uploaded image"
                    fill
                    style={{ objectFit: 'contain' }}
          priority
        />
                </div>
                <button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                  onClick={() => {
                    setSelectedImage(null);
                    setExifData(null);
                  }}
                >
                  Upload a Different Image
                </button>
              </div>
              
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ExifDisplay exifData={exifData} />
                )}
              </div>
            </div>
          )}
        </div>

        <section className="max-w-4xl mx-auto mt-12 sm:mt-16 prose prose-blue">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">What is EXIF Data?</h2>
          <p>
            EXIF (Exchangeable Image File Format) is a standard that specifies the formats for images, sound, and ancillary tags used by digital cameras, smartphones, and other digital imaging devices. The metadata tags defined in the EXIF standard cover a broad spectrum of information, including:
          </p>
          <ul>
            <li>Date and time information</li>
            <li>Camera settings (model, manufacturer, aperture, shutter speed, focal length, etc.)</li>
            <li>Location information (GPS data)</li>
            <li>Orientation and rotation</li>
            <li>Copyright information</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 sm:mt-10 mb-4 sm:mb-6">Why View EXIF Data?</h2>
          <p>
            Viewing EXIF data can be beneficial for various reasons:
          </p>
          <ul>
            <li><strong>Photography Learning:</strong> Analyze settings used in successful photos to improve your technique.</li>
            <li><strong>Organization:</strong> Use capture dates and GPS information to organize your photo library.</li>
            <li><strong>Verification:</strong> Check if images have been edited or verify when and where they were taken.</li>
            <li><strong>Technical Issues:</strong> Diagnose problems with your camera or understand image quality issues.</li>
            <li><strong>Privacy Concerns:</strong> Identify what personal information might be embedded in your photos before sharing them online.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 sm:mt-10 mb-4 sm:mb-6">How Our EXIF Viewer Works</h2>
          <p>
            Our online EXIF data viewer provides a simple, secure way to view the metadata stored in your image files:
          </p>
          <ol>
            <li>Upload your image using our drag-and-drop interface or file selector.</li>
            <li>Your image is processed locally in your browser – we never store your photos or their data on our servers.</li>
            <li>The EXIF information is extracted and displayed in an organized, easy-to-read format.</li>
            <li>You can view detailed information about your camera settings, image properties, timestamps, and more.</li>
          </ol>
          
          <p className="mt-8 sm:mt-10 text-gray-600 text-sm">
            <strong>Privacy Note:</strong> All processing happens directly in your browser. Your images are never uploaded to our servers, ensuring complete privacy and security of your personal data.
          </p>
        </section>
      </div>
    </div>
  );
}