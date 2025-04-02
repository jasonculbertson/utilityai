import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing manual entry...');
    
    // Parse the request body
    const data = await request.json();
    console.log('Received manual entry data:', data);
    
    // Validate required fields
    if (!data.billingStart || !data.billingEnd || !data.ratePlan || 
        !data.peakUsage || !data.peakRate || !data.offPeakUsage || 
        !data.offPeakRate || !data.amountDue) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Handle customer information if provided
    const customerName = data.customerName || 'Manual Entry';
    const serviceAddress = data.serviceAddress || '';
    const city = data.city || '';
    const state = data.state || 'CA';
    const zip = data.zip || '';
    
    // Format the billing period
    const startDate = new Date(data.billingStart);
    const endDate = new Date(data.billingEnd);
    
    // Calculate billing days
    const billingDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format dates as MM/DD/YYYY
    const formatDate = (date: Date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    const billingPeriod = `${formatDate(startDate)} - ${formatDate(endDate)} (${billingDays} billing days)`;
    
    // Calculate peak and off-peak charges
    const peakUsage = parseFloat(data.peakUsage);
    const peakRate = parseFloat(data.peakRate);
    const offPeakUsage = parseFloat(data.offPeakUsage);
    const offPeakRate = parseFloat(data.offPeakRate);
    
    const peakCharge = peakUsage * peakRate;
    const offPeakCharge = offPeakUsage * offPeakRate;
    
    // Analyze rate plans
    const analysis = analyzeRatePlan(data.ratePlan, peakUsage, offPeakUsage);
    
    // Prepare the response data
    const responseData = {
      serviceInfo: {
        customerName: customerName,
        serviceAddress: serviceAddress,
        city: city,
        state: state,
        zip: zip
      },
      billingInfo: {
        billingPeriod,
        rateSchedule: `Rate Schedule: ${data.ratePlan}`,
        amountDue: parseFloat(data.amountDue).toFixed(2)
      },
      energyCharges: {
        peak: {
          kWh: peakUsage,
          rate: peakRate,
          charge: peakCharge.toFixed(2)
        },
        offPeak: {
          kWh: offPeakUsage,
          rate: offPeakRate,
          charge: offPeakCharge.toFixed(2)
        },
        total: (peakCharge + offPeakCharge).toFixed(2)
      },
      analysis: analysis,
      // Additional fields for display in the UI
      ratePlan: data.ratePlan,
      amountDue: parseFloat(data.amountDue).toFixed(2),
      suggestedRatePlan: analysis.recommendedPlan,
      projectedAmount: analysis.recommendedPlanEstimatedCost,
      monthlySavings: analysis.potentialMonthlySavings,
      yearlySavings: (parseFloat(analysis.potentialMonthlySavings) * 12).toFixed(2)
    };
    
    return NextResponse.json({
      success: true,
      message: 'Manual entry processed successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error processing manual entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

function analyzeRatePlan(currentRateCode: string, peakKwh: number, offPeakKwh: number) {
  // Rate plans and their pricing
  const ratePlans = {
    'E-1': { peak: 0.37, offPeak: 0.37, description: 'Flat Rate' }, // Flat rate
    'E-TOU-B': { peak: 0.42, offPeak: 0.33, description: 'Time-of-Use (4-9pm Peak)' }, // Winter rates
    'E-TOU-C': { peak: 0.42, offPeak: 0.33, description: 'Time-of-Use (4-9pm Peak)' }, // Winter rates
    'E-TOU-D': { peak: 0.40, offPeak: 0.32, description: 'Time-of-Use (5-8pm Peak)' }, // Winter rates
    'EV2A': { peak: 0.35, offPeak: 0.27, description: 'Time-of-Use (EV Owners)' },  // Winter rates
    'EV2-A': { peak: 0.35, offPeak: 0.27, description: 'Time-of-Use (EV Owners)' }  // Winter rates
  };
  
  // Ensure the rate code is one we recognize
  if (!ratePlans[currentRateCode as keyof typeof ratePlans]) {
    currentRateCode = 'E-TOU-B'; // Default to E-TOU-B if not recognized
  }
  
  // Calculate cost under each rate plan
  const totalKwh = peakKwh + offPeakKwh;
  
  const costByPlan: Record<string, number> = {};
  const planDetails: Record<string, any> = {};
  
  for (const [plan, rates] of Object.entries(ratePlans)) {
    const peakCost = peakKwh * (rates as any).peak;
    const offPeakCost = offPeakKwh * (rates as any).offPeak;
    const totalCost = peakCost + offPeakCost;
    costByPlan[plan] = totalCost;
    
    planDetails[plan] = {
      name: plan,
      peakRate: (rates as any).peak,
      offPeakRate: (rates as any).offPeak,
      peakCost: peakCost.toFixed(2),
      offPeakCost: offPeakCost.toFixed(2),
      monthlyCost: totalCost.toFixed(2)
    };
  }
  
  // Find the cheapest plan
  let cheapestPlan = Object.keys(costByPlan)[0];
  let lowestCost = costByPlan[cheapestPlan];
  
  for (const [plan, cost] of Object.entries(costByPlan)) {
    if (cost < lowestCost) {
      cheapestPlan = plan;
      lowestCost = cost;
    }
  }
  
  // Calculate potential savings
  const currentPlanCost = costByPlan[currentRateCode];
  const potentialSavings = currentPlanCost - lowestCost;
  
  // Get descriptions for the plans
  const currentPlanDescription = (ratePlans[currentRateCode as keyof typeof ratePlans] as any)?.description || 'Time-of-Use';
  const bestPlanDescription = (ratePlans[cheapestPlan as keyof typeof ratePlans] as any)?.description || 'Time-of-Use';
  
  return {
    currentPlan: currentRateCode,
    currentPlanDescription: currentPlanDescription,
    currentPlanEstimatedCost: currentPlanCost.toFixed(2),
    recommendedPlan: cheapestPlan,
    bestPlanDescription: bestPlanDescription,
    recommendedPlanEstimatedCost: lowestCost.toFixed(2),
    potentialMonthlySavings: potentialSavings > 0 ? potentialSavings.toFixed(2) : '0.00',
    plans: Object.values(planDetails),
    bestPlan: cheapestPlan,
    currentCost: currentPlanCost.toFixed(2),
    bestCost: lowestCost.toFixed(2),
    monthlySavings: potentialSavings > 0 ? potentialSavings.toFixed(2) : '0.00',
    yearlySavings: potentialSavings > 0 ? (potentialSavings * 12).toFixed(2) : '0.00',
    allPlans: Object.entries(planDetails).map(([code, details]) => ({
      planCode: code,
      description: (ratePlans[code as keyof typeof ratePlans] as any)?.description || 'Time-of-Use',
      peakCost: parseFloat(details.peakCost),
      offPeakCost: parseFloat(details.offPeakCost),
      totalCost: parseFloat(details.monthlyCost)
    }))
  };
}
