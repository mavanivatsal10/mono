export default function Slots({ slots }) {
  return (
    <div>
      {slots.map((slot) => (
        <Slot slot={slot} />
      ))}
    </div>
  );
}

function Slot({ slot }) {
  return (
    <div className="border rouned-md w-fit m-4 p-2">
      <div>
        {slot.type}: {slot.startTime} - {slot.endTime}
      </div>
      <div></div>
    </div>
  );
}
