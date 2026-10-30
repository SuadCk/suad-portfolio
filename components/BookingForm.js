
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

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
    } catch (error) {
      setSuccess(false);
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-field">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
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
          required
        />
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
          required
        />
      </div>

      <div className="booking-field">
        <label htmlFor="time">Preferred Time</label>
        <input
          id="time"
          name="time"
          type="time"
          value={form.time}
          onChange={handleChange}
          required
        />
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
          required
        />
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
