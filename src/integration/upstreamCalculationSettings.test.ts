// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { openUpstreamCalculationSettings } from "./upstreamCalculationSettings";
import { findUpstreamRankingSlot } from "./upstreamRankingSlot";

describe("openUpstreamCalculationSettings", () => {
  it("uses the upstream tabs and waits for its parameter tab", async () => {
    document.body.innerHTML = `
      <main><div><div id="sticky" style="position: sticky">
        <div><div><div role="tablist">
          <button role="tab">RP</button><button id="energy" role="tab">Energy</button><button role="tab">Rating</button><button role="tab">Team</button>
        </div></div></div>
      </div></div></main>`;
    const sticky = document.getElementById("sticky");
    const energy = document.getElementById("energy");
    const parameterClick = vi.fn();
    energy?.addEventListener("click", () => {
      sticky?.insertAdjacentHTML(
        "beforeend",
        `<div><div role="tablist"><button role="tab">Pokemon</button><button role="tab">Box</button><button id="parameter" role="tab">Parameter</button></div></div>`,
      );
      document
        .getElementById("parameter")
        ?.addEventListener("click", parameterClick);
    });
    const slot = findUpstreamRankingSlot(document);
    expect(slot).not.toBeNull();
    if (slot === null) return;

    await expect(openUpstreamCalculationSettings(slot)).resolves.toBe(true);
    expect(parameterClick).toHaveBeenCalledOnce();
  });
});
