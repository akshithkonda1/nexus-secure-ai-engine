import { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

export default function PagesMode() {
  const pages = useWorkspace((state) => state.pages);
  const currentPageId = useWorkspace((state) => state.currentPage);
  const setCurrentPage = useWorkspace((state) => state.setCurrentPage);
  const addPage = useWorkspace((state) => state.addPage);
  const updatePage = useWorkspace((state) => state.updatePage);
  const deletePage = useWorkspace((state) => state.deletePage);

  const [newPageTitle, setNewPageTitle] = useState('');
  const [isAddingPage, setIsAddingPage] = useState(false);

  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageTitle.trim()) {
      addPage({ title: newPageTitle.trim(), content: '' });
      setNewPageTitle('');
      setIsAddingPage(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentPage) {
      updatePage(currentPage.id, { content: e.target.value });
    }
  };

  const handleSelectPage = (pageId: string) => {
    setCurrentPage(pageId);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Pages List */}
      <div className="w-64 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)]">Pages</h3>
          <button
            onClick={() => setIsAddingPage(true)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {isAddingPage && (
          <form onSubmit={handleAddPage} className="space-y-2">
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Page title..."
              autoFocus
              className="w-full rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingPage(false)}
                className="rounded-lg bg-[var(--bg-elev)] px-3 py-1.5 text-sm text-[var(--text)]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => handleSelectPage(page.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                currentPage?.id === page.id
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-elev)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{page.title}</span>
              </div>
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(page.id);
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)]/50 p-6">
        {currentPage ? (
          <div className="flex h-full flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">
                {currentPage.title}
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Last edited: {new Date(currentPage.updatedAt).toLocaleString()}
              </p>
            </div>

            <textarea
              value={currentPage.content}
              onChange={handleContentChange}
              placeholder="Start writing..."
              className="flex-1 resize-none rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] p-4 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            No pages yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
