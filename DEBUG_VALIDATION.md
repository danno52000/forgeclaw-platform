# ForgeClaw Advisor Validation — Debugging Checklist

## 🔴 Known Issue Found During Analysis

**The frontend swallows the `details` array from the API error response.**

In `signup.tsx` line 144:
```js
throw new Error(errorData.error || 'Failed to create advisor instance')
```
This only reads `errorData.error` (the string `"Validation failed"`), but **discards
`errorData.details`** — the array of Joi messages telling you exactly which field failed.
This is why you can't see what's wrong. Fix this first (see Step 0).

---

## Step 0: Surface the actual Joi error details (DO THIS FIRST)

Temporarily patch the frontend error handler to show the `details` array:

```tsx
// signup.tsx — in the handleSubmit catch block
if (!response.ok) {
  const errorData = await response.json()
  // Show the FULL error including field-level details
  const detailMsg = errorData.details?.join(', ') || ''
  throw new Error(`${errorData.error}: ${detailMsg}`)
}
```

This alone will likely tell you exactly which field is failing and why.

---

## Step 1: Verify Render is running the latest code

The `.allow('')` fix is committed (`0903f2b`) and pushed to `origin/master`.
But Render may not have auto-deployed, or the build may have failed.

- [ ] Check Render dashboard → `forgeclaw-platform` service → **Events** tab
- [ ] Confirm latest deploy commit matches `0903f2b`
- [ ] If deploy failed, check build logs for errors
- [ ] Hit the health endpoint to confirm the API is alive:

```bash
curl https://forgeclaw-platform.onrender.com/health
```

---

## Step 2: Test the API directly with curl (isolate frontend vs backend)

### 2a. Minimal valid payload (should succeed)
```bash
curl -X POST https://forgeclaw-platform.onrender.com/api/advisors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Corp",
    "subdomain": "test-debug",
    "anthropicApiKey": "sk-ant-test-1234567890",
    "selectedPackage": "core"
  }'
```

**Expected:** 201 or 409 (subdomain taken) — NOT 400.
If this returns 400, the deployed code doesn't match what's in git.

### 2b. Payload mimicking what the frontend sends (with empty strings)
```bash
curl -X POST https://forgeclaw-platform.onrender.com/api/advisors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Corp",
    "phone": "",
    "practiceType": "",
    "aum": "",
    "clientCount": "",
    "primaryCustodian": "",
    "subdomain": "test-debug-2",
    "anthropicApiKey": "sk-ant-test-1234567890",
    "selectedPackage": "professional",
    "additionalSkills": [],
    "dataRetention": "90"
  }'
```

**Expected:** 201 or 409 — NOT 400.
If 2a succeeds but 2b fails, the `.allow('')` fix isn't deployed.

### 2c. Intentionally bad payload (verify error details work)
```bash
curl -X POST https://forgeclaw-platform.onrender.com/api/advisors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "",
    "email": "not-an-email",
    "subdomain": "AB"
  }'
```

**Expected:** 400 with `details` array showing multiple field errors.
Read the `details` — these are the exact Joi messages.

---

## Step 3: Capture the exact frontend request payload

Open browser DevTools → **Network** tab → submit the form → click the
`/api/advisors` request:

- [ ] **Request Headers** — confirm `Content-Type: application/json` is present
- [ ] **Request Payload** — copy the full JSON body
- [ ] **Response Body** — copy the full response, especially the `details` array
- [ ] Check for unexpected fields the frontend might be sending that aren't
      in the Joi schema (Joi rejects unknown keys by default!)

---

## Step 4: Field-by-field comparison

| Field | Schema Rule | Frontend Default | Potential Failure |
|---|---|---|---|
| `firstName` | `string().required().min(1)` | `''` | ❌ Empty string fails `min(1)` |
| `lastName` | `string().required().min(1)` | `''` | ❌ Empty string fails `min(1)` |
| `email` | `string().email().required()` | `''` | ❌ Empty string fails email format |
| `company` | `string().required().min(1)` | `''` | ❌ Empty string fails `min(1)` |
| `phone` | `string().allow('').optional()` | `''` | ✅ OK after fix |
| `practiceType` | `string().allow('').optional()` | `''` | ✅ OK after fix |
| `aum` | `string().allow('').optional()` | `''` | ✅ OK after fix |
| `clientCount` | `string().allow('').optional()` | `''` | ✅ OK after fix |
| `primaryCustodian` | `string().allow('').optional()` | `''` | ✅ OK after fix |
| `subdomain` | `string().required().min(3).pattern(/^[a-z0-9-]+$/)` | `''` | ❌ Empty/uppercase/special chars fail |
| `anthropicApiKey` | `string().required().min(10)` | `''` | ❌ Empty string fails min(10) |
| `selectedPackage` | `string().valid("core","professional","enterprise").required()` | `'professional'` | ✅ OK |
| `additionalSkills` | `array().items(string()).default([])` | `[]` | ✅ OK |
| `dataRetention` | `string().allow('').optional()` | `'90'` | ✅ OK |

### ⚠️  Key observation
The frontend has **no client-side validation**. Users can submit Step 4 with
`subdomain: ''` and `anthropicApiKey: ''`, which will always fail server-side.
But that's expected behavior, not a bug — it should produce a clear error message.

---

## Step 5: Check for Joi's `stripUnknown` / unknown key behavior

By default, `Joi.object()` **rejects unknown keys** (returns an error for any
field not in the schema). If the frontend ever sends an extra field not in the
schema, validation will fail.

Check if the frontend is sending anything extra (e.g., from browser extensions,
form libraries adding metadata, etc.).

**Quick fix if this is the issue** — add `{ allowUnknown: true }` or
`{ stripUnknown: true }` to the validate call:

```ts
// In advisors.ts line 44
const { error, value } = createAdvisorSchema.validate(req.body, { stripUnknown: true });
```

---

## Step 6: Verify CORS isn't causing a silent failure

The API's CORS config (index.ts lines 42-51) allows:
- `*.vercel.app` (regex)
- `localhost:3000`
- `forgeclaw.com`
- `portal.forgeclaw.com`
- `forgeclaw-platform.vercel.app`

- [ ] Confirm the frontend's actual deployed domain matches one of these
- [ ] Check browser console for CORS errors (these happen before the request
      even reaches Express, so you'd get a network error, not a 400)

---

## Triage Order

1. **Step 0** — Surface the Joi details (5 min, highest value)
2. **Step 1** — Confirm Render deployed the latest commit (2 min)
3. **Step 2c** — Test with curl to verify the API returns details (2 min)
4. **Step 2b** — Test with the exact frontend payload shape (2 min)
5. **Step 3** — Capture real browser request from Network tab (5 min)
6. **Step 5** — Add `stripUnknown` as a safety net (1 min)
