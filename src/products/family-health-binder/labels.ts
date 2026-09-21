import type { MedicalFactKind, Relationship } from "./state";

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  self: "You",
  spouse: "Spouse or partner",
  child: "Child",
  parent: "Parent",
  other: "Other",
};

export const RELATIONSHIP_OPTIONS: { id: Relationship; label: string }[] = (
  ["child", "self", "spouse", "parent", "other"] as Relationship[]
).map((id) => ({ id, label: RELATIONSHIP_LABEL[id] }));

/** What each kind of fact is called on a screen, and what to say when adding one. */
export const FACT_LABEL: Record<MedicalFactKind, { section: string; noun: string; add: string; prompt: string; placeholder: string }> = {
  allergy: { section: "Allergies", noun: "allergy", add: "Add an allergy", prompt: "What are they allergic to?", placeholder: "Peanuts" },
  condition: { section: "Conditions", noun: "condition", add: "Add a condition", prompt: "Condition", placeholder: "Asthma" },
  medication: { section: "Medications", noun: "medication", add: "Add a medication", prompt: "Medication name", placeholder: "Amoxicillin" },
  history: { section: "Family history", noun: "family history note", add: "Add a note", prompt: "Family history note", placeholder: "Asthma runs in the family" },
};
