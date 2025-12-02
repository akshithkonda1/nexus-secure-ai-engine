import { ListsStore } from "../widgets/lists/ListsStore";
import { CalendarStore } from "../widgets/calendar/CalendarStore";
import { TasksStore } from "../widgets/tasks/TasksStore";
import { ConnectorsStore } from "../widgets/connectors/ConnectorsStore";

export function exportForToron() {
  return {
    lists: ListsStore.getAll(),
    calendar: CalendarStore.getAll(),
    tasks: TasksStore.getAll(),
    connectors: ConnectorsStore.getState(),
  };
}

export default exportForToron;
