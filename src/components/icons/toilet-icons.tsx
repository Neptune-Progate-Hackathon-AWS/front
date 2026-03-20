import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

/** 男女両方のトイレアイコン */
export function ToiletIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7.5 2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2M6 7h3a2 2 0 0 1 2 2v5.5H9.5V22h-4v-7.5H4V9a2 2 0 0 1 2-2m10.5-5a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2M15 22v-6h-3l2.59-7.59C14.84 7.59 15.6 7 16.5 7s1.66.59 1.91 1.41L21 16h-3v6z" />
    </svg>
  );
}

/** 男性用トイレアイコン */
export function ToiletMaleIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10 22v-7H8V9q0-.825.588-1.412T10 7h4q.825 0 1.413.588T16 9v6h-2v7zm2-16q-.825 0-1.412-.587T10 4t.588-1.412T12 2t1.413.588T14 4t-.587 1.413T12 6" />
    </svg>
  );
}

/** 女性用トイレアイコン */
export function ToiletFemaleIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10.5 22v-6H7l3.05-7.7q.25-.6.775-.95T12 7t1.175.35t.775.95L17 16h-3.5v6zM12 6q-.825 0-1.412-.587T10 4t.588-1.412T12 2t1.413.588T14 4t-.587 1.413T12 6" />
    </svg>
  );
}
