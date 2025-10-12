export default function SourceList({ sources }:{ sources:{title:string; url:string}[] }) {
  if (!sources?.length) return null;
  return (
    <ul className="mt-2 space-y-1 text-sm">
      {sources.map((s,i)=>(
        <li key={i}>
          <a className="underline underline-offset-2"
             href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title || s.url}
          </a>
        </li>
      ))}
    </ul>
  );
}
