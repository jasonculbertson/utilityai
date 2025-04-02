# Utility AI - Product Requirements Document

**PG&E Bill Analysis & Energy Optimization Platform**

**Version:** 1.0  
**Date:** March 25, 2025  
**Author:** Utility AI Team  

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Market Analysis](#3-market-analysis)
4. [User Personas](#4-user-personas)
5. [Product Roadmap](#5-product-roadmap)
6. [Feature Requirements](#6-feature-requirements)
7. [Technical Requirements](#7-technical-requirements)
8. [User Experience](#8-user-experience)
9. [Analytics & Success Metrics](#9-analytics--success-metrics)
10. [Go-to-Market Strategy](#10-go-to-market-strategy)
11. [Appendices](#11-appendices)

## 1. Executive Summary

Utility AI is an intelligent energy management platform that helps PG&E customers optimize their utility costs through advanced bill analysis, rate plan optimization, and energy usage recommendations. The platform leverages artificial intelligence, OCR technology, and direct API integration with PG&E's Share My Data service to provide personalized insights and actionable recommendations.

This PRD outlines our product vision and development roadmap for the next 12 months, focusing on enhancing core functionality, implementing PG&E API integration, and developing advanced features such as anomaly detection and HVAC optimization.

### Key Objectives

- Transition from OCR-based bill processing to direct PG&E API integration
- Implement intelligent energy usage monitoring and anomaly detection
- Develop weather-integrated HVAC optimization recommendations
- Create a scalable, user-friendly platform that delivers measurable cost savings
- Establish a foundation for potential monetization through premium features

## 2. Product Overview

### 2.1 Product Description

Utility AI is a web-based application that analyzes PG&E utility bills and energy usage data to identify cost-saving opportunities. The platform uses artificial intelligence to recommend optimal rate plans, detect unusual energy consumption, and provide personalized energy efficiency recommendations.

### 2.2 Value Proposition

- **For Residential Customers:** Save money on utility bills through personalized rate plan optimization and energy usage insights without requiring technical expertise.
  
- **For Small Business Owners:** Reduce operational costs through intelligent energy management and receive alerts about unusual consumption patterns that may indicate equipment issues.
  
- **For Energy Consultants:** Efficiently analyze multiple client accounts with professional-grade tools and generate detailed reports that demonstrate potential savings.
  
- **For Property Managers:** Monitor energy usage across multiple properties, identify inefficiencies, and optimize utility costs at scale.

### 2.3 Current State Assessment

The current application provides basic functionality including:

- PDF bill upload with OCR processing
- Manual data entry option
- Simple rate plan analysis
- Basic results visualization

Limitations of the current implementation include:

- Dependency on OCR accuracy for data extraction
- Limited historical data analysis
- No real-time usage monitoring
- Basic error handling
- Performance issues on Heroku deployment

## 3. Market Analysis

### 3.1 Target Market

- **Primary:** Residential PG&E customers in California (approximately 5.5 million households)
- **Secondary:** Small business owners with PG&E accounts (approximately 500,000 businesses)
- **Tertiary:** Energy consultants and property managers in California

### 3.2 Market Size & Opportunity

- Total addressable market: 6+ million PG&E accounts
- Average annual electricity bill: $1,500 per household
- Potential savings through rate optimization: 10-20% ($150-300 per household annually)
- Total market opportunity: $900M+ in potential customer savings

### 3.3 Competitive Landscape

**Direct Competitors:**
- Energy management platforms (Sense, Bidgely)
- Utility bill analysis services (Arcadia, WattBuy)
- Rate comparison tools (provided by PG&E and third parties)

**Indirect Competitors:**
- Smart home energy management systems
- Energy consultants and auditors
- DIY spreadsheet analysis

### 3.4 Competitive Advantages

- Integration with PG&E Share My Data API for accurate, real-time data
- AI-powered analysis tailored to California-specific rate plans
- Comprehensive approach combining rate optimization, usage monitoring, and HVAC recommendations
- User-friendly interface accessible to non-technical users

## 4. User Personas

### 4.1 Residential User: Cost-Conscious Homeowner

**Profile:** Sarah, 35, homeowner in San Francisco

**Goals:**
- Reduce monthly utility bills
- Understand energy usage patterns
- Make informed decisions about rate plans

**Pain Points:**
- Confused by complex rate structures
- Surprised by unexpectedly high bills
- Unsure how to optimize energy usage

**Use Cases:**
- Upload PG&E bill to identify better rate plans
- Receive alerts about unusual energy consumption
- Get personalized recommendations for reducing costs

### 4.2 Small Business Owner

**Profile:** James, 45, retail store owner in Oakland

**Goals:**
- Minimize operational costs
- Identify equipment inefficiencies
- Budget accurately for utility expenses

**Pain Points:**
- Limited time to analyze energy usage
- Difficulty identifying sources of energy waste
- Concerns about equipment being left on after hours

**Use Cases:**
- Monitor real-time energy usage during business hours
- Receive alerts about unusual after-hours consumption
- Get recommendations for shifting energy-intensive operations to lower-rate periods

### 4.3 Energy Consultant

**Profile:** Jennifer, 41, independent energy consultant

**Goals:**
- Efficiently analyze multiple client accounts
- Demonstrate potential savings to clients
- Provide professional recommendations

**Pain Points:**
- Time-consuming manual analysis of bills
- Difficulty accessing historical usage data
- Need for professional-looking reports

**Use Cases:**
- Manage multiple client accounts in one platform
- Generate detailed savings reports for clients
- Model different usage scenarios to demonstrate potential savings

### 4.4 Property Manager

**Profile:** Robert, 39, manager of 15 residential properties

**Goals:**
- Monitor energy costs across multiple properties
- Identify inefficient properties for improvements
- Demonstrate value to property owners

**Pain Points:**
- Difficulty comparing efficiency across properties
- Time-consuming bill management for multiple accounts
- Identifying unauthorized energy usage

**Use Cases:**
- View portfolio-wide energy usage dashboard
- Compare similar properties to identify inefficiencies
- Receive alerts about unusual consumption patterns

## 5. Product Roadmap

### 5.1 Phase 1: Foundation Enhancement (Q2 2025, April-June)

**Goal:** Improve core functionality and prepare for PG&E API integration

**Key Deliverables:**
- Enhanced OCR processing with improved error handling
- User account creation and authentication system
- Basic data persistence for historical bill storage
- Improved UI/UX with responsive design
- PG&E Share My Data API registration and initial integration

### 5.2 Phase 2: API Integration & Core Features (Q3 2025, July-September)

**Goal:** Transition from OCR to API-based data retrieval and implement core monitoring features

**Key Deliverables:**
- Complete PG&E Share My Data API integration
- Real-time energy usage dashboard
- Basic anomaly detection and alerts
- Historical usage visualization and analysis
- Multi-account management for consultants and property managers

### 5.3 Phase 3: Advanced Analytics (Q4 2025, October-December)

**Goal:** Implement sophisticated analysis features and personalized recommendations

**Key Deliverables:**
- Advanced anomaly detection with contextual awareness
- Weather data integration and correlation analysis
- Predictive bill forecasting
- Enhanced rate plan optimization with seasonal considerations
- Detailed energy efficiency recommendations

### 5.4 Phase 4: Smart Home & Premium Features (Q1 2026, January-March)

**Goal:** Expand functionality with smart home integration and premium features

**Key Deliverables:**
- Smart thermostat integration (Nest, Ecobee)
- HVAC optimization with weather forecasting
- Mobile application development
- Premium subscription tier with advanced features
- API access for third-party integration

## 6. Feature Requirements

### 6.1 User Management & Authentication

#### 6.1.1 User Registration & Authentication
- Email and password registration
- OAuth login options (Google, Apple)
- Password reset functionality
- Session management and security

#### 6.1.2 User Profile Management
- Personal information management
- Communication preferences
- Notification settings
- Account deletion

#### 6.1.3 Multi-Account Management
- Add/remove multiple PG&E accounts
- Account grouping and labeling
- Role-based access control for consultants
- Property/client management for professionals

### 6.2 PG&E Data Integration

#### 6.2.1 Share My Data Authorization
- OAuth flow for PG&E authorization
- Scope selection for data access
- Authorization management and renewal
- Secure credential handling

#### 6.2.2 Data Retrieval & Processing
- Interval usage data retrieval (15-min/hourly electric, daily gas)
- Bill and rate plan information access
- Solar generation data for applicable customers
- Historical data import and processing

#### 6.2.3 Data Synchronization
- Scheduled data updates
- Real-time data streaming where available
- Conflict resolution and error handling
- Data validation and quality assurance

### 6.3 Energy Usage Monitoring & Analysis

#### 6.3.1 Usage Dashboard
- Real-time usage visualization
- Historical usage trends
- Cost tracking and projection
- Usage breakdown by time period

#### 6.3.2 Comparative Analysis
- Year-over-year comparisons
- Similar household benchmarking
- Property-to-property comparison
- Rate plan impact analysis

#### 6.3.3 Anomaly Detection
- Unusual usage pattern identification
- Contextual anomaly classification
- Multi-level alerting system
- Feedback mechanism for alert accuracy

### 6.4 Rate Plan Optimization

#### 6.4.1 Rate Plan Analysis
- Current plan cost calculation
- Alternative plan cost projection
- Savings opportunity identification
- Seasonal rate plan recommendations

#### 6.4.2 Usage Simulation
- What-if scenario modeling
- Usage pattern modification simulation
- Cost impact visualization
- Behavioral change recommendations

#### 6.4.3 Implementation Guidance
- Step-by-step rate change instructions
- Timing recommendations for plan switches
- Documentation for PG&E submission
- Verification of successful changes

### 6.5 HVAC & Weather Integration

#### 6.5.1 Weather Data Integration
- Local weather data retrieval
- Historical weather correlation
- Weather forecast integration
- Microclimate considerations

#### 6.5.2 HVAC Optimization
- Temperature setpoint recommendations
- Pre-cooling/pre-heating strategies
- Peak rate avoidance tactics
- Comfort vs. cost balancing

#### 6.5.3 Smart Device Integration
- Thermostat control integration
- Schedule programming recommendations
- Automated implementation options
- Manual override capabilities

### 6.6 Notification & Alerting System

#### 6.6.1 Alert Configuration
- Customizable alert thresholds
- Notification channel preferences
- Alert priority settings
- Scheduling and quiet periods

#### 6.6.2 Delivery Channels
- In-app notifications
- Email alerts
- SMS messages (premium)
- Push notifications (mobile)

#### 6.6.3 Alert Types
- Unusual usage alerts
- Bill threshold warnings
- Rate change opportunities
- Weather-related recommendations

### 6.7 Reporting & Exports

#### 6.7.1 Standard Reports
- Monthly usage summary
- Savings opportunity report
- Anomaly detection report
- Efficiency recommendation report

#### 6.7.2 Custom Reports
- Report builder functionality
- Custom date range selection
- Metric selection and filtering
- Comparison options

#### 6.7.3 Export Options
- PDF report generation
- CSV data export
- API data access (premium)
- Scheduled report delivery

## 7. Technical Requirements

### 7.1 Platform Architecture

#### 7.1.1 Frontend
- Next.js React framework
- Responsive design for all devices
- Progressive Web App capabilities
- Accessibility compliance (WCAG 2.1)

#### 7.1.2 Backend
- Node.js/Express API services
- Serverless functions for specific operations
- Microservices architecture for scalability
- RESTful API design

#### 7.1.3 Database
- PostgreSQL for relational data
- MongoDB for time-series usage data
- Redis for caching and session management
- Data encryption at rest and in transit

### 7.2 Integration Requirements

#### 7.2.1 PG&E Share My Data API
- OAuth 2.0 implementation
- ESPI standard compliance
- Secure credential management
- Rate limiting and backoff handling

#### 7.2.2 Weather API Integration
- Multiple provider support (OpenWeatherMap, Weather.gov)
- Geocoding for precise location matching
- Forecast data retrieval and processing
- Historical weather data correlation

#### 7.2.3 Smart Device APIs
- Nest/Google Home integration
- Ecobee API integration
- Generic thermostat support via user input
- Secure device authorization

### 7.3 Performance Requirements

#### 7.3.1 Scalability
- Support for 10,000+ concurrent users
- Efficient handling of millions of data points
- Horizontal scaling capabilities
- Load balancing implementation

#### 7.3.2 Response Time
- Page load time < 2 seconds
- API response time < 500ms
- Real-time data updates < 5 seconds
- Report generation < 10 seconds

#### 7.3.3 Availability
- 99.9% uptime SLA
- Graceful degradation under load
- Redundant systems for critical functions
- Comprehensive monitoring and alerting

### 7.4 Security Requirements

#### 7.4.1 Data Protection
- End-to-end encryption for sensitive data
- Secure credential storage
- Regular security audits
- Compliance with CCPA and other regulations

#### 7.4.2 Authentication & Authorization
- Multi-factor authentication option
- Role-based access control
- Session management and timeout
- API key security for integrations

#### 7.4.3 Compliance
- GDPR compliance for data handling
- CCPA compliance for California users
- SOC 2 compliance preparation
- Regular penetration testing

## 8. User Experience

### 8.1 User Interface Design

#### 8.1.1 Design System
- Consistent component library
- Responsive grid system
- Accessibility-first approach
- Dark/light mode support

#### 8.1.2 Information Architecture
- Intuitive navigation structure
- Progressive disclosure of complex information
- Contextual help and tooltips
- Guided workflows for key tasks

#### 8.1.3 Visualization Standards
- Consistent chart and graph styles
- Color coding for status and alerts
- Interactive data exploration
- Mobile-friendly visualizations

### 8.2 User Onboarding

#### 8.2.1 First-Time Experience
- Guided welcome tour
- PG&E connection walkthrough
- Quick value demonstration
- Progress tracking for setup completion

#### 8.2.2 Educational Content
- Contextual tutorials
- Video demonstrations
- Knowledge base articles
- FAQ section

#### 8.2.3 Ongoing Engagement
- Regular insights and tips
- Feature discovery prompts
- Usage milestone celebrations
- Savings achievement recognition

### 8.3 Accessibility

#### 8.3.1 Standards Compliance
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- Color contrast requirements

#### 8.3.2 Inclusive Design
- Multiple language support
- Text size adjustment
- Alternative text for images
- Reduced motion option

## 9. Analytics & Success Metrics

### 9.1 Key Performance Indicators

#### 9.1.1 User Engagement
- Monthly active users
- Session duration and frequency
- Feature adoption rates
- Retention and churn rates

#### 9.1.2 Business Metrics
- User acquisition cost
- Conversion rate to premium (future)
- Revenue per user (future)
- Customer lifetime value

#### 9.1.3 Product Effectiveness
- Average user savings
- Anomaly detection accuracy
- Recommendation implementation rate
- User satisfaction scores

### 9.2 Analytics Implementation

#### 9.2.1 User Analytics
- Behavior tracking
- Funnel analysis
- Feature usage tracking
- Error and exception monitoring

#### 9.2.2 Performance Monitoring
- System health metrics
- API performance tracking
- Error rate monitoring
- Resource utilization

#### 9.2.3 Business Intelligence
- Custom reporting dashboard
- Cohort analysis capabilities
- A/B testing framework
- Predictive analytics

## 10. Go-to-Market Strategy

### 10.1 Launch Plan

#### 10.1.1 Beta Program
- Closed beta with 50-100 users
- Focused feedback collection
- Iterative improvement cycle
- Bug bounty program

#### 10.1.2 Public Launch
- Phased rollout by user segment
- Launch event and PR
- Early adopter incentives
- Referral program

### 10.2 Marketing Strategy

#### 10.2.1 Channel Strategy
- Content marketing (blog, guides)
- Social media presence
- SEO optimization
- Email marketing

#### 10.2.2 Partnerships
- Energy consultant relationships
- Property management companies
- Smart home device manufacturers
- Sustainability organizations

### 10.3 Pricing Strategy (Future)

#### 10.3.1 Freemium Model
- Free tier with basic functionality
- Premium tier with advanced features
- Enterprise tier for professionals
- Usage-based pricing options

#### 10.3.2 Premium Features
- Advanced anomaly detection
- Smart device integration
- Professional reporting
- Multi-account management

## 11. Appendices

### 11.1 Technical Documentation

#### 11.1.1 API Documentation
- PG&E Share My Data API reference
- Weather API integration details
- Smart device API specifications
- Internal API documentation

#### 11.1.2 Data Models
- User data schema
- Energy usage data schema
- Bill and rate plan schema
- Analytics data schema

### 11.2 User Research

#### 11.2.1 User Interview Summaries
- Residential user insights
- Small business owner feedback
- Energy consultant requirements
- Property manager needs

#### 11.2.2 Competitive Analysis
- Feature comparison matrix
- Pricing comparison
- User experience evaluation
- Market positioning

### 11.3 Regulatory Considerations

#### 11.3.1 Data Privacy Regulations
- CCPA compliance requirements
- GDPR considerations
- PG&E data usage policies
- Industry best practices

#### 11.3.2 Energy Industry Regulations
- CPUC requirements
- Green Button standard compliance
- Energy data access regulations
- Future regulatory considerations

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2025-03-25 | Utility AI Team | Initial PRD |

---

*This document is confidential and proprietary to Utility AI. It contains information that is proprietary and may not be reproduced or disclosed without prior written approval.*
