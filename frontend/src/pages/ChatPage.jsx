import DataChat from "../components/DataChat";

function ChatPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Step 05</p>
        <h1 className="font-display text-4xl text-white mb-2">Ask your data</h1>
        <p className="text-mist">Type a question in plain English — no formulas needed.</p>
      </div>
      <DataChat />
    </div>
  );
}

export default ChatPage;