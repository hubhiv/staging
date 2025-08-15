# BHL Platform Development Rules & Accountability Measures

## 🎯 **CORE PRINCIPLE**
**NEVER DEVIATE FROM USER-PROVIDED DOCUMENTATION WITHOUT EXPLICIT APPROVAL**

---

## 📋 **MANDATORY PRE-IMPLEMENTATION CHECKLIST**

Before making ANY code changes, I must:

- [ ] **Quote exact API endpoints** from `docs/resource/notes.md` or `xano.yaml`
- [ ] **Confirm correct base URL** from user's config files
- [ ] **Verify user authentication requirements** from existing implementation
- [ ] **State what I'm changing and why** in plain, specific terms
- [ ] **Ask for explicit approval** before proceeding with implementation

---

## 📚 **DOCUMENTATION-FIRST APPROACH**

### **Source of Truth Hierarchy:**
1. **Primary**: `docs/resource/notes.md` (xano.yaml API documentation)
2. **Secondary**: User-provided configuration files
3. **Tertiary**: Existing working code patterns
4. **NEVER**: AI assumptions or improvisation

### **Required Actions:**
- [ ] **Always reference docs first** before any API integration
- [ ] **Quote relevant sections** verbatim before implementing
- [ ] **Flag any conflicts** between documentation and existing code immediately
- [ ] **Never assume or improvise** API structures, endpoints, or data formats

---

## 🔄 **INCREMENTAL VALIDATION PROTOCOL**

### **After Each Change:**
- [ ] **Test immediately** in browser with real user credentials
- [ ] **Show actual error messages** from browser console/network tab
- [ ] **Validate against user's API docs** before marking anything complete
- [ ] **Stop and ask** if anything doesn't match documented expectations

### **Browser Testing Requirements:**
- [ ] **Use provided credentials**: javierc9@gmail.com / Snapple#1
- [ ] **Navigate actual UI**: Don't assume functionality works
- [ ] **Check browser console**: Report real errors, not theoretical ones
- [ ] **Validate API calls**: Confirm requests hit correct endpoints with proper responses

---

## 💬 **CLEAR COMMUNICATION PROTOCOL**

### **When Issues Are Found:**
1. **State the problem clearly** (what's actually broken)
2. **Reference user documentation** (what the docs say should happen)
3. **Propose specific fixes** (how to align implementation with docs)
4. **Wait for user approval** before implementing changes

### **Before Claiming Success:**
- [ ] "Does this actually work in the browser?"
- [ ] "Does this match the user's documented API exactly?"
- [ ] "Have I tested this with the provided real credentials?"
- [ ] "Am I following the exact endpoints and data structures provided?"

---

## 🔒 **BHL PLATFORM SPECIFIC RULES**

### **API Configuration Requirements:**
- [ ] **HOME API**: Always use `https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR` for home_system endpoints
- [ ] **AUTH API**: Only use `https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u` for authentication endpoints
- [ ] **Endpoints**: Stick to documented endpoint formats (e.g., `/home_system` singular)
- [ ] **User Context**: Always include user_id parameter in home system requests
- [ ] **Authentication**: Include Bearer token headers for protected endpoints

### **Code Integration Standards:**
- [ ] **Follow existing patterns** in the codebase for similar functionality
- [ ] **Use established services** (HomeService, AuthService) rather than creating new ones
- [ ] **Maintain TypeScript interfaces** that match API response structures exactly
- [ ] **Implement proper error handling** with user-friendly messages

### **Testing & Validation:**
- [ ] **Functional browser testing** required for all UI changes
- [ ] **API endpoint validation** against documented responses
- [ ] **Error state testing** to ensure graceful failure handling
- [ ] **Authentication flow testing** with provided credentials

---

## 🚨 **ESCALATION TRIGGERS**

### **Stop Work Immediately If:**
- [ ] API endpoints return unexpected 404/500 errors
- [ ] Documentation conflicts with existing implementation
- [ ] User credentials don't work as expected
- [ ] Any assumption needs to be made about undocumented behavior

### **Required Actions:**
1. **Document the exact issue** with screenshots/error messages
2. **Reference conflicting documentation** sections
3. **Ask for clarification** before proceeding
4. **Do not implement workarounds** without explicit approval

---

## ✅ **SUCCESS CRITERIA**

### **A task is only complete when:**
- [ ] **Functionality works** in browser with real user credentials
- [ ] **API calls succeed** with documented endpoints and responses
- [ ] **Error handling** provides meaningful feedback to users
- [ ] **Code follows** established patterns and TypeScript standards
- [ ] **User has validated** the implementation meets requirements

---

## 📝 **VIOLATION CONSEQUENCES**

### **If I deviate from these rules:**
1. **Stop current work** immediately
2. **Document what went wrong** and why
3. **Revert to last known working state**
4. **Re-read user documentation** before proceeding
5. **Ask for explicit guidance** on the correct approach

---

**Remember: The user provided comprehensive documentation and working examples. My job is to implement exactly what they specified, not to improve or modify their architecture.**
