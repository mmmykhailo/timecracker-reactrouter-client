export function meta() {
  return [
    { title: "Timecracker" },
    { name: "description", content: "Stupidly simple timetracker" },
  ];
}

export default function NotSupportedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <img className="h-12 w-12" src="/logo.svg" alt="Timecracker" />
              <h1 className="font-bold text-xl">Welcome to Timecracker</h1>
            </div>
          </div>
          <div className="text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            Unfortunately, Filesystem API is not supported in your browser. Try
            using any Chromium-based browser. More info{" "}
            <a href="https://caniuse.com/filesystem">here</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
