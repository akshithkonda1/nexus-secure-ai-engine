import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-elevated dark:border-b border-gray-700 flex items-center px-4 z-50">
      <div className="flex-1 flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Nexus <span className="text-xs text-muted">BETA</span></h1>
        <div className="relative flex-1 max-w-md">
          <input
            placeholder="What are you looking for?"
            className="w-full bg-gray-800 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
        </div>
      </div>
      <button className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">
        Join Waitlist
      </button>
    </header>
  );
}

export default Header;
