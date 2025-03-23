'use client';

interface ExifDisplayProps {
  exifData: Record<string, unknown> | null;
}

interface ExifItem {
  key: string;
  value: unknown;
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
    } catch {
      return dateString;
    }
  };

  // Format long string values
  const formatValue = (value: unknown, key: string) => {
    if (value === null || value === undefined) return '';
    
    // 处理数组或对象
    if (typeof value === 'object') {
      try {
        const stringValue = JSON.stringify(value);
        if (stringValue.length > 50) {
          return (
            <div title={stringValue} className="cursor-help break-all">
              {stringValue.substring(0, 47)}...
            </div>
          );
        }
        return <span className="break-all">{stringValue}</span>;
      } catch {
        return '[Complex Value]';
      }
    }
    
    const stringValue = value.toString();
    
    // 处理数字类型，使其更易读
    if (typeof value === 'number' || !isNaN(Number(stringValue))) {
      // 如果是ApertureValue, FNumber等特殊字段，格式化为更易读的形式
      if (key === 'ApertureValue' || key === 'F Number' || key === 'FNumber') {
        const num = Number(stringValue);
        if (!isNaN(num)) {
          return `f/${num.toFixed(1)}`;
        }
      }
      
      // 如果是焦距相关值
      if (key === 'FocalLength' || key.includes('Focal Length')) {
        const num = Number(stringValue);
        if (!isNaN(num)) {
          return `${num.toFixed(1)} mm`;
        }
      }
    }
    
    // 处理日期时间值
    if (isTimestamp(key)) {
      return formatDate(stringValue);
    }
    
    // 截断超长文本
    if (stringValue.length > 50 && !isTimestamp(key)) {
      return (
        <div title={stringValue} className="cursor-help break-all">
          {stringValue.substring(0, 47)}...
        </div>
      );
    }
    
    return stringValue;
  };

  // Format long field names
  const formatFieldName = (key: string) => {
    if (key.length > 25) {
      return (
        <span title={key} className="cursor-help">
          {key.substring(0, 20)}...
        </span>
      );
    }
    return key;
  };

  // Extract all keys from exifData and organize them alphabetically for a complete view
  const getAllExifItems = (): ExifItem[] => {
    return Object.entries(exifData)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .filter(item => item.value !== null && item.value !== undefined);
  };

  // Check if a field is a timestamp
  const isTimestamp = (key: string): boolean => {
    return key.includes('Date') || key.includes('Time');
  };

  // Determine if a key is important
  const isImportantField = (key: string): boolean => {
    const importantFields = [
      'Make', 'Camera Model Name', 'Aperture Value', 'F Number', 'Focal Length',
      'Shutter Speed Value', 'ISO', 'Exposure Time', 'DateTimeOriginal'
    ];
    return importantFields.includes(key);
  };

  // Define categories type
  type CategoryMap = Record<string, ExifItem[]>;
  
  // Group the EXIF data into categories
  const categories: CategoryMap = {
    Camera: [
      { key: 'Make', value: exifData.Make },
      { key: 'Camera Model Name', value: exifData.Model },
      { key: 'Software', value: exifData.Software },
      { key: 'Lens Make', value: exifData.LensMake },
      { key: 'Lens Model', value: exifData.LensModel },
      { key: 'Lens Specification', value: exifData.LensSpecification },
    ],
    Image: [
      { key: 'Image Width', value: exifData.ImageWidth },
      { key: 'Image Height', value: exifData.ImageHeight },
      { key: 'Orientation', value: exifData.Orientation },
      { key: 'Color Space', value: exifData.ColorSpace },
      { key: 'Bits Per Sample', value: exifData.BitsPerSample },
    ],
    Exposure: [
      { key: 'Exposure Time', value: exifData.ExposureTime },
      { key: 'Shutter Speed Value', value: exifData.ShutterSpeedValue },
      { key: 'Aperture Value', value: exifData.ApertureValue },
      { key: 'F Number', value: exifData.FNumber },
      { key: 'ISO', value: exifData.ISO },
      { key: 'Exposure Program', value: exifData.ExposureProgram },
      { key: 'Exposure Mode', value: exifData.ExposureMode },
      { key: 'Exposure Compensation', value: exifData.ExposureCompensation },
      { key: 'Metering Mode', value: exifData.MeteringMode },
      { key: 'Flash', value: exifData.Flash },
    ],
    Optics: [
      { key: 'Focal Length', value: exifData.FocalLength },
      { key: 'Focal Length In 35mm Format', value: exifData.FocalLengthIn35mmFormat },
      { key: 'Digital Zoom Ratio', value: exifData.DigitalZoomRatio },
    ],
    Timestamps: [
      { key: 'Create Date', value: exifData.CreateDate },
      { key: 'Date/Time Original', value: exifData.DateTimeOriginal },
      { key: 'Modify Date', value: exifData.ModifyDate },
      { key: 'Sub Sec Time', value: exifData.SubSecTime },
      { key: 'Sub Sec Time Original', value: exifData.SubSecTimeOriginal },
      { key: 'Sub Sec Time Digitized', value: exifData.SubSecTimeDigitized },
    ],
    GPS: [
      { key: 'GPS Latitude', value: exifData.GPSLatitude },
      { key: 'GPS Longitude', value: exifData.GPSLongitude },
      { key: 'GPS Altitude', value: exifData.GPSAltitude },
      { key: 'GPS Date Stamp', value: exifData.GPSDateStamp },
      { key: 'GPS Time Stamp', value: exifData.GPSTimeStamp },
    ],
    Technical: [
      { key: 'Profile Version', value: exifData.ProfileVersion },
      { key: 'JFIF Version', value: exifData.JFIFVersion },
      { key: 'X Resolution', value: exifData.XResolution },
      { key: 'Y Resolution', value: exifData.YResolution },
      { key: 'Resolution Unit', value: exifData.ResolutionUnit },
      { key: 'JFIF X Resolution', value: exifData.JFIFXResolution },
      { key: 'JFIF Y Resolution', value: exifData.JFIFYResolution },
      { key: 'JFIF Unit', value: exifData.JFIFUnit },
      { key: 'YCbCr Positioning', value: exifData.YCbCrPositioning },
      { key: 'EXIF Version', value: exifData.ExifVersion },
    ],
    File: [
      { key: 'Filename', value: exifData.FileName },
      { key: 'File Size', value: exifData.FileSize },
      { key: 'File Type', value: exifData.FileType },
      { key: 'File Type Extension', value: exifData.FileTypeExtension },
      { key: 'MIME Type', value: exifData.MIMEType },
    ],
    Composite: [
      { key: 'Image Size', value: exifData.ImageWidth && exifData.ImageHeight ? `${exifData.ImageWidth}x${exifData.ImageHeight}` : null },
      { key: 'Megapixels', value: exifData.Megapixels || (exifData.ImageWidth && exifData.ImageHeight ? 
        ((Number(exifData.ImageWidth) * Number(exifData.ImageHeight)) / 1000000).toFixed(1) : null) },
      { key: 'Scale Factor To 35 mm Equivalent', value: exifData.ScaleFactor35efl },
    ],
    // Other will be populated with remaining items
    Other: [] as ExifItem[],
  };
  
  // Populate the Other category with remaining items
  categories.Other = getAllExifItems().filter(item => {
    // Get all category keys to filter out duplicates
    const allCategoryKeys = Object.values(categories)
      .flat()
      .map((categoryItem: ExifItem) => categoryItem.key);
    return !allCategoryKeys.includes(item.key);
  });

  // Filter out categories with no values
  const filteredCategories = Object.entries(categories).reduce<CategoryMap>((acc, [category, items]) => {
    const validItems = items.filter(item => item.value !== undefined && item.value !== null);
    if (validItems.length > 0) {
      acc[category] = validItems;
    }
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(filteredCategories).map(([category, items]) => (
        <div key={category} className={`bg-white rounded-lg shadow overflow-hidden exif-card ${category === 'Other' ? 'md:col-span-2' : ''}`}>
          <h2 className="text-xl font-bold p-4 bg-gray-800 text-white exif-card-header">{category}</h2>
          <div className="p-4 exif-card-body">
            {category === 'Other' && items.length > 8 ? (
              // Multi-column layout for Other category with many items
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                <table className="w-full table-fixed mb-4 lg:mb-0">
                  <tbody>
                    {items.slice(0, Math.ceil(items.length / 2)).map((item: ExifItem, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-1 px-2 text-sm font-medium text-gray-700 w-1/2 truncate" title={item.key}>
                          {formatFieldName(item.key)}
                        </td>
                        <td className={`py-1 px-2 text-sm font-mono break-words w-1/2 ${isImportantField(item.key) ? 'highlight-value' : ''} ${isTimestamp(item.key) ? 'timestamp-cell' : ''}`}>
                          {formatValue(item.value, item.key)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full table-fixed">
                  <tbody>
                    {items.slice(Math.ceil(items.length / 2)).map((item: ExifItem, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-1 px-2 text-sm font-medium text-gray-700 w-1/2 truncate" title={item.key}>
                          {formatFieldName(item.key)}
                        </td>
                        <td className={`py-1 px-2 text-sm font-mono break-words w-1/2 ${isImportantField(item.key) ? 'highlight-value' : ''} ${isTimestamp(item.key) ? 'timestamp-cell' : ''}`}>
                          {formatValue(item.value, item.key)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Standard layout for categories with fewer items
              <table className="w-full table-fixed">
                <tbody>
                  {items.map((item: ExifItem, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-3 text-sm font-medium text-gray-700 w-1/2 truncate" title={item.key}>
                        {formatFieldName(item.key)}
                      </td>
                      <td className={`py-2 px-3 text-sm font-mono break-words w-1/2 ${isImportantField(item.key) ? 'highlight-value' : ''} ${isTimestamp(item.key) ? 'timestamp-cell' : ''}`}>
                        {formatValue(item.value, item.key)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 