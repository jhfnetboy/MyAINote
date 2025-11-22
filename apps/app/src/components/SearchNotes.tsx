"use client";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RoundedButton } from "./RoundedButton";

interface SearchResult {
    title: string;
    path: string;
    score: number;
    content_snippet: string;
}

export function SearchNotes() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [chatResponse, setChatResponse] = useState("");
    const [mode, setMode] = useState<"search" | "chat">("search");

    const handleSearch = async () => {
        try {
            const res = await invoke<SearchResult[]>("search_notes", { query });
            setResults(res);
        } catch (e) {
            console.error(e);
        }
    };

    const handleChat = async () => {
        try {
            setChatResponse("Thinking...");
            const res = await invoke<string>("chat_with_notes", { query });
            setChatResponse(res);
        } catch (e) {
            console.error(e);
            setChatResponse("Error: " + String(e));
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4">MyAINote Brain</h2>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setMode("search")}
                    className={`px-4 py-2 rounded-lg ${mode === "search" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                    Search
                </button>
                <button
                    onClick={() => setMode("chat")}
                    className={`px-4 py-2 rounded-lg ${mode === "chat" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                    Chat (RAG)
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === "search" ? "Search notes..." : "Ask your notes..."}
                    className="flex-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    onKeyDown={(e) => e.key === "Enter" && (mode === "search" ? handleSearch() : handleChat())}
                />
                <RoundedButton
                    onClick={mode === "search" ? handleSearch : handleChat}
                    title={mode === "search" ? "Search" : "Ask"}
                    disabled={!query}
                />
            </div>

            {mode === "search" && (
                <div className="space-y-4">
                    {results.map((result, i) => (
                        <div key={i} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <h3 className="font-bold text-lg">{result.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{result.path}</p>
                            <p className="text-gray-700 dark:text-gray-300">{result.content_snippet}</p>
                            <div className="mt-2 text-xs text-blue-500">Score: {result.score.toFixed(2)}</div>
                        </div>
                    ))}
                    {results.length === 0 && query && <p className="text-gray-500">No results found.</p>}
                </div>
            )}

            {mode === "chat" && chatResponse && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h3 className="font-bold mb-2 text-purple-800 dark:text-purple-300">AI Answer:</h3>
                    <p className="whitespace-pre-wrap">{chatResponse}</p>
                </div>
            )}
        </div>
    );
}
