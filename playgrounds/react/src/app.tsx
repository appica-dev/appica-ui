import { Button, Sparkline, SparklineChart, SparklineLabel, SparklineValue, useTheme } from '@appica/ui-react'

const DATA = [4, 8, 6, 10, 7, 12]
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function App() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <main className="text-foreground bg-background mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground-intense text-3xl font-semibold">Appica UI Playground</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            Scratch page for developing components - edit <code>packages/react/src</code> and it hot-reloads.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon-md"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          ◑
        </Button>
      </header>

      <section className="flex flex-col gap-8">
        <h2 className="text-foreground-emphasis text-lg font-semibold">Sparkline</h2>

        <Sparkline data={DATA} labels={LABELS} className="max-w-xs">
          <div className="flex items-baseline justify-between">
            <SparklineLabel />
            <SparklineValue />
          </div>
          <SparklineChart variant="area" tooltip aria-label="Weekly revenue" />
        </Sparkline>

        <Sparkline data={DATA} className="max-w-xs">
          <SparklineChart variant="column" height={64} aria-label="Weekly columns" />
        </Sparkline>

        <Sparkline data={DATA} className="max-w-xs">
          <SparklineChart variant="line" aria-label="Weekly line" />
        </Sparkline>
      </section>
    </main>
  )
}
