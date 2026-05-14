export function WorkflowConnector({ animated = false }: { animated?: boolean }) {
  return (
    <div className="flex items-center justify-center" style={{ height: 32, width: 60 }}>
      <svg
        width="60"
        height="32"
        viewBox="0 0 60 32"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Vertical line */}
        <path
          d="M 30 3 C 30 10, 30 22, 30 29"
          stroke="#60a5fa"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className={animated ? 'wf-flow-line' : ''}
        />
        {/* Top dot */}
        <circle cx="30" cy="3"  r="2.5" fill="#60a5fa" className="wf-dot" />
        {/* Bottom dot */}
        <circle cx="30" cy="29" r="2.5" fill="#60a5fa" className="wf-dot" />
        {/* Arrowhead */}
        <polygon
          points="27,19 33,19 30,24"
          fill="#60a5fa"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
