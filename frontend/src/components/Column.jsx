import CardItem from "./CardItem.jsx";

export default function Column({ status, title, cards, onMove, onOpen }) {
  function handleDrop(e) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");   // l'id messo da CardItem nel dragstart
    onMove(cardId, status);
  }

  return (
    <section className="column" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <h2>{title} <span className="count">{cards.length}</span></h2>
      {cards.map((c) => (
        <CardItem key={c._id} card={c} onOpen={onOpen} />
      ))}
    </section>
  );
}
