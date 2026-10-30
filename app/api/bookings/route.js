import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, date, time, agenda } = body;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !date ||
      !time ||
      !agenda?.trim()
    ) {
      return Response.json(
        { success: false, message: "Please complete all fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return Response.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    if (date < today) {
      return Response.json(
        { success: false, message: "Please select a future date." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.HOST_EMAIL) {
      throw new Error("Email environment variables are missing.");
    }

    const client = await clientPromise;
    const db = client.db("suad_portfolio");

    const booking = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      date,
      time,
      agenda: agenda.trim(),
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    const safeName = escapeHtml(booking.fullName);
    const safeEmail = escapeHtml(booking.email);
    const safeDate = escapeHtml(booking.date);
    const safeTime = escapeHtml(booking.time);
    const safeAgenda = escapeHtml(booking.agenda).replace(/\n/g, "<br>");

    const emailResults = await Promise.allSettled([
      // Email 1: Notification to you
      resend.emails.send({
        from: "Suad CK <bookings@mail.suadweb.com>",
        to: [process.env.HOST_EMAIL],
        subject: `New Meeting Request from ${booking.fullName}`,
        html: `
          <h2>New Meeting Request</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Date:</strong> ${safeDate}</p>
          <p><strong>Time:</strong> ${safeTime}</p>
          <p><strong>Agenda:</strong></p>
          <p>${safeAgenda}</p>
        `,
      }),

      // Email 2: Confirmation to visitor
      resend.emails.send({
        from: "Suad CK <bookings@mail.suadweb.com>",
        to: [booking.email],
        subject: "Your Meeting Request Has Been Received",
        html: `
          <h2>Thank you, ${safeName}!</h2>
          <p>Your meeting request has been received successfully.</p>
          <p><strong>Preferred date:</strong> ${safeDate}</p>
          <p><strong>Preferred time:</strong> ${safeTime}</p>
          <p><strong>Agenda:</strong></p>
          <p>${safeAgenda}</p>
          <p>I will get back to you soon.</p>
          <p>Regards,<br>Suad CK</p>
        `,
      }),
    ]);

    const emailsSent = emailResults.map((result, index) => {
      const failed =
        result.status === "rejected" ||
        Boolean(result.value?.error);

      if (failed) {
        console.error(
          index === 0
            ? "Host email failed:"
            : "Visitor email failed:",
          result.status === "rejected"
            ? result.reason
            : result.value.error
        );
      }

      return !failed;
    });

    return Response.json(
      {
        success: true,
        message: "Your meeting request has been submitted!",
        bookingId: result.insertedId,
        emailsSent: {
          host: emailsSent[0],
          visitor: emailsSent[1],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking API error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}