'use client';

import { useState, useEffect } from 'react';

export default function DebugAddressPage() {
  const [billData, setBillData] = useState<any>(null);

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
  }, []);

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Debug Address Information</h1>
        
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
