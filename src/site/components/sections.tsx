import { useState, type FormEvent } from "react";
import {
  about,
  alsoBuilt,
  closing,
  contact,
  education,
  featured,
  headline,
  me,
  shifts,
  standfirst,
  toolkit,
  work,
  type Project,
} from "../content";

/** Rule + title that opens every section. */
function Heading({ title, note }: { title: string; note: string }) {
  return (
    <div className="heading">
      <h2>{title}</h2>
      <span>{note}</span>
    </div>
  );
}

export function Intro() {
  return (
    <section id="intro" className="band intro">
      <div className="inner">
        <h1>
          {headline.map((line) => (
            <span className="line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p className="standfirst intro-fade" style={{ marginTop: "1.8rem" }}>
          {standfirst}
        </p>
      </div>

      <div className="inner intro-fade">
        <div className="shifts">
          {shifts.map((shift) => (
            <div className="shift" key={shift.label}>
              <p className="shift-label">{shift.label}</p>
              <p className="shift-pair">
                <span className="shift-from">{shift.from}</span>
                <Chevron />
                <span className="shift-to">{shift.to}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Points from the old value to the new one — data, not decoration. */
function Chevron() {
  return (
    <svg
      className="shift-arrow"
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      aria-label="became"
      role="img"
    >
      <path d="M0 5h17M13 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function About() {
  return (
    <section id="about" className="band">
      <div className="inner">
        <Heading title="About" note="What I work on, and where I've done it" />

        <div className="split">
          <p className="split-lead">{about.standfirst}</p>
          <div className="prose">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <dl className="facts">
          {about.facts.map((fact) => (
            <div className="fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section id="work" className="band">
      <div className="inner">
        <Heading title="Work" note="Three and a half years, two companies" />

        <div className="roles">
          {work.map((role) => (
            <article className="role" key={role.title + role.period}>
              <p className="role-period">{role.period}</p>
              <div>
                <h3>{role.title}</h3>
                <p className="role-org">{role.org}</p>
                <ul className="role-points">
                  {role.points.map((point) => (
                    <li key={point.slice(0, 32)}>{point}</li>
                  ))}
                </ul>
                <ul className="chips">
                  {role.stack.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="edu">
          {education.map((item) => (
            <div className="edu-item" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="links">
      {project.live && (
        <a className="link" href={project.live} target="_blank" rel="noreferrer">
          Open it
        </a>
      )}
      {project.repo && (
        <a className="link" href={project.repo} target="_blank" rel="noreferrer">
          Read the code
        </a>
      )}
    </div>
  );
}

export function Projects() {
  return (
    <section id="projects">
      <div className="band" style={{ paddingBottom: 0 }}>
        <div className="inner">
          <Heading title="Projects" note="Built on my own time" />
        </div>
      </div>

      <div className="projects">
        {featured.map((project) => (
          <article className="project" key={project.name}>
            <div className="project-body">
              <p className="project-kind">{project.kind}</p>
              <h3>{project.name}</h3>
              <p>{project.blurb}</p>
              {project.note && <p className="project-note">{project.note}</p>}
              <ul className="chips">
                {project.stack.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
              <ProjectLinks project={project} />
            </div>
            <div className="shot">
              <img
                src={project.image}
                alt={`${project.name} in use`}
                className={project.fit === "contain" ? "contain" : undefined}
                loading="lazy"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="band">
        <div className="inner">
          <div className="more">
            {alsoBuilt.map((project) => (
              <article key={project.name}>
                <p className="project-kind">{project.kind}</p>
                <h3>{project.name}</h3>
                <p>{project.blurb}</p>
                {project.repo && <ProjectLinks project={project} />}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Toolkit() {
  return (
    <section id="toolkit" className="band">
      <div className="inner">
        <Heading title="Toolkit" note="What I reach for" />
        <div className="groups">
          {toolkit.map((group) => (
            <div className="group" key={group.group}>
              <h3>{group.group}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Point this at a Formspree or Web3Forms endpoint to collect messages
 * silently. Left empty, the form opens the visitor's mail client instead, so
 * the site stays a static build with no backend.
 */
const FORM_ENDPOINT = "";

export function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (FORM_ENDPOINT) return; // let the browser POST it
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const body = `${data.get("message") ?? ""}\n\n— ${name} (${data.get("email") ?? ""})`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      `Hello from ${name}`
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section id="contact" className="band band-dark">
      <div className="inner">
        <Heading title="Contact" note="Based in Nagpur, India" />

        <div className="contact-grid">
          <div>
            <h3 className="contact-line">{closing.line}</h3>
            <p className="contact-blurb">{closing.blurb}</p>

            <a className="mailto" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>

            <div className="elsewhere">
              <a href={contact.github.url} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={contact.linkedin.url} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={`tel:${contact.phone.e164}`}>{contact.phone.display}</a>
            </div>
          </div>

          <form
            className="form"
            onSubmit={handleSubmit}
            action={FORM_ENDPOINT || undefined}
            method={FORM_ENDPOINT ? "POST" : undefined}
          >
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="message">What are you building?</label>
              <textarea id="message" name="message" required />
            </div>
            <button className="send" type="submit">
              {sent ? "Opening your mail app" : "Send message"}
            </button>
          </form>
        </div>

        <div className="colophon">
          <span>{me.fullName}</span>
          <span>Built with React and Vite. No trackers.</span>
        </div>
      </div>
    </section>
  );
}
