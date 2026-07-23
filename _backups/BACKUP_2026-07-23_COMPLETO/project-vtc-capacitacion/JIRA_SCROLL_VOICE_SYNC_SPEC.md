# Technical Ticket: Scroll Behavior, Layout Detection, and Voice Sync Fixes

**Status:** CRITICAL SPEC FOR DEVELOPMENT  
**Version:** 1.0 FINAL  
**Date:** 2026-06-01

---

## Objective

Fix erratic scrolling behavior ("crazy scrolling") by enforcing a strict sequential execution flow, tracking user position, and synchronizing page scrolling with the voice assistant's (Víctor) playback status.

---

## 1. Full Course Flow (Sequential Initialization)

When the user triggers the **"Start Full Course"** action, the system must follow this exact sequence **without jumping ahead or backtracking**:

### Step 1: Position view at the Hero Section
→ Trigger Víctor to read the Hero text.

### Step 2: Skip Syllabus
→ Smoothly scroll past the syllabus section **without reading it**.

### Step 3: Target the Welcome Video Container
→ Stop scrolling and trigger the **Video Protocol**:

**Video Protocol:**
- Víctor must voice-prompt the user: **"We are about to watch a video. Please press Play."**
- **Pause Voice System:** Put the voice assistant listener/speaker on standby.
- **On Video End Event:** Once `video.onended` fires, automatically reactivate the voice assistant system and proceed to the modules.

---

## 2. Standard Module Execution Loop

To prevent the scroll from jumping up and down looking for data, each module must be treated as an **isolated, linear sequence**. Do not fetch or read data outside the active module viewport.

For every module, the developer must implement this exact loop:

```
[Scroll to Module Video] 
    ↓
[Wait for Video to End] 
    ↓
[Read + Explain All Module Text] 
    ↓
[Execute Quiz]
```

### 2.A Video Anchor
- Move view directly to the module's video.
- Ensure video is fully visible in viewport.

### 2.B Complete Text Scan
- Read **100% of the text** inside that specific module block.
- **Do not skip any paragraphs.**
- Mark each paragraph as `.vtc-reading` (gold/dorado highlight) while reading.
- Maintain auto-scroll synchronization: as Víctor speaks a paragraph, that paragraph should be highlighted and centered in viewport.

### 2.C Explanation
- Trigger the contextual explanation for that block **immediately after reading**.
- Explanation should be professional and motivating (recap de módulo).
- Use Víctor's voice (Enrique M. Nieto in Spanish; Enrique M. Nieto in English).

### 2.D Quiz Handling
- Detect the quiz element within the module container.
- Read the questions and only the correct answers.
- Do not read incorrect answers.
- Wait for user response before proceeding to next module.

### 🚫 Critical Constraint
**The system must fully exhaust a module** (Video → Text → Explanation → Quiz) **before updating the scroll window to the next section.**

---

## 3. Deep Linking & Direct Navigation ("Go to Module X")

When a user explicitly requests a specific module (e.g., **"Go to Module 3"**):

1. **Instantly focus/scroll smoothly** to the requested module container.
2. **Direct focus** to the Module Video.
3. **Initialize the standard loop** described in Section 2:
   - Video → Read Text → Explain → Quiz

No backtracking. No jumping to earlier sections. Direct execution.

---

## 4. Real-Time Viewport & Position Detection

The system needs **constant spatial awareness** to handle user interruptions without losing its place:

### 4.A Viewport Detector
Implement a viewport detector (e.g., **IntersectionObserver** or **current scroll-y position tracking** tied to section IDs).

**Purpose:** Know which section the user is looking at in real-time.

### 4.B Interruption Handling
If the user says:  
**"I am right here, explain this part"** or **"Explain this section"** or similar:

1. **Intercept the coordinates** or the **active ID** of the section the user is currently looking at.
2. **Freeze Scroll:** Keep the scroll locked at the user's current position.
3. **Read/Explain that specific block** immediately.
4. **Do not trigger any automated scrolling** until the explanation finishes.
5. **Resume normal flow** after explanation completes.

### 4.C Section ID Tracking
- Assign unique IDs to every major section:
  - `#hero`
  - `#syllabus`
  - `#welcome-video`
  - `#module-0`
  - `#module-1`
  - ... etc.

- Use IntersectionObserver to detect which section is currently **"in view"** (>50% visible in viewport).

- Store current active section in a state variable that Víctor's system can read and respond to.

---

## 5. Voice Assistant Integration Points

### 5.A Víctor's Role in Scroll Sync
- Víctor **controls** the scroll indirectly through his reading.
- As Víctor speaks a paragraph, the **paragraph must be highlighted** and **viewport must auto-scroll to center it**.
- This is **NOT manual scrolling**; it's **automatic sync** based on Víctor's playback timeline.

### 5.B Client Tools for Víctor (ElevenLabs)
Víctor must have access to **browser control functions** (via Client Tools) to:
- Query current viewport position
- Get list of unread paragraphs in active module
- Get current quiz state
- Detect when user interrupts (pause, specific commands)

### 5.C Language Detection
- Víctor **auto-detects user language** (Spanish or English).
- Uses **Enrique M. Nieto** for both languages.
- All UI text and prompts must match the detected language.

---

## 6. Data Structure: Module Schema

Each module must have this structure (example for Module 1):

```json
{
  "moduleId": "module-1",
  "title": "Module 1: OPC Basics",
  "video": {
    "url": "/videos/module-1.mp4",
    "duration": 300,
    "containerId": "module-1-video"
  },
  "contentBlocks": [
    {
      "id": "module-1-para-1",
      "title": "What is an OPC?",
      "text": "An OPC is a licensed sales representative...",
      "order": 1
    },
    {
      "id": "module-1-para-2",
      "title": "OPC Responsibilities",
      "text": "OPCs are responsible for...",
      "order": 2
    }
    // ... more paragraphs
  ],
  "quiz": {
    "id": "module-1-quiz",
    "questions": [
      {
        "id": "q1",
        "text": "What does OPC stand for?",
        "correctAnswer": "Outbound Priority Caller",
        "wrongAnswers": ["Option 1", "Option 2"]
      }
      // ... more questions
    ]
  }
}
```

---

## 7. Error Handling & Edge Cases

### 7.A User Interrupts Mid-Paragraph
- **Action:** Pause Víctor immediately.
- **Scroll Lock:** Freeze scroll at current paragraph.
- **Re-engage:** When user resumes, continue from same paragraph (no restart).

### 7.B User Scrolls Manually During Reading
- **Detect:** IntersectionObserver detects manual scroll.
- **Pause Víctor:** Automatically pause voice playback.
- **Track New Position:** Update active section based on new scroll position.
- **Prompt:** Víctor asks: "Should I continue from here or go back to where we were?"

### 7.C Video Fails to Play
- **Fallback:** Víctor narrates a summary of the video content.
- **Resume:** After narration, continue to text reading.

### 7.D Quiz Timeout
- **Default Behavior:** After 2 minutes without user answer, Víctor provides the correct answer and moves to next module.

---

## 8. Testing Checklist (For Developer)

- [ ] Hero section is read first, no skipping to modules.
- [ ] Syllabus section is scrolled past WITHOUT being read.
- [ ] Welcome video triggers correctly; Víctor prompts user to press Play.
- [ ] Video ends → Voice system reactivates → Module 0 starts.
- [ ] Each paragraph is highlighted (`.vtc-reading` gold) as Víctor reads.
- [ ] Viewport auto-scrolls to center highlighted paragraph.
- [ ] All paragraphs in module are read (no skipping).
- [ ] Quiz is triggered after text reading completes.
- [ ] "Go to Module X" deep links work and don't cause scroll jumping.
- [ ] User interruption ("Explain this part") freezes scroll and triggers explanation.
- [ ] IntersectionObserver correctly identifies active section.
- [ ] Manual scroll pause triggers correctly.
- [ ] Language detection works (Spanish ↔ English).
- [ ] Víctor uses Enrique M. Nieto voice in both languages.

---

## 9. Success Criteria

✅ **No more erratic/crazy scrolling**  
✅ **100% sequential flow** (no jumping ahead)  
✅ **Perfect voice-to-text sync** (paragraph highlighted = Víctor reading that paragraph)  
✅ **User position always tracked** (InteractionObserver)  
✅ **Interruptions handled gracefully** (freeze, explain, resume)  
✅ **Quiz execution matches requirements** (correct answers only, no wrong answers read)  
✅ **Deep linking works** (Go to Module X without errors)  
✅ **All modules completed end-to-end** (no gaps, no skips)

---

**Priority:** 🔴 **CRITICAL**  
**Time Estimate:** 6-8 hours (scroll + voice sync + viewport detection)  
**Dependencies:** ElevenLabs Client Tools, IntersectionObserver API, Module JSON schema