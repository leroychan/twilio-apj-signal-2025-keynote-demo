import {
  deleteTranscript,
  insertTranscript,
  searchTranscript,
} from "./vector-db.js";

export async function debugInsert() {
  // --- Seed transcripts (10+ turns each) ---
  const baseballTranscript = `
     AGENT: Hi Tom, welcome to the Sports Chat line.
     USER: Hey, thanks. I'm puzzled about last night's baseball game.
     AGENT: Which matchup are we talking about?
     USER: Yankees versus Red Sox. The seventh inning got weird.
     AGENT: Ah, the pitching change?
     USER: Exactly. Why pull the starter when he had only 80 pitches?
     AGENT: Manager wanted a lefty-lefty matchup with Devers coming up.
     USER: But the reliever gave up a homer anyway!
     AGENT: Right, that's baseball. Matchups are probabilities, not guarantees.
     USER: Got it. Anything else I should rewatch?
     AGENT: Check Judge's catch in the 9th—it saved the game.`;

  const basketballTranscript = `
     AGENT: Coach's Corner, this is Maya. What's your basketball question?
     USER: I'm designing a 2-3 zone for high school players.
     AGENT: Nice. What's your main concern?
     USER: We get burned in the corners.
     AGENT: Classic issue. Are your wings pinching too far in?
     USER: Probably. They collapse on every drive.
     AGENT: Teach them to stunt, then recover to the shooter.
     USER: Any drill recommendations?
     AGENT: Shell drill, but emphasize talk and close-outs.
     USER: Got it. How many reps per practice?
     AGENT: Start with five-minute blocks, three times.
     USER: Thanks! This'll help a ton.`;

  const deliveryTranscript = `
     AGENT: Hello, I'm the DoorDash driver for your sushi order.
     USER: Great, are you close? I don't see you.
     AGENT: I'm on Park Street by the red mailbox.
     USER: There are two Park Streets—north and south.
     AGENT: Oh, didn't know that. I'm at 512 North Park.
     USER: I'm actually 512 South Park, five minutes away.
     AGENT: Yikes! GPS failed me. I'll head over now.
     USER: No problem, call if you get lost again.
     AGENT: Will do. Anything tricky about the house?
     USER: Blue door, porch light on.
     AGENT: Got it. See you soon!`;

  const results = await Promise.all([
    await insertTranscript(baseballTranscript, {
      id: "test-baseball-dialogue",
      active: false,
      feedback: "feedback baseball dialogue",
      summary: "call about baseball (dialogue)",
      callSid: "CS200-BASEBALL",
      topics: ["baseball"],
    }),

    await insertTranscript(basketballTranscript, {
      id: "test-basketball-dialogue",
      active: false,
      feedback: "feedback basketball dialogue",
      summary: "call about basketball (dialogue)",
      callSid: "CS201-BASKETBALL",
      topics: [],
    }),

    await insertTranscript(deliveryTranscript, {
      id: "test-delivery-dialogue",
      active: false,
      feedback: "feedback delivery call",
      summary: "call about food delivery (dialogue)",
      callSid: "CS202-DELIVERY",
      topics: ["delivery"],
    }),
  ]);

  console.debug("vectorDebugInsert", JSON.stringify(results, null, 2));
}

export async function debugSearch() {
  // Queries designed to roughly match the seeded conversations
  const baseballQuery = `
        AGENT: Hey, I'm curious why the coach switched pitchers so late.
        USER: Probably the matchup in that Yankees game.`;

  const soccerQuery = `
        AGENT: Did you catch the Premier League match yesterday?
        USER: Yeah, that offside call was wild.`;

  const foodQuery = `
        AGENT: Hey, this is Bill with Pizza Hut. I'm parked outside but can't see your house.
        USER: Are you on South Park St or North Park St?
        AGENT: There's a south?`;

  /* 1️⃣  Basic searches (default: active === true → should return empty arrays
   *     because our seed docs are active=false)
   * -----------------------------------------------------------------------*/
  console.debug("\n🔎 SEARCH 1: baseball (default active=true)");
  console.debug(JSON.stringify(await searchTranscript(baseballQuery), null, 2));

  console.debug("\n🔎 SEARCH 2: soccer (no seed data, expect empty)");
  console.debug(JSON.stringify(await searchTranscript(soccerQuery), null, 2));

  /* 2️⃣  Override active flag so that the seeded docs become eligible */
  console.debug("\n🔎 SEARCH 3: baseball (active=false override)");
  console.debug(
    JSON.stringify(
      await searchTranscript(baseballQuery, { active: false }),
      null,
      2,
    ),
  );

  console.debug("\n🔎 SEARCH 4: food delivery (active=false override)");
  console.debug(
    JSON.stringify(
      await searchTranscript(foodQuery, { active: false }),
      null,
      2,
    ),
  );

  /* 3️⃣  Topic filters (single + array) ----------------------------------*/
  console.debug("\n🔎 SEARCH 5: food delivery, topics=['delivery']");
  console.debug(
    JSON.stringify(
      await searchTranscript(foodQuery, { topics: "delivery", active: false }),
      null,
      2,
    ),
  );

  console.debug(
    "\n🔎 SEARCH 6: baseball, topics=['baseball','delivery'] (OR combo)",
  );
  console.debug(
    JSON.stringify(
      await searchTranscript(baseballQuery, {
        topics: ["baseball", "delivery"],
        active: false,
      }),
      null,
      2,
    ),
  );

  /* 4️⃣  callSid filters --------------------------------------------------*/
  console.debug("\n🔎 SEARCH 7: baseball by exact callSid");
  console.debug(
    JSON.stringify(
      await searchTranscript(baseballQuery, {
        callSids: ["CS200-BASEBALL"],
        active: false,
      }),
      null,
      2,
    ),
  );

  console.debug("\n🔎 SEARCH 8: food delivery by callSid (array)");
  console.debug(
    JSON.stringify(
      await searchTranscript(foodQuery, {
        callSids: ["CS202-DELIVERY", "CS999-NONEXISTENT"],
        active: false,
      }),
      null,
      2,
    ),
  );

  /* 5️⃣  Combined topic + callSid filter --------------------------------*/
  console.debug("\n🔎 SEARCH 9: delivery, topics=['delivery'], callSids match");
  console.debug(
    JSON.stringify(
      await searchTranscript(foodQuery, {
        topics: ["delivery"],
        callSids: ["CS202-DELIVERY"],
        active: false,
      }),
      null,
      2,
    ),
  );

  /* 6️⃣  Negative test: invalid topic should return empty --------------*/
  console.debug("\n🔎 SEARCH 10: invalid topic filter");
  console.debug(
    JSON.stringify(
      await searchTranscript(foodQuery, { topics: "sdfsdf", active: false }),
      null,
      2,
    ),
  );
}
export async function debugDelete() {
  const results = await searchTranscript("Hello world");

  console.debug("results", results);
  for (const result of results) {
    console.debug(`deleting ${result.document.id}`);
    const rez = await deleteTranscript(result.document.id);
    console.debug(`deleting ${result.document.id} result: `, rez);
  }
}
