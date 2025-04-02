// src/app/debug-bill/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function DebugBillPage() {
  const [billData, setBillData] = useState<any>(null);

  useEffect(() => {
    // Get the bill data from localStorage when the component mounts
    const storedData = localStorage.getItem('billResult');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setBillData(parsedData);
      } catch (error) {
        console.error('Error parsing bill data:', error);
      }
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bill Data Debug</h1>
      
      {billData ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Bill Data Structure</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 mb-6">
            {JSON.stringify(billData, null, 2)}
          </pre>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Service Info</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(billData.serviceInfo, null, 2)}
              </pre>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Billing Info</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(billData.billingInfo, null, 2)}
              </pre>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Energy Usage</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(billData.energyUsage, null, 2)}
            </pre>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Analysis</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(billData.analysis, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <p>No bill data found in localStorage. Please upload a bill first.</p>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Manual Fix Service Info</h2>
        <button
          onClick={() => {
            if (billData) {
              // Get OCR text from the debug section
              const ocrTextArea = document.getElementById('ocr-text') as HTMLTextAreaElement;
              if (ocrTextArea && ocrTextArea.value) {
                const ocrText = ocrTextArea.value;
                
                // Extract service info from OCR text
                const serviceForBlock = ocrText.match(/Service For:\s*([\s\S]*?)(?:\n\n|\n[^\s]|$)/i);
                if (serviceForBlock && serviceForBlock[1]) {
                  const lines = serviceForBlock[1].split('\n')
                    .map(line => line.trim())
                    .filter(line => line);
                  
                  console.log('Service For block lines:', lines);
                  
                  // Update bill data with service info
                  const updatedBillData = {...billData};
                  if (!updatedBillData.serviceInfo) {
                    updatedBillData.serviceInfo = {};
                  }
                  
                  // First line is customer name
                  if (lines.length >= 1) {
                    updatedBillData.serviceInfo.customerName = lines[0];
                  }
                  
                  // Second line is service address
                  if (lines.length >= 2) {
                    updatedBillData.serviceInfo.serviceAddress = lines[1];
                  }
                  
                  // Third line is city, state, zip
                  if (lines.length >= 3) {
                    const cityStateZipParts = lines[2].match(/([^,]+),?\s*([A-Z]{2})\s*(\d{5})/i);
                    if (cityStateZipParts) {
                      updatedBillData.serviceInfo.city = cityStateZipParts[1].trim();
                      updatedBillData.serviceInfo.state = cityStateZipParts[2];
                      updatedBillData.serviceInfo.zip = cityStateZipParts[3];
                    }
                  }
                  
                  // Save updated bill data
                  localStorage.setItem('billResult', JSON.stringify(updatedBillData));
                  setBillData(updatedBillData);
                  alert('Service info updated! Go to the results page to see the changes.');
                } else {
                  alert('Could not find Service For block in OCR text');
                }
              } else {
                alert('Please paste OCR text in the textarea below');
              }
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Extract Service Info from OCR
        </button>
        
        <div className="mt-4">
          <textarea
            id="ocr-text"
            className="w-full h-60 p-2 border rounded"
            placeholder="Paste OCR text here..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}
