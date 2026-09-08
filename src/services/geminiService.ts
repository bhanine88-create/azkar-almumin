
export const getAIInsights = async (ayahText: string, tafsirText: string, surahName: string, ayahNumber: number) => {
  try {
    const response = await fetch("/api/gemini-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ayahText,
        tafsirText,
        surahName,
        ayahNumber,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI insights from server");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    throw error;
  }
};
