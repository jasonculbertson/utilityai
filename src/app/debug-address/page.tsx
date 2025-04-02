'use client';

import { useState, useEffect } from 'react';

export default function DebugAddressPage() {
  const [billData, setBillData] = useState<any>(null);
  const [ocrFiles, setOcrFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');
  const [regexResults, setRegexResults] = useState<any>({});

  useEffect(() => {
    // Get the bill data from localStorage
    const storedData = localStorage.getItem('billResult');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Debug - Parsed bill data:', parsedData);
        setBillData(parsedData);
      } catch (error) {
        console.error('Error parsing bill data:', error);
      }
    }
    
    // Fetch list of OCR files
    fetchOcrFiles();
  }, []);
  
  const fetchOcrFiles = async () => {
    try {
      const response = await fetch('/api/debug-ocr?action=list');
      const data = await response.json();
      setOcrFiles(data.files || []);
      if (data.files && data.files.length > 0) {
        setSelectedFile(data.files[0]);
        fetchOcrText(data.files[0]);
      }
    } catch (error) {
      console.error('Error fetching OCR files:', error);
    }
  };
  
  const fetchOcrText = async (filename: string) => {
    try {
      const response = await fetch(`/api/debug-ocr?action=view&filename=${encodeURIComponent(filename)}`);
      const data = await response.json();
      setOcrText(data.ocrText || '');
      testRegexPatterns(data.ocrText || '');
    } catch (error) {
      console.error('Error fetching OCR text:', error);
    }
  };
  
  const testRegexPatterns = (text: string) => {
    const results: any = {};
    
    // Test different regex patterns
    // 1. Service For block extraction
    const serviceForLines = text.match(/Service For:([\s\S]*?)(?:\n\n|\n[^\s]|$)/i);
    results.serviceForLines = serviceForLines ? serviceForLines[1] : null;
    
    // 2. Service address regex from results page
    const addressRegex = /Service For:.*?([0-9]+\s+[A-Za-z\s]+(?:RD|ST|AVE|BLVD|LN|DR|WAY|PL|CT|TER))\s*([A-Za-z\s]+),?\s*([A-Z]{2})\s*([0-9]{5})/i;
    const addressMatch = text.match(addressRegex);
    results.addressMatch = addressMatch || null;
    
    setRegexResults(results);
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Debug Address Information</h1>
        
        {/* OCR Files Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">OCR Text Analysis</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">OCR Files</h3>
            <select 
              className="w-full p-2 border rounded" 
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                fetchOcrText(e.target.value);
              }}
            >
              {ocrFiles.map((file, index) => (
                <option key={index} value={file}>{file}</option>
              ))}
            </select>
          </div>
          
          {ocrText && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">OCR Text</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
                  {ocrText}
                </pre>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Service Address Regex Results</h3>
                
                <div className="mb-2">
                  <h4 className="font-medium">Service For Block:</h4>
                  {regexResults.serviceForLines ? (
                    <pre className="bg-green-50 border border-green-200 p-2 rounded overflow-auto max-h-40 text-sm">
                      {regexResults.serviceForLines}
                    </pre>
                  ) : (
                    <p className="text-red-500">No match found for Service For block</p>
                  )}
                </div>
                
                <div className="mb-2">
                  <h4 className="font-medium">Address Match:</h4>
                  {regexResults.addressMatch ? (
                    <pre className="bg-green-50 border border-green-200 p-2 rounded overflow-auto max-h-40 text-sm">
                      {JSON.stringify(regexResults.addressMatch, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-red-500">No match found for address pattern</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {billData ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Bill Data Structure</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Service Info</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(billData.serviceInfo || {}, null, 2)}
              </pre>
            </div>
            
            {/* Raw Data Section */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Raw Data Structure</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(billData, null, 2)}
              </pre>
            </div>
            
            {/* Results Page Preview */}
            <div className="border-t mt-6 pt-6">
              <h2 className="text-2xl font-semibold mb-4">Results Page Preview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Service Information</h3>
                  <p><strong>Customer Name:</strong> {billData.serviceInfo?.customerName || 'N/A'}</p>
                  <p><strong>Service Address:</strong> {billData.serviceInfo?.serviceAddress || 'N/A'}</p>
                  <p><strong>City:</strong> {billData.serviceInfo?.city || 'N/A'}</p>
                  <p><strong>State:</strong> {billData.serviceInfo?.state || 'N/A'}</p>
                  <p><strong>ZIP:</strong> {billData.serviceInfo?.zip || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
            <p>No bill data found in localStorage. Please upload a bill or use manual entry first.</p>
          </div>
        )}
      </main>
    </div>
  );
}
