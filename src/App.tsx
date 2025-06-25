import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Plus } from "lucide-react";
import type { Item, Slot } from "./types";
import { DraggableItem } from "./components/DraggableItem";
import { DroppableSlot } from "./components/DroppableSlot";
import { ENABLE_SLOT_LIMIT, MAX_ITEMS_PER_SLOT } from "./const";

const initialItems: Item[] = [
  { id: "1", content: "Task 1" },
  { id: "2", content: "Task 2" },
  { id: "3", content: "Task 3" },
  { id: "4", content: "Task 4" },
  { id: "5", content: "Task 5" },
  { id: "6", content: "Task 6" },
  { id: "7", content: "Task 7" },
  { id: "8", content: "Task 8" },
  { id: "9", content: "Task 9" },
  { id: "10", content: "Task 10" },
];

export default function Component() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [slots, setSlots] = useState<Slot[]>([
    { id: "slot-1", name: "Slot 1", items: [] },
    { id: "slot-2", name: "Slot 2", items: [] },
  ]);
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const unassignedItems = items.filter((item) => !item.slotId);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = items.find((item) => item.id === active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeItem = items.find((item) => item.id === active.id);
    if (!activeItem) return;

    // If dropped on a slot
    if (over.data.current?.type === "slot") {
      const targetSlot = over.data.current.slot as Slot;

      // Update items to assign to new slot
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === activeItem.id ? { ...item, slotId: targetSlot.id } : item
        )
      );

      // Update slots
      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          if (slot.id === targetSlot.id) {
            // Add item to target slot if not already there
            const itemExists = slot.items.some(
              (item) => item.id === activeItem.id
            );
            if (!itemExists) {
              // Check slot limit if enabled
              if (
                ENABLE_SLOT_LIMIT &&
                slot.items.length >= MAX_ITEMS_PER_SLOT
              ) {
                return slot; // Don't add if slot is full
              }
              return {
                ...slot,
                items: [
                  ...slot.items,
                  { ...activeItem, slotId: targetSlot.id },
                ],
              };
            }
          } else {
            // Remove item from other slots
            return {
              ...slot,
              items: slot.items.filter((item) => item.id !== activeItem.id),
            };
          }
          return slot;
        })
      );
    }
  };

  const addMoreSlots = () => {
    const currentSlotCount = slots.length;
    const newSlots: Slot[] = [
      {
        id: `slot-${currentSlotCount + 1}`,
        name: `Slot ${currentSlotCount + 1}`,
        items: [],
      },
      {
        id: `slot-${currentSlotCount + 2}`,
        name: `Slot ${currentSlotCount + 2}`,
        items: [],
      },
    ];
    setSlots((prevSlots) => [...prevSlots, ...newSlots]);
  };

  const removeTwoSlots = () => {
    if (slots.length <= 2) return;

    const slotsToRemove = slots.slice(-2);
    const itemsToUnassign: string[] = [];

    // Collect items from slots being removed
    slotsToRemove.forEach((slot) => {
      slot.items.forEach((item) => {
        itemsToUnassign.push(item.id);
      });
    });

    // Update items to remove slot assignment for items in removed slots
    setItems((prevItems) =>
      prevItems.map((item) =>
        itemsToUnassign.includes(item.id)
          ? { ...item, slotId: undefined }
          : item
      )
    );

    // Remove the last 2 slots
    setSlots((prevSlots) => prevSlots.slice(0, -2));
  };

  const removeItemFromSlot = (itemId: string) => {
    // Update items to remove slot assignment
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, slotId: undefined } : item
      )
    );

    // Update slots to remove item
    setSlots((prevSlots) =>
      prevSlots.map((slot) => ({
        ...slot,
        items: slot.items.filter((item) => item.id !== itemId),
      }))
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Drag & Drop Assignment</h1>
        <p className="text-gray-600">
          Drag items from the list below to assign them to slots
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Items */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Available Items ({unassignedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={unassignedItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {unassignedItems.map((item) => (
                      <DraggableItem key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
                {unassignedItems.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    All items assigned
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Slots */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Assignment Slots</h2>
              <div className="flex gap-2">
                <Button
                  onClick={removeTwoSlots}
                  variant="outline"
                  disabled={slots.length <= 2}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-4 h-4">−</span>
                  Remove 2 Slots
                </Button>
                <Button
                  onClick={addMoreSlots}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add 2 More Slots
                </Button>
              </div>
            </div>

            <SortableContext
              items={slots.map((slot) => slot.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <DroppableSlot
                    key={slot.id}
                    slot={slot}
                    onRemoveItem={removeItemFromSlot}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeItem ? <DraggableItem item={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Assignment Summary</h3>
        <div className="text-sm text-gray-600">
          <span className="mr-4">Total Items: {items.length}</span>
          <span className="mr-4">
            Assigned: {items.filter((item) => item.slotId).length}
          </span>
          <span className="mr-4">Unassigned: {unassignedItems.length}</span>
          <span className="mr-4">Total Slots: {slots.length}</span>
          {ENABLE_SLOT_LIMIT && <span>Max per Slot: {MAX_ITEMS_PER_SLOT}</span>}
        </div>
      </div>
    </div>
  );
}
