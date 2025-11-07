interface SessionItemProps {
  title: string;
  desc: string;
  onResume: () => void;
}

function SessionItem({ title, desc, onResume }: SessionItemProps) {
  return (
    <div className="bg-elevated rounded-lg p-4 flex justify-between items-start hover:bg-gray-700">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <button onClick={onResume} className="bg-primary text-white px-3 py-1 rounded-full text-sm">
        Resume
      </button>
    </div>
  );
}

export default SessionItem;
