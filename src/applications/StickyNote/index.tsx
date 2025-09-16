import { ScrollArea } from "@/components/ScrollArea";

// TODO replace with a text editor - lexical looks good
export default function StickyNote() {
  return (
    <ScrollArea className="w-full h-full" type="always">
      <div className="justify-center p-6 bg-yellow-100  text-black flex flex-col gap-2">
        <p>
          Hello - Adam again! This is a work-in-progress rewrite of my old site
          over at:{" "}
          <a className="underline" href="https://www.adamw.ph/">
            https://www.adamw.ph/
          </a>
          .
        </p>
        <p>
          There&apos;s not a whole bunch to see here yet as you can tell by this
          crude info window but do check back! I&apos;m currently building out
          the core window system to be as flexible and performant as possible
          which has involved doing a fair bit from scratch!
        </p>
        <p>
          There&apos;s minimal apps to actually play around with atm but do play
          with what&apos;s here like 2048 and the core window system. Soon
          enough this sticky note will be editable too!
        </p>
      </div>
    </ScrollArea>
  );
}
