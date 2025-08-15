# Webhook Integration Story Example

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

### Story: Booking Request Webhook Integration
**Task ID:** WEBHOOK-001
**Status:** To Do
**As a** homeowner,
**I want to** receive real-time notifications when service providers respond to my booking requests,
**So that** I can quickly confirm appointments and manage my home maintenance schedule.

**Third-Party Booking Service API Details:**
- **Primary Endpoint:** `POST /api/booking-requests`
- **Authentication:** Bearer JWT tokens
- **Request Body:**
  ```json
  {
    "task_id": "string (required)",
    "service_type": "string (hvac|plumbing|electrical|landscaping|carpentry|painting)",
    "preferred_date": "string (ISO 8601 date)",
    "time_window": "string (morning|afternoon|evening)",
    "customer_notes": "string (optional)",
    "priority": "string (low|medium|high|urgent)"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "booking_request_id": "string",
    "status": "pending",
    "estimated_response_time": "string (ISO 8601)",
    "webhook_url": "string"
  }
  ```
- **Error Responses:** 
  - 400: Invalid request data
  - 401: Authentication failed
  - 429: Rate limit exceeded
- **Content-Type:** `application/json`
- **Webhook URL:** `https://your-domain.com/webhooks/booking-status`

**Webhook Configuration:**
- **Webhook URL:** `https://hubhiv-app.com/webhooks/booking-status`
- **HTTP Method:** POST
- **Content-Type:** application/json
- **Authentication:** HMAC SHA-256 signature
- **Retry Policy:** 3 retries with exponential backoff
- **Timeout:** 30 seconds

**Webhook Payload Structure:**
```json
{
  "event_type": "booking.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "booking_request_id": "req_12345",
    "task_id": "TASK-1001",
    "status": "confirmed",
    "provider_id": "prov_67890",
    "provider_name": "ABC HVAC Services",
    "scheduled_date": "2024-01-20T09:00:00Z",
    "estimated_duration": "2 hours",
    "provider_notes": "Will call 30 minutes before arrival"
  },
  "signature": "sha256=abc123def456..."
}
```

**Event Types:**
- `booking.status_changed`: Triggered when booking status changes (pending → confirmed → completed → cancelled)
- `booking.provider_assigned`: Triggered when a service provider accepts the booking request
- `booking.rescheduled`: Triggered when appointment time is changed
- `booking.cancelled`: Triggered when booking is cancelled by provider or customer

**Pre-Requisite API Validation:**
**Instructions:** Before proceeding with this story, go to `docs/api-tests.md` and execute the API test case(s) associated with this story (TEST-WEBHOOK-001, TEST-WEBHOOK-002). Update this story in `backlog.md` with your comments regarding the test results. If the API tests fail, stop and notify the project lead. If the API tests pass, continue with executing and completing the story tasks below.

**Status:** ⏳ PENDING
**Required Tests:** TEST-WEBHOOK-001 (Booking Request API), TEST-WEBHOOK-002 (Webhook Endpoint)
**Test Results:**
- TEST-WEBHOOK-001: ⏳ PENDING - [To be updated after testing]
- TEST-WEBHOOK-002: ⏳ PENDING - [To be updated after testing]
**Comments:** [To be updated after API testing]

**Pre-Requisite: Review Frontend Files & Validate UI Integration Readiness**
**Instructions:** Since the UI was created by an AI agent, we must thoroughly validate and potentially refactor the frontend to ensure it's ready for backend integration. This includes code review, UI testing, and integration preparation.

**Phase 1: Code Review & Analysis**
**Files to Review:** `src/components/TaskCard.tsx`, `src/services/bookingService.ts`, `src/hooks/useBooking.tsx`
**Code Review Checklist:**
- [ ] **Import Analysis**: Check if TaskCard imports booking service
- [ ] **Mock Code Detection**: Identify alert() calls and mock implementations
- [ ] **Integration Points**: Verify handleBookingRequest calls real API
- [ ] **Error Handling**: Ensure components can handle booking API errors
- [ ] **State Management**: Verify booking state management is implemented
- [ ] **TypeScript Compliance**: Check for type errors with booking interfaces
**Code Review Status:** ⏳ PENDING
**Issues Found:**
- ❌ Mock Implementation: TaskCard uses alert() instead of real booking service
- ❌ Missing Service: No bookingService.ts file exists
- ❌ No State Management: No booking state management implemented

**Phase 2: UI Functionality Testing**
**Browser Testing Requirements:**
- [ ] **Booking Button**: Verify "Request Booking" button is functional
- [ ] **Form Validation**: Test booking form validation works correctly
- [ ] **Loading States**: Test loading indicators during booking request
- [ ] **Success States**: Verify success messages display correctly
- [ ] **Error States**: Verify error messages display correctly
- [ ] **Real-time Updates**: Test webhook notifications update UI
**UI Testing Status:** ⏳ PENDING

**Phase 3: Integration Readiness Assessment**
**Integration Preparation Checklist:**
- [ ] **Service Dependencies**: TaskCard imports booking service
- [ ] **API Call Structure**: Booking requests structured for API
- [ ] **Response Handling**: Components handle booking responses
- [ ] **Webhook Handling**: Real-time updates from webhooks
- [ ] **Error Propagation**: Booking errors displayed to users
**Integration Readiness:** ❌ REFACTORING_REQUIRED

**Tasks:**
1. Create `src/services/bookingService.ts` with booking request methods
2. Update `src/components/TaskCard.tsx` to use real booking service
3. Create webhook endpoint `/api/webhooks/booking-status`
4. Implement webhook signature verification
5. Add real-time UI updates for booking status changes
6. Create booking state management with Context API

**Acceptance Criteria:**
- The "Request Booking" button sends real API requests to booking service
- Webhook endpoint receives and validates booking status updates
- UI updates in real-time when booking status changes
- Error handling displays appropriate messages to users
- Booking requests include all required task and customer information

**End-to-End Testing:**
**Status:** ⏳ PENDING
**Required Browser Testing Actions:**
- [ ] Click "Request Booking" button and verify API call is made
- [ ] Test webhook endpoint receives POST requests correctly
- [ ] Verify booking status updates appear in UI without page refresh
- [ ] Test error handling for failed booking requests
- [ ] Confirm webhook signature verification works
- [ ] Test booking cancellation and rescheduling flows
**Test Results:** [To be updated after browser testing]

**Security Considerations:**
- [ ] Webhook signature verification implemented
- [ ] HTTPS endpoint configured
- [ ] Rate limiting configured for webhook endpoint
- [ ] Idempotency handling implemented
- [ ] Input validation for webhook payloads

**Implementation:**
```file="src/services/bookingService.ts"
import apiClient from './api';
import { BookingRequest, BookingResponse } from '../types/api';

export const BookingService = {
  /**
   * Create booking request
   * 
   * API: POST /api/booking-requests
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   */
  createBookingRequest: async (data: BookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/booking-requests', data);
    return response.data;
  },

  /**
   * Get booking status
   * 
   * API: GET /api/booking-requests/{id}
   */
  getBookingStatus: async (bookingId: string): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/booking-requests/${bookingId}`);
    return response.data;
  }
};
```

**TEST CREDENTIALS & TOOLS:**
- 📖 **Documentation**: See `docs/api-tests.md` for booking service test credentials
- 🔧 **Automation**: Use `node scripts/test-webhook.js` to simulate webhook events
- 🎯 **Test Booking**: Use task ID `TASK-1001` for testing booking requests
