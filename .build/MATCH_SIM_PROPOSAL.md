# Match Simulation Redesign — Design Proposal

> Edit this file with your tweaks, then hand back to Claude to build.

---

## What exists and is being kept

- **Poisson distribution engine** — correct, well-tested, not touching
- **Home advantage** — 1.10× multiplier, keeping
- **`generateAITeam()` for NPC clubs** — still uses `baseStrength` only, no change
- **`BASE_EXPECTED_GOALS = 1.2`** — realistic for League Two, keeping
- **Position-weighted attack/defence split** — structure is right, but switching from `overallRating` to actual `attack`/`defence` attributes (see below)

---

## Proposed changes

### 1. Attack & defence strength — use player attributes, not overallRating

**Current:** position-weighted average of `overallRating`

**Proposed:**

| Attribute | FWD weight | MID weight | DEF weight | GK weight |
|-----------|-----------|-----------|-----------|----------|
| `attack`  | 3×        | 2×        | 1×        | 0×       |
| `defence` | 1×        | 2×        | 3×        | 3.5×     |

No change to the formula structure — just swap `overallRating` for the relevant attribute.

---

### 2. Team modifier — full input breakdown

**Range: clamped to [0.80, 1.30]**

| Input | Modifier contribution | Notes |
|-------|-----------------------|-------|
| Squad avg `teamwork` | +0.00 to +0.08 | 0 at avg=0, +0.08 at avg=100 |
| TRAINING_GROUND level (0–5) | +0.00 to +0.50 | replaces blended-all-facilities calc |
| Staff avg quality (0–100) | +0.00 to +0.12 | was 0.15 — reduced to balance vs. training ground |
| FAN_ZONE level (0–5) | +0.00 to +0.05 | **home matches only** |
| Reputation (0–100) | +0.00 to +0.08 | was 0.10 |
| Form (last 5) | W=+0.02, L=−0.02 each | unchanged |

**Ceiling check:** 1.0 + 0.08 + 0.10 + 0.12 + 0.05 + 0.08 + 0.10 = 1.53 → clamped to 1.30

Facilities NOT in the modifier: STADIUM, COMMERCIAL, F&B (revenue only), MEDICAL_CENTER (injury, deferred), YOUTH_ACADEMY (development, deferred), GROUNDS_SECURITY (reputation/attendance, not match).

---

### 3. Training focus — weekly effect on the match

Applied after base strengths are calculated.

| Focus | Effect |
|-------|--------|
| `ATTACKING` | `attackStrength × 1.05` |
| `DEFENSIVE` | `defenceStrength × 1.05` |
| `FITNESS` | `teamModifier + 0.03` |
| `SET_PIECES` | `attackStrength × 1.03` |
| `YOUTH_INTEGRATION` | no match effect — developmental only |

---

## Questions / decisions needed

1. **Training focus — DEFENSIVE framing**
   The DEFENSIVE focus improves *your* `defenceStrength × 1.05` rather than reducing the opponent (which we can't control). Does this feel right, or should it work differently?

2. **FAN_ZONE as home-only**
   Modelled as a home-atmosphere bonus only. Agree?

3. **Staff contribution** (0.15 → 0.12)
   Staff is expensive. Reducing slightly so training ground investment is a meaningful alternative. Or keep staff at 0.15 to stay dominant?

4. **Player morale — wire in now or defer?**
   `morale` exists on every Player (0–100). Could feed into `teamModifier` as avg squad morale → ±0.05. Worth adding now or leave for later?

---

## Deliberately deferred

- Charisma → revenue (separate PR, touches revenue systems)
- MEDICAL_CENTER → injury risk (no injury system yet)
- Player morale modifier (see question 4 above)
- Manager creation (#29)
- Player development / aging using `truePotential`
