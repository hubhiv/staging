# Integration Story Template

## **Story Completion Criteria**

**Stories have two completion phases:**

1. **IMPLEMENTATION COMPLETE - BROWSER TESTING PENDING**: Code changes completed and API tests passed, but end-to-end browser testing not yet performed.

2. **✅ COMPLETE**: Both implementation AND successful browser testing completed.

**Definition of Done for Each Story:**
- [ ] Pre-requisite API validation passed
- [ ] Pre-requisite frontend review completed
- [ ] Code implementation completed
- [ ] **End-to-end browser testing completed successfully**
- [ ] All acceptance criteria verified in browser
- [ ] No blocking technical issues remain

**Critical**: Stories are NOT considered fully complete until browser testing validates the complete user experience.

---

## Story Template

### Story: [FEATURE_NAME] Integration
**Task ID:** [PROJECT_PREFIX]-[NUMBER] (e.g., WEBHOOK-001, API-005)
**Status:** [To Do | In Progress | Implementation Complete | ✅ Complete]
**As a** [USER_ROLE],
**I want to** [DESIRED_FUNCTIONALITY],
**So that** [BUSINESS_VALUE].

**[BACKEND_SYSTEM] API Details:**
- **Primary Endpoint:** `[HTTP_METHOD] /[endpoint-path]`
- **Authentication:** [Bearer JWT | API Key | None]
- **Request Body:**
  ```json
  {
    "field1": "type (validation rules)",
    "field2": "type (validation rules)"
  }
  ```
- **Success Response ([STATUS_CODE]):**
  ```json
  {
    "response_field": "type",
    "data": "structure"
  }
  ```
- **Error Responses:** 
  - [STATUS_CODE]: [Error Description]
  - [STATUS_CODE]: [Error Description]
- **Content-Type:** `application/json`
- **Additional Details:** [Webhook URLs, Rate Limits, etc.]

**Pre-Requisite API Validation:**
**Instructions:** Before proceeding with this story, go to `docs/api-tests.md` and execute the API test case(s) associated with this story ([TEST_IDS]). Update this story in `backlog.md` with your comments regarding the test results. If the API tests fail, stop and notify the project lead. If the API tests pass, continue with executing and completing the story tasks below.

**Status:** [⏳ PENDING | ✅ VALIDATED | ❌ FAILED]
**Required Tests:** [TEST-001 (Description), TEST-002 (Description)]
**Test Results:**
- TEST-001: [✅ PASS | ❌ FAIL] - [Description of results]
- TEST-002: [✅ PASS | ❌ FAIL] - [Description of results]
**Comments:** [Detailed comments about API test results and any issues found]

**Pre-Requisite: Review Frontend Files & Validate UI Integration Readiness**
**Instructions:** Since the UI was created by an AI agent, we must thoroughly validate and potentially refactor the frontend to ensure it's ready for backend integration. This includes code review, UI testing, and integration preparation.

**Phase 1: Code Review & Analysis**
**Files to Review:** `[file1.ts]`, `[file2.tsx]`, `[file3.ts]`
**Code Review Checklist:**
- [ ] **Import Analysis**: Check if components import required services/hooks
- [ ] **Mock Code Detection**: Identify TODO comments, mock implementations, placeholder code
- [ ] **Integration Points**: Verify service method calls match updated API signatures
- [ ] **Error Handling**: Ensure components can handle API errors appropriately
- [ ] **State Management**: Verify state management is implemented correctly
- [ ] **TypeScript Compliance**: Check for type errors with updated interfaces
**Code Review Status:** [⏳ PENDING | ✅ COMPLETED | ❌ ISSUES_FOUND]
**Issues Found:**
- [✅ | ⚠️ | ❌] [Issue Description]: [Details]
- [✅ | ⚠️ | ❌] [Issue Description]: [Details]

**Phase 2: UI Functionality Testing**
**Browser Testing Requirements:**
- [ ] **Component Rendering**: Verify all UI components render without errors
- [ ] **Form Validation**: Test client-side validation works correctly
- [ ] **User Interactions**: Test buttons, inputs, modals function properly
- [ ] **Error States**: Verify error messages display correctly
- [ ] **Loading States**: Check loading indicators work as expected
- [ ] **Navigation Flow**: Test navigation and state transitions
**UI Testing Status:** [⏳ PENDING | ✅ COMPLETED | ❌ ISSUES_FOUND]
**UI Issues Found:**
- [✅ | ⚠️ | ❌] [Issue Description]: [Details]
- [✅ | ⚠️ | ❌] [Issue Description]: [Details]

**Phase 3: Integration Readiness Assessment**
**Integration Preparation Checklist:**
- [ ] **Service Dependencies**: Components import and reference correct services
- [ ] **API Call Structure**: Form submissions structured for backend integration
- [ ] **Response Handling**: Components prepared to handle API responses
- [ ] **Token Management**: Authentication token storage/retrieval implemented
- [ ] **Redirect Logic**: Post-action navigation logic in place
- [ ] **Error Propagation**: API errors can be displayed to users
**Integration Readiness:** [⏳ PENDING | ✅ READY | ❌ REFACTORING_REQUIRED]
**Refactoring Required:**
- [✅ | ❌] [Refactoring Item]: [Description]
- [✅ | ❌] [Refactoring Item]: [Description]

**Overall Review Status:** [⏳ PENDING | ✅ COMPLETED | ❌ BLOCKED]
**Review Comments:**
[Detailed summary of frontend review findings and integration readiness]

**Tasks:**
1. [Task description with specific file and method references]
2. [Task description with specific file and method references]
3. [Task description with specific file and method references]

**API Test Status:**
- TEST-001: [Test Name] - [⏳ PENDING | ✅ PASS | ❌ FAIL]
- TEST-002: [Test Name] - [⏳ PENDING | ✅ PASS | ❌ FAIL]
- **Test Results:** [To be updated after running tests]

**Acceptance Criteria:**
- [Specific, measurable criterion]
- [Specific, measurable criterion]
- [Specific, measurable criterion]

**End-to-End Testing:**
**Status:** [⏳ PENDING | ✅ PASSED | ❌ FAILED]
**Required Browser Testing Actions:**
- [ ] [Specific browser test action]
- [ ] [Specific browser test action]
- [ ] [Specific browser test action]
- [ ] [Specific browser test action]
**Test Results:** [To be updated after browser testing]
**Browser Testing Notes:** [Add observations about actual browser behavior]

**Implementation:**
```file="[file-path]"
[Code implementation with detailed comments]
```

**TEST CREDENTIALS & TOOLS:**
- 📖 **Documentation**: See `docs/api-tests.md` for test account credentials and manual API testing instructions
- 🔧 **Automation**: Use `[script-name]` to [automation description]
- 🎯 **Test Account**: `[email]` / `[password]` (verified working)

---

## Webhook-Specific Template Additions

**For Webhook Integration Stories, add these sections:**

**Webhook Configuration:**
- **Webhook URL:** `[YOUR_DOMAIN]/webhooks/[endpoint]`
- **HTTP Method:** POST
- **Content-Type:** application/json
- **Authentication:** [Bearer Token | HMAC Signature | None]
- **Retry Policy:** [Number of retries, backoff strategy]
- **Timeout:** [Timeout duration]

**Webhook Payload Structure:**
```json
{
  "event_type": "string",
  "timestamp": "ISO 8601 timestamp",
  "data": {
    "object_type": "string",
    "object_id": "string",
    "changes": {}
  },
  "signature": "HMAC signature (if applicable)"
}
```

**Event Types:**
- `[event.type]`: [Description of when this event is triggered]
- `[event.type]`: [Description of when this event is triggered]

**Security Considerations:**
- [ ] Webhook signature verification implemented
- [ ] HTTPS endpoint configured
- [ ] Rate limiting configured
- [ ] Idempotency handling implemented

**Additional Testing for Webhooks:**
- [ ] Test webhook endpoint receives POST requests
- [ ] Verify webhook signature validation
- [ ] Test webhook retry mechanism
- [ ] Confirm idempotency handling
- [ ] Test webhook failure scenarios
