/**
 * Workspace Store Tests
 * Tests for the unified workspace state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore } from '../../stores/workspaceStore';

describe('WorkspaceStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useWorkspaceStore.getState().clearAll();
  });

  describe('List Operations', () => {
    it('should have default lists on initialization', () => {
      const { lists } = useWorkspaceStore.getState();
      expect(lists.length).toBeGreaterThanOrEqual(2);
      expect(lists[0].name).toBe('Research');
    });

    it('should add a new list', () => {
      const { addList } = useWorkspaceStore.getState();

      addList('Test List');

      const updatedLists = useWorkspaceStore.getState().lists;
      expect(updatedLists.length).toBe(3); // 2 default + 1 new
      expect(updatedLists[2].name).toBe('Test List');
      expect(updatedLists[2].items).toEqual([]);
    });

    it('should add item to list', () => {
      const { lists, addListItem } = useWorkspaceStore.getState();
      const listId = lists[0].id;
      const initialLength = lists[0].items.length;

      addListItem(listId, 'New Item');

      const updatedList = useWorkspaceStore.getState().lists[0];
      expect(updatedList.items.length).toBe(initialLength + 1);
      expect(updatedList.items[updatedList.items.length - 1].text).toBe('New Item');
      expect(updatedList.items[updatedList.items.length - 1].done).toBe(false);
    });

    it('should toggle list item', () => {
      const { lists, toggleListItem } = useWorkspaceStore.getState();
      const listId = lists[0].id;
      const itemId = lists[0].items[0].id;
      const initialDoneState = lists[0].items[0].done;

      toggleListItem(listId, itemId);

      const updatedItem = useWorkspaceStore.getState().lists[0].items[0];
      expect(updatedItem.done).toBe(!initialDoneState);
    });

    it('should delete list item', () => {
      const { lists, deleteListItem } = useWorkspaceStore.getState();
      const listId = lists[0].id;
      const itemId = lists[0].items[0].id;
      const initialLength = lists[0].items.length;

      deleteListItem(listId, itemId);

      const updatedList = useWorkspaceStore.getState().lists[0];
      expect(updatedList.items.length).toBe(initialLength - 1);
    });

    it('should update list item text', () => {
      const { lists, updateListItem } = useWorkspaceStore.getState();
      const listId = lists[0].id;
      const itemId = lists[0].items[0].id;

      updateListItem(listId, itemId, 'Updated Text');

      const updatedItem = useWorkspaceStore.getState().lists[0].items[0];
      expect(updatedItem.text).toBe('Updated Text');
    });

    it('should delete a list', () => {
      const { lists, deleteList } = useWorkspaceStore.getState();
      const listId = lists[0].id;
      const initialLength = lists.length;

      deleteList(listId);

      const updatedLists = useWorkspaceStore.getState().lists;
      expect(updatedLists.length).toBe(initialLength - 1);
      expect(updatedLists.find(l => l.id === listId)).toBeUndefined();
    });
  });

  describe('Task Operations', () => {
    it('should have default tasks on initialization', () => {
      const { tasks } = useWorkspaceStore.getState();
      expect(tasks.length).toBeGreaterThanOrEqual(3);
    });

    it('should add a new task', () => {
      const { addTask } = useWorkspaceStore.getState();

      addTask({
        title: 'Test Task',
        done: false,
        priority: 50,
        type: 'work',
      });

      const updatedTasks = useWorkspaceStore.getState().tasks;
      expect(updatedTasks.length).toBe(4); // 3 default + 1 new
      expect(updatedTasks[3].title).toBe('Test Task');
      expect(updatedTasks[3].priority).toBe(50);
    });

    it('should toggle task completion', () => {
      const { tasks, toggleTask } = useWorkspaceStore.getState();
      const taskId = tasks[0].id;
      const initialDoneState = tasks[0].done;

      toggleTask(taskId);

      const updatedTask = useWorkspaceStore.getState().tasks[0];
      expect(updatedTask.done).toBe(!initialDoneState);
    });

    it('should update task', () => {
      const { tasks, updateTask } = useWorkspaceStore.getState();
      const taskId = tasks[0].id;

      updateTask(taskId, { title: 'Updated Title', priority: 90 });

      const updatedTask = useWorkspaceStore.getState().tasks[0];
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.priority).toBe(90);
    });

    it('should delete task', () => {
      const { tasks, deleteTask } = useWorkspaceStore.getState();
      const taskId = tasks[0].id;
      const initialLength = tasks.length;

      deleteTask(taskId);

      const updatedTasks = useWorkspaceStore.getState().tasks;
      expect(updatedTasks.length).toBe(initialLength - 1);
    });
  });

  describe('Calendar Operations', () => {
    it('should start with empty calendar events', () => {
      const { calendarEvents } = useWorkspaceStore.getState();
      expect(calendarEvents).toEqual([]);
    });

    it('should add calendar event', () => {
      const { addCalendarEvent } = useWorkspaceStore.getState();

      addCalendarEvent({
        title: 'Test Event',
        start: new Date('2025-01-20T10:00:00'),
        end: new Date('2025-01-20T11:00:00'),
      });

      const updatedEvents = useWorkspaceStore.getState().calendarEvents;
      expect(updatedEvents.length).toBe(1);
      expect(updatedEvents[0].title).toBe('Test Event');
    });

    it('should update calendar event', () => {
      const { addCalendarEvent, updateCalendarEvent } = useWorkspaceStore.getState();

      addCalendarEvent({
        title: 'Original Title',
        start: new Date('2025-01-20T10:00:00'),
        end: new Date('2025-01-20T11:00:00'),
      });

      const eventId = useWorkspaceStore.getState().calendarEvents[0].id;

      updateCalendarEvent(eventId, { title: 'Updated Title' });

      const updatedEvent = useWorkspaceStore.getState().calendarEvents[0];
      expect(updatedEvent.title).toBe('Updated Title');
    });

    it('should delete calendar event', () => {
      const { addCalendarEvent, deleteCalendarEvent } = useWorkspaceStore.getState();

      addCalendarEvent({
        title: 'Test Event',
        start: new Date('2025-01-20T10:00:00'),
        end: new Date('2025-01-20T11:00:00'),
      });

      const eventId = useWorkspaceStore.getState().calendarEvents[0].id;

      deleteCalendarEvent(eventId);

      const updatedEvents = useWorkspaceStore.getState().calendarEvents;
      expect(updatedEvents.length).toBe(0);
    });
  });

  describe('Connector Operations', () => {
    it('should start with empty connectors', () => {
      const { connectors } = useWorkspaceStore.getState();
      expect(connectors).toEqual([]);
    });

    it('should add connector', () => {
      const { addConnector } = useWorkspaceStore.getState();

      addConnector({
        name: 'GitHub',
        type: 'github',
        connected: false,
      });

      const updatedConnectors = useWorkspaceStore.getState().connectors;
      expect(updatedConnectors.length).toBe(1);
      expect(updatedConnectors[0].name).toBe('GitHub');
      expect(updatedConnectors[0].connected).toBe(false);
    });

    it('should toggle connector', () => {
      const { addConnector, toggleConnector } = useWorkspaceStore.getState();

      addConnector({
        name: 'GitHub',
        type: 'github',
        connected: false,
      });

      const connectorId = useWorkspaceStore.getState().connectors[0].id;
      toggleConnector(connectorId);

      const updatedConnector = useWorkspaceStore.getState().connectors[0];
      expect(updatedConnector.connected).toBe(true);
    });

    it('should update connector PAT', () => {
      const { addConnector, updateConnectorPAT } = useWorkspaceStore.getState();

      addConnector({
        name: 'GitHub',
        type: 'github',
        connected: false,
      });

      const connectorId = useWorkspaceStore.getState().connectors[0].id;
      updateConnectorPAT(connectorId, 'encrypted-token-123');

      const updatedConnector = useWorkspaceStore.getState().connectors[0];
      expect(updatedConnector.token).toBe('encrypted-token-123');
    });

    it('should remove connector', () => {
      const { addConnector, removeConnector } = useWorkspaceStore.getState();

      addConnector({
        name: 'GitHub',
        type: 'github',
        connected: false,
      });

      const connectorId = useWorkspaceStore.getState().connectors[0].id;
      removeConnector(connectorId);

      const updatedConnectors = useWorkspaceStore.getState().connectors;
      expect(updatedConnectors.length).toBe(0);
    });
  });

  describe('Board Operations', () => {
    it('should have default board', () => {
      const { boards } = useWorkspaceStore.getState();
      expect(boards.length).toBe(1);
      expect(boards[0].name).toBe('Project Board');
      expect(boards[0].columns.length).toBe(3);
    });

    it('should add card to column', () => {
      const { boards, addCard } = useWorkspaceStore.getState();
      const boardId = boards[0].id;
      const columnId = boards[0].columns[0].id;

      addCard(boardId, columnId, 'New Card');

      const updatedBoard = useWorkspaceStore.getState().boards[0];
      expect(updatedBoard.columns[0].cards.length).toBe(1);
      expect(updatedBoard.columns[0].cards[0].title).toBe('New Card');
    });

    it('should move card between columns', () => {
      const { boards, addCard, moveCard } = useWorkspaceStore.getState();
      const boardId = boards[0].id;
      const fromColumnId = boards[0].columns[0].id;
      const toColumnId = boards[0].columns[1].id;

      addCard(boardId, fromColumnId, 'Card to Move');
      const cardId = useWorkspaceStore.getState().boards[0].columns[0].cards[0].id;

      moveCard(boardId, cardId, toColumnId);

      const updatedBoard = useWorkspaceStore.getState().boards[0];
      expect(updatedBoard.columns[0].cards.length).toBe(0);
      expect(updatedBoard.columns[1].cards.length).toBe(1);
      expect(updatedBoard.columns[1].cards[0].title).toBe('Card to Move');
    });
  });

  describe('Data Persistence', () => {
    it('should export data correctly', () => {
      const exported = useWorkspaceStore.getState().exportData();

      expect(exported).toHaveProperty('lists');
      expect(exported).toHaveProperty('tasks');
      expect(exported).toHaveProperty('calendarEvents');
      expect(exported).toHaveProperty('connectors');
      expect(exported).toHaveProperty('version');
      expect(exported).toHaveProperty('lastModified');
    });

    it('should import data correctly', () => {
      const testData = {
        lists: [
          {
            id: 'test-list',
            name: 'Imported List',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      useWorkspaceStore.getState().importData(testData);

      const lists = useWorkspaceStore.getState().lists;
      expect(lists[0].name).toBe('Imported List');
    });

    it('should clear all data', () => {
      const { addTask, clearAll } = useWorkspaceStore.getState();

      // Add extra data
      addTask({ title: 'Extra Task', done: false, priority: 50, type: 'work' });

      // Clear all
      clearAll();

      // Should be back to defaults
      const state = useWorkspaceStore.getState();
      expect(state.lists.length).toBe(2);
      expect(state.tasks.length).toBe(3);
      expect(state.calendarEvents.length).toBe(0);
    });
  });

  describe('Analyze Permissions', () => {
    it('should start without analyze permission', () => {
      const hasPermission = useWorkspaceStore.getState().hasAnalyzePermission();
      expect(hasPermission).toBe(false);
    });

    it('should grant and check analyze permission', () => {
      const { grantAnalyzePermission } = useWorkspaceStore.getState();

      grantAnalyzePermission('always');

      const hasPermission = useWorkspaceStore.getState().hasAnalyzePermission();
      expect(hasPermission).toBe(true);
    });

    it('should revoke analyze permission', () => {
      const { grantAnalyzePermission, revokeAnalyzePermission } = useWorkspaceStore.getState();

      grantAnalyzePermission('always');
      revokeAnalyzePermission();

      const hasPermission = useWorkspaceStore.getState().hasAnalyzePermission();
      expect(hasPermission).toBe(false);
    });
  });
});
