import { useState, useEffect } from "react";
import { ListsApi, TasksApi, CalendarApi, PagesApi, ToronApi } from "./api";
import { ListItem, TaskItem, CalendarItem, ContentItem, ToronInsight } from "./models";

export function useLists() {
  const [data, setData] = useState<ListItem[]>([]);
  useEffect(() => {
    ListsApi.list().then(setData).catch(console.error);
  }, []);
  return data;
}

export function useTasks() {
  const [data, setData] = useState<TaskItem[]>([]);
  useEffect(() => {
    TasksApi.list().then(setData).catch(console.error);
  }, []);
  return data;
}

export function useCalendar() {
  const [data, setData] = useState<CalendarItem[]>([]);
  useEffect(() => {
    CalendarApi.list().then(setData).catch(console.error);
  }, []);
  return data;
}

export function usePages() {
  const [data, setData] = useState<ContentItem[]>([]);
  useEffect(() => {
    PagesApi.list().then(setData).catch(console.error);
  }, []);
  return data;
}

export function useToronInsights() {
  const [insights, setInsights] = useState<ToronInsight[]>([]);
  useEffect(() => {
    ToronApi.insights().then(setInsights).catch(console.error);
  }, []);
  return insights;
}
