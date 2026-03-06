import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Tool {
  name: string;
  description: string;
  parameters: any;
}

export interface AgentDefinition {
  id: string;
  role: string;
  skills: string;
  tools: string[]; // Names of tools assigned
  task: string;
}

export interface AgentResult {
  agentId: string;
  role: string;
  task: string;
  skills: string;
  tools: string[];
  response: string;
  status: 'pending' | 'planning' | 'processing' | 'completed' | 'error';
  toolCalls?: any[];
}

// Define available tools for injection
const AVAILABLE_TOOLS: Record<string, FunctionDeclaration> = {
  search_web: {
    name: "search_web",
    parameters: {
      type: Type.OBJECT,
      description: "Search the web for real-time information.",
      properties: {
        query: { type: Type.STRING, description: "The search query." }
      },
      required: ["query"]
    }
  },
  calculate_data: {
    name: "calculate_data",
    parameters: {
      type: Type.OBJECT,
      description: "Perform complex mathematical or statistical calculations.",
      properties: {
        expression: { type: Type.STRING, description: "The math expression to evaluate." }
      },
      required: ["expression"]
    }
  },
  fetch_historical_records: {
    name: "fetch_historical_records",
    parameters: {
      type: Type.OBJECT,
      description: "Access a database of historical facts and dates.",
      properties: {
        topic: { type: Type.STRING, description: "The historical topic to look up." }
      },
      required: ["topic"]
    }
  }
};

export async function orchestrateDynamicTask(
  mainTask: string,
  onUpdate: (results: AgentResult[]) => void
) {
  // 1. PLANNING PHASE: Orchestrator decides how many agents and what skills/tools they need
  const plannerResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Master Orchestrator. Given the task: "${mainTask}", 
    determine the optimal team of specialized agents (between 2 and 5) to solve it.
    For each agent, provide:
    - A unique ID
    - A specific Role
    - Skills (System Instruction)
    - Tools (Choose from: ${Object.keys(AVAILABLE_TOOLS).join(", ")})
    - A specific sub-task.
    
    Return the plan as a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            role: { type: Type.STRING },
            skills: { type: Type.STRING },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            task: { type: Type.STRING }
          },
          required: ["id", "role", "skills", "tools", "task"]
        }
      }
    }
  });

  const plan: AgentDefinition[] = JSON.parse(plannerResponse.text || "[]");
  
  const results: AgentResult[] = plan.map(p => ({
    agentId: p.id,
    role: p.role,
    task: p.task,
    skills: p.skills,
    tools: p.tools,
    response: "",
    status: 'pending'
  }));

  onUpdate([...results]);

  // 2. EXECUTION PHASE: Spawn agents with injected skills and tools
  const agentPromises = plan.map(async (agentDef, i) => {
    results[i].status = 'processing';
    onUpdate([...results]);

    try {
      // Inject tools based on the plan
      const agentTools = agentDef.tools
        .map(tName => AVAILABLE_TOOLS[tName])
        .filter(Boolean);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Your role: ${agentDef.role}. Your task: ${agentDef.task}`,
        config: {
          systemInstruction: agentDef.skills,
          tools: agentTools.length > 0 ? [{ functionDeclarations: agentTools }] : undefined
        }
      });

      // Handle potential function calls (simulated for this demo)
      if (response.functionCalls) {
        results[i].toolCalls = response.functionCalls;
        results[i].response = `[Tool Used: ${response.functionCalls[0].name}] \n\n ${response.text || "Processing tool output..."}`;
      } else {
        results[i].response = response.text || "No response";
      }
      
      results[i].status = 'completed';
    } catch (error) {
      console.error(`Agent ${agentDef.id} failed:`, error);
      results[i].status = 'error';
      results[i].response = "Error occurred during processing.";
    }
    onUpdate([...results]);
  });

  await Promise.all(agentPromises);
  return results;
}
