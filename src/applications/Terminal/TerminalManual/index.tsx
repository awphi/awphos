import { ScrollArea } from "@/components/ScrollArea";
import { COMMANDS, type CommandDef } from "../constants";
import { Fragment } from "react";

const SORTED_COMMANDS = Object.entries(COMMANDS).sort(([a], [b]) => {
  return a.localeCompare(b);
});

console.log(SORTED_COMMANDS, COMMANDS);

function TerminalManualEntry({
  command: { description, usage },
}: {
  command: CommandDef;
}) {
  return (
    <div>
      <p className="text-lg">{usage}</p>

      <p className="text-sm">{description}</p>
    </div>
  );
}

export default function TerminalManual() {
  return (
    <ScrollArea className="w-full h-full" type="always">
      <div className="px-4 py-2 bg-neutral-950 h-full flex flex-col gap-2">
        <div className="text-xs flex flex-col gap-1">
          <p>
            This manual is a simple reference for the simplified command set
            that the adamwp.h shell supports. Some notes:
          </p>
          <ul className="list-disc [&>li]:ml-6 gap-1 flex flex-col">
            <li>
              Not all standard terminal or shell features are supported. In
              fact, most aren&apos;t!
            </li>
            <li>
              All file system commands interact with your local on-disk file
              system through IndexedDB. This means any changes will persist
              across sessions and create very large files only eats up your disk
              space so be warned.
            </li>
            <li>
              Redirection, piping and command chaining are <b>not</b> supported
              yet but I&apos;m hoping to add this soon!
            </li>
          </ul>
        </div>
        <hr />
        {SORTED_COMMANDS.map(([key, cmd]) => {
          return (
            <Fragment key={key}>
              <TerminalManualEntry command={cmd!} />
              <hr className="last:hidden" />
            </Fragment>
          );
        })}
      </div>
    </ScrollArea>
  );
}
