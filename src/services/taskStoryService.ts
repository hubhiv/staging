/**
 * Task Story Generation Service
 * Automatically generates integration stories following the established template pattern
 */

import { Status } from '../components/KanbanContext';

export interface TaskStoryTemplate {
  taskId: string;
  status: string;
  featureName: string;
  userRole: string;
  functionality: string;
  businessValue: string;
  backendSystem: string;
  endpoint: string;
  httpMethod: string;
  filesToReview: string[];
  testIds: string[];
}

// Feature name templates based on common integration patterns
const FEATURE_TEMPLATES = [
  {
    name: 'Webhook Notification Integration',
    userRole: 'homeowner',
    functionality: 'receive real-time notifications when service providers respond to requests',
    businessValue: 'I can quickly respond to updates and manage my home maintenance efficiently',
    backendSystem: 'Third-Party Notification Service',
    endpoint: '/webhooks/notifications',
    httpMethod: 'POST',
    filesToReview: ['src/components/NotificationCenter.tsx', 'src/services/notificationService.ts', 'src/hooks/useNotifications.tsx']
  },
  {
    name: 'Booking Request API Integration',
    userRole: 'homeowner',
    functionality: 'submit booking requests directly from task cards',
    businessValue: 'I can schedule services without leaving the application',
    backendSystem: 'Booking Management API',
    endpoint: '/api/booking-requests',
    httpMethod: 'POST',
    filesToReview: ['src/components/TaskCard.tsx', 'src/services/bookingService.ts', 'src/hooks/useBooking.tsx']
  },
  {
    name: 'Real-time Status Updates',
    userRole: 'homeowner',
    functionality: 'see live updates when task statuses change',
    businessValue: 'I have accurate information about my home maintenance progress',
    backendSystem: 'WebSocket Status Service',
    endpoint: '/ws/status-updates',
    httpMethod: 'WebSocket',
    filesToReview: ['src/components/KanbanBoard.tsx', 'src/services/websocketService.ts', 'src/hooks/useRealTimeUpdates.tsx']
  },
  {
    name: 'Service Provider Integration',
    userRole: 'homeowner',
    functionality: 'connect with verified service providers for my tasks',
    businessValue: 'I can find reliable professionals for my home maintenance needs',
    backendSystem: 'Provider Directory API',
    endpoint: '/api/providers',
    httpMethod: 'GET',
    filesToReview: ['src/components/ProviderSelector.tsx', 'src/services/providerService.ts', 'src/hooks/useProviders.tsx']
  },
  {
    name: 'Payment Processing Integration',
    userRole: 'homeowner',
    functionality: 'process payments for completed services',
    businessValue: 'I can pay for services securely within the application',
    backendSystem: 'Payment Gateway API',
    endpoint: '/api/payments',
    httpMethod: 'POST',
    filesToReview: ['src/components/PaymentModal.tsx', 'src/services/paymentService.ts', 'src/hooks/usePayments.tsx']
  },
  {
    name: 'Calendar Sync Integration',
    userRole: 'homeowner',
    functionality: 'sync scheduled tasks with my personal calendar',
    businessValue: 'I can manage all my appointments in one place',
    backendSystem: 'Calendar Sync API',
    endpoint: '/api/calendar/sync',
    httpMethod: 'POST',
    filesToReview: ['src/components/CalendarView.tsx', 'src/services/calendarService.ts', 'src/hooks/useCalendar.tsx']
  }
];

/**
 * Get the next available task ID
 */
export const getNextTaskId = async (): Promise<string> => {
  try {
    // Read the current backlog to find the highest XANO task ID
    const response = await fetch('/docs/backlog.md');
    const content = await response.text();
    
    // Find all XANO task IDs
    const taskIdMatches = content.match(/XANO-(\d+)/g);
    
    if (!taskIdMatches) {
      return 'XANO-011'; // Start after the known XANO-010
    }
    
    // Extract numbers and find the highest
    const numbers = taskIdMatches.map(id => parseInt(id.split('-')[1]));
    const highestNumber = Math.max(...numbers);
    
    return `XANO-${String(highestNumber + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error reading backlog file:', error);
    // Fallback to a reasonable default
    return `XANO-${String(Date.now()).slice(-3)}`;
  }
};

/**
 * Generate a random feature template
 */
export const getRandomFeatureTemplate = (): typeof FEATURE_TEMPLATES[0] => {
  const randomIndex = Math.floor(Math.random() * FEATURE_TEMPLATES.length);
  return FEATURE_TEMPLATES[randomIndex];
};

/**
 * Map kanban status to story status
 */
export const mapStatusToStoryStatus = (status: Status): string => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'scheduled':
      return 'Scheduled';
    case 'booked':
      return 'Booked';
    case 'complete':
      return 'Complete';
    case 'archived':
      return 'Archived';
    default:
      return 'To Do';
  }
};

/**
 * Generate test IDs based on feature type
 */
export const generateTestIds = (featureName: string): string[] => {
  const baseTestId = featureName.toLowerCase().replace(/\s+/g, '-');
  return [
    `TEST-${baseTestId.toUpperCase()}-001 (API Connectivity)`,
    `TEST-${baseTestId.toUpperCase()}-002 (Data Validation)`
  ];
};

/**
 * Generate a complete task story template
 */
export const generateTaskStory = async (status: Status): Promise<string> => {
  const taskId = await getNextTaskId();
  const template = getRandomFeatureTemplate();
  const storyStatus = mapStatusToStoryStatus(status);
  const testIds = generateTestIds(template.name);
  
  return `
### Story: ${template.name}
**Task ID:** ${taskId}
**Status:** ${storyStatus}
**As a** ${template.userRole},
**I want to** ${template.functionality},
**So that** ${template.businessValue}.

**${template.backendSystem} API Details:**
- **Primary Endpoint:** \`${template.httpMethod} ${template.endpoint}\`
- **Authentication:** Bearer JWT tokens
- **Request Body:**
  \`\`\`json
  {
    "task_id": "string (required)",
    "user_id": "string (required)",
    "timestamp": "string (ISO 8601 format)",
    "data": "object (feature-specific payload)"
  }
  \`\`\`
- **Success Response (200):**
  \`\`\`json
  {
    "success": true,
    "request_id": "string",
    "status": "processed",
    "timestamp": "string (ISO 8601 format)"
  }
  \`\`\`
- **Error Responses:** 
  - 400: Invalid request data
  - 401: Authentication failed
  - 429: Rate limit exceeded
- **Content-Type:** \`application/json\`

**Pre-Requisite API Validation:**
**Instructions:** Before proceeding with this story, go to \`docs/api-tests.md\` and execute the API test case(s) associated with this story (${testIds.join(', ')}). Update this story in \`backlog.md\` with your comments regarding the test results. If the API tests fail, stop and notify the project lead. If the API tests pass, continue with executing and completing the story tasks below.

**Status:** ⏳ PENDING
**Required Tests:** ${testIds.join(', ')}
**Test Results:** [To be updated after running tests]
**Comments:** [Detailed comments about API test results and any issues found]

**Pre-Requisite: Review Frontend Files & Validate UI Integration Readiness**
**Instructions:** Since the UI was created by an AI agent, we must thoroughly validate and potentially refactor the frontend to ensure it's ready for backend integration. This includes code review, UI testing, and integration preparation.

**Phase 1: Code Review & Analysis**
**Files to Review:** \`${template.filesToReview.join('\`, \`')}\`
**Code Review Checklist:**
- [ ] **Import Analysis**: Check if components import required services/hooks
- [ ] **Mock Code Detection**: Identify TODO comments, mock implementations, placeholder code
- [ ] **Integration Points**: Verify service method calls match updated API signatures
- [ ] **Error Handling**: Ensure components can handle API errors appropriately
- [ ] **State Management**: Verify state management is implemented correctly
- [ ] **TypeScript Compliance**: Check for type errors with updated interfaces
**Code Review Status:** ⏳ PENDING
**Issues Found:** [To be updated after code review]

**Phase 2: UI Functionality Testing**
**Browser Testing Requirements:**
- [ ] **Component Rendering**: Verify all UI components render without errors
- [ ] **User Interactions**: Test buttons, inputs, modals function properly
- [ ] **Error States**: Verify error messages display correctly
- [ ] **Loading States**: Check loading indicators work as expected
- [ ] **Integration Flow**: Test complete user workflow end-to-end
**UI Testing Status:** ⏳ PENDING
**UI Issues Found:** [To be updated after UI testing]

**Phase 3: Integration Readiness Assessment**
**Integration Preparation Checklist:**
- [ ] **Service Dependencies**: Components import and reference correct services
- [ ] **API Call Structure**: Requests structured for backend integration
- [ ] **Response Handling**: Components prepared to handle API responses
- [ ] **Error Propagation**: API errors can be displayed to users
- [ ] **State Updates**: UI updates correctly based on API responses
**Integration Readiness:** ⏳ PENDING
**Refactoring Required:** [To be updated after assessment]

**Overall Review Status:** ⏳ PENDING
**Review Comments:** [Detailed summary of frontend review findings and integration readiness]

**Tasks:**
1. Create or update the service file (\`${template.filesToReview[1]}\`) with API integration methods
2. Update the main component (\`${template.filesToReview[0]}\`) to use the real service instead of mock implementations
3. Implement proper error handling and loading states in the UI components
4. Add TypeScript interfaces for the API request/response structures
5. Create or update the custom hook (\`${template.filesToReview[2]}\`) for state management

**API Test Status:**
- ${testIds[0]}: ⏳ PENDING
- ${testIds[1]}: ⏳ PENDING
- **Test Results:** [To be updated after running tests]

**Acceptance Criteria:**
- The feature integrates successfully with the ${template.backendSystem}
- All API calls include proper authentication headers
- Error handling displays appropriate user-friendly messages
- Loading states provide clear feedback during API operations
- The UI updates correctly based on API responses
- All TypeScript interfaces match the actual API data structures

**End-to-End Testing:**
**Status:** ⏳ PENDING
**Required Browser Testing Actions:**
- [ ] Test the complete user workflow from start to finish
- [ ] Verify API calls are made with correct parameters
- [ ] Confirm error handling works for various failure scenarios
- [ ] Test loading states during API operations
- [ ] Verify UI updates correctly after successful API responses
- [ ] Test edge cases and boundary conditions
**Test Results:** [To be updated after browser testing]
**Browser Testing Notes:** [Add observations about actual browser behavior]

**Implementation:**
\`\`\`file="${template.filesToReview[1]}"
// Implementation will be added during development phase
// This section will contain the actual service code with API integration
\`\`\`

**TEST CREDENTIALS & TOOLS:**
- 📖 **Documentation**: See \`docs/api-tests.md\` for API testing instructions
- 🔧 **Automation**: Use \`node scripts/test-${template.name.toLowerCase().replace(/\s+/g, '-')}.js\` for automated testing
- 🎯 **Test Data**: Use development environment test data for integration testing
`;
};

/**
 * Append a new story to the backlog file
 */
export const appendStoryToBacklog = async (story: string): Promise<void> => {
  try {
    // For now, we'll show the story in a modal or alert for the user to copy
    // In a real implementation, this would write to the file system via backend API

    // Create a downloadable text file with the story
    const blob = new Blob([story], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `integration-story-${Date.now()}.md`;

    // Show user notification with the story content
    const storyTitle = story.split('\n')[1]?.replace('### Story: ', '') || 'New Integration Story';

    // For demo purposes, show an alert with instructions
    alert(`Integration Story Created: "${storyTitle}"\n\nThe story has been generated and is ready to be added to docs/backlog.md.\n\nCheck the browser console for the full story content, or click OK to download the story as a markdown file.`);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also log to console for easy copying
    console.log('=== GENERATED INTEGRATION STORY ===');
    console.log('Copy the content below and append it to docs/backlog.md:');
    console.log('=====================================');
    console.log(story);
    console.log('=====================================');

  } catch (error) {
    console.error('Error creating integration story:', error);
    throw new Error('Failed to create integration story');
  }
};
