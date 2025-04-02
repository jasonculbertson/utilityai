'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnergyData {
  kWh: number;
  rate: number;
  charge: number;
}

interface BillResult {
  serviceInfo: {
    customerName: string;
    serviceAddress: string;
    city: string;
    state: string;
    zip: string;
  };
  billingInfo: {
    billingPeriod: string;
    rateSchedule: string;
    totalBillAmount?: number;
  };
  energyCharges: {
    peak: EnergyData;
    offPeak: EnergyData;
    total: number;
  };
  analysis: {
    currentPlan: string;
    currentPlanEstimatedCost: string;
    recommendedPlan: string;
    recommendedPlanEstimatedCost: string;
    potentialMonthlySavings: string;
    costByPlan: Array<{plan: string; cost: string}>;
    calculationBreakdown?: string;
    actualBillAmount?: number;
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const [billData, setBillData] = useState<BillResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatePlanModal, setShowRatePlanModal] = useState(false);

  // Helper function to extract a numeric value from nested properties in an object
  const extractNumericValue = (obj: any, paths: string[], fallback: number = 0): number => {
    for (const path of paths) {
      const value = path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj);
      if (value !== undefined && value !== null) {
        const num = Number(value);
        if (!isNaN(num)) return num;
      }
    }
    return fallback;
  };
  
  useEffect(() => {
    // Get the bill data from localStorage
    const storedData = localStorage.getItem('billResult');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Parsed bill data:', parsedData);
        console.log('Service info from localStorage:', parsedData?.serviceInfo);
        console.log('Energy charges from localStorage:', parsedData?.energyCharges);
        
        // Ensure the data has the required structure, providing fallbacks for missing properties
        const formattedData = {
          serviceInfo: {
            customerName: parsedData?.serviceInfo?.customerName || parsedData?.customerName || 'N/A',
            // Simplify service address extraction to prioritize the address from serviceInfo
            serviceAddress: parsedData?.serviceInfo?.serviceAddress || parsedData?.address || parsedData?.serviceAddress || 'N/A',
            city: parsedData?.serviceInfo?.city || parsedData?.city || 'N/A',
            state: parsedData?.serviceInfo?.state || parsedData?.state || 'CA',
            zip: parsedData?.serviceInfo?.zip || parsedData?.zip || 'N/A'
          },
          billingInfo: {
            billingPeriod: parsedData?.billingInfo?.billingPeriod || parsedData?.billingPeriod || 'N/A',
            rateSchedule: parsedData?.billingInfo?.rateSchedule || parsedData?.ratePlan || 'N/A',
            totalBillAmount: parsedData?.billingInfo?.totalBillAmount || parsedData?.amountDue || 0
          },
          energyCharges: {
            peak: {
              kWh: extractNumericValue(parsedData, ['energyCharges.peak.kWh', 'peakKwh', 'peakUsage', 'analysis.peakUsage'], 70),
              rate: extractNumericValue(parsedData, ['energyCharges.peak.rate', 'peakRate', 'analysis.peakRate'], 0.45),
              charge: extractNumericValue(parsedData, ['energyCharges.peak.charge', 'peakCharge', 'analysis.peakCharge'], 30)
            },
            offPeak: {
              kWh: extractNumericValue(parsedData, ['energyCharges.offPeak.kWh', 'offPeakKwh', 'offPeakUsage', 'analysis.offPeakUsage'], 500),
              rate: extractNumericValue(parsedData, ['energyCharges.offPeak.rate', 'offPeakRate', 'analysis.offPeakRate'], 0.35),
              charge: extractNumericValue(parsedData, ['energyCharges.offPeak.charge', 'offPeakCharge', 'analysis.offPeakCharge'], 175)
            },
            total: extractNumericValue(parsedData, ['energyCharges.total', 'totalCharge', 'analysis.totalEnergy', 'amountDue'], 205)
          },
          analysis: {
            currentPlan: parsedData?.analysis?.currentPlan || parsedData?.ratePlan || 'N/A',
            currentPlanEstimatedCost: parsedData?.analysis?.currentPlanEstimatedCost || String(parsedData?.amountDue || '0'),
            recommendedPlan: parsedData?.analysis?.recommendedPlan || parsedData?.suggestedRatePlan || 'N/A',
            recommendedPlanEstimatedCost: parsedData?.analysis?.recommendedPlanEstimatedCost || String(parsedData?.projectedAmount || '0'),
            potentialMonthlySavings: parsedData?.analysis?.potentialMonthlySavings || String(parsedData?.monthlySavings || '0'),
            costByPlan: parsedData?.analysis?.costByPlan || [],
            calculationBreakdown: parsedData?.analysis?.calculationBreakdown || '',
            actualBillAmount: parsedData?.analysis?.actualBillAmount || parsedData?.amountDue || 0
          }
        };
        
        console.log('Formatted bill data:', formattedData);
        setBillData(formattedData);
      } catch (error) {
        console.error('Error parsing bill data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleReset = () => {
    localStorage.removeItem('billResult');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No Bill Data Found</h1>
        <p className="mb-4">No bill data was found. Please upload a bill or enter details manually.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  const {
    serviceInfo,
    billingInfo,
    energyCharges,
    analysis
  } = billData;

  // Format currency
  const formatCurrency = (value: number | string) => {
    return `$${Number(value).toFixed(2)}`;
  };

  // Format rate - handle zero rates gracefully
  const formatRate = (value: number) => {
    if (!value || isNaN(value)) return '$0.00000/kWh';
    return `$${value.toFixed(5)}/kWh`;
  };

  // Format kWh - handle zero values gracefully
  const formatKwh = (value: number) => {
    if (!value || isNaN(value)) return '0.000 kWh';
    return `${value.toFixed(3)} kWh`;
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">PG&E Bill Analysis Results</h1>
        
        {/* Service Information */}
        <div className="mb-8 p-6 border rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Service Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Customer Name:</p>
              <p className="font-medium">{serviceInfo.customerName}</p>
            </div>
            <div>
              <p className="text-gray-600">Service Address:</p>
              <p className="font-medium">{serviceInfo.serviceAddress}</p>
              <p className="font-medium">{serviceInfo.city && serviceInfo.city !== 'N/A' ? `${serviceInfo.city}, ` : ''}{serviceInfo.state} {serviceInfo.zip}</p>
            </div>
          </div>
        </div>
        
        {/* Billing Information */}
        <div className="mb-8 p-6 border rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Billing Period:</p>
              <p className="font-medium">{billingInfo.billingPeriod}</p>
            </div>
            <div>
              <p className="text-gray-600">Rate Schedule:</p>
              <p className="font-medium">{billingInfo.rateSchedule}</p>
            </div>
          </div>
        </div>
        
        {/* Energy Charges */}
        <div className="mb-8 p-6 border rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Energy Charges</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Time Period</th>
                  <th className="py-3 px-6 text-right">Usage</th>
                  <th className="py-3 px-6 text-right">Rate</th>
                  <th className="py-3 px-6 text-right">Charge</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className="font-medium">Peak</span>
                  </td>
                  <td className="py-3 px-6 text-right">{formatKwh(energyCharges.peak.kWh)}</td>
                  <td className="py-3 px-6 text-right">{formatRate(energyCharges.peak.rate)}</td>
                  <td className="py-3 px-6 text-right">{formatCurrency(energyCharges.peak.charge)}</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className="font-medium">Off-Peak</span>
                  </td>
                  <td className="py-3 px-6 text-right">{formatKwh(energyCharges.offPeak.kWh)}</td>
                  <td className="py-3 px-6 text-right">{formatRate(energyCharges.offPeak.rate)}</td>
                  <td className="py-3 px-6 text-right">{formatCurrency(energyCharges.offPeak.charge)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className="font-bold">Total</span>
                  </td>
                  <td className="py-3 px-6 text-right font-bold">
                    {formatKwh(energyCharges.peak.kWh + energyCharges.offPeak.kWh)}
                  </td>
                  <td className="py-3 px-6 text-right"></td>
                  <td className="py-3 px-6 text-right font-bold">{formatCurrency(energyCharges.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Rate Plan Analysis */}
        <div className="mb-8 p-6 border rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Rate Plan Analysis</h2>
          
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600">Current Plan:</p>
                <p className="text-lg font-bold">{analysis.currentPlan}</p>
                <p className="text-gray-600 mt-1">Estimated Monthly Cost:</p>
                <p className="text-lg font-bold">{formatCurrency(analysis.currentPlanEstimatedCost)}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Recommended Plan:</p>
                <p className="text-lg font-bold text-green-600">{analysis.recommendedPlan}</p>
                <p className="text-gray-600 mt-1">Estimated Monthly Cost:</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(analysis.recommendedPlanEstimatedCost)}</p>
              </div>
            </div>
            
            {/* Always show a savings or status section */}
            <div className={`p-3 ${Number(analysis.potentialMonthlySavings) > 0 ? 'bg-green-100' : 'bg-blue-100'} rounded-lg text-center`}>
              {Number(analysis.potentialMonthlySavings) > 0 ? (
                <>
                  <p className="text-gray-700">Potential Monthly Savings:</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(analysis.potentialMonthlySavings)}</p>
                  <p className="text-gray-700 mt-1">Potential Annual Savings:</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(Number(analysis.potentialMonthlySavings) * 12)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700">Plan Status:</p>
                  <p className="text-xl font-bold text-blue-700">You're already on the optimal plan</p>
                  <p className="text-gray-700 mt-1">No additional savings available</p>
                </>
              )}
              
              {/* Always show calculation breakdown when available */}
              {analysis.calculationBreakdown && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
                  <h4 className="font-bold mb-2">Calculation Breakdown:</h4>
                  <pre className="whitespace-pre-wrap text-sm p-2 bg-white rounded border border-gray-200">
                    {analysis.calculationBreakdown}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Detailed Rate Plan Comparison</h3>
          
          {/* Rate Plan Comparison Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="min-w-full bg-white mb-4">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Feature</th>
                  <th className="py-3 px-6 text-center">{analysis.currentPlan} (Current)</th>
                  <th className="py-3 px-6 text-center">{analysis.recommendedPlan} (Recommended)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-left font-medium">Peak Hours</td>
                  <td className="py-3 px-6 text-center">
                    {analysis.currentPlan.includes('EV2A') || analysis.currentPlan.includes('E-TOU-C') ? '4-9 PM' : 
                     analysis.currentPlan.includes('E-TOU-D') ? '5-8 PM' : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {analysis.recommendedPlan.includes('EV2A') || analysis.recommendedPlan.includes('E-TOU-C') ? '4-9 PM' : 
                     analysis.recommendedPlan.includes('E-TOU-D') ? '5-8 PM' : 'N/A'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-left font-medium">Peak Rate</td>
                  <td className="py-3 px-6 text-center">{formatRate(energyCharges.peak.rate)}</td>
                  <td className="py-3 px-6 text-center">
                    {analysis.recommendedPlan.includes('EV2A') ? '$0.35/kWh (Winter) / $0.47/kWh (Summer)' : 
                     analysis.recommendedPlan.includes('E-TOU-C') ? '$0.42/kWh (Winter) / $0.54/kWh (Summer)' : 
                     analysis.recommendedPlan.includes('E-TOU-D') ? '$0.40/kWh (Winter) / $0.50/kWh (Summer)' : 
                     '$0.31/kWh'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-left font-medium">Off-Peak Rate</td>
                  <td className="py-3 px-6 text-center">{formatRate(energyCharges.offPeak.rate)}</td>
                  <td className="py-3 px-6 text-center">
                    {analysis.recommendedPlan.includes('EV2A') ? '$0.27/kWh (Winter) / $0.29/kWh (Summer)' : 
                     analysis.recommendedPlan.includes('E-TOU-C') ? '$0.33/kWh (Winter) / $0.36/kWh (Summer)' : 
                     analysis.recommendedPlan.includes('E-TOU-D') ? '$0.32/kWh (Winter) / $0.35/kWh (Summer)' : 
                     '$0.31/kWh'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200 font-medium">
                  <td className="py-3 px-6 text-left">Projected Monthly Cost</td>
                  <td className="py-3 px-6 text-center">{formatCurrency(analysis.currentPlanEstimatedCost)}</td>
                  <td className="py-3 px-6 text-center text-green-600">{formatCurrency(analysis.recommendedPlanEstimatedCost)}</td>
                </tr>
                <tr className={`border-b border-gray-200 font-medium ${Number(analysis.potentialMonthlySavings) > 0 ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <td className="py-3 px-6 text-left">Potential Monthly Savings</td>
                  <td className="py-3 px-6 text-center">-</td>
                  <td className="py-3 px-6 text-center ${Number(analysis.potentialMonthlySavings) > 0 ? 'text-green-600' : 'text-blue-600'}">
                    {Number(analysis.potentialMonthlySavings) > 0 
                      ? formatCurrency(analysis.potentialMonthlySavings)
                      : 'Already Optimal'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Cost Comparison by Rate Plan</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Rate Plan</th>
                  <th className="py-3 px-6 text-right">Estimated Monthly Cost</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {analysis.costByPlan.map((planCost, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-200 hover:bg-gray-50 ${planCost.plan === analysis.recommendedPlan ? 'bg-green-50' : ''}`}
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <span className={`font-medium ${planCost.plan === analysis.recommendedPlan ? 'text-green-600' : ''}`}>
                        {planCost.plan}
                        {planCost.plan === analysis.currentPlan && ' (Current)'}
                        {planCost.plan === analysis.recommendedPlan && ' (Recommended)'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className={planCost.plan === analysis.recommendedPlan ? 'font-bold text-green-600' : ''}>
                        {formatCurrency(planCost.cost)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Rate Plan Descriptions Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowRatePlanModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            View Rate Plan Descriptions
          </button>
        </div>
        
        {/* Rate Plan Modal */}
        {showRatePlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Rate Plan Descriptions</h2>
                  <button
                    onClick={() => setShowRatePlanModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">E-1: Flat Rate (Tiered Pricing)</h3>
                    <p className="text-gray-600">$0.31/kWh all day</p>
                    <p className="text-gray-600 mt-2">This is a simple flat rate plan with tiered pricing. You pay the same rate regardless of when you use electricity.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">E-TOU-B: Time-of-Use (4-9pm Peak)</h3>
                    <p className="text-gray-600">Winter: $0.42/kWh peak, $0.33/kWh off-peak</p>
                    <p className="text-gray-600">Summer: $0.54/kWh peak, $0.36/kWh off-peak</p>
                    <p className="text-gray-600 mt-2">Peak hours are 4-9 PM every day. This plan works well if you can shift most of your electricity usage to off-peak hours.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">E-TOU-C: Time-of-Use (4-9pm Peak)</h3>
                    <p className="text-gray-600">Winter: $0.42/kWh peak, $0.33/kWh off-peak</p>
                    <p className="text-gray-600">Summer: $0.54/kWh peak, $0.36/kWh off-peak</p>
                    <p className="text-gray-600 mt-2">Peak hours are 4-9 PM every day. Similar to E-TOU-B with slightly different pricing structures.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">E-TOU-D: Time-of-Use (5-8pm Peak)</h3>
                    <p className="text-gray-600">Winter: $0.40/kWh peak, $0.32/kWh off-peak</p>
                    <p className="text-gray-600">Summer: $0.50/kWh peak, $0.35/kWh off-peak</p>
                    <p className="text-gray-600 mt-2">Peak hours are 5-8 PM every day. Shorter peak period compared to E-TOU-C, but with slightly different rates.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">EV2-A: Time-of-Use (EV Owners)</h3>
                    <p className="text-gray-600">Winter: $0.35/kWh peak, $0.27/kWh off-peak</p>
                    <p className="text-gray-600">Summer: $0.47/kWh peak, $0.29/kWh off-peak</p>
                    <p className="text-gray-600 mt-2">Designed for electric vehicle owners. Peak hours are 4-9 PM. Lower rates, especially during off-peak when you can charge your vehicle.</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowRatePlanModal(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Process Another Bill
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Print Results
          </button>
        </div>
      </main>
    </div>
  );
}
