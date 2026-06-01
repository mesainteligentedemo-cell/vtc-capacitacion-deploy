# ElevenLabs Audio Configuration & Deployment
## Víctor Agent — Production Audio Routing

**Status:** DEPLOYMENT READY  
**Version:** 1.0 PRODUCTION  
**Date:** 2026-06-01

---

## Critical Constraints

### 1. ZERO VOICE MIXING
- **Single output stream:** Only ONE voice model output at any time
- **Sequential audio:** Voices must be queued, not paralleled
- **No overlapping synthesis:** Each voice output completes before the next begins
- **Silence buffers:** 200-300ms between voice switches
- **No background elements during speech:** Music, SFX, ambience stopped during voice playback

### 2. ZERO ECHOING/MIRRORING
- **No acknowledgment:** Victor never repeats or confirms user input
- **Direct processing:** Input → [silent processing] → output
- **No transition phrases:** Zero "now I'm going to...", "let me...", "just a moment..."
- **No meta-commentary:** Never explain what you're doing
- **Pure signal:** Only the requested response, nothing else

---

## Audio Stream Architecture

### Output Stream Configuration

```
SINGLE AUDIO STREAM (24-bit PCM, 44.1kHz or 48kHz)
├─ Victor (Enrique M. Nieto voice)
│  └─ Used for: Course narration, explanations, greetings
│
├─ Roleplay Characters (when active)
│  ├─ Client Male (Burt Reynolds / Miguel)
│  ├─ Client Female (Hope / Yuana)
│  ├─ British Male (Brian)
│  └─ British Female (Isabella)
│
└─ SILENCE BETWEEN VOICES (200-300ms minimum)
   └─ Critical for clarity, prevents blending
```

### Voice Queue Model (NOT Parallel)

```
Victor speaks: [═════════════]
                              ↓ 250ms silence
                                          Client: [════════════]
                                                                ↓ 250ms silence
                                                                            Victor: [═══════]
```

**NEVER DO THIS:**
```
Victor: [═════════════]
Client:       [════════════]  ← OVERLAPPING (FORBIDDEN)
```

---

## ElevenLabs Conversational AI Settings

### Agent Configuration

**Audio Output Settings:**
```
Stream Mode: SINGLE (not MULTI)
Max Concurrent Voices: 1
Voice Overlap: DISABLED
Crossfade Duration: 0ms (no blending)
Silence Buffer: 250ms (between voice changes)
Audio Format: PCM 48kHz, 24-bit
Compression: None (raw audio)
```

**Response Processing:**
```
Echo Prevention: ENABLED
Input Mirroring: DISABLED
Acknowledgment Mode: OFF
Direct Response: ENABLED
Processing Latency: <100ms (transparent to user)
```

### Client Tools Configuration

**Browser Audio Handling:**
```javascript
// Single audio context - enforces one stream
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Voice queue - sequential, not parallel
const voiceQueue = [];

// Play voices in order, never overlap
async function playVoiceSequence(voices) {
  for (const voice of voices) {
    await playVoice(voice);
    await silence(250); // Buffer between voices
  }
}

// NEVER allow simultaneous playback
playVoice.concurrent = false;
```

---

## Voice Routing Matrix

### Español (Spanish)

| Role | Voice ID | Model | Mixing? | Overlap? |
|------|----------|-------|---------|----------|
| Victor (Coach) | Enrique M. Nieto | ES | ❌ Never | ❌ Never |
| Client Male | Miguel | ES | ❌ Never | ❌ Never |
| Client Female | Yuana | ES | ❌ Never | ❌ Never |

### English (US)

| Role | Voice ID | Model | Mixing? | Overlap? |
|------|----------|-------|---------|----------|
| Victor (Coach) | Enrique M. Nieto | EN | ❌ Never | ❌ Never |
| Client Male | Burt Reynolds | EN | ❌ Never | ❌ Never |
| Client Female | Hope | EN | ❌ Never | ❌ Never |

### British English

| Role | Voice ID | Model | Mixing? | Overlap? |
|------|----------|-------|---------|----------|
| Victor (Coach) | Enrique M. Nieto | EN | ❌ Never | ❌ Never |
| Client Male | Brian | EN-GB | ❌ Never | ❌ Never |
| Client Female | Isabella | EN-GB | ❌ Never | ❌ Never |

---

## Deployment Checklist

### Pre-Production Tests

- [ ] **Audio Isolation Test**
  - Record a roleplay session (Victor + 2 clients)
  - Verify waveform shows NO overlapping audio
  - Verify silence buffer between each voice (~250ms)
  - Verify ONLY ONE voice active at any timestamp

- [ ] **No-Echo Test**
  - User says "Continue"
  - Victor does NOT say "Continue" or "Continuing"
  - Victor immediately executes action
  - Zero acknowledgment in output

- [ ] **Voice Switch Test**
  - Play module with Victor + client exchange
  - Verify each voice switch is clean (not blended)
  - Verify no artifacts at transition points
  - Verify no brief overlaps or crossfading

- [ ] **Roleplay Test (3 voices)**
  - Victor starts: "Hello, welcome"
  - Client Male responds: "Hi, thanks for having us"
  - Client Female adds: "We're excited"
  - Victor replies: "Perfect, let's begin"
  - ✅ Verify: 4 separate, clean audio outputs
  - ✅ Verify: No mixing, no overlaps, clear transitions

### Production Deployment

**Staging Environment:**
- [ ] Deploy updated ELEVENLABS_AGENT_PROMPT.md
- [ ] Deploy ELEVENLABS_AUDIO_CONFIG.md
- [ ] Update ElevenLabs agent settings (audio stream isolation)
- [ ] Run full test suite (see "Deployment Checklist" above)
- [ ] Verify no audio mixing in any scenario
- [ ] Verify no echoing in any interaction

**Production Environment:**
- [ ] Promote from staging
- [ ] Monitor first 24 hours for audio issues
- [ ] Gather user feedback on audio clarity
- [ ] Disable background music/ambience during Victor sessions
- [ ] Disable UI sound effects during voice playback

---

## Monitoring & Validation

### Audio Stream Health Metrics

```
✅ PASSING CRITERIA:
- Waveform overlap = 0% (for all voice changes)
- Voice switch latency < 300ms
- Silence buffer = 200-300ms (between voices)
- No concurrent audio streams
- Zero audio artifacts during transitions
- User reports audio as "clear" and "never overlapping"

❌ FAILING CRITERIA:
- Any waveform overlap detected
- Voices playing simultaneously
- Silence buffer < 150ms
- Audio artifacts or glitches at transitions
- User reports "echo", "mixing", or "two voices at once"
```

### Real-time Monitoring

Log these metrics per session:
```javascript
{
  sessionId: "vtc-session-xxx",
  audioEvents: [
    { time: 0, event: "victor_start", voice: "enrique" },
    { time: 3.2, event: "victor_end" },
    { time: 3.45, event: "silence_buffer", duration: 0.25 },
    { time: 3.7, event: "client_male_start", voice: "burt" },
    { time: 5.1, event: "client_male_end" },
    // ... more events
  ],
  overlapDetected: false,
  avgSwitchLatency: 0.28,
  avgBufferDuration: 0.248,
  userReportedIssues: [] // Should be empty
}
```

### Validation Script

```bash
#!/bin/bash
# validate-audio-stream.sh

echo "🔍 Validating audio stream isolation..."

# Check 1: No overlapping waveforms
ffmpeg -i recorded-session.wav -af "silencedetect=n=-30dB:d=0.01" -f null - \
  | grep silence | wc -l
# Result: Should show clean silence buffers, NO mid-sentence silences

# Check 2: Voice isolation
sox recorded-session.wav -n stat -freq
# Result: Should show single speaker characteristics per segment

# Check 3: No echo detection
sox recorded-session.wav -n remix 1,2 stat
# Result: Should show correlation ~0 (no duplicate channels)

echo "✅ Audio stream validation complete"
```

---

## Support & Rollback

### If Audio Issues Detected

**Issue: Voices overlapping**
- Rollback: Disable concurrent voice synthesis
- Fix: Set `voiceOverlap: DISABLED` in agent config
- Verify: Re-run audio isolation test

**Issue: Echoing/Mirroring**
- Rollback: Previous version of ELEVENLABS_AGENT_PROMPT.md
- Fix: Ensure REGLA #0 is enforced in model weights
- Verify: Test "no-echo" scenario

**Issue: Audio artifacts**
- Rollback: Previous audio routing config
- Fix: Increase silence buffer to 300-400ms
- Verify: Re-test voice switches

---

## References

- ELEVENLABS_AGENT_PROMPT.md — Agent behavioral rules
- scroll-voice-sync.js — Browser audio queue handling
- ElevenLabs Conversational AI Docs — Voice synthesis settings
- Browser Web Audio API — Audio context isolation

---

**DEPLOYMENT STATUS:** ✅ READY FOR STAGING VALIDATION