# PRD: ForgeClaw API Validation Debugging Enhancement

## 🎯 Problem Statement

The ForgeClaw advisor signup flow is failing with "Validation failed" errors, but the current error handling provides insufficient diagnostic information to identify root causes. This creates debugging loops where fixes are applied blindly without understanding the actual validation failures.

## 🔍 Current State Analysis

### Issues Identified:
1. **Frontend error handling discards critical diagnostic data** - Only shows generic "Validation failed" message while discarding the detailed `errorData.details` array from Joi validation
2. **Required fields may be receiving empty strings** - Fields like `firstName`, `lastName`, `email`, `company` have `.min(1)` validation but may receive empty string defaults
3. **Potential unknown field injection** - Browser extensions or form serialization may inject unexpected fields
4. **Blind debugging cycle** - Cannot determine which specific fields are failing validation

### Technical Root Cause:
- Frontend `handleSubmit` error handling: `setError(error instanceof Error ? error.message : 'Failed to create your instance. Please try again.')`
- Backend Joi validation returns detailed `details` array but frontend discards it
- Validation fails silently with no field-specific feedback

## 📋 Requirements

### R1: Enhanced Error Diagnostics
**Priority:** P0 (Critical)
- Frontend must surface actual Joi validation error details to developer/user
- Error messages should specify which fields failed validation and why
- Temporary debugging enhancement acceptable for diagnosis phase

### R2: Validation Protection
**Priority:** P1 (Important)  
- Backend validation should strip unknown fields to prevent injection issues
- Add `stripUnknown: true` to Joi validation call

### R3: Field-by-Field Analysis
**Priority:** P1 (Important)
- Ability to trace each form field through validation pipeline
- Documentation of expected vs actual values for each field

## 🛠️ Technical Implementation

### Frontend Changes (forgeclaw-portal/src/pages/signup.tsx)
```typescript
// BEFORE (line ~155):
setError(error instanceof Error ? error.message : 'Failed to create your instance. Please try again.')

// AFTER (debugging enhancement):
if (errorData && errorData.details) {
  const detailedErrors = errorData.details.join(', ');
  setError(`Validation failed: ${detailedErrors}`);
} else {
  setError(error instanceof Error ? error.message : 'Failed to create your instance. Please try again.');
}
```

### Backend Changes (portal-api/src/routes/advisors.ts)
```typescript
// BEFORE (line ~44):
const { error, value } = createAdvisorSchema.validate(req.body);

// AFTER (add stripUnknown protection):
const { error, value } = createAdvisorSchema.validate(req.body, { stripUnknown: true });
```

## 🧪 Acceptance Criteria

### AC1: Detailed Error Visibility
- **GIVEN** a validation failure occurs
- **WHEN** user attempts advisor signup
- **THEN** specific field-level validation errors are displayed
- **AND** developer can identify which field(s) caused the failure

### AC2: Unknown Field Protection  
- **GIVEN** form contains unexpected fields
- **WHEN** validation runs
- **THEN** unknown fields are stripped without causing validation failure

### AC3: Diagnostic Completeness
- **GIVEN** any validation error
- **WHEN** error occurs
- **THEN** complete diagnostic information is available for debugging
- **AND** no more blind debugging cycles are required

## 📊 Success Metrics

1. **Error Clarity:** Specific field names and failure reasons visible in error messages
2. **Debugging Efficiency:** Root cause identifiable within 1 validation attempt
3. **System Stability:** No regression in successful signup flows

## 🔄 Implementation Plan

### Phase 1: Quick Diagnostic (Immediate)
1. Apply frontend error detail surfacing
2. Apply backend stripUnknown protection  
3. Test with failing form data
4. Document actual validation failures discovered

### Phase 2: Systematic Fix (After diagnosis)
1. Address root cause validation issues identified in Phase 1
2. Implement proper error handling for production
3. Add comprehensive field validation testing

## 📝 Notes

- This is a **debugging enhancement PRD** - changes are primarily diagnostic
- Once root cause is identified, proper production error handling should be implemented
- Frontend changes are temporary for diagnosis phase
- Backend changes (stripUnknown) are production-appropriate and should be permanent

## 🏷️ Tags
`validation` `debugging` `error-handling` `frontend` `backend` `forgeclaw` `signup-flow`
