export function DashboardArt({ x, y, width, height, label, className = "" }: { x: number; y: number; width: number; height: number; label?: string; className?: string }) {
  return <span className={`dashboard-art ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{ aspectRatio: `${width} / ${height}`, backgroundSize: `${617 / width * 100}% ${407 / height * 100}%`, backgroundPosition: `${x / (617 - width) * 100}% ${y / (407 - height) * 100}%` }} />;
}
