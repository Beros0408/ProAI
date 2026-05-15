export function WorkflowConnector({ animated = false }: { animated?: boolean }) {
  return (
    <div className="flex items-center justify-center" style={{ height: 20, width: 60 }}>
      <svg
        width="60"
        height="20"
        viewBox="0 0 60 20"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Vertical line */}
        <path
          d="M 30 2 C 30 6, 30 14, 30 18"
          stroke="#60a5fa"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className={animated ? 'wf-flow-line' : ''}
        />
        {/* Top dot */}
        <circle cx="30" cy="2"  r="2" fill="#60a5fa" className="wf-dot" />
        {/* Bottom dot */}
        <circle cx="30" cy="18" r="2" fill="#60a5fa" className="wf-dot" />
        {/* Arrowhead */}
        <polygon
          points="27,11 33,11 30,16"
          fill="#60a5fa"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
