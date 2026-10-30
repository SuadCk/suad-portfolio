
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManageProjects() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
  });

  async function loadProjects() {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Project loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch("/api/admin/session");

        if (!response.ok) {
          router.replace("/admin");
          return;
        }

        await loadProjects();
      } catch {
        router.replace("/admin");
      }
    }

    checkAccess();
  }, [router]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5 MB.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  }

  function handleEdit(project) {
    setEditingId(project._id);

    setForm({
      title: project.title || "",
      description: project.description || "",
      image: project.image || "",
      link: project.link || "",
    });

    setSelectedImage(null);
    setImagePreview(project.image || "");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      title: "",
      description: "",
      image: "",
      link: "",
    });

    setSelectedImage(null);
    setImagePreview("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      let imageUrl = form.image;

      // Upload a new image only if one was selected
      if (selectedImage) {
        setUploading(true);

        const uploadData = new FormData();
        uploadData.append("image", selectedImage);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          setMessage(uploadResult.message || "Image upload failed.");
          return;
        }

        imageUrl = uploadResult.imageUrl;
      }

      if (!imageUrl) {
        setMessage("Please select a project image.");
        return;
      }

      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing
          ? `/api/projects?id=${editingId}`
          : "/api/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            image: imageUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save project.");
        return;
      }

      setMessage(
        isEditing
          ? "Project updated successfully!"
          : "Project added successfully!"
      );

      resetForm();
      await loadProjects();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/projects?id=${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete project.");
        return;
      }

      if (editingId === projectId) {
        resetForm();
      }

      setMessage("Project deleted successfully!");
      await loadProjects();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while deleting.");
    }
  }

  return (
    <main className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-brand">SUAD CK</span>
          <h1>Manage Projects</h1>
          <p>Add and manage your portfolio projects.</p>
        </div>

        <button onClick={() => router.push("/admin/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="project-form-section">
        <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

        <p>
          {editingId
            ? "Update your project details below."
            : "Add a new project to your portfolio."}
        </p>

        <form className="project-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Project Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter project title"
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your project"
            rows={4}
            required
          />

          <label htmlFor="image">Project Image</label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />

          <p>
            {editingId
              ? "Leave empty to keep the existing image."
              : "Select an image for your project."}
          </p>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Project preview"
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            />
          )}

          <label htmlFor="link">Project Website URL</label>
          <input
            id="link"
            name="link"
            type="url"
            value={form.link}
            onChange={handleChange}
            placeholder="https://example.com"
          />

          <button type="submit" disabled={saving}>
            {uploading
              ? "Uploading image..."
              : saving
              ? "Saving project..."
              : editingId
              ? "Update Project"
              : "Add Project"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel Editing
            </button>
          )}

          {message && <p>{message}</p>}
        </form>
      </section>

      <section className="project-list-section">
        <h2>Your Projects ({projects.length})</h2>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <article className="dashboard-card">
            <h3>No projects yet</h3>
            <p>Your project list is currently empty.</p>
          </article>
        ) : (
          <div className="dashboard-grid">
            {projects.map((project) => (
              <article className="dashboard-card" key={project._id}>
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginBottom: "12px",
                    }}
                  />
                )}

                <h3>{project.title}</h3>
                <p>{project.description}</p>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit project
                  </a>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
