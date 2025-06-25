import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Item } from "../types";
import { GripVertical } from "lucide-react";

export function DraggableItem({
  item,
  isOverlay = false,
}: {
  item: Item;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm cursor-grab active:cursor-grabbing ${
        isOverlay ? "rotate-3 shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span className="flex-1">{item.content}</span>
    </div>
  );
}