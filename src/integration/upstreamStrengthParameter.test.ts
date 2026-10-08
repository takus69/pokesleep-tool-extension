import { deserializeStrengthParameter } from "@upstream/util/StrengthParameter";
import { expect, it } from "vitest";

it("loads old settings with a zero berry zone and bounds new settings", () => {
  expect(deserializeStrengthParameter({}).berryZone).toEqual({ psychic: 0 });
  expect(
    deserializeStrengthParameter({ berryZone: { psychic: 12.4 } }).berryZone,
  ).toEqual({ psychic: 12.4 });
  expect(
    deserializeStrengthParameter({ berryZone: { psychic: 99 } }).berryZone,
  ).toEqual({ psychic: 24 });
  expect(
    deserializeStrengthParameter({ berryZone: { psychic: -1 } }).berryZone,
  ).toEqual({ psychic: 0 });
});
