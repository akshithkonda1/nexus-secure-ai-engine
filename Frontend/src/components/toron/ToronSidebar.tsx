/**
 * ToronSidebar Component
 * Ultra-modern dual-menu sidebar for Toron interface
 * Design Philosophy: Minimalist, precise, 60fps smooth
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn, bg, border } from '../../utils/theme';
import { useToronStore } from '../../stores/useToronStore';
import SidebarHeader from './SidebarHeader';
import ChatsMenu from './ChatsMenu';
import ProjectsMenu from './ProjectsMenu';

type MenuType = 'chats' | 'projects';

export default function ToronSidebar() {
  const [activeMenu, setActiveMenu] = useState<MenuType>('chats');
  const [isScrolled, setIsScrolled] = useState(false);
  const [previousMenu, setPreviousMenu] = useState<MenuType>('chats');

  // Store actions
  const createChat = useToronStore(state => state.createChat);
  const createProject = useToronStore(state => state.createProject);

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const chatsScrollPosition = useRef(0);
  const projectsScrollPosition = useRef(0);

  // Track scroll position for header shadow
  useEffect(() => {
    const container = menuContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeMenu]);

  // Handle menu change with scroll position preservation
  const handleMenuChange = useCallback((menu: MenuType) => {
    if (menu === activeMenu) return;

    // Save current scroll position
    const container = menuContainerRef.current;
    if (container) {
      if (activeMenu === 'chats') {
        chatsScrollPosition.current = container.scrollTop;
      } else {
        projectsScrollPosition.current = container.scrollTop;
      }
    }

    setPreviousMenu(activeMenu);
    setActiveMenu(menu);

    // Restore scroll position for new menu (after render)
    requestAnimationFrame(() => {
      if (container) {
        if (menu === 'chats') {
          container.scrollTop = chatsScrollPosition.current;
        } else {
          container.scrollTop = projectsScrollPosition.current;
        }
      }
    });
  }, [activeMenu]);

  // Handle new item creation
  const handleNewItem = useCallback(() => {
    if (activeMenu === 'chats') {
      // Create a new chat directly without prompt
      createChat();
    } else {
      const name = prompt('Enter project name:');
      if (name && name.trim()) {
        createProject(name.trim());
      }
    }
  }, [activeMenu, createChat, createProject]);

  // Handle new chat (passed to ChatsMenu)
  const handleNewChat = useCallback(() => {
    createChat();
  }, [createChat]);

  // Handle new project (passed to ProjectsMenu)
  const handleNewProject = useCallback(() => {
    const name = prompt('Enter project name:');
    if (name && name.trim()) {
      createProject(name.trim());
    }
  }, [createProject]);

  // Animation direction for menu transitions
  const isForward = activeMenu === 'projects' && previousMenu === 'chats';

  return (
    <div
      className={cn(
        'flex h-full w-[320px] flex-col border-r',
        border.subtle,
        bg.surface
      )}
    >
      {/* Header */}
      <SidebarHeader
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        onNewItem={handleNewItem}
        isScrolled={isScrolled}
      />

      {/* Menu content with transitions */}
      <div className="relative flex-1 overflow-hidden">
        {/* Chats Menu */}
        <div
          ref={activeMenu === 'chats' ? menuContainerRef : null}
          className={cn(
            'absolute inset-0 transition-all',
            activeMenu === 'chats'
              ? 'opacity-100 translate-x-0'
              : cn(
                  'opacity-0 pointer-events-none',
                  isForward ? '-translate-x-2' : 'translate-x-2'
                )
          )}
          style={{
            transitionDuration: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            transitionProperty: 'opacity, transform',
          }}
        >
          <ChatsMenu onNewChat={handleNewChat} />
        </div>

        {/* Projects Menu */}
        <div
          ref={activeMenu === 'projects' ? menuContainerRef : null}
          className={cn(
            'absolute inset-0 transition-all',
            activeMenu === 'projects'
              ? 'opacity-100 translate-x-0'
              : cn(
                  'opacity-0 pointer-events-none',
                  !isForward ? 'translate-x-2' : '-translate-x-2'
                )
          )}
          style={{
            transitionDuration: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            transitionProperty: 'opacity, transform',
          }}
        >
          <ProjectsMenu onNewProject={handleNewProject} />
        </div>
      </div>
    </div>
  );
}
