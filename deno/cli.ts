import { Command } from "https://deno.land/x/cliffy@v0.24.3/command/mod.ts";
import { guess, init } from "./mod.ts";

if (import.meta.main) {
  const cmd = await new Command().name("ngender")
    .description("Guess gender for Chinese names")
    .arguments("<names...>")
    .parse(Deno.args);

  await init();
  for (const name of cmd.args[0]) {
    const [gender, prob] = guess(name);
    console.log(`name: ${name} => gender: ${gender}, probability: ${prob}`);
  }
} else {
  throw new Error("This module can only be imported as a main module");
}
