"use client";
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SearchNotes } from '@/components/SearchNotes';

export default function Home() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  async function greet() {
    setGreetMsg(await invoke('greet_with_ai', { name }));
  }

  async function toggleRecording() {
    if (isRecording) {
      try {
        const text = await invoke('stop_recording');
        setIsRecording(false);
        setTranscription(text as string);
        alert(`Recording saved! Transcription: ${text}`);
      } catch (e) {
        console.error(e);
        alert('Error stopping recording');
        setIsRecording(false);
      }
    } else {
      try {
        await invoke('start_recording');
        setIsRecording(true);
        setTranscription('');
      } catch (e) {
        console.error(e);
        alert('Error starting recording');
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          MyAINote &nbsp;
          <code className="font-mono font-bold">v0.5.0</code>
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-blue-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-sky-900 after:via-[#0141ff] after:opacity-40 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          MyAINote
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-1 lg:text-left gap-8">

        {/* AI Greeting Section */}
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            AI Greeting{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
          >
            <input
              id="greet-input"
              className="p-2 rounded text-black"
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all">
              Greet
            </button>
          </form>
          <p className="mt-4 text-sm opacity-70">{greetMsg}</p>
        </div>

        {/* Voice Recorder Section */}
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Voice Note{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={toggleRecording}
              className={`font-bold py-4 px-6 rounded-full transition-all flex items-center justify-center gap-2 ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isRecording ? (
                <>
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                  Stop Recording
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Start Recording
                </>
              )}
            </button>
            {transcription && (
              <div className="mt-2 p-4 bg-gray-800 rounded border border-gray-700">
                <h3 className="font-bold text-gray-400 text-xs uppercase mb-2">Last Transcription:</h3>
                <p className="italic text-gray-300">"{transcription}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Brain Section */}
        <SearchNotes />

      </div>
    </main>
  );
}
