// Stand-in for domain/learningData.ts (Supabase reads and writes). Reads return the fixture;
// writes keep the same Result shape and change nothing.
import { ok } from "@/product-framework/result";
import { CHILD, CURRICULA, PLAN, POSITIONS, TOPICS } from "../fixtures";

export type ChildTopic = (typeof TOPICS)[number] | { id: string; childId: string; subject: string; topicKey: string; state: "current" | "covered" | "removed" };

export const loadChildren = async () => ok([CHILD]);
export const loadCurricula = async () => ok(CURRICULA);
export const loadPositions = async () => ok(POSITIONS);
export const loadPlan = async () => ok(PLAN);
export const loadChildTopics = async () => ok(TOPICS as ChildTopic[]);
export const setChildTopic = async () => ok(null);
export const clearChildTopic = async () => ok(null);
export const setChildVisibility = async () => ok(CHILD);
export const setSubjectActive = async () => ok(null);
export const setSubjectFrequency = async () => ok(null);
export const setSubjects = async () => ok(null);
