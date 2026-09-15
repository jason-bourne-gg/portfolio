import { useEffect, useState } from "react";
import { contact, me, sections } from "../content";

/**
 * Persistent index. On desktop it's the left-hand rail; below 1080px the same
 * markup reflows into a sticky top bar. The active entry is driven by which
 * section currently owns the middle of the viewport.
 */
export function Rail({ onRide }: { onRide: () => void }) {
  const active = useActiveSection();

  return (
    <nav className="rail" aria-label="Sections">
      <div>
        <a className="rail-name" href="#intro">
          Aniket
          <br />
          Charjan
        </a>
        <p className="rail-role">
          {me.role}, building autonomous systems at BrowserStack.
        </p>
      </div>

      <ul className="rail-index">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className="rail-link"
              href={`#${section.id}`}
              aria-current={active === section.id}
            >
              <span className="rail-tick" aria-hidden="true" />
              {section.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="rail-foot">
        <button className="rail-ride" type="button" onClick={onRide}>
          Take the ride
        </button>
        <a href={`mailto:${contact.email}`}>Email</a>
        <a href={contact.github.url} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={contact.linkedin.url} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </nav>
  );
}

function useActiveSection() {
  const [active, setActive] = useState<string>(sections[0].id);

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      // A band across the middle of the viewport: whatever sits there wins.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return active;
}
