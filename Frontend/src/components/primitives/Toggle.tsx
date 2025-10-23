import React from 'react';

type ToggleProps = {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
  const handleClick = () => {
    onChange(!checked);
  };

  const renderedLabel =
    typeof label === 'string' ? <span className="chatgpt-toggle-label-text">{label}</span> : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`chatgpt-toggle ${checked ? 'is-active' : ''}`}
      role="switch"
      aria-checked={checked}
      data-has-label={label ? 'true' : 'false'}
    >
      {label ? <span className="chatgpt-toggle-label">{renderedLabel}</span> : null}
      <span className="chatgpt-toggle-track" aria-hidden="true">
        <span className="chatgpt-toggle-thumb" />
      </span>
    </button>
  );
};

export default Toggle;
