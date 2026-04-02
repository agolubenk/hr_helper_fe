import type { SVGProps } from 'react'

/** Иконка дискеты для сохранения черновика (в @radix-ui/react-icons нет аналога). */
export function PlaygroundFloppyDiskIcon(props: SVGProps<SVGSVGElement>) {
  const { width = 20, height = 20, ...rest } = props
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...rest}
    >
      <path d="M5 3h9.17L19 7.83V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 2v5h8V5H7zm-2 7h12v10H5V12z" />
    </svg>
  )
}
