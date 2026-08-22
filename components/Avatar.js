import Image from "next/image";
import { cn, hueFromString, initialsOf } from "@/lib/utils";

export default function Avatar({ src, name, size = 48, className }) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden rounded-full border border-hairline",
          className
        )}
        style={style}
      >
        <Image
          src={src}
          alt={name || "Profile picture"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      </span>
    );
  }

  const hue = hueFromString(name);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none",
        className
      )}
      style={{
        ...style,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 60% 45%), hsl(${(hue + 40) % 360} 65% 35%))`,
      }}
      aria-label={name ? `${name} avatar` : "Avatar"}
    >
      {initialsOf(name)}
    </span>
  );
}
