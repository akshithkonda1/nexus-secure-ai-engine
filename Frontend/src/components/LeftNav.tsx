import { UserCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export type LeftNavAction = { label: string; onClick: () => void };

export type LeftNavItem = {
  id: string;
  title: string;
  subtitle?: string;
  when: string;
  active?: boolean;
  onSelect: () => void;
  actions?: LeftNavAction[];
};

export type LeftNavSection = {
  id: string;
  title: string;
  emptyLabel: string;
  extra?: ReactNode;
  items: LeftNavItem[];
};

type LeftNavProps = {
  sections: LeftNavSection[];
  onNewChat: () => void;
  onProfileClick: () => void;
  profileImage?: string | null;
};

export default function LeftNav({ sections, onNewChat, onProfileClick, profileImage }: LeftNavProps) {
  return (
    <aside className="nx-side">
      <div className="nx-side-profile">
        <button type="button" className="nx-profile-avatar" onClick={onProfileClick} aria-label="Open profile">
          {profileImage ? <img src={profileImage} alt="Profile" /> : <UserCircle2 size={32} aria-hidden />}
        </button>
        <button type="button" className="primary nx-new-chat" onClick={onNewChat}>
          ＋ New chat
        </button>
      </div>
      {sections.map(section => (
        <Section key={section.id} title={section.title} extra={section.extra}>
          {section.items.length === 0 ? (
            <Empty label={section.emptyLabel} />
          ) : (
            section.items.map(item => (
              <ConversationRow key={item.id} item={item} />
            ))
          )}
        </Section>
      ))}
    </aside>
  );
}

function Section({ title, extra, children }: { title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="sect">
      <div className="sect-head">
        <div className="sect-title">{title}</div>
        {extra}
      </div>
      <div className="sect-body">{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="empty">{label}</div>;
}

function ConversationRow({ item }: { item: LeftNavItem }) {
  return (
    <div className={`conv ${item.active ? "active" : ""}`}>
      <button type="button" className="conv-body" onClick={item.onSelect}>
        <div className="conv-title">{item.title || "Untitled"}</div>
        {item.subtitle ? <div className="conv-sub">{item.subtitle}</div> : null}
        <div className="conv-when">{item.when}</div>
      </button>
      {item.actions?.length ? (
        <div className="conv-menu">
          {item.actions.map((action, idx) => (
            <button type="button" key={idx} className="pill sm" onClick={action.onClick}>
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
