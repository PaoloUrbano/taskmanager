import { formatDate, initials } from "../utils.js";

export default function CardItem({ card, onOpen }) {
  const done = card.subtasks.filter(s => s.done).length;

  return (
    <div
      className="card-item"
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", card._id)}
      onClick={() => onOpen(card._id)}
    >
      <p className="card-title">{card.title}</p>
      <div className="card-meta">
        {card.dueDate && <span className="due">Scade {formatDate(card.dueDate)}</span>}
        {card.subtasks.length > 0 && <span title="Sottotask completati">{done}/{card.subtasks.length}</span>}
        {card.assignee && <span className="avatar" title={card.assignee.name}>{initials(card.assignee.name)}</span>}
      </div>
    </div>
  );
}
