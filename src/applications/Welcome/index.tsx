export default function Welcome() {
  return (
    <div className="bg-white h-full text-black p-6 justify-center flex flex-col gap-2">
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
        crude info window but do check back! I&apos;m currently building out the
        core window system to be as flexible and performant as possible which
        has involved doing a fair bit from scratch!
      </p>
      <p>
        As a little bonus I&apos;ve added the game &quot;2048&quot; to the site
        for now so give it a go and let me know if you spot any really egregious
        bugs!
      </p>
    </div>
  );
}
