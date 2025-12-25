import { useState } from 'react';
import { StickyNote, Plus, X } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

export default function NotesMode() {
  const notes = useWorkspace((state) => state.notes);
  const addNote = useWorkspace((state) => state.addNote);
  const updateNote = useWorkspace((state) => state.updateNote);
  const deleteNote = useWorkspace((state) => state.deleteNote);

  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteContent.trim()) {
      addNote(newNoteContent.trim());
      setNewNoteContent('');
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="flex gap-3">
        <input
          type="text"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Quick note..."
          className="flex-1 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <button
          type="submit"
          disabled={!newNoteContent.trim()}
          className="rounded-lg bg-[var(--accent)] px-6 py-3 text-white hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>

      {/* Notes Grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group relative flex flex-col gap-3 rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)]/50 p-4 transition-colors hover:bg-[var(--bg-surface)]"
          >
            <div className="flex items-start justify-between gap-2">
              <StickyNote className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <button
                onClick={() => deleteNote(note.id)}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4 text-[var(--text-muted)] hover:text-red-500" />
              </button>
            </div>

            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
              className="flex-1 resize-none bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
              rows={4}
            />

            <p className="text-xs text-[var(--text-muted)]">
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="col-span-full flex h-full items-center justify-center text-[var(--text-muted)]">
            No notes yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}
