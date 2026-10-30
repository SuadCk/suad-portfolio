
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/mongodb";

// Verify admin authentication
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token || !process.env.ADMIN_SESSION_SECRET) {
      return false;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET)
    );

    return payload.role === "admin";
  } catch {
    return false;
  }
}

// GET: Fetch all projects (public)
export async function GET() {
  try {
    const client = await clientPromise;

    const projects = await client
      .db("suad_portfolio")
      .collection("projects")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("MONGODB PROJECT FETCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch projects." },
      { status: 500 }
    );
  }
}

// POST: Add a project (admin only)
export async function POST(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { title, description, image, link } = await request.json();

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof image !== "string" ||
      !title.trim() ||
      !description.trim() ||
      !image.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description and image are required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const project = {
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      link: typeof link === "string" ? link.trim() : "",
      createdAt: new Date(),
    };

    const result = await client
      .db("suad_portfolio")
      .collection("projects")
      .insertOne(project);

    return NextResponse.json(
      {
        success: true,
        message: "Project added successfully.",
        project: {
          ...project,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add project error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to add project." },
      { status: 500 }
    );
  }
}

// PATCH: Edit a project (admin only)
export async function PATCH(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const { title, description, image, link } = await request.json();

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof image !== "string" ||
      !title.trim() ||
      !description.trim() ||
      !image.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description and image are required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const collection = client
      .db("suad_portfolio")
      .collection("projects");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: title.trim(),
          description: description.trim(),
          image: image.trim(),
          link: typeof link === "string" ? link.trim() : "",
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error("Update project error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update project." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a project (admin only)
export async function DELETE(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const collection = client
      .db("suad_portfolio")
      .collection("projects");

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete project." },
      { status: 500 }
    );
  }
}
