import { useScrollType } from "@/hooks/useScrollType";

interface ScrollTypeHeadingProps {
  children: string;
  id?: string;
  className?: string;
}

/**
 * ScrollTypeHeading
 * Drop-in replacement for <h2>. Text types itself in as you scroll to it.
 *
 * Usage:
 *   <ScrollTypeHeading id="skills" className="text-2xl font-serif border-b border-[#a2a9b1] mt-6 mb-3">
 *     Skills and Areas of Expertise
 *   </ScrollTypeHeading>
 */
export function ScrollTypeHeading({
  children,
  id,
  className,
}: ScrollTypeHeadingProps) {
  const { ref, displayed } = useScrollType(children);

  return (
    <h2
      id={id}
      className={className}
      ref={ref as React.RefObject<HTMLHeadingElement>}
    >
      {displayed}
      {/* blinking cursor — hidden once fully typed */}
      {displayed.length < children.length && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            background: "currentColor",
            marginLeft: "2px",
            verticalAlign: "-0.1em",
            animation: "scrollTypeBlink 0.85s step-end infinite",
          }}
        />
      )}
    </h2>
  );
}
