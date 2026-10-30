
"use client";

import { useEffect, useState } from "react";
import BookingForm from "@/components/BookingForm";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load projects.");
        }

        setProjects(data.projects || []);
      } catch (err) {
        console.error("Project loading error:", err);
        setError("Unable to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <main>
      {/* NAVBAR */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="container navbar-inner">
          <a className="brand" href="#home">
            SUAD<span>.</span>
          </a>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <p className="eyebrow">Web Developer · Kerala, India</p>
              <h1>
                Building websites
                <br />
                that <span>work beautifully.</span>
              </h1>
              <p className="hero-description">
                {"I'm"} Suad, a web developer working with WordPress,
                Shopify, and modern web technologies.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">
                  Explore my work ↗
                </a>
                <a className="button button-secondary" href="#contact">
                  Contact me
                </a>
              </div>
              <p className="availability">
                <span className="status-dot" aria-hidden="true"></span>
                Open to learning and new opportunities
              </p>
            </div>
            <div className="hero-photo-wrapper">
              <img
                className="hero-photo"
                src="/images/profile.png"
                alt="Portrait of Suad CK"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">01 / About</p>
            <h2>A little about me.</h2>
          </div>
          <p className="about-body">
            {"I'm"} Suad, a web developer and BCA student passionate about
            creating modern, responsive websites and e-commerce experiences.
            I enjoy turning ideas into functional and visually appealing websites.
          </p>
          <div className="about-details">
            <div className="about-card">
              <h3>{"Skills & Technologies"}</h3>
              <p>HTML · CSS · JavaScript</p>
              <p>WordPress · Elementor · Shopify · WooCommerce</p>
            </div>
            <div className="about-card">
              <h3>Education</h3>
              <p>Bachelor of Computer Applications (BCA)</p>
              <p>Lovely Professional University (LPU)</p>
            </div>
            <div className="about-card">
              <h3>My Journey</h3>
              <p>
                I started with HTML and CSS, then moved into building WordPress
                and Shopify websites. {"I've"} worked on real client projects and
                continue learning new technologies to grow as a developer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section" id="projects">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">02 / Selected Work</p>
            <h2>{"Projects I've worked on."}</h2>
            <p className="section-intro">Explore some of my website projects.</p>
          </div>

          {loading && <p className="project-status">Loading projects...</p>}
          {error && <p className="project-status" role="alert">{error}</p>}
          {!loading && !error && projects.length === 0 && (
            <p className="project-status">No projects have been added yet.</p>
          )}
          {!loading && !error && projects.length > 0 && (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project._id || project.title}>
                  <button
                    className="project-image-button"
                    onClick={() => setSelectedProject(project)}
                    aria-label={`View ${project.title} screenshot`}
                  >
                    <img
                      className="project-image"
                      src={project.image}
                      alt={`${project.title} website screenshot`}
                    />
                  </button>
                  <div className="project-info">
                    <p className="project-category">
                      {project.category || "Website Project"}
                    </p>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    {project.link && (
                      <a
                        className="project-link"
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit website ↗
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProject(null)}
          role="presentation"
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              className="modal-image"
              src={selectedProject.image}
              alt={`${selectedProject.title} enlarged screenshot`}
            />
            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
            {selectedProject.link && (
              <a
                className="button button-primary"
                href={selectedProject.link}
                target="_blank"
                rel="noreferrer"
              >
                Visit website ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">03 / Contact</p>
            <h2>{"Let's build something together."}</h2>
            <p className="contact-intro">
              Have an idea, a project, or just want to connect?
              {"I'd"} love to hear from you.
            </p>
          </div>

          <div className="contact-forms-grid">
            <div className="contact-card">
              <h3>Send a Message</h3>
              <p>Have a question or want to work together?</p>
              <ContactForm />
            </div>
            <div className="contact-card">
              <h3>Book a Meeting</h3>
              <p>{"Let's"} schedule a time to discuss your project.</p>
              <BookingForm />
            </div>
          </div>

          <div className="contact-details">
            <h3>Find me online</h3>
            <div className="contact-details-inner">
              <div className="contact-details-links">
                <a href="mailto:muhammedsuadck1@gmail.com">
                  muhammedsuadck1@gmail.com
                </a>
                <a href="tel:+919778147045">+91 97781 47045</a>
              </div>
              <div className="social-links">
                <a href="https://in.linkedin.com/in/suad-ck" target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
                <a href="https://github.com/SuadCk" target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a href="https://www.instagram.com/suad_ck/" target="_blank" rel="noreferrer">
                  Instagram ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} Suad CK. All rights reserved.</p>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
