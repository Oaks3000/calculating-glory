/**
 * Match Commentary Templates — Phase A (Kev Mulligan only)
 *
 * Each array is a pool. generateMatchTimeline() picks from the pool using seeded
 * RNG so the same match always produces the same commentary.
 *
 * Placeholders:
 *   [SCORER]   — replaced with the scoring player's first name
 *   [PLAYER]   — generic player reference
 *   [KEEPER]   — goalkeeper's name
 *   [OPPONENT] — opposing team name
 *   [SCORE]    — current scoreline e.g. "2-1"
 */

export const KEV_TEMPLATES = {

  kickoff: [
    "Here we go. Let's have it.",
    "Right, we're off. Come on then.",
    "Whistle's gone. Let's do this.",
    "Underway. Time to show what we're made of.",
    "And we're off. Everything to play for.",
    "Kickoff. I've been looking forward to this one.",
    "Right then. Ninety minutes. Let's get after them.",
    "We're live. Come on lads.",
    "Off we go. Season doesn't stop for anyone.",
    "Here we go again. Come on.",
  ],

  quiet_neutral: [
    "Fairly even start to this.",
    "Both sides feeling each other out.",
    "Slow start. Typical.",
    "Neither side giving anything away.",
    "Quiet spell. Just watching the shape.",
    "Nothing doing yet. Just possession.",
    "Steady. Getting a feel for the game.",
    "Bit cagey this. Expected really.",
    "Tight early on. Plenty of time.",
    "Early doors. Doesn't mean much yet.",
  ],

  quiet_winning: [
    "Comfortable now. No need to force it.",
    "Happy enough with how this is going.",
    "We're controlling this. Just need to hold on.",
    "Three points is three points. Keep it tidy.",
    "Cruising a bit. Let them have the ball.",
    "Good position to be in. Calm.",
    "No panic needed. Just see it out.",
    "Tick tick tick. Come on lads.",
    "We're in good shape. Don't get sloppy.",
    "Professional performance this.",
  ],

  quiet_losing: [
    "Need to respond here. Not good enough.",
    "We're not at it today. Something needs to change.",
    "Frustrating. Really frustrating.",
    "Come on. There's still time.",
    "Not the performance we needed.",
    "Got to dig in. Find something.",
    "Head down. Keep going.",
    "We're chasing it now. Have to push.",
    "Backs against the wall. Come on.",
    "Need something. Anything.",
  ],

  building_pressure: [
    "Getting some joy down the left now.",
    "Good spell this. Keep it up.",
    "We're growing into this. Feeling it.",
    "Knocking on the door. Stay patient.",
    "Lots of possession now. Just need the final ball.",
    "Good passages of play. Something's coming.",
    "Pressure building. They can't hold on forever.",
    "Getting into good positions. Stay calm.",
    "Good intensity now. Press them.",
    "Better. Much better. Keep it going.",
  ],

  chance_player: [
    "CHANCE! [SCORER] lets fly — just wide!",
    "So close! [SCORER] rattles the crossbar!",
    "Off the post! How has that not gone in?!",
    "Oh! [SCORER] must score there — straight at the keeper.",
    "Chance wasted. Should've done better.",
    "Gets a shot away — just over the bar!",
    "Brilliant save! [SCORER] looked certain to score.",
    "NEARLY! Inches away from the opener.",
    "[SCORER] drives at goal — blocked on the line!",
    "What a chance! Gets there a fraction too late.",
  ],

  near_miss_opponent: [
    "Off the post! Off the post and away! Got away with that.",
    "Huge save from [KEEPER]! That was going in.",
    "Cleared off the line! My heart nearly stopped.",
    "SAVE! [KEEPER] was brilliant there. Brilliant.",
    "Post and out. We were very lucky there.",
    "Blocked! Somehow blocked! Incredible.",
    "[KEEPER] down low — gets fingertips to it. Unbelievable.",
    "They should've scored that. Let off.",
    "Lucky. Very lucky. Come on, get tighter.",
    "[KEEPER] coming up big for us. Massive.",
  ],

  goal_player_buildup: [
    "[SCORER] picks it up on the edge... drives inside...",
    "Good move, good move... [SCORER] through on goal...",
    "Ball over the top... [SCORER] is in here...",
    "Counter! [SCORER] in space... there's a chance here...",
    "Corner comes in... [SCORER] meets it...",
    "[SCORER] with room to shoot... lines it up...",
    "One-two on the edge... [SCORER] pulls the trigger...",
    "Long ball forward... [SCORER] first touch... turns...",
    "Free kick. [SCORER] standing over it. This has a chance...",
    "Cutback! [SCORER] unmarked six yards out...",
  ],

  goal_player_reaction: [
    "SCORES! [SCORER]! GET IN!",
    "GOAL! [SCORER]! WHAT A STRIKE!",
    "YES! [SCORER]! RIGHT IN THE CORNER!",
    "IT'S IN! [SCORER]! GET IN SON!",
    "SCORED! [SCORER]! FROM NOWHERE!",
    "GOAL!!! [SCORER]!!! BEAUTIFUL!!!",
    "YES YES YES! [SCORER]! THAT'S THE ONE!",
    "[SCORER]!!! TAKE A BOW!!! GET IN!!!",
    "IN OFF THE POST! [SCORER]! DOESN'T MATTER HOW!",
    "HEADER! [SCORER]! BRILLIANT! ABSOLUTELY BRILLIANT!",
  ],

  goal_player_aftermath: [
    "The fans are going mental. What a goal.",
    "That's exactly what we needed. Come on!",
    "[SCORER] is loving that. We all are.",
    "Brilliant. Just brilliant. Keep it up.",
    "The lads are celebrating. That's a big one.",
    "That changes everything. Come on now.",
    "Up the table we go. Class.",
    "That's the goal of the season right there.",
    "Scenes. Absolute scenes.",
    "They'll be talking about that one.",
  ],

  opponent_goal_reaction: [
    "No. Just... no. [OPPONENT] score. Nightmare.",
    "That's poor. Really poor. We switched off.",
    "Gutting. Against the run of play as well.",
    "They didn't deserve that. Neither did we.",
    "Can't concede that. Sloppy defending.",
    "Silence from our end. Come on, respond.",
    "They've nicked one. Backs against the wall now.",
    "Awful. Absolutely awful. Wake up.",
    "One moment of sloppiness. That's all it takes.",
    "Disappointed. Very disappointed. Not again.",
  ],

  opponent_goal_aftermath: [
    "Right. Head up. There's still time.",
    "Don't let it affect us. Keep going.",
    "Stay positive. Come on lads.",
    "We need to respond. Now. Not in ten minutes. Now.",
    "Come on. This season isn't over.",
    "Regroup. Don't panic. We can still do this.",
    "Clear your head. Get back to basics.",
    "Use the restart. Fresh start. Come on.",
    "That hurt but there's time to put it right.",
    "Not ideal. But we're still in this.",
  ],

  half_time_winning: [
    "Half time. Deserved lead. More of the same.",
    "HT. Good half. Don't relax in the second.",
    "Half time and we're in front. Good. Keep the shape.",
    "Break. We've done well. Just see it out.",
    "Forty-five down. Keep going, we're in good shape.",
    "Half time. Nice position to be in. Don't blow it.",
    "HT. Job half done. Second half — same again.",
    "Break. Happy with that. Don't get complacent.",
    "Half time whistle. Good half. Stay focused.",
    "HT. Solid. Keep it tight and we're home.",
  ],

  half_time_level: [
    "Half time. Still level. Tight one this.",
    "HT. A point each so far. Needs a moment of quality.",
    "Break. Even game. Need to find something in the second.",
    "Forty-five done. Not pretty but still in it.",
    "Half time. Hard to split them. Come on second half.",
    "HT. Very even. Next goal will be massive.",
    "Break. Need to find a gear in the second half.",
    "Half time. Frustrating. Should've done more in that first half.",
    "HT. Equal on chances, equal on score. Something has to give.",
    "Break. Come on. Find a way.",
  ],

  half_time_losing: [
    "Half time and we're behind. Need to dig out a response.",
    "HT. Behind. Not good enough first half.",
    "Break. Behind. Real words in the dressing room time.",
    "Forty-five done. Losing. We need to be better.",
    "Half time whistle. We're chasing it. Come on lads.",
    "HT. Behind at the break. Season defining now.",
    "Break. Disappointing first half. Need more in the second.",
    "Half time. Behind. Come on — we've turned things around before.",
    "HT. Behind but not out of it. Need belief.",
    "Break. Tough watch. Let's see what they've got in the second half.",
  ],

  final_minutes_winning: [
    "Ten minutes. Just hold on.",
    "Come on come on come on...",
    "Every clearance getting a cheer. Keep it.",
    "Stay tight. Don't let them back in.",
    "So close. Just see it out.",
    "Five minutes. We're so close.",
    "Time wasting is absolutely fine right now.",
    "Keep possession. Anything. Just keep the ball.",
    "Nearly there. Stay focused.",
    "Three minutes. Hold on. HOLD ON.",
  ],

  final_minutes_level: [
    "Last ten. Either side can nick this.",
    "One moment of quality and this is won.",
    "Can anyone find something? Push on.",
    "Hang on... keep going... one chance is all we need.",
    "Heads up. Last ten. Leave it all out there.",
    "Can we find a winner? Can we?",
    "Nervy finish. Both sides going for it.",
    "Everything to play for. Come on.",
    "This is brilliant. Horrible. But brilliant.",
    "Last throw of the dice time.",
  ],

  final_minutes_losing: [
    "Running out of time...",
    "Throwing everything at it. Need something.",
    "Can anyone find a bit of magic?",
    "Come on. Anything. Please.",
    "Getting desperate now. Has to be.",
    "Last chance saloon. Come on.",
    "Time ticking. Don't go quietly.",
    "We need two. Have to try.",
    "Keep pushing. Stranger things have happened.",
    "Last few minutes. Everything.",
  ],

  full_time_win: [
    "FULL TIME! Three points! Get in!",
    "That's it! Full time! Brilliant!",
    "FT. Three points! The lads were magnificent!",
    "Full time whistle! We've done it!",
    "FULL TIME! YES! What a result!",
    "FT. Three points. Absolutely deserved.",
    "Full time. Incredible. Three points in the bag.",
    "That's it! The fans are loving it! Well done boys!",
    "FT! Get in! Three points! Brilliant!",
    "Full time and we WIN! What a day!",
  ],

  full_time_draw: [
    "Full time. A point. I'll take it — they were tough today.",
    "FT. Draw. Could've nicked it, could've lost it.",
    "Full time. Point each. Frustrating but fair.",
    "Whistle. Draw. Not what we wanted but it keeps things ticking.",
    "Full time. Hard-fought point. Season's long.",
    "FT. Equal. Hmm. Could be worse.",
    "Full time. Point away from home. Not the worst.",
    "Whistle. Draw. On another day we win that.",
    "FT. Level. Keep building.",
    "Full time. Draw. Move on.",
  ],

  full_time_loss: [
    "Full time. Tough day. Nothing went for us.",
    "FT. Disappointing. The lads know it.",
    "Full time. We weren't good enough today. Simple as.",
    "Whistle. Loss. Painful.",
    "FT. We lose. Not good enough.",
    "Full time. Difficult watch. Lots to work on.",
    "That's the whistle. We lose. Hurts.",
    "FT. Beaten. Regroup.",
    "Full time and we're beaten. Hard to take.",
    "Loss. Full time. Got to do better.",
  ],

};

export type KevTemplateMood = keyof typeof KEV_TEMPLATES;
