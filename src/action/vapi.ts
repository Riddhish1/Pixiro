"use server";

import { aiAgentPrompt } from "@/lib/data";
import { prismaClient } from "@/lib/prismaClient";
import { vapiServer } from "@/lib/vapi/vapiServer";

export const createAssistant = async (name: string, userId: string) => {
  try {
    const createAssistant = await vapiServer.assistants.create({
      name: name,
      firstMessage: `Hi there, this is ${name} from customer support. How can I help you today?`,
      model: {
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: aiAgentPrompt,
          },
        ],
        temperature: 0.5,
      },
      serverMessages: [],
    });

    console.log("Assistant created:", createAssistant);

    const aiAgent = await prismaClient.aiAgents.create({
      data: {
        id: createAssistant.id,
        model: "gpt-4o",
        provider: "openai",
        prompt: aiAgentPrompt,
        name: name,
        firstMessage: `Hi there, this is ${name} from customer support. How can I help you today?`,
        userId: userId,
        User:{
          connect: {
            id: userId,
          },
        }
      },
    });

    return {
      success: true,
      status: 200,
      data: aiAgent,
    };
  } catch (error) {
    console.error("Error creating agent:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to create agent",
    };
  }
};

//update assistant
export const updateAssistant = async (
  assistantId: string,
  firstMessage: string,
  systemPrompt: string
) => {
  try {
    const updateAssistant = await vapiServer.assistants.update(assistantId, {
      firstMessage: firstMessage,
      model: {
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
      serverMessages: [],
    });
    console.log("Assistant updated:", updateAssistant);

    const updateAiAgent = await prismaClient.aiAgents.update({
      where: {
        id: assistantId,
      },
      data: {
        firstMessage: firstMessage,
        prompt: systemPrompt,
      },
    });

    return {
      success: true,
      status: 200,
      data: updateAiAgent,
    };
  } catch (error) {
    console.error("Error updating agent:", error);
    return {
      success: false,
      status: 500,
      error: error,
      message: "Failed to update agent",
    };
  }
};
