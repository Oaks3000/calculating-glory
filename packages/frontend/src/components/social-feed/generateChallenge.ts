import { GameState } from '@calculating-glory/domain';

/** Shape of businessAcumen.recentPerformance, keyed by ChallengeTopic */
export type TopicPerformance = {
  percentage: number;
  decimals:   number;
  ratios:     number;
  algebra:    number;
  statistics: number;
  multiStep:  number;
};

export type ChallengeTopic = 'percentage' | 'decimals' | 'ratios' | 'algebra' | 'statistics';

export interface MathChallenge {
  id: string;
  topic: ChallengeTopic;
  difficulty: number; // 1-3
  question: string;
  answer: number;
  unit: string;
  hints: [string, string, string]; // progressive hints
  explanation: string;
  context: string;   // NPC narrative — explains why this challenge matters
}

function pct(n: number) { return Math.round(n); }
function dp1(n: number) { return Math.round(n * 10) / 10; }
function dp2(n: number) { return Math.round(n * 100) / 100; }

export function generateChallenge(
  state: GameState,
  index: number,
  performance?: TopicPerformance,
  topicOverride?: ChallengeTopic,
): MathChallenge {
  const { club, league, boardConfidence } = state;

  const playerEntry = league.entries.find(e => e.clubId === club.id);
  const position    = playerEntry?.position ?? 12;
  const totalTeams  = league.entries.length;
  const points      = playerEntry?.points ?? 30;
  const played      = playerEntry?.played ?? 20;
  const won         = playerEntry?.won ?? 8;
  const gf          = playerEntry?.goalsFor ?? 24;
  const ga          = playerEntry?.goalsAgainst ?? 20;
  const gamesLeft   = 46 - state.currentWeek;

  const budgetM     = dp1(club.transferBudget / 100_000_000);
  const budgetK     = Math.round(club.transferBudget / 100_000);   // £ thousands

  const wageBillWeekly = Math.round(
    (club.squad.reduce((s, p) => s + p.wage, 0) + club.staff.reduce((s, st) => s + st.salary, 0))
    / 100
  );
  const wageBudgetWeekly = Math.round(club.wageBudget / 100);
  const wageHeadroom     = wageBudgetWeekly - wageBillWeekly;

  // Top 5 OVR for squad average question
  const top5Ratings = [...club.squad]
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 5)
    .map(p => p.overallRating);
  const top5Avg = top5Ratings.length > 0
    ? dp1(top5Ratings.reduce((s, r) => s + r, 0) / top5Ratings.length)
    : 70;

  // Leading team points
  const leadPoints = league.entries[0]?.points ?? 50;
  const pointsGap  = Math.max(0, leadPoints - points);

  // Cheapest upgradeable facility
  const upgradeTarget = [...club.facilities]
    .filter(f => f.level < 5)
    .sort((a, b) => a.upgradeCost - b.upgradeCost)[0];
  const upgradeCostK = upgradeTarget ? Math.round(upgradeTarget.upgradeCost / 100_000) : 50;

  // Win rate
  const winRatePct = played > 0 ? pct((won / played) * 100) : 0;

  // Points per game
  const ppg = played > 0 ? dp2(points / played) : 0;

  // GD
  const gd = gf - ga;

  const challenges: MathChallenge[] = [
    // ── DIFFICULTY 1 ─────────────────────────────────────────────────────────

    {
      id: `ch-${index}-wage-pct`,
      topic: 'percentage',
      difficulty: 1,
      context:
        `I need to brief the board on our finances. They want to know exactly how stretched our wages are. ` +
        `If you can work out what percentage of the budget we're spending, I can make a stronger case for us in the transfer window.`,
      question:
        `Your weekly wage bill is £${wageBillWeekly.toLocaleString()}. Your weekly wage budget is £${wageBudgetWeekly.toLocaleString()}. ` +
        `What percentage of your budget are you spending? Round to the nearest whole number.`,
      answer: pct((wageBillWeekly / wageBudgetWeekly) * 100),
      unit: '%',
      hints: [
        'Percentage = (part ÷ whole) × 100',
        `Divide the wage bill (${wageBillWeekly.toLocaleString()}) by the budget (${wageBudgetWeekly.toLocaleString()}), then × 100`,
        `${wageBillWeekly} ÷ ${wageBudgetWeekly} = ${(wageBillWeekly / wageBudgetWeekly).toFixed(4)} … × 100 = ?`,
      ],
      explanation: `(${wageBillWeekly} ÷ ${wageBudgetWeekly}) × 100 = ${pct((wageBillWeekly / wageBudgetWeekly) * 100)}%`,
    },

    {
      id: `ch-${index}-confidence-proj`,
      topic: 'algebra',
      difficulty: 1,
      context:
        `The board are watching closely. If we can string three wins together, confidence will rocket. ` +
        `I need you to calculate where we'll stand so I can tell them exactly what to expect.`,
      question:
        `Board confidence is currently ${boardConfidence}%. ` +
        `If you win the next 3 games and gain 5 confidence points per win, what will board confidence be? (Maximum 100%)`,
      answer: Math.min(100, boardConfidence + 15),
      unit: '%',
      hints: [
        '3 wins × 5 points per win = how many points gained?',
        `Add those points to the current confidence: ${boardConfidence} + ?`,
        `${boardConfidence} + (3 × 5) = ${boardConfidence} + 15 = ?`,
      ],
      explanation: `${boardConfidence} + (3 × 5) = ${boardConfidence} + 15 = ${Math.min(100, boardConfidence + 15)}%`,
    },

    {
      id: `ch-${index}-budget-40pct`,
      topic: 'percentage',
      difficulty: 1,
      context:
        `I've spotted a solid target but we can't blow the whole kitty on one player. ` +
        `The golden rule is: never spend more than 40% of your budget on a single signing. What's our ceiling?`,
      question:
        `Your transfer budget is £${budgetM}m. ` +
        `A scout recommends spending no more than 40% of it on a single player. ` +
        `What is the maximum you should spend? Give your answer in millions to 1 decimal place.`,
      answer: dp1(budgetM * 0.4),
      unit: 'm',
      hints: [
        '40% means 40 out of every 100, so divide by 100 then multiply by 40 — or just × 0.4',
        `Multiply £${budgetM}m by 0.4`,
        `${budgetM} × 0.4 = ?`,
      ],
      explanation: `£${budgetM}m × 0.4 = £${dp1(budgetM * 0.4)}m`,
    },

    // ── DIFFICULTY 2 ─────────────────────────────────────────────────────────

    {
      id: `ch-${index}-position-pct`,
      topic: 'statistics',
      difficulty: 2,
      context:
        `A rival chairman was boasting about beating us in the table. I need the exact figures to put him straight. ` +
        `How many teams are we actually beating right now?`,
      question:
        `You are in position ${position} out of ${totalTeams} teams. ` +
        `What percentage of teams are BELOW you in the table? Round to the nearest whole number.`,
      answer: pct(((totalTeams - position) / totalTeams) * 100),
      unit: '%',
      hints: [
        `Teams below you = Total − Your position = ${totalTeams} − ${position} = ${totalTeams - position}`,
        'Percentage = (teams below ÷ total teams) × 100',
        `(${totalTeams - position} ÷ ${totalTeams}) × 100 = ?`,
      ],
      explanation:
        `${totalTeams - position} teams below. (${totalTeams - position} ÷ ${totalTeams}) × 100 = ` +
        `${pct(((totalTeams - position) / totalTeams) * 100)}%`,
    },

    {
      id: `ch-${index}-points-proj`,
      topic: 'algebra',
      difficulty: 2,
      context:
        `The board want to know if we can make the play-offs. I need you to project our final points tally ` +
        `so I can put together a realistic case for them.`,
      question:
        `You have ${points} points with ${gamesLeft} games remaining. ` +
        `If you average 1.8 points per game from here, how many total points will you finish on? ` +
        `Round to the nearest whole number.`,
      answer: Math.round(points + gamesLeft * 1.8),
      unit: 'pts',
      hints: [
        `Points from remaining games = games left × average = ${gamesLeft} × 1.8`,
        `${gamesLeft} × 1.8 = ${dp1(gamesLeft * 1.8)} extra points`,
        `Add to current total: ${points} + ${dp1(gamesLeft * 1.8)} = ?`,
      ],
      explanation:
        `${points} + (${gamesLeft} × 1.8) = ${points} + ${dp1(gamesLeft * 1.8)} = ` +
        `${Math.round(points + gamesLeft * 1.8)} pts`,
    },

    {
      id: `ch-${index}-win-rate`,
      topic: 'statistics',
      difficulty: 2,
      context:
        `A potential signing's agent asked about our win percentage — they want to know if they're joining a club ` +
        `going places. I need the exact figure to put in their presentation.`,
      question:
        `You have played ${played} games this season and won ${won}. ` +
        `What is your win percentage? Round to the nearest whole number.`,
      answer: winRatePct,
      unit: '%',
      hints: [
        'Win percentage = (wins ÷ games played) × 100',
        `Divide ${won} by ${played}`,
        `(${won} ÷ ${played}) × 100 = ${((won / played) * 100).toFixed(2)}… → round to nearest whole number`,
      ],
      explanation: `(${won} ÷ ${played}) × 100 = ${winRatePct}%`,
    },

    {
      id: `ch-${index}-ppg`,
      topic: 'decimals',
      difficulty: 2,
      context:
        `The analytics team measure everything in points per game — it's the only fair way to compare clubs ` +
        `at different stages of the season. What's ours?`,
      question:
        `With ${points} points from ${played} games, what is your points per game average? ` +
        `Give your answer to 2 decimal places.`,
      answer: ppg,
      unit: 'ppg',
      hints: [
        'Points per game = total points ÷ games played',
        `Divide ${points} by ${played}`,
        `${points} ÷ ${played} = ? (round to 2 dp)`,
      ],
      explanation: `${points} ÷ ${played} = ${ppg} ppg`,
    },

    {
      id: `ch-${index}-squad-avg-ovr`,
      topic: 'statistics',
      difficulty: 2,
      context:
        `A scout report needs our top-5 squad rating to benchmark us against transfer targets. ` +
        `Work out the mean from our best five players' overall ratings.`,
      question:
        `Your top 5 players have overall ratings of ${top5Ratings.join(', ')}. ` +
        `What is their mean overall rating? Give your answer to 1 decimal place.`,
      answer: top5Avg,
      unit: '',
      hints: [
        'Mean = sum of all values ÷ number of values',
        `Add up all five ratings: ${top5Ratings.join(' + ')} = ${top5Ratings.reduce((s, r) => s + r, 0)}`,
        `${top5Ratings.reduce((s, r) => s + r, 0)} ÷ ${top5Ratings.length} = ?`,
      ],
      explanation:
        `(${top5Ratings.join(' + ')}) ÷ ${top5Ratings.length} = ` +
        `${top5Ratings.reduce((s, r) => s + r, 0)} ÷ ${top5Ratings.length} = ${top5Avg}`,
    },

    {
      id: `ch-${index}-wage-headroom`,
      topic: 'algebra',
      difficulty: 2,
      context:
        `There's a player available on a free — no transfer fee, just wages. I need to know what we can ` +
        `actually afford without blowing the budget. Let's work it out.`,
      question:
        `Your wage budget is £${wageBudgetWeekly.toLocaleString()}/wk and your current bill is £${wageBillWeekly.toLocaleString()}/wk. ` +
        `A target player earns £${Math.round(wageHeadroom * 0.6).toLocaleString()}/wk. ` +
        `After signing them, what percentage of your remaining headroom will they use? Round to the nearest whole number.`,
      answer: pct((Math.round(wageHeadroom * 0.6) / wageHeadroom) * 100),
      unit: '%',
      hints: [
        `Headroom = budget − current bill = £${wageBudgetWeekly.toLocaleString()} − £${wageBillWeekly.toLocaleString()} = £${wageHeadroom.toLocaleString()}`,
        `Player wage = £${Math.round(wageHeadroom * 0.6).toLocaleString()}/wk`,
        `Percentage used = (player wage ÷ headroom) × 100`,
      ],
      explanation:
        `Headroom = £${wageHeadroom.toLocaleString()}. ` +
        `(${Math.round(wageHeadroom * 0.6)} ÷ ${wageHeadroom}) × 100 = ` +
        `${pct((Math.round(wageHeadroom * 0.6) / wageHeadroom) * 100)}%`,
    },

    // ── DIFFICULTY 3 ─────────────────────────────────────────────────────────

    {
      id: `ch-${index}-goals-per-game`,
      topic: 'decimals',
      difficulty: 3,
      context:
        `The press are asking whether our attack is good enough. I need the cold, hard numbers — ` +
        `goals per game — to settle the debate. Can you work it out?`,
      question:
        `You've scored ${gf} goals and conceded ${ga} in ${played} games. ` +
        `What is your goals scored per game? Give your answer to 2 decimal places.`,
      answer: dp2(played > 0 ? gf / played : 0),
      unit: ' goals/game',
      hints: [
        'Goals per game = goals scored ÷ games played',
        `Divide ${gf} by ${played}`,
        `${gf} ÷ ${played} = ? (2 dp)`,
      ],
      explanation: `${gf} ÷ ${played} = ${dp2(played > 0 ? gf / played : 0)} goals/game`,
    },

    {
      id: `ch-${index}-gd-pct`,
      topic: 'statistics',
      difficulty: 3,
      context:
        `Promotion goes down to goal difference when teams are level on points. ` +
        `Our ${gd >= 0 ? 'positive' : 'negative'} GD matters — but what percentage of our goals scored ` +
        `have we let in? The board want to see it in percentage terms.`,
      question:
        `You've scored ${gf} goals and conceded ${ga}. ` +
        `What percentage of your goals scored have you conceded? Give to 1 decimal place.`,
      answer: dp1(played > 0 && gf > 0 ? (ga / gf) * 100 : 0),
      unit: '%',
      hints: [
        'Percentage conceded = (goals conceded ÷ goals scored) × 100',
        `Divide ${ga} by ${gf}`,
        `(${ga} ÷ ${gf}) × 100 = ${((ga / Math.max(1, gf)) * 100).toFixed(3)}… → 1 dp`,
      ],
      explanation:
        `(${ga} ÷ ${gf}) × 100 = ${dp1((ga / Math.max(1, gf)) * 100)}%`,
    },

    {
      id: `ch-${index}-catch-leaders`,
      topic: 'algebra',
      difficulty: 3,
      context:
        `The top spot is the dream but maths doesn't lie. I need to know the absolute minimum points ` +
        `per game we need to average just to draw level with the leaders by the final whistle.`,
      question:
        `The league leaders have ${leadPoints} points. You have ${points}. ` +
        `There are ${gamesLeft} games remaining. ` +
        `What is the minimum points per game average you need to match them? Give to 1 decimal place.`,
      answer: gamesLeft > 0 ? dp1(pointsGap / gamesLeft) : 0,
      unit: ' ppg',
      hints: [
        `Points gap = leader points − your points = ${leadPoints} − ${points} = ${pointsGap}`,
        'You need to make up that gap over the remaining games',
        `Required ppg = gap ÷ games left = ${pointsGap} ÷ ${gamesLeft} = ?`,
      ],
      explanation:
        `Need ${pointsGap} more points over ${gamesLeft} games. ${pointsGap} ÷ ${gamesLeft} = ${gamesLeft > 0 ? dp1(pointsGap / gamesLeft) : 0} ppg`,
    },

    {
      id: `ch-${index}-upgrade-roi`,
      topic: 'ratios',
      difficulty: 3,
      context:
        `The blueprint team want to upgrade a facility but I need to justify the spend to the chairman. ` +
        `He wants to know how many home games it takes before a £${upgradeCostK}K upgrade pays itself off ` +
        `if it brings in an extra £2,500 per game. Can you work it out?`,
      question:
        `A facility upgrade costs £${upgradeCostK},000. ` +
        `It generates an extra £2,500 in revenue per home game. ` +
        `How many home games does it take to break even? Round up to the nearest whole number.`,
      answer: Math.ceil((upgradeCostK * 1000) / 2500),
      unit: ' games',
      hints: [
        'Break-even = total cost ÷ income per game',
        `Divide £${upgradeCostK},000 by £2,500`,
        `${upgradeCostK * 1000} ÷ 2500 = ${(upgradeCostK * 1000 / 2500).toFixed(2)} → round UP`,
      ],
      explanation:
        `${upgradeCostK * 1000} ÷ 2500 = ${(upgradeCostK * 1000 / 2500).toFixed(2)} → ` +
        `round up = ${Math.ceil((upgradeCostK * 1000) / 2500)} games`,
    },

    {
      id: `ch-${index}-budget-ratio`,
      topic: 'ratios',
      difficulty: 3,
      context:
        `The chairman wants to know the ratio of our transfer budget to the league leaders'. ` +
        `It'll help frame our transfer strategy — whether we're competing head-to-head or punching above our weight.`,
      question:
        `Your transfer budget is £${budgetK}K. ` +
        `The league leaders have a budget of £${Math.round(budgetK * 1.6)}K. ` +
        `Write the ratio of your budget to theirs in the form 1 : n, where n is to 1 decimal place.`,
      answer: dp1(Math.round(budgetK * 1.6) / budgetK),
      unit: '',
      hints: [
        'Ratio your budget : their budget = divide both sides by your budget',
        `${budgetK} : ${Math.round(budgetK * 1.6)} — divide both by ${budgetK}`,
        `1 : ${Math.round(budgetK * 1.6)} ÷ ${budgetK} = 1 : ?`,
      ],
      explanation:
        `${Math.round(budgetK * 1.6)} ÷ ${budgetK} = ${dp1(Math.round(budgetK * 1.6) / budgetK)}, ` +
        `so ratio = 1 : ${dp1(Math.round(budgetK * 1.6) / budgetK)}`,
    },

    {
      id: `ch-${index}-sponsor-markup`,
      topic: 'percentage',
      difficulty: 3,
      context:
        `A sponsor offered us £${budgetK}K but I think we can do better. If I argue we're undervalued ` +
        `and get them up to £${Math.round(budgetK * 1.25)}K, I need to tell the board the percentage increase ` +
        `so they can see it's worth the negotiation.`,
      question:
        `A sponsor originally offered £${budgetK}K. You negotiate them up to £${Math.round(budgetK * 1.25)}K. ` +
        `What is the percentage increase? Give your answer to 1 decimal place.`,
      answer: dp1(((Math.round(budgetK * 1.25) - budgetK) / budgetK) * 100),
      unit: '%',
      hints: [
        'Percentage increase = (increase ÷ original) × 100',
        `Increase = £${Math.round(budgetK * 1.25)}K − £${budgetK}K = £${Math.round(budgetK * 1.25) - budgetK}K`,
        `(${Math.round(budgetK * 1.25) - budgetK} ÷ ${budgetK}) × 100 = ?`,
      ],
      explanation:
        `(${Math.round(budgetK * 1.25) - budgetK} ÷ ${budgetK}) × 100 = ` +
        `${dp1(((Math.round(budgetK * 1.25) - budgetK) / budgetK) * 100)}%`,
    },
  ];

  // ── Topic override: filter bank to a single topic ────────────────────────────
  const pool = topicOverride
    ? challenges.filter(c => c.topic === topicOverride)
    : challenges;
  const safePool = pool.length > 0 ? pool : challenges;

  // ── No performance data or all zeros → plain index cycling ─────────────────
  const hasPerformanceData =
    performance && Object.values(performance).some(v => v > 0);

  if (!hasPerformanceData || topicOverride) {
    return safePool[index % safePool.length];
  }

  // ── Weighted selection based on topic accuracy ───────────────────────────────
  // Map ChallengeTopic → accuracy score (0-100)
  const accuracy: Record<ChallengeTopic, number> = {
    percentage: performance.percentage,
    decimals:   performance.decimals,
    ratios:     performance.ratios,
    algebra:    performance.algebra,
    statistics: performance.statistics,
  };

  const weighted = safePool.map(c => {
    const score = accuracy[c.topic];

    // Base weight: lower accuracy → higher weight (min 20 so all topics remain reachable)
    let weight = Math.max(20, 100 - score);

    // Mastered topic (≥ 80%): push harder variants, suppress easy ones
    if (score >= 80) {
      if (c.difficulty >= 2) weight *= 1.5;
      if (c.difficulty === 1) weight *= 0.3;
    }

    // Struggling topic (> 0 attempts but < 40%): prefer easier variants
    if (score > 0 && score < 40) {
      if (c.difficulty === 1) weight *= 1.5;
      if (c.difficulty === 3) weight *= 0.5;
    }

    return { challenge: c, weight };
  });

  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * total;
  for (const w of weighted) {
    rand -= w.weight;
    if (rand <= 0) return w.challenge;
  }
  return weighted[weighted.length - 1]?.challenge ?? safePool[0];
}
