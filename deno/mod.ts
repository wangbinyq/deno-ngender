import * as csv from "https://deno.land/std@0.152.0/encoding/csv.ts";
import * as buffer from "https://deno.land/std@0.152.0/io/buffer.ts";
import * as streams from "https://deno.land/std@0.152.0/streams/mod.ts";

let loaded = false;
let total = 0;
let male_total = 0;
let female_total = 0;
const freq = {} as Record<string, [number, number]>;

export type GuessResult = ["male" | "female" | "unknown", number];

export async function init() {
  if (loaded) {
    return;
  }
  const f = await fetch(
    new URL("../ngender/charfreq.csv", import.meta.url),
  );
  const reader = new buffer.BufReader(
    streams.readerFromStreamReader(f.body!.getReader()),
  );
  const rows = await csv.parse(reader, { skipFirstRow: true });

  for (const row of rows) {
    const char = row.char as string;
    const male = parseInt(row.male as string) as number;
    const female = parseInt(row.female as string) as number;
    male_total += male;
    female_total += female;
    freq[char] = [female, male];
  }

  total = male_total + female_total;

  Object.values(freq).forEach((char_freq) => {
    const [female, male] = char_freq;
    char_freq[0] = female / female_total;
    char_freq[1] = male / male_total;
  });

  loaded = true;
}

export function guess(name: string): GuessResult {
  if (!loaded) {
    throw new Error("need init before guess");
  }

  name = name.substring(1);

  for (const char of name.split("")) {
    console.assert(char >= "\u4e00" && char <= "\u9fa0", "姓名必须为中文");
  }

  const pf = prob_for_gender(name, 0);
  const pm = prob_for_gender(name, 1);

  if (pm > pf) {
    return ["male", pm / (pm + pf)];
  } else if (pm < pf) {
    return ["female", pf / (pm + pf)];
  } else {
    return ["unknown", 0];
  }
}

function prob_for_gender(name: string, gender: 0 | 1) {
  let p = gender === 1 ? (male_total / total) : (female_total / total);
  for (const char of name.split("")) {
    p *= (freq[char] || [0, 0])[gender];
  }
  return p;
}
