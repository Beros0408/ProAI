export function WorkflowConnector({ animated = false }: { animated?: boolean }) {
  return (
    <div className="flex items-center justify-center" style={{ height: 48, width: 80 }}>
      <svg
        width="80"
        height="48"
        viewBox="0 0 80 48"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Vertical bezier line */}
        <path
          d="M 40 4 C 40 16, 40 32, 40 44"
          stroke="#60a5fa"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className={animated ? 'wf-flow-line' : ''}
        />
        {/* Top dot */}
        <circle cx="40" cy="4"  r="3.5" fill="#60a5fa" className="wf-dot" />
        {/* Bottom dot */}
        <circle cx="40" cy="44" r="3.5" fill="#60a5fa" className="wf-dot" />
        {/* Arrowhead at mid-point */}
        <polygon
          points="36,27 44,27 40,34"
          fill="#60a5fa"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
