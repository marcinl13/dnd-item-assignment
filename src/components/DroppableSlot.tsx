import { useSortable } from "@dnd-kit/sortable";
import type { Slot } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ENABLE_SLOT_LIMIT, MAX_ITEMS_PER_SLOT } from "../const";

export function DroppableSlot({
  slot,
  onRemoveItem,
}: {
  slot: Slot;
  onRemoveItem: (itemId: string) => void;
}) {
  const { setNodeRef, isOver } = useSortable({
    id: slot.id,
    data: {
      type: "slot",
      slot,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-[200px] transition-colors ${
        isOver
          ? ENABLE_SLOT_LIMIT && slot.items.length >= MAX_ITEMS_PER_SLOT
            ? "bg-red-50 border-red-300"
            : "bg-blue-50 border-blue-300"
          : ENABLE_SLOT_LIMIT && slot.items.length >= MAX_ITEMS_PER_SLOT
          ? "bg-gray-100 border-gray-300"
          : "bg-gray-50"
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {slot.name}
          {ENABLE_SLOT_LIMIT && (
            <span className="text-xs text-gray-500 font-normal">
              {slot.items.length}/{MAX_ITEMS_PER_SLOT}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {slot.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 bg-white border rounded shadow-sm"
          >
            <span className="text-sm">{item.content}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(item.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              ×
            </Button>
          </div>
        ))}
        {slot.items.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            Drop items here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
