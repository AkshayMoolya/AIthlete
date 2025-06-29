import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Using a free AI API like OpenAI's GPT or Hugging Face
const AI_API_URL =
  process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_API_KEY = process.env.AI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionId } = await request.json();

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await db.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true },
      });
    } else {
      chatSession = await db.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50) + "...",
        },
        include: { messages: true },
      });
    }

    if (!chatSession) {
      return NextResponse.json(
        { message: "Chat session not found" },
        { status: 404 }
      );
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "user",
        content: message,
      },
    });

    // Prepare messages for AI
    const messages = [
      {
        role: "system",
        content:
          "You are a fitness and nutrition AI assistant. Help users with workout routines, exercise form, nutrition advice, and fitness goals. Be encouraging and provide practical, safe advice.",
      },
      ...chatSession.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // Call AI API (example using OpenAI-compatible API)
    const aiResponse = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();
    const aiMessage =
      aiData.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't process that request.";

    // Save AI response
    await db.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "assistant",
        content: aiMessage,
      },
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      message: aiMessage,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
