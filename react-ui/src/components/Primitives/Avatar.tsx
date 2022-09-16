import React, { ReactNode } from 'react'

export default function Avatar({
  children,
  indicator,
}: {
  children: ReactNode,
  indicator?: string,
}) {
  return (
    <div className="pc-avatar">
      {children}
      {indicator && (
        <div className={`pc-avatar-indicator ${indicator}`}></div>
      )}
    </div>
  )
}
