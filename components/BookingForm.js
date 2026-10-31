
"use client";

import { useState } from "react";

export default function BookingForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    date: "",
    time: "",
    agenda: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function validateForm() {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.date) {
      newErrors.date = "Please select a preferred date.";
    } else if (form.date < getToday()) {
      newErrors.date = "Please select today or a future date.";
    }

    if (!form.time) {
      newErrors.time = "Please select a preferred time.";
    }

    if (!form.agenda.trim()) {
      newErrors.agenda = "Please enter your meeting agenda.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Booking failed.");
      }

      setSuccess(true);
      setMessage("Your meeting request has been submitted successfully!");

      setForm({
        fullName: "",
        email: "",
        date: "",
        time: "",
        agenda: "",
      });

      setErrors({});
    } catch (error) {
      setSuccess(false);
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fieldClass(name) {
    return errors[name] ? "booking-input booking-input-error" : "booking-input";
  }

  function errorMessage(name) {
    return errors[name] ? (
      <p className="booking-field-error" role="alert">
        {errors[name]}
      </p>
    ) : null;
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <div className="booking-field">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={handleChange}
          className={fieldClass("fullName")}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
        />
        {errorMessage("fullName")}
      </div>

      <div className="booking-field">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          className={fieldClass("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errorMessage("email")}
      </div>

      <div className="booking-field">
        <label htmlFor="date">Preferred Date</label>
        <input
          id="date"
          name="date"
          type="date"
          min={getToday()}
          value={form.date}
          onChange={handleChange}
          className={fieldClass("date")}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "date-error" : undefined}
        />
        {errorMessage("date")}
      </div>

      <div className="booking-field">
        <label htmlFor="time">Preferred Time</label>
        <input
          id="time"
          name="time"
          type="time"
          value={form.time}
          onChange={handleChange}
          className={fieldClass("time")}
          aria-invalid={Boolean(errors.time)}
          aria-describedby={errors.time ? "time-error" : undefined}
        />
        {errorMessage("time")}
      </div>

      <div className="booking-field">
        <label htmlFor="agenda">Meeting Agenda</label>
        <textarea
          id="agenda"
          name="agenda"
          placeholder="What would you like to discuss?"
          value={form.agenda}
          onChange={handleChange}
          rows={5}
          className={fieldClass("agenda")}
          aria-invalid={Boolean(errors.agenda)}
          aria-describedby={errors.agenda ? "agenda-error" : undefined}
        />
        {errorMessage("agenda")}
      </div>

      <button
        className="button button-primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Book a Meeting ↗"}
      </button>

      {message && (
        <p
          className={success ? "booking-success" : "booking-error"}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
