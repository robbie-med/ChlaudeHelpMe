// Copy-to-clipboard for prompt blocks + tab switching
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.closest(".prompt-block")?.querySelector("pre code, pre");
      if (!target) return;
      const text = target.innerText;
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = "Copied ✓";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1800);
      } catch (e) {
        btn.textContent = "Press Cmd+C";
        setTimeout(() => (btn.textContent = "Copy prompt"), 1800);
      }
    });
  });

  // Tabs (Mac / Linux switcher)
  document.querySelectorAll("[data-tabs]").forEach((group) => {
    const buttons = group.querySelectorAll(".tab-btn");
    const panels = group.querySelectorAll(".tab-panel");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) =>
          p.classList.toggle("active", p.dataset.panel === target)
        );
      });
    });
  });

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }
    });
  });
});
