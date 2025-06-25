export type Item = {
  id: string;
  content: string;
  slotId?: string;
};

export type Slot = {
  id: string;
  name: string;
  items: Item[];
};