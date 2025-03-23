'use client';

import { useEffect, useState } from 'react';

interface ExifDisplayProps {
  exifData: any;
}

export default function ExifDisplay({ exifData }: ExifDisplayProps) {
  if (!exifData) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No EXIF data available</p>
      </div>
    );
  }

  // Format date strings to ensure they fit and wrap properly
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    
    try {
      // Replace timezone format for better display
      const cleanedString = dateString.replace(/\.\d+(\+|\-)\d{2}:\d{2}/, '');
      
      // Try to parse and format the date in a more user-friendly way
      const date = new Date(cleanedString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
      
      // If parsing fails, just return the cleaned string
      return cleanedString;
    } catch (error) {
      return dateString;
    }
  };

  // Format long string values
  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    const stringValue = value.toString();
    
    // Handle date values
    if (isTimestamp(key)) {
      return formatDate(stringValue);
    }
    
    // Truncate very long strings with ellipsis
    if (stringValue.length > 50 && !isTimestamp(key)) {
      return (
        <div title={stringValue}>
          {stringValue.substring(0, 50)}... 
        </div>
      );
    }
    
    return stringValue;
  };

  // Extract all EXIF properties and organize them
  const organizeExifData = () => {
    const predefinedCategories: Record<string, string[]> = {
      'Camera Info': ['Make', 'Model', 'Software', 'LensMake', 'LensModel', 'CameraSerialNumber', 'LensSpecification'],
      'Image Details': ['ImageWidth', 'ImageHeight', 'BitsPerSample', 'Orientation', 'XResolution', 'YResolution', 'ResolutionUnit', 'ColorSpace', 'Megapixels'],
      'Capture Settings': [
        'Aperture', 'ApertureValue', 'FNumber', 'FocalLength', 'FocalLengthIn35mmFormat', 
        'ShutterSpeed', 'ShutterSpeedValue', 'ExposureTime', 'ExposureCompensation', 'ExposureBiasValue', 
        'ISO', 'ISOSpeedRatings', 'ExposureMode', 'ExposureProgram', 'MeteringMode', 'Flash', 'WhiteBalance',
        'LightSource', 'SceneCaptureType', 'SubjectDistance', 'DigitalZoomRatio', 'Contrast', 'Saturation', 'Sharpness'
      ],
      'Timestamps': [
        'DateTime', 'DateTimeOriginal', 'CreateDate', 'ModifyDate', 'DateTimeDigitized',
        'SubSecTime', 'SubSecTimeOriginal', 'SubSecTimeDigitized'
      ],
      'GPS Data': [
        'GPS', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSDateStamp', 'GPSTimeStamp',
        'GPSProcessingMethod', 'GPSStatus', 'GPSMeasureMode', 'GPSDOP', 'GPSSpeedRef', 'GPSSpeed',
        'GPSImgDirectionRef', 'GPSImgDirection', 'GPSMapDatum', 'GPSDestLatitude', 'GPSDestLongitude'
      ],
      'File Info': ['FileName', 'FileSize', 'FileType', 'FileTypeExtension', 'MIMEType', 'EncodingProcess', 'ComponentsConfiguration']
    };
    
    // Initialize categories with known keys
    const categories: Record<string, { key: string, value: any }[]> = {};
    Object.keys(predefinedCategories).forEach(category => {
      categories[category] = [];
    });
    
    // Add "Other" category for unclassified data
    categories['Other'] = [];
    
    // Categorize all EXIF data
    Object.entries(exifData).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value === null || value === undefined) return;
      
      // Find which category this key belongs to
      let assigned = false;
      
      for (const [category, keys] of Object.entries(predefinedCategories)) {
        if (keys.some(k => key === k || key.includes(k))) {
          categories[category].push({ key, value });
          assigned = true;
          break;
        }
      }
      
      // If not assigned to any predefined category, add to "Other"
      if (!assigned) {
        categories['Other'].push({ key, value });
      }
    });
    
    // Sort each category items alphabetically by key
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.key.localeCompare(b.key));
    });
    
    // Remove empty categories
    return Object.entries(categories).reduce((acc, [category, items]) => {
      if (items.length > 0) {
        acc[category] = items;
      }
      return acc;
    }, {} as Record<string, { key: string, value: any }[]>);
  };

  const categorizedData = organizeExifData();

  // Determine if a key is important
  const isImportantField = (key: string) => {
    const importantFields = [
      'Make', 'Model', 'Aperture', 'ApertureValue', 'ShutterSpeed', 'ShutterSpeedValue', 
      'FocalLength', 'ISO', 'ISOSpeedRatings', 'FNumber', 'ExposureTime'
    ];
    return importantFields.some(field => key.includes(field));
  };

  // Check if a field is a timestamp
  const isTimestamp = (key: string) => {
    return key.includes('Date') || key.includes('Time') || key.includes('SubSec');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(categorizedData).map(([category, items]) => (
        <div key={category} className="bg-white rounded-lg shadow overflow-hidden exif-card">
          <h2 className="text-xl font-bold p-4 bg-gray-800 text-white exif-card-header">{category}</h2>
          <div className="p-4 exif-card-body">
            <table className="w-full">
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 text-sm font-medium text-gray-700 w-2/5">{item.key}</td>
                    <td className={`py-2 px-3 text-sm font-mono break-words w-3/5 ${isImportantField(item.key) ? 'highlight-value' : ''} ${isTimestamp(item.key) ? 'timestamp-cell' : ''}`}>
                      {formatValue(item.value, item.key)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
} 