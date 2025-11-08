import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '1', role: 'assistant', text: 'Welcome to Nexus. Ask anything—models will debate & converge.' }
  ]);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();
    setMsgs((m) => [...m, { id, role: 'user', text }]);
    setText('');
    // stubbed assistant reply
    setTimeout(() => {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: `Working on it: "${text}"` }]);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4 min-h-[60vh]">
        <div className="space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="px-3 py-2 rounded-lg max-w-[70ch]"
                style={{
                  background: m.role === 'user' ? 'rgba(37,99,235,0.15)' : 'var(--nexus-surface)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <button className="px-3 py-2 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask securely. The engine will orchestrate models & verify."
        />
        <button onClick={send} className="px-3 py-2 rounded-lg flex items-center gap-2">
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </div>
  );
}
