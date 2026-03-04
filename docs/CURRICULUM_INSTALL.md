# Quick Install - Curriculum System

## 📦 Files to Download
1. ✅ `CURRICULUM_UPDATE.md` (read this first - explains everything)
2. ✅ `curriculum-config.ts` (new file)
3. ✅ `curriculum-progression.ts` (new file)
4. ✅ `game-state-updated.ts` (replaces existing)
5. ✅ `domain-index-updated.ts` (replaces existing)

## 🚀 Installation (3 Steps)

### Step 1: Create Curriculum Folder
```bash
cd packages/domain/src
mkdir curriculum
```

### Step 2: Add New Files
```bash
# Copy downloaded files to:
curriculum/config.ts           ← curriculum-config.ts
curriculum/progression.ts      ← curriculum-progression.ts
```

### Step 3: Replace Updated Files
```bash
# Replace these existing files with downloaded versions:
types/game-state.ts           ← game-state-updated.ts
index.ts                      ← domain-index-updated.ts
```

## ✅ Verification

After installation, your structure should look like:
```
packages/domain/src/
├── curriculum/          ← NEW
│   ├── config.ts       ← NEW
│   └── progression.ts  ← NEW
├── types/
│   ├── game-state.ts   ← UPDATED
│   └── ...
├── index.ts            ← UPDATED
└── ...
```

Test that TypeScript compiles:
```bash
cd packages/domain
npm run build
```

Should compile with no errors! ✨

## 🎯 What This Gives You

**Now:**
- Curriculum system in place
- Ready to use in Week 3 (problem generation)

**Later:**
- Game scales from Year 7 → GCSE automatically
- One setting controls difficulty, budget, features
- Built-in progression assessment
- 4+ years of educational value

## 📖 Next Steps

1. Read `CURRICULUM_UPDATE.md` for full explanation
2. Continue with Week 1 tasks (money utils, events, etc.)
3. Use curriculum system in Week 3 when building problem generator

That's it! The foundation for curriculum evolution is now in place. 🎓⚽
