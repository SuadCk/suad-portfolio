
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, message } = body;

    if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
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

    if (!process.env.RESEND_API_KEY || !process.env.HOST_EMAIL) {
      throw new Error("Email environment variables are missing.");
    }

    const result = await resend.emails.send({
      from: "Suad CK <bookings@mail.suadweb.com>",
      to: [process.env.HOST_EMAIL],
      replyTo: email.trim(),
      subject: `Portfolio Contact: ${fullName.trim()}`,
      text: `
New contact message

Name: ${fullName.trim()}
Email: ${email.trim()}

Message:
${message.trim()}
      `,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return Response.json(
      {
        success: true,
        message: "Your message has been sent successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to send your message. Please try again.",
      },
      { status: 500 }
    );
  }
}
