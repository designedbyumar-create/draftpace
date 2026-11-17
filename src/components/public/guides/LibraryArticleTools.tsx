"use client";
import { useId, useState } from "react";
import { Check, ListChecks, MessageCircle, RotateCcw } from "@/design-system/Icon";
import { renderInline } from "./inline";
import s from "./LibraryArticleExperience.module.css";

export function FieldnoteChecklist({ items }: { items: string[] }) {
  const [done,setDone]=useState<number[]>([]);
  const id=useId();
  return <div className={s.checkTool}><div className={s.checkTop}><ListChecks size={23} aria-hidden /><strong>Your next steps</strong><span aria-live="polite">{done.length} / {items.length}</span><button type="button" title="Reset checklist" aria-label="Reset checklist" disabled={!done.length} onClick={()=>setDone([])}><RotateCcw size={17} aria-hidden /></button></div><progress value={done.length} max={items.length} aria-label="Checklist progress" /><ul>{items.map((item,i)=><li data-done={done.includes(i)} key={item}><label htmlFor={`${id}-${i}`}><input id={`${id}-${i}`} type="checkbox" checked={done.includes(i)} onChange={()=>setDone(old=>old.includes(i)?old.filter(n=>n!==i):[...old,i])} /><span>{renderInline(item,`check-${id}-${i}`)}</span></label></li>)}</ul><p className={s.sessionNote}>Ticks last for this visit only. Nothing is saved.</p></div>;
}

export function FieldnoteScripts({ items }: { items: { situation: string; line: string }[] }) {
  const [selected,setSelected]=useState(0);
  const [status,setStatus]=useState("");
  const id=useId();
  async function copy(){try{await navigator.clipboard.writeText(items[selected].line);setStatus("Copied to your clipboard.");}catch{setStatus("Copy unavailable. Select the words above to copy them.");}}
  return <div className={s.scriptTool}><fieldset><legend>Which conversation are you having?</legend>{items.map((item,i)=><label data-selected={selected===i} key={item.situation}><input type="radio" name={id} checked={selected===i} onChange={()=>{setSelected(i);setStatus("");}} /><span>{item.situation}</span></label>)}</fieldset><div className={s.scriptQuote}><MessageCircle size={28} aria-hidden /><span className={s.youCouldSay}>You could say</span>{items.map((item,i)=><blockquote key={item.situation} hidden={selected!==i}>{item.line}</blockquote>)}<button type="button" onClick={copy}><Check size={17} aria-hidden />Copy these words</button><span role="status">{status}</span></div></div>;
}
