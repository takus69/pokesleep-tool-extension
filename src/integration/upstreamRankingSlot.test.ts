// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { findUpstreamRankingSlot } from "./upstreamRankingSlot";

describe("findUpstreamRankingSlot", () => {
  it("selects the first upper tab list when an upstream tab is added", () => {
    document.body.innerHTML = `
      <main id="root">
        <div style="position: sticky; top: 0px">
          <div><div><div role="tablist">
            <button role="tab">RP</button>
            <button role="tab">Strength</button>
            <button role="tab">Rating</button>
            <button role="tab">Team</button>
          </div></div></div>
          <section>current result</section>
          <div><div role="tablist">
            <button role="tab">Pokemon</button>
            <button role="tab">Box</button>
          </div></div>
        </div>
        <section>current editor</section>
      </main>`;

    const slot = findUpstreamRankingSlot(document);

    expect(slot?.tabList.textContent).toContain("RP");
    expect(slot?.tabList.textContent).toContain("Team");
    expect(slot?.workspaceHeader.style.position).toBe("sticky");
  });

  it("does not mistake a nested lower tab list for the upper tabs", () => {
    document.body.innerHTML = `
      <main>
        <div style="position: sticky">
          <section><div><div><div role="tablist">
            <button role="tab">Pokemon</button>
            <button role="tab">Box</button>
            <button role="tab">Settings</button>
          </div></div></div></section>
        </div>
      </main>`;
    expect(findUpstreamRankingSlot(document)).toBeNull();
  });

  it("fails closed when the expected upper tab contract changes", () => {
    document.body.innerHTML = `<div role="tablist"><button role="tab">Only one</button></div>`;
    expect(findUpstreamRankingSlot(document)).toBeNull();
  });
});
