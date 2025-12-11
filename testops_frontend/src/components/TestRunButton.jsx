import React from 'react'

export default function TestRunButton({ disabled, onClick }) {
  return (
    <button className="primary" disabled={disabled} onClick={onClick}>
      RUN FULL TEST SUITE
    </button>
  )
}
