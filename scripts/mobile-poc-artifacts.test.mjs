import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { JSDOM } from "jsdom";

const outDir = path.resolve("dist-mobile-poc");
const markup = `<main id="root"><div style="position: sticky">
  <div><div><div role="tablist">
  <button role="tab">A</button><button role="tab">B</button>
  <button role="tab">C</button></div></div></div>
  <section>result</section></div><section>editor</section></main>`;

function environment(url = "https://nitoyon.github.io/pokesleep-tool/iv/") {
  const dom = new JSDOM(markup, {
    url,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const alerts = [];
  dom.window.alert = (value) => alerts.push(value);
  dom.window.matchMedia = () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  dom.window.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
  return { dom, alerts };
}

test("generated bookmarklets round-trip without replacing the document", () => {
  for (const name of ["probe", "ranking"]) {
    const code = readFileSync(path.join(outDir, `${name}.js`), "utf8");
    const bookmarklet = readFileSync(
      path.join(outDir, `${name}.bookmarklet.txt`),
      "utf8",
    );
    assert.ok(bookmarklet.startsWith("javascript:void "));
    const script = decodeURIComponent(bookmarklet.slice("javascript:".length));
    assert.equal(script, `void (function(){${code.trim()}\n})()`);
    const { dom, alerts } = environment("https://example.com/");
    try {
      assert.equal(runInContext(script, dom.getInternalVMContext()), undefined);
      assert.equal(alerts.length, 1);
      assert.match(alerts[0], /unsupported/);
      assert.equal(
        dom.window.document
          .getElementById("root")
          .textContent.includes("editor"),
        true,
      );
    } finally {
      dom.window.close();
    }
  }
});

test("diagnostic bundle is read-only and does not disclose stored values", () => {
  const { dom, alerts } = environment();
  try {
    dom.window.localStorage.setItem(
      "PstPokeBox",
      '["private-iv@private-name"]',
    );
    const before = dom.window.localStorage.getItem("PstPokeBox");
    const html = dom.window.document.body.innerHTML;
    runInContext(
      readFileSync(path.join(outDir, "probe.js"), "utf8"),
      dom.getInternalVMContext(),
    );
    assert.match(alerts[0], /storage.box: present-json-shape/);
    assert.doesNotMatch(alerts[0], /private/);
    assert.equal(dom.window.localStorage.getItem("PstPokeBox"), before);
    assert.equal(dom.window.document.body.innerHTML, html);
  } finally {
    dom.window.close();
  }
});

test("self-contained ranking bundle mounts and returns to upstream without writes", async () => {
  const { dom, alerts } = environment();
  try {
    dom.window.localStorage.setItem("PstPokeBox", "[]");
    const storage = dom.window.localStorage;
    const before = { ...storage };
    let writes = 0;
    dom.window.Storage.prototype.setItem = () => {
      writes += 1;
      throw new Error("Unexpected write");
    };
    dom.window.Storage.prototype.removeItem = () => {
      writes += 1;
      throw new Error("Unexpected removal");
    };
    dom.window.fetch = () => {
      throw new Error("Unexpected network fetch");
    };
    const code = readFileSync(path.join(outDir, "ranking.js"), "utf8");
    runInContext(code, dom.getInternalVMContext());
    const deadline = Date.now() + 5000;
    while (
      !dom.window.document.querySelector("#pokesleep-extension-suite button") &&
      Date.now() < deadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    const tab = dom.window.document.querySelector(
      "[data-pokesleep-extension-ranking]",
    );
    assert.ok(tab, "ranking tab mounted");
    tab.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.ok(
      dom.window.document.querySelector("#pokesleep-extension-suite button"),
    );
    assert.deepEqual({ ...storage }, before);
    assert.equal(writes, 0);
    assert.equal(alerts.length, 0);
    runInContext(code, dom.getInternalVMContext());
    assert.equal(alerts.length, 1);
    assert.equal(
      dom.window.document.querySelectorAll("[data-pokesleep-extension-ranking]")
        .length,
      1,
    );
    dom.window.document.querySelector("#root [role=tab]").click();
    assert.equal(
      dom.window.document.getElementById("pokesleep-extension-suite").style
        .display,
      "none",
    );
  } finally {
    dom.window.close();
  }
});

test("measurements and licenses describe the actual standalone artifacts", () => {
  assert.equal(
    readFileSync("docs/testing/mobile-probe.bookmarklet.txt", "utf8").trim(),
    readFileSync(path.join(outDir, "probe.bookmarklet.txt"), "utf8").trim(),
    "Refresh the copyable diagnostic when its source changes",
  );
  const measurements = JSON.parse(
    readFileSync(path.join(outDir, "measurements.json"), "utf8"),
  );
  for (const name of ["probe", "ranking"]) {
    const bytes = readFileSync(path.join(outDir, `${name}.js`));
    assert.equal(measurements[name].javascriptBytes, bytes.length);
    assert.equal(
      measurements[name].sha256,
      createHash("sha256").update(bytes).digest("hex"),
    );
  }
  const userScript = readFileSync(path.join(outDir, "ranking.user.js"), "utf8");
  assert.match(userScript, /@grant none/);
  assert.doesNotMatch(userScript, /@require|@updateURL|@downloadURL/);
  assert.ok(
    userScript.endsWith(readFileSync(path.join(outDir, "ranking.js"), "utf8")),
  );
  for (const name of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
    assert.equal(
      readFileSync(path.join(outDir, name), "utf8"),
      readFileSync(name, "utf8"),
    );
  }
  assert.match(
    readFileSync(path.join(outDir, "THIRD_PARTY_PACKAGE_LICENSES.md"), "utf8"),
    /react/,
  );
});
