# PRD: ForgeClaw Frontend Form Completion

## 🎯 Problem Statement

The ForgeClaw signup flow is missing critical form steps, causing validation failures. Backend validation expects fields that frontend doesn't collect.

## 🔍 Current State Analysis

**✅ Implemented Steps:**
- Step 1: Basic Info (firstName, lastName, email, company, phone)
- Step 3: Skills Selection (package tiers)

**❌ Missing Steps:**
- Step 2: Practice Details (practiceType, aum, clientCount, primaryCustodian)
- Step 4: Configuration (subdomain, anthropicApiKey, dataRetention)

**Impact:** Backend requires `subdomain` field but frontend has no input for it.

## 📋 Requirements

### R1: Implement Step 2 - Practice Details
- Practice Type dropdown (optional)
- Assets Under Management field (optional)
- Client Count field (optional) 
- Primary Custodian field (optional)

### R2: Implement Step 4 - Configuration
- Subdomain field (required, 3-30 chars, a-z0-9-)
- Anthropic API Key field (required, min 10 chars)
- Data Retention dropdown (optional, default 90 days)

### R3: Maintain Form Flow
- Preserve existing navigation logic
- Maintain step progress indicators
- Keep existing validation and styling

## 🛠️ Implementation Plan

### Step 2 Content (Practice Details):
```jsx
{currentStep === 2 && (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Practice Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Practice Type, AUM, Client Count, Primary Custodian */}
    </div>
  </div>
)}
```

### Step 4 Content (Configuration):
```jsx
{currentStep === 4 && (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Configure Your Instance</h2>
    <div className="grid grid-cols-1 gap-6">
      {/* Subdomain, Anthropic API Key, Data Retention */}
    </div>
  </div>
)}
```

## 📊 Success Metrics

1. All 4 steps have form content
2. No "subdomain is not allowed to be empty" validation errors
3. Complete signup flow works end-to-end

## 🏷️ Tags
`frontend` `forms` `validation` `signup-flow` `forgeclaw`
