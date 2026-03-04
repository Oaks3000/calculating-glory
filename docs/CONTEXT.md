# Football Club Management Game - Design Context Document

**Date:** February 16, 2026  
**Version:** V1 Prototype Scope  
**Target Audience:** Year 7 students (ages 11-12)  
**Primary Goal:** Improve Year 7 and early Year 8 maths skills through immersive gameplay

---

## Core Concept

Player assumes role of new owner of a mid-table League Two football club. Through strategic resource management decisions requiring real maths problem-solving, they build their club over a single season. Mathematical challenges drive resource acquisition (budget, facilities, staff quality) which indirectly affects on-field performance.

**Key Design Principle:** Maths is integral to decision-making, not artificially inserted. Wrong answers create suboptimal outcomes (budget drain, missed opportunities) rather than game-over states.

---

## Design Philosophy

### Dual Success Metrics

1. **Engagement/Enjoyment** - Drives continued play
   - Immersive narrative and club attachment
   - Meaningful consequences without harsh punishment
   - Player agency in choosing challenge level
   - 60+ minute play time per season for deep engagement

2. **Measurable Improvement** - Educational effectiveness
   - Comprehensive Year 7 curriculum coverage
   - Adaptive difficulty based on performance
   - Contextual tutorials when struggling
   - Multiple exposures to concepts in varied contexts

### Core Tension Resolution

**Problem:** If maths performance = survival, weak students quit. If maths doesn't matter, no incentive to try.

**Solution:** Decouple maths from survival, but strongly couple it to optimization and richness of experience.
- Wrong answers = suboptimal outcomes (overpaying, missed opportunities)
- Right answers = better resources, richer narrative, superior outcomes
- Always eventually progress, but quality of experience varies with maths performance

---

## Gameplay Structure

### V1 Prototype Scope: Single Season (60+ minutes)

**Starting Position:**
- Mid-table League Two club
- Starter budget: £500k transfer budget, £60k/week wage budget
- Basic 20-player squad with simple stats (Overall Rating, Position, Wage)
- **Season Goal:** Finish in playoff positions (top 7)

### Season Structure

#### 1. Pre-Season (15-20 minutes)

**Club Introduction**
- Club history, stadium name, local rivalry
- Board expectations: "Minimum top 10, playoffs = success"
- Financial review: debts, revenue streams, costs breakdown

**Squad Audit** (Maths Challenge)
- Analyze 20-player squad using stat tables
- Identify weaknesses via data interpretation
- Example: "Defense concedes 2.1 goals/game vs league avg 1.6 - calculate goals saved over 46 games if we matched average"

**Transfer Window** (5-7 challenges)
- Scout reports on 15-20 available players
- Multiple positions to fill (GK, DEF, MID, FWD)
- Each signing = contextualized maths problem:
  - Contract negotiations (base + bonuses)
  - Player value comparisons (cost per goal, cost per clean sheet)
  - Agent fees, payment structures, release clauses
- Selling decisions: Keep or sell existing players based on value calculations

**Staff & Facilities** (3-4 decisions)
- **Manager Selection:** 4 options with different stats/costs/specializations
  - Defensive specialist, attacking flair, youth developer, experienced
  - Compare win %, goals for/against, cost
- **Coaching Staff:** Attacking coach, defensive coach, fitness coach (each improves specific stats)
- **Facilities:** Training ground, medical, youth academy, stadium
  - Each includes ROI calculation challenge

#### 2. Season Progression (30-35 minutes)

**Monthly Checkpoints** (4 checkpoints = 4 months)

Each checkpoint displays:
- Last month's results (4-5 matches with scores, brief highlights)
- Current league table position
- Player performance statistics
- Financial snapshot (running total)
- News/events: injuries, morale, rival results

**Interactive Events** (2-3 per month)

*Financial Decisions:*
- Sponsorship deal comparisons (flat rate vs performance-based)
- Investment opportunities (ROI calculations)
- Emergency funding needs

*Squad Management:*
- Contract renegotiations (wage calculations, comparison with transfer offers)
- Injury crisis responses (loan costs vs youth promotion)
- Player morale issues (investment trade-offs)

*Strategic Moments:*
- Derby match preparations (cost-benefit of performance boosts)
- Rival analysis and competitive responses
- Ethical dilemmas with mathematical components

**January Transfer Window** (8-10 minutes)
- Smaller budget allocation
- React to first-half performance
- 3-4 transfer challenges
- Opportunity to correct summer mistakes

#### 3. Season Run-In (10-12 minutes)

**Final 3 Months** (March-May)
- Weekly updates (more granular than monthly)
- Playoff race intensification
- Critical decisions:
  - Fitness management (short-term vs long-term trade-offs)
  - Final investment opportunities
  - Player motivation strategies

**Critical Matches**
- Brief match commentary for crucial games
- Key tactical moments with mathematical implications

#### 4. End of Season (8-10 minutes)

**Final Day Drama**
- Multiple clubs competing for playoff spots
- Live updates of simultaneous matches
- Player's result + rivals' results determine final position

**Season Review**
- Final league position
- Complete financial report (P&L interpretation, ROI calculations)
- Player awards and statistics
- Board assessment with detailed breakdown
- "What If" analysis showing alternative outcomes
- Future tease: Next season budget, transfer interest, continuation prompt

---

## Mathematical Integration

### Year 7 Curriculum Coverage

**Core Topics Woven Throughout:**
- **Number Operations:** Budgets, transfers, wage calculations (constant)
- **Decimals:** Player statistics (goals/game, save %), ticket prices
- **Percentages:** Agent fees, performance changes, discounts, probability
- **Fractions & Ratios:** Value per £, goals per game, comparative analysis
- **Algebra:** Break-even calculations, solving for unknowns in contracts
- **Statistics:** Tables, charts, averages, data interpretation
- **Multi-step Problem-Solving:** Complex scenarios requiring multiple operations

### Three Types of Mathematical Challenges

#### 1. Binary Levers (Stakes-Based Decisions)
- Real consequences for right/wrong answers
- Wrong answer = budget drain OR lost opportunity
- Hint system available but you commit to result
- Examples:
  - "Calculate total signing cost" → overpay = budget drain
  - "What's break-even attendance?" → wrong = bad investment
  - "Maximum wage offer under cap?" → wrong = financial trouble

#### 2. Guided Tutorials (Must-Pass Story Beats)
- Triggered by repeated struggles OR at key learning moments
- Game pauses for collaborative problem-solving
- Cannot progress until understanding demonstrated
- No penalty - this IS the teaching moment
- Examples:
  - First percentage calculation: "Let's learn how agent fees work..."
  - After struggling with 3 percentage problems: Tutorial triggered
  - Complex new concepts: Step-by-step walkthrough

**Tutorial Structure:**
1. "Here's what we're trying to find..."
2. "First, identify what we know..."
3. "Step 1: Calculate X..." [practice step]
4. "Good! Now step 2..." [build up]
5. "Now try the full problem" [application]
6. Return to game with newfound confidence

**Mandatory Tutorial Story Beats:**
- **Stadium Development:** Capacity calculations, revenue projections, break-even analysis (must complete to unlock upgrade)
- **First Contract Negotiation:** Teaches percentage calculations with agent fees
- **Youth Academy Decision:** Probability and expected value
- **Sponsorship Deal:** Comparing different deal structures
- **Season Financial Review:** Data interpretation from complex tables

#### 3. Risk/Reward Narrative Choices
- Player chooses challenge level through story, not abstract difficulty
- Benefits and risks explicitly shown in UI
- Not "easy/medium/hard" but narrative options requiring different maths

**Example Structure:**
```
[Trust the Scout - Easy Maths]
✓ Guaranteed success
✓ Quick decision (1 question)
⚠ Pay full market rate (£250k)
⚠ Standard player quality

[Negotiate Yourself - Medium Maths]
✓ Save £30-40k if correct
✓ Better player morale
⚠ 2-3 calculations required
⚠ Might overpay if wrong

[Advanced Analysis - Hard Maths]
✓ Best value signing possible
✓ Could save £60-80k
✓ Might find a star
⚠ Complex comparison (4-5 steps)
⚠ Risk of wrong player if miscalculated
```

---

## Pedagogical Systems

### Progressive Hint System

**First Wrong Attempt:**
- "Let me check those figures... try again?" 
- No help provided, just opportunity to self-correct

**Second Attempt:**
- Conceptual hint: "Remember to account for the 15% agent fee in your total"

**Third Attempt:**
- Step-by-step guidance: "Let's break it down: £180k base price, then calculate 15% of that..."

**Fourth Attempt:**
- Calculator appears OR "Would you like me to walk you through it?"
- Tutorial mode with worked example

**Always Eventually Progress:** No student stuck permanently

### Diagnostic Assessment (Hidden)

**Background Tracking:**
- Silent monitoring of problem types where player struggles
- Categories: percentages, decimals, multi-step problems, ratios, algebra, data interpretation
- Tracks both speed AND accuracy

**Adaptive Problem Selection:**
- Game offers more practice on weak areas (disguised as natural game events)
- Strong areas receive harder variations
- Weak areas receive scaffolded versions
- Example: Struggling with percentages → more agent fees, bonus structures, discount calculations appear (in varied contexts)

### Error Feedback & Learning

**Contextual Tutorials:**
- Triggered after 2+ errors in similar problem types
- "I notice percentage calculations are tricky. Want a quick refresher?"
- Optional 2-minute interactive tutorial with visual representations
- Immediate practice opportunity after learning

**Worked Examples:**
- After incorrect answer, option to see step-by-step solution
- Not just final answer, but complete breakdown
- Then similar problem offered immediately for practice

**In-Game Advisor System:**
- Club accountant character helps with numbers
- "Boss, want me to check your maths before we finalize this deal?"
- If help requested: shows working, identifies specific error
- Example: "You calculated agent fee correctly (£27k), but forgot to add it to base price"

### Skill Development Tracking (Visible)

**"Business Acumen" Dashboard:**
- Player's mathematical skills displayed as in-game stats
- "Financial Management: ★★★☆☆"
- "Statistical Analysis: ★★☆☆☆"
- "Strategic Planning: ★★★★☆"
- Stars increase visibly as player improves

**Unlocks via Skill Mastery:**
- Master percentages → Unlock "Advanced Contract Negotiations"
- Master ratios → Unlock "Comparative Scouting System"
- Master data interpretation → Unlock "Detailed Analytics Dashboard"
- Rewards growth, doesn't punish weakness

---

## Budget & Resource Systems

### Dynamic Budget Mechanic

**Core System:**
- **Transfer Budget:** Starting £500k (for buying players)
- **Wage Budget:** Starting £60k/week (ongoing player salaries)
- Every mathematical error directly impacts budgets

**Overpayment Consequences:**
- Player true value: £180k + 15% fee = £207k total
- Calculate £230k → Overpay by £23k
- Budget drops from £500k to £270k (not £293k)
- **Compound effect:** Multiple overpayments = can't afford later signings

**Underpayment Consequences:**
- Offer too low → Player rejects, signs elsewhere
- Must find alternative (possibly worse or more expensive)
- Time pressure as transfer window progresses

**Budget Replenishment:**
- Successful sponsorship deals (calculated correctly)
- Prize money from good league performance
- Selling players for profit
- Smart facility investments paying off

### Match Performance Formula

**Multi-Factor Success (No Direct Maths → Result Link):**
```
Match Performance = 
  40% Squad Quality (from transfer decisions)
  25% Manager/Staff Quality (from hiring decisions)
  15% Facilities (from investment decisions)
  10% Morale (from player management)
  10% Randomness/luck
```

**Mathematical Accuracy Impact on Resources:**
- Perfect maths → Full value from all decisions (100% effectiveness)
- Some errors → 85-95% effectiveness (slight inefficiency, still competitive)
- Many errors → 70-85% effectiveness (noticeably suboptimal but not broken)

**Critical Design Point:** Even with poor maths, mid-table finish possible. With excellent maths, can push for automatic promotion. Creates aspiration without despair.

---

## Forcing Difficulty Variation

**Problem:** Players might choose only Easy mode, missing learning opportunities

**Solutions:**

### 1. Forced Medium/Hard Scenarios

**Elite Opportunity Example:**
- Championship-quality player becomes available
- No Easy option: "Too important to delegate - you handle this personally"
- Must choose Medium (direct negotiation) or Hard (comparison analysis)
- Narrative justification for increased complexity

### 2. Budget Constraints Force Optimization

**Late Season, Tight Budget:**
- Easy option exists but: "Scout recommends £75k player - but then no backup GK"
- Forces consideration of Medium/Hard to find better deals
- Can still choose Easy, but consequences explicit

### 3. Board Demands Strategic Thinking

**Mandatory Board Meeting:**
- "Present your financial strategy - can't delegate this"
- Forced Medium difficulty: ROI calculations, projection analysis
- No Easy option - skill gate for board confidence

### 4. Adaptive Nudging System

**If 5+ Easy choices in row:**
- "Boss, you've been delegating a lot lately. Board's noticing..."
- Next major decision: Chairman insists on personal involvement
- Forces Medium or Hard choice

**If regularly chooses Hard:**
- "Board impressed with strategic thinking!"
- Unlocks bonus scenario with extra rewards

### 5. Crisis Mode = Forced Complexity

**Financial Crisis Example:**
- Overspent on wages, must fix before season starts
- No Easy option available
- Medium: Calculate which players to sell
- Hard: Restructure contracts without selling
- Real-world constraints don't offer simple solutions

### 6. Season-Long Complexity Requirement

**Hidden "Challenge Points" System:**
- Easy = 1 point, Medium = 2 points, Hard = 3 points
- Season gates:
  - 25 points: Unlock January budget increase
  - 40 points: Get playoff bonus if finish 7th
  - 60+ points: "Strategic Genius" ending
- Displayed as "Board Confidence: Medium/High"
- Impossible to pure-Easy-mode to best ending

**Balanced Season Arc:**
- Matches 1-10: Free choice (learning phase)
- Match 11: First gate - forced Medium/Hard
- Matches 12-20: Back to choices
- January: Mandatory financial report + forced decision
- Matches 21-35: Choices, but Easy options show consequences
- Match 36: Playoff push - no Easy option
- End: Quality depends on accumulated strategic thinking score

---

## Immersion Elements

### Narrative Flavor

- **Club Identity:** Colors, badge, stadium name, established rivalry
- **Character Voices:** Manager quotes, board personality, player attitudes
- **Player Personalities:** Some mercenary, some loyal, affects decisions
- **Media Response:** Local newspaper headlines after big results
- **Fan Sentiment:** Happiness/anger/anxiety affects atmosphere
- **Progression Narrative:** Underdog story, building something special

### Visual & UI Richness

- League table always visible in interface
- Form guide (last 5 results) for all teams
- Mini player cards with avatars/photos
- Stadium image that visually upgrades
- Budget/finance dashboard with clear visualization
- Match highlights with brief commentary
- Statistical charts and graphs

### Consequence & Stakes

- Decisions have meaningful trade-offs
- Failed investments feel disappointing
- Good signings become club heroes
- Missing playoffs by 1 point creates emotional impact
- Board pressure increases with poor decisions
- Fan expectations evolve with success

---

## Technical Scope for V1

### Must-Have Features

✅ React-based single-page application
✅ Clean, football-themed UI design
✅ Game state management (budget, squad, season progress)
✅ Mathematical problem generator with 3 difficulty tiers
✅ Progressive hint system with multiple levels
✅ Tutorial system for mandatory story beats
✅ Match simulation algorithm (based on squad quality ratings)
✅ League table tracking with 24 teams
✅ Progress tracking (finances, player stats, board confidence)
✅ End-of-season comprehensive summary
✅ Adaptive difficulty system (hidden diagnostic tracking)

### Explicitly NOT in V1

❌ Multiplayer functionality
❌ Save/load game capability
❌ Multiple seasons (single season only)
❌ Complex tactical systems or formation choices
❌ Detailed player attributes beyond: Overall Rating, Position, Wage, Goals/Game
❌ Real-world club names or licenses

### Player Data Structure (Simplified)

```javascript
{
  name: "Player Name",
  position: "FWD" | "MID" | "DEF" | "GK",
  overallRating: 65, // 0-100 scale
  wage: 2500, // per week in £
  goalsPerGame: 0.45, // for forwards
  cleanSheetRate: 0.35, // for defenders/GK
  transferValue: 180000, // in £
  morale: 75, // 0-100
  age: 24
}
```

---

## Success Criteria

### Educational Effectiveness

- Covers 6-8 Year 7 curriculum topics comprehensively
- Problems feel naturally integrated, not forced
- Clear, constructive feedback on mathematical errors
- Adaptive difficulty finds appropriate challenge level
- Multiple exposures to each concept in varied contexts
- Measurable improvement in problem-solving confidence

### Engagement Metrics

- 60+ minutes play time per season (immersive depth)
- High replay value (different strategies, different outcomes)
- Satisfying progression (visible squad/club improvement)
- Emotional investment (care about results, players, club)
- Natural desire to optimize (try harder maths for better outcomes)
- Narrative pull (want to see how season concludes)

### Game Design Quality

- Mathematical decisions feel meaningful and impactful
- Consequences are logical and proportional
- No student permanently stuck (always path forward)
- Excellence rewarded, struggle supported
- Balance between agency and guidance
- Realistic enough to be credible, gamified enough to be fun

---

## Future Expansion Possibilities (Post-V1)

### Multi-Season Campaign
- Carry over budget, squad, reputation
- Promotion through leagues: League Two → League One → Championship → Premier League
- Increasing complexity and stakes
- Legacy building (youth players develop, stadium grows)
- **Escalating Failure Stakes:** As player progresses to higher leagues (especially post-promotion), genuine failure states become more present and meaningful
  - League Two/One: Forgiving, focus on learning and optimization
  - Championship/Premier League: Real risk of relegation, financial crisis, board dismissal
  - Mathematical errors have more severe consequences at higher levels
  - Reflects real-world pressure of top-tier management
  - Note: V1 maintains supportive approach; this escalation reserved for sequential season development

### Multiplayer Features
- Shared league with 10-20 human players
- Asynchronous play (make decisions, season simulates overnight)
- Real transfer market competition (bidding wars)
- Direct head-to-head when clubs meet
- Leaderboards and seasonal rankings

**Architectural Considerations for V1 (Future-Proofing):**
- Design game state structure to be serializable/shareable (JSON-based)
- Separate game logic from UI rendering (facilitate server-side simulation)
- Keep match simulation deterministic (same inputs = same outputs for sync)
- Structure transfer market as independent system (easier to make competitive)
- Design league table calculations to support multiple human-controlled clubs
- Use event-driven state updates (facilitates async multiplayer transitions)
- Consider data models that work for both local and remote state management
- **Critical:** V1 should be built with clean separation of concerns so multiplayer backend can be added without major refactoring

### Extended Content
- More facility types and upgrade paths
- Deeper youth academy system
- Managerial career progression
- European competition unlocks
- Historical challenge scenarios
- Custom club creation

---

## Open Questions for Build Phase

1. **Specific Problem Bank:** How many unique maths problems needed per topic to avoid repetition over 60+ minutes?

2. **Match Simulation Detail:** How much match commentary/detail enhances immersion without slowing pace?

3. **Visual Assets:** What level of visual polish needed? Custom illustrations vs simple UI elements?

4. **Difficulty Calibration:** Exact thresholds for Easy/Medium/Hard - what calculation complexity per level?

5. **Balancing Act:** Precise tuning of how much mathematical errors impact budget vs board confidence vs season outcome?

6. **Tutorial Frequency:** How many mandatory tutorials vs optional help before it feels too instructional?

7. **Narrative Depth:** How much story/character development enriches without overwhelming the maths focus?

---

## Design Principles Summary

1. **Maths is integral, not decorative** - Decisions require actual problem-solving
2. **Support struggle, don't punish it** - Always path forward, hints available
3. **Optimize, don't survive** - Excellence rewarded more than failure punished
4. **Context creates meaning** - Every problem embedded in believable scenario
5. **Agency within structure** - Player choice, but nudged toward growth
6. **Immersion drives engagement** - Rich narrative makes practice purposeful
7. **Visible progress motivates** - Show improvement, unlock capabilities
8. **Multiple exposures, varied contexts** - Same concept, different scenarios

---

**End of Context Document**

*This document captures all design decisions agreed upon before build phase. Any significant changes during development should be documented with rationale.*
