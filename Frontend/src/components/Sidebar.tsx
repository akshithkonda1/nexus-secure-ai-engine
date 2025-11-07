import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChatBubbleLeftRightIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [
    { icon: ChatBubbleLeftRightIcon, label: 'Telemetry', active: false },
    { icon: ClockIcon, label: 'History', active: false },
    { icon: Cog6ToothIcon, label: 'Settings', active: true },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-elevated dark:border-r border-gray-700 pt-6">
        {items.map((i) => (
          <button
            key={i.label}
            className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-700 ${
              i.active ? 'bg-primary/20 text-primary' : 'text-muted'
            }`}
          >
            <i.icon className="w-5 h-5" />
            <span>{i.label}</span>
          </button>
        ))}
      </aside>

      {/* Mobile Toggle & Dialog */}
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-20 left-4 z-50">Menu</button>
      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setMobileOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          {/* Sidebar content here, same as desktop */}
        </Dialog>
      </Transition.Root>
    </>
  );
}

export default Sidebar;
