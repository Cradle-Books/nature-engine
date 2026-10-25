"use client";
import { useId } from "react";
export function SegmentedControl({ options, value, onChange, label }: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; label: string }) {
 const id = useId();
 return <fieldset className="segments"><legend className="sr-only">{label}</legend>{options.map(option => <label key={option.value} className="segment"><input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} /><span>{option.label}</span></label>)}</fieldset>;
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
 return <label className="toggle-row"><span>{label}</span><input className="toggle" type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} /></label>;
}
