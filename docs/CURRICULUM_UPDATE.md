# Curriculum Evolution - Updated Files

## 🎓 What's New

I've created a curriculum configuration system that allows the game to grow with your child from Year 7 through GCSE without rebuilding. Here are the updated/new files:

## 📦 New Files to Add

### 1. **`/packages/domain/src/curriculum/config.ts`** ✨ NEW
**Purpose:** Single source of truth for curriculum levels

**What it does:**
- Defines all 5 curriculum levels (Year 7, 8, 9, GCSE Foundation, GCSE Higher)
- Controls difficulty parameters for each level
- Manages budget scaling (bigger numbers for older students)
- Gates features by level (loans unlock Y8+, investments Y9+, etc.)
- Provides helper functions to get/set current level

**Key exports:**
```typescript
- CURRICULUM_LEVELS: All level definitions
- getCurrentCurriculum(): Get active level
- setCurriculumLevel(level): Change level
- getNextLevel(current): Progression path
- isFeatureUnlocked(feature): Check feature availability
```

**Location:** Create new folder `/packages/domain/src/curriculum/` and add this file

---

### 2. **`/packages/domain/src/curriculum/progression.ts`** ✨ NEW
**Purpose:** Assess readiness to progress to next level

**What it does:**
- Analyzes recent math performance across 5 dimensions:
  - Overall accuracy (need 85%)
  - Hard problem accuracy (need 75%)
  - Hint dependency (max 0.5 hints per problem)
  - Time efficiency (within 120% of expected)
  - Topic consistency (70%+ across all topics)
- Generates personalized recommendations
- Provides UI-friendly progress summaries

**Key exports:**
```typescript
- assessReadinessForProgression(events): Full assessment
- getProgressionSummary(events): Quick UI status
```

**Location:** Same `/packages/domain/src/curriculum/` folder

---

## 📝 Updated Files

### 3. **`/packages/domain/src/types/game-state.ts`** 🔄 UPDATED
**What changed:** Added `curriculum: CurriculumConfig` field to `GameState`

**Why:** Game state now tracks which curriculum level is active, allowing all systems to adapt automatically.

**Location:** Replace existing file

---

### 4. **`/packages/domain/src/index.ts`** 🔄 UPDATED  
**What changed:** Added curriculum exports at top:
```typescript
export * from './curriculum/config';
export * from './curriculum/progression';
```

**Why:** Makes curriculum system available to rest of codebase

**Location:** Replace existing file

---

## 🗂️ File Structure

After adding these files, your structure should be:

```
packages/domain/src/
├── curriculum/              ← NEW FOLDER
│   ├── config.ts           ← NEW FILE
│   └── progression.ts      ← NEW FILE
├── types/
│   ├── game-state.ts       ← UPDATED
│   └── ... (other type files)
├── index.ts                ← UPDATED
└── ... (other folders)
```

---

## 🎮 How It Works

### Example: Transfer Problem at Different Levels

**Year 7:**
```
Player costs £180,000
Agent wants 15% fee
Calculate total cost

- Max values: £300k
- Steps: 2 (calculate fee, add)
- Hints: 4 detailed hints available
- Time: 2 minutes expected
```

**Year 8:** (Same problem type, harder parameters)
```
Player costs £850,000
Agent wants 18% fee, plus £25,000 admin
Calculate total cost

- Max values: £1M
- Steps: 3 (calculate %, add admin, add base)
- Hints: 2 conceptual hints only
- Time: 2.5 minutes expected
```

**Year 9:** (More complex)
```
Player A: £1.8M + 12% agent fee
Player B: £2.1M + 8% agent + £50k bonus
Budget: £2.5M
Which leaves more remaining?

- Max values: £5M
- Steps: 5 (both calculations, compare, subtract)
- Hints: 1 hint only
- Time: 5 minutes expected
```

### What Automatically Scales:

**1. Budget & Values:**
- Y7: £500k transfer budget, £50k-£300k players
- Y8: £1.5M budget, £100k-£1M players  
- Y9: £5M budget, £500k-£5M players
- GCSE: £20M-£50M budgets, multi-million players

**2. Problem Complexity:**
- Y7: 1-3 steps, simple calculations
- Y8: 2-4 steps, compound percentages
- Y9: 3-5 steps, equations, multi-step
- GCSE: 4-6 steps, advanced topics

**3. Features:**
- Y7: Single transfer window, basic contracts
- Y8: January window, bonuses, loan system
- Y9: European competition, investment portfolio
- GCSE: All features, advanced analytics

**4. Hint Support:**
- Y7: Offer hints after 2 wrong attempts
- Y8: After 3 attempts
- Y9: After 4 attempts
- GCSE: After 5-6 attempts

---

## 🔧 How to Use

### In Problem Generation (Week 3):
```typescript
import { getCurrentCurriculum } from './curriculum/config';

function generateTransferProblem() {
  const curriculum = getCurrentCurriculum();
  
  // Use curriculum parameters
  const maxValue = curriculum.budgetScale.playerValues[1];
  const difficulty = curriculum.difficulty.medium;
  const topics = curriculum.topics;
  
  // Generate problem within constraints
  // ...
}
```

### In Match Simulation:
```typescript
function simulateMatch(homeTeam, awayTeam, seed) {
  const curriculum = getCurrentCurriculum();
  
  // Y9+ allows more varied scorelines
  const goalVariance = curriculum.level === 'YEAR_9' ? 1.3 : 1.0;
  
  // ...
}
```

### In UI (Week 2):
```typescript
import { 
  getAllCurriculumLevels, 
  getCurrentCurriculum,
  setCurriculumLevel 
} from '@football-manager/domain';

function SettingsScreen() {
  const current = getCurrentCurriculum();
  
  return (
    <select value={current.level} onChange={e => {
      setCurriculumLevel(e.target.value);
    }}>
      {getAllCurriculumLevels().map(level => (
        <option value={level.level}>{level.displayName}</option>
      ))}
    </select>
  );
}
```

### Check Progression:
```typescript
import { assessReadinessForProgression } from './curriculum/progression';

const assessment = assessReadinessForProgression(gameState.events);

if (assessment.ready) {
  // Show "Ready to progress!" message
  // Offer to advance to next level
}

// Show progress: assessment.readinessScore (0-100)
// Show recommendations: assessment.recommendations
```

---

## ✅ Benefits

1. **Single Change Point:** Change curriculum level once, everything adapts
2. **Smooth Progression:** Manual or automatic advancement
3. **Feature Gating:** Complexity increases gradually
4. **Problem Reuse:** Same templates, different parameters
5. **Long-term Value:** Game grows with your child for 4+ years
6. **Easy Testing:** Can test at any level instantly

---

## 📋 Integration Checklist

Week 1 (Now):
- [x] Add `/curriculum/config.ts`
- [x] Add `/curriculum/progression.ts`  
- [x] Update `types/game-state.ts`
- [x] Update `index.ts`
- [ ] Create curriculum folder structure
- [ ] Add to git

Week 2 (UI):
- [ ] Add curriculum selector to settings
- [ ] Show progression status on dashboard
- [ ] Test level switching

Week 3 (Problems):
- [ ] Use `getCurrentCurriculum()` in problem generator
- [ ] Test problems at all levels
- [ ] Verify difficulty scaling

Week 4 (Polish):
- [ ] Add "Ready to progress!" notification
- [ ] Show detailed progression assessment
- [ ] Celebrate level-ups

---

## 🎯 Summary

These 4 files create a curriculum system that:
- ✅ Scales from Year 7 through GCSE
- ✅ Automatically adjusts difficulty, budget, features
- ✅ Assesses readiness to progress
- ✅ Requires minimal changes to use
- ✅ Future-proofs the game for years of use

Add these files now in Week 1, use them in Week 3 (problem generation), and you'll have a game that grows with your child!
