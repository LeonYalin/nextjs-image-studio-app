"use client";

export default function BrandMark({ size = 26, hole = "var(--sidebar)" }: { size?: number; hole?: string }) {
  const cx = 13, cy = 13, R = 12.4, r = 4.4, gap = 4;
  const colors = ["var(--brand)", "var(--accent-green)", "var(--accent-amber)", "var(--accent-red)", "var(--brand)", "var(--accent-green)"];
  const pt = (ang: number, rad: number): [number, number] => {
    const a = ((ang - 90) * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  const blades = colors.map((col, i) => {
    const a0 = i * 60 + gap / 2, a1 = (i + 1) * 60 - gap / 2;
    const [ox0, oy0] = pt(a0, R), [ox1, oy1] = pt(a1, R);
    const [ix1, iy1] = pt(a1, r), [ix0, iy0] = pt(a0, r);
    const d = `M${ox0.toFixed(2)} ${oy0.toFixed(2)} A${R} ${R} 0 0 1 ${ox1.toFixed(2)} ${oy1.toFixed(2)} L${ix1.toFixed(2)} ${iy1.toFixed(2)} A${r} ${r} 0 0 0 ${ix0.toFixed(2)} ${iy0.toFixed(2)} Z`;
    return <path key={i} d={d} fill={col} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" style={{ display: "block", flexShrink: 0 }}>
      {blades}
      <circle cx={cx} cy={cy} r={r - 0.6} fill={hole} />
    </svg>
  );
}
